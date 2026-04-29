import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useWizard } from "@/context/WizardContext";
import { DashboardBackground } from "@/components/wizard/DashboardBackground";
import { ProfileOverlay, AccountSelectOverlay } from "@/components/wizard/OnboardingOverlay";
import { ToolExplanationOverlay } from "@/components/wizard/ToolExplanationOverlay";
import { DataSyncStep } from "@/components/wizard/DataSyncStep";
import { BrandKitStep } from "@/components/wizard/BrandKitStep";
import { supabase } from "@/integrations/supabase/client";
import { isSuperAdmin } from "@/lib/superAdmin";

type OnboardingPhase = "loading" | "profile" | "tool-explanation" | "account-select" | "brand-kit" | "data-sync";

const Onboarding = () => {
  const { state, updateState } = useWizard();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [phase, setPhase] = useState<OnboardingPhase>("loading");
  const isDevMode = searchParams.get("dev") === "true";

  useEffect(() => {
    const init = async () => {
      // Gate: only super admin can access v1 onboarding
      if (!isDevMode) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate("/loginv1"); return; }
        const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).single();
        if (!isSuperAdmin(profile?.email)) { navigate("/onboarding-v2"); return; }
      }
      // Dev mode: skip auth check
      if (isDevMode) {
        updateState({ metaConnected: true });
        setShowProfileDialog(true);
        setPhase("profile");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }

      // Returning-user shortcut: if the user already has a default ad account
      // with a confirmed brand kit, skip onboarding entirely and send them to
      // /home. /home will trigger a non-blocking 30-day resync on landing.
      const { data: profile } = await supabase
        .from("profiles")
        .select("default_ad_account_id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.default_ad_account_id) {
        const { data: aap } = await supabase
          .from("ad_account_profiles")
          .select("brand_kit_status")
          .eq("ad_account_id", profile.default_ad_account_id)
          .maybeSingle();

        if (aap?.brand_kit_status === "ready") {
          navigate("/home", { replace: true });
          return;
        }
      }

      if (searchParams.get("meta") === "connected") {
        updateState({ metaConnected: true });
        await checkProfileComplete();
      } else if (state.selectedAccount && !state.syncComplete) {
        setPhase("data-sync");
      } else {
        setPhase("account-select");
      }
    };
    init();
  }, []);

  const checkProfileComplete = async () => {
    if (isDevMode) {
      setShowProfileDialog(true);
      setPhase("profile");
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // For new users (query param), always show profile
      const isNew = searchParams.get("new") === "true";
      if (isNew || !profile || !profile.full_name) {
        setShowProfileDialog(true);
        setPhase("profile");
      } else {
        updateState({ profileComplete: true });
        setPhase("account-select");
      }
    } catch {
      setShowProfileDialog(true);
      setPhase("profile");
    }
  };

  const handleProfileComplete = () => {
    setShowProfileDialog(false);
    updateState({ profileComplete: true });
    // After profile, show the education / "what happens next" overlay.
    setPhase("tool-explanation");
  };

  const handleToolExplanationContinue = () => {
    // Then pick the default ad account.
    setPhase("account-select");
  };

  const handleAccountSelected = () => {
    // Then confirm the brand kit (auto-extracts from website captured in profile step).
    setPhase("brand-kit");
  };

  const handleBrandKitComplete = () => {
    // Finally pull the ad data.
    setPhase("data-sync");
  };

  const handleSyncComplete = () => {
    navigate("/home");
  };

  return (
    <>
      <DashboardBackground />
      <ProfileOverlay open={showProfileDialog} onComplete={handleProfileComplete} isDevMode={isDevMode} />
      <AccountSelectOverlay
        open={phase === "account-select" && !showProfileDialog}
        onStartSync={handleAccountSelected}
        isDevMode={isDevMode}
        saveAsDefault
      />
      {phase === "brand-kit" && state.selectedAccount && (
        <BrandKitStep
          open
          adAccountId={state.selectedAccount}
          defaultBrandName={state.selectedAccountName ?? undefined}
          initialWebsite={state.brandWebsite}
          isDevMode={isDevMode}
          onComplete={handleBrandKitComplete}
        />
      )}
      <ToolExplanationOverlay
        open={phase === "tool-explanation"}
        onContinue={handleToolExplanationContinue}
      />
      {phase === "data-sync" && (
        <DataSyncStep asOverlay onComplete={handleSyncComplete} isDevMode={isDevMode} />
      )}
    </>
  );
};

export default Onboarding;
