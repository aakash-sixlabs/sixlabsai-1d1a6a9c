// Single source of truth for onboarding completion.
// The flow is: pick ad account → confirm brand kit → add ICPs → run data sync.
// Until ALL four are satisfied we keep the user inside /onboarding-v2.
import { supabase } from "@/integrations/prod/client";

export type OnboardingResumePhase =
  | "select-account" // no default ad account chosen
  | "brand-kit"      // account chosen, brand kit not confirmed
  | "add-icp"        // brand kit confirmed, no ICPs yet
  | "pulling"        // ICPs exist, no completed sync_job yet
  | "complete";      // everything done — user can use /home

export interface OnboardingState {
  complete: boolean;
  resumePhase: OnboardingResumePhase;
  adAccountId: string | null;
  adAccountName: string | null;
  metaAccountId: string | null;
}

export const getOnboardingState = async (
  userId: string,
): Promise<OnboardingState> => {
  // Source of truth for "is onboarding done?" → ad_accounts.onboarding_completed.
  // We still compute resumePhase so OnboardingV2 knows which step to show.
  const { data: allAccounts } = await supabase
    .from("ad_accounts")
    .select("id, account_name, account_id_meta, onboarding_completed, created_at")
    .order("created_at", { ascending: false });

  const completedAcct = (allAccounts || []).find((a: any) => a.onboarding_completed);
  if (completedAcct) {
    return {
      complete: true,
      resumePhase: "complete",
      adAccountId: completedAcct.id,
      adAccountName: completedAcct.account_name,
      metaAccountId: completedAcct.account_id_meta,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_ad_account_id")
    .eq("id", userId)
    .maybeSingle();

  const defaultId = profile?.default_ad_account_id ?? null;
  const acct =
    (allAccounts || []).find((a: any) => a.id === defaultId) ||
    (allAccounts || [])[0] ||
    null;

  if (!acct) {
    return {
      complete: false,
      resumePhase: "select-account",
      adAccountId: null,
      adAccountName: null,
      metaAccountId: null,
    };
  }

  const base = {
    adAccountId: acct.id,
    adAccountName: acct.account_name,
    metaAccountId: acct.account_id_meta,
  };

  if (!defaultId) {
    return { ...base, complete: false, resumePhase: "select-account" };
  }

  const { data: brandProfile } = await supabase
    .from("ad_account_profiles")
    .select("confirmed, brand_kit_status")
    .eq("ad_account_id", acct.id)
    .maybeSingle();

  const brandReady =
    !!brandProfile?.confirmed || brandProfile?.brand_kit_status === "completed";
  if (!brandReady) {
    return { ...base, complete: false, resumePhase: "brand-kit" };
  }

  const { count: icpCount } = await supabase
    .from("icps")
    .select("id", { count: "exact", head: true })
    .eq("ad_account_id", acct.id);

  if (!icpCount || icpCount === 0) {
    return { ...base, complete: false, resumePhase: "add-icp" };
  }

  // ICPs exist but the sync hasn't flipped onboarding_completed yet → keep
  // them in the pulling phase until the edge function marks the account done.
  return { ...base, complete: false, resumePhase: "pulling" };
};
