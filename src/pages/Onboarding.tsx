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

type OnboardingPhase = "loading" | "profile" | "account-select" | "brand-kit" | "tool-explanation" | "data-sync";

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
        if (!user) { navigate("/login"); return; }
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
    setPhase("account-select");
  };

  const handleAccountSelected = () => {
    // After selecting default ad account, confirm brand kit before continuing.
    setPhase("brand-kit");
  };

  const handleBrandKitComplete = () => {
    setPhase("tool-explanation");
  };

  const handleToolExplanationContinue = () => {
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
