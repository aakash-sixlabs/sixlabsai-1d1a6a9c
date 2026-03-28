import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { WizardProvider, useWizard } from "@/context/WizardContext";
import { DashboardBackground } from "@/components/wizard/DashboardBackground";
import { WizardShell } from "@/components/wizard/WizardShell";
import { DataSyncStep } from "@/components/wizard/DataSyncStep";
import { DataReviewStep } from "@/components/wizard/DataReviewStep";
import { InsightsStep } from "@/components/wizard/InsightsStep";
import { PdpInputStep } from "@/components/wizard/PdpInputStep";
import { PdpScrapeStep } from "@/components/wizard/PdpScrapeStep";
import { StrategyStep } from "@/components/wizard/StrategyStep";
import { OutputStep } from "@/components/wizard/OutputStep";
import { LoginOverlay, ProfileOverlay, AccountSelectOverlay } from "@/components/wizard/OnboardingOverlay";
import { supabase } from "@/integrations/supabase/client";

const WizardRouter = () => {
  const { state, setStep, updateState } = useWizard();
  const [searchParams] = useSearchParams();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (searchParams.get("meta") === "connected" && isAuthed) {
      updateState({ metaConnected: true });
      checkProfileComplete();
    }
  }, [searchParams, isAuthed]);

  const checkProfileComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.full_name) {
        setShowProfileDialog(true);
        updateState({ profileComplete: false });
      } else {
        updateState({ profileComplete: true });
        setStep("account-select");
      }
    } catch {
      setShowProfileDialog(true);
    }
  };

  const handleProfileComplete = () => {
    setShowProfileDialog(false);
    updateState({ profileComplete: true });
    setStep("account-select");
  };

  // Determine if we're in onboarding (show overlays on dashboard bg)
  const isOnboarding = !isAuthed || state.step === "landing" || state.step === "meta-connect" || state.step === "account-select" || state.step === "data-sync";

  // For post-onboarding steps, render them normally in the wizard shell
  const renderMainContent = () => {
    switch (state.step) {
      case "data-review": return <DataReviewStep />;
      case "insights": return <InsightsStep />;
      case "pdp-input": return <PdpInputStep />;
      case "pdp-scrape": return <PdpScrapeStep />;
      case "strategy": return <StrategyStep />;
      case "output":
      case "regenerate": return <OutputStep />;
      default: return null;
    }
  };

  // During onboarding: show dashboard skeleton + overlay dialogs
  if (isOnboarding) {
    return (
      <>
        <DashboardBackground />

        {/* Login overlay — shown when not authenticated */}
        <LoginOverlay open={!isAuthed && !showProfileDialog} />

        {/* Profile overlay — shown after Meta auth returns */}
        <ProfileOverlay open={showProfileDialog} onComplete={handleProfileComplete} />

        {/* Account select overlay — shown after profile is complete */}
        <AccountSelectOverlay open={isAuthed && state.step === "account-select" && !showProfileDialog} />

        {/* Data sync overlay — shown during sync */}
        {isAuthed && state.step === "data-sync" && <DataSyncStep asOverlay />}
      </>
    );
  }

  // Post-onboarding: normal wizard shell
  return (
    <WizardShell currentStep={state.step}>
      {renderMainContent()}
    </WizardShell>
  );
};

const Index = () => {
  return (
    <WizardProvider>
      <WizardRouter />
    </WizardProvider>
  );
};

export default Index;
