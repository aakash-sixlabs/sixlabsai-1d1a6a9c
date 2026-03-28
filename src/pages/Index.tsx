import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { WizardProvider, useWizard } from "@/context/WizardContext";
import { DashboardBackground } from "@/components/wizard/DashboardBackground";
import { WizardShell } from "@/components/wizard/WizardShell";
import { LandingStep } from "@/components/wizard/LandingStep";
import { DataSyncStep } from "@/components/wizard/DataSyncStep";
import { DataReviewStep } from "@/components/wizard/DataReviewStep";
import { InsightsStep } from "@/components/wizard/InsightsStep";
import { PdpInputStep } from "@/components/wizard/PdpInputStep";
import { PdpScrapeStep } from "@/components/wizard/PdpScrapeStep";
import { StrategyStep } from "@/components/wizard/StrategyStep";
import { OutputStep } from "@/components/wizard/OutputStep";
import { ProfileOverlay, AccountSelectOverlay } from "@/components/wizard/OnboardingOverlay";
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

  // Not authenticated → show original full-page landing with scrolling columns
  if (!isAuthed) {
    return <LandingStep />;
  }

  // Post-login onboarding steps shown as overlays on dashboard background
  const isOnboardingOverlay = state.step === "account-select" || state.step === "data-sync" || state.step === "landing" || state.step === "meta-connect";

  if (isOnboardingOverlay) {
    return (
      <>
        <DashboardBackground />

        {/* Profile overlay — shown after Meta auth returns */}
        <ProfileOverlay open={showProfileDialog} onComplete={handleProfileComplete} />

        {/* Account select overlay — shown after profile is complete */}
        <AccountSelectOverlay open={state.step === "account-select" && !showProfileDialog} />

        {/* Data sync overlay — shown during sync */}
        {state.step === "data-sync" && <DataSyncStep asOverlay />}
      </>
    );
  }

  // Post-onboarding: normal wizard shell
  return (
    <WizardShell currentStep={state.step}>
      {(() => {
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
      })()}
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
