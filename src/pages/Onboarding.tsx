import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useWizard } from "@/context/WizardContext";
import { DashboardBackground } from "@/components/wizard/DashboardBackground";
import { ProfileOverlay, AccountSelectOverlay } from "@/components/wizard/OnboardingOverlay";
import { ToolExplanationOverlay } from "@/components/wizard/ToolExplanationOverlay";
import { DataSyncStep } from "@/components/wizard/DataSyncStep";
import { BrandKitStep } from "@/components/wizard/BrandKitStep";
import { IcpOnboardingStep } from "@/components/wizard/IcpOnboardingStep";
import { supabase } from "@/integrations/prod/client";
import { getOnboardingState } from "@/lib/onboardingState";

type OnboardingPhase = "loading" | "profile" | "tool-explanation" | "account-select" | "brand-kit" | "add-icp" | "data-sync";

const Onboarding = () => {
  const { state, updateState } = useWizard();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [phase, setPhase] = useState<OnboardingPhase>("loading");
  const isDevMode = searchParams.get("dev") === "true";

  useEffect(() => {
    const init = async () => {
      // V1 login must stay in the V1 onboarding flow. Do not bounce to V2.
      if (!isDevMode) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate("/loginv1"); return; }
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

      const onboarding = await getOnboardingState(session.user.id);
      if (onboarding.complete) {
        navigate("/home", { replace: true });
        return;
      }

      if (onboarding.adAccountId) {
        updateState({
          selectedAccount: onboarding.adAccountId,
          selectedAccountName: onboarding.adAccountName,
          selectedMetaAccountId: onboarding.metaAccountId,
          dateRange: "90",
        });
        if (onboarding.resumePhase === "brand-kit") { setPhase("brand-kit"); return; }
        if (onboarding.resumePhase === "add-icp") { setPhase("add-icp"); return; }
        if (onboarding.resumePhase === "pulling") { setPhase("data-sync"); return; }
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
    // Optional ICP collection before pulling data.
    setPhase("add-icp");
  };

  const handleIcpComplete = () => {
    // Finally pull the ad data.
    setPhase("data-sync");
  };

  const handleSyncComplete = () => {
    navigate("/home", { replace: true });
  };

  return (
    <>
      <DashboardBackground />
      <ProfileOverlay open={showProfileDialog} onComplete={handleProfileComplete} isDevMode={isDevMode} />
      <AccountSelectOverlay
        open={phase === "account-select" && !showProfileDialog}
        onStartSync={handleAccountSelected}
        onReturningAccountSelected={() => navigate("/home", { replace: true })}
        isDevMode={isDevMode}
        saveAsDefault
        skipCompletedAccountSetup
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
      {phase === "add-icp" && state.selectedAccount && (
        <IcpOnboardingStep
          open
          adAccountId={state.selectedAccount}
          isDevMode={isDevMode}
          onComplete={handleIcpComplete}
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
