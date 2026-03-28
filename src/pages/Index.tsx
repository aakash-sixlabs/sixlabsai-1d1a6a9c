import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { WizardProvider, useWizard } from "@/context/WizardContext";
import { WizardShell } from "@/components/wizard/WizardShell";
import { LandingStep } from "@/components/wizard/LandingStep";
import { MetaConnectStep } from "@/components/wizard/MetaConnectStep";
import { AccountSelectStep } from "@/components/wizard/AccountSelectStep";
import { DataSyncStep } from "@/components/wizard/DataSyncStep";
import { DataReviewStep } from "@/components/wizard/DataReviewStep";
import { InsightsStep } from "@/components/wizard/InsightsStep";
import { PdpInputStep } from "@/components/wizard/PdpInputStep";
import { PdpScrapeStep } from "@/components/wizard/PdpScrapeStep";
import { StrategyStep } from "@/components/wizard/StrategyStep";
import { OutputStep } from "@/components/wizard/OutputStep";
import { ProfileDialog } from "@/components/wizard/ProfileDialog";
import { supabase } from "@/integrations/supabase/client";

const WizardRouter = () => {
  const { state, setStep, updateState } = useWizard();
  const [searchParams] = useSearchParams();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);
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
    // Handle return from Meta OAuth
    if (searchParams.get("meta") === "connected" && isAuthed) {
      updateState({ metaConnected: true });
      // Check if profile is complete
      checkProfileComplete();
    }
  }, [searchParams, isAuthed]);

  const checkProfileComplete = async () => {
    setCheckingProfile(true);
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
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleProfileComplete = () => {
    setShowProfileDialog(false);
    updateState({ profileComplete: true });
    setStep("account-select");
  };

  const stepComponent = () => {
    // If not authed, always show landing
    if (!isAuthed) return <LandingStep />;

    switch (state.step) {
      case "landing": return <LandingStep />;
      case "meta-connect": return <MetaConnectStep />;
      case "account-select": return <AccountSelectStep />;
      case "data-sync": return <DataSyncStep />;
      case "data-review": return <DataReviewStep />;
      case "insights": return <InsightsStep />;
      case "pdp-input": return <PdpInputStep />;
      case "pdp-scrape": return <PdpScrapeStep />;
      case "strategy": return <StrategyStep />;
      case "output":
      case "regenerate": return <OutputStep />;
      default: return <LandingStep />;
    }
  };

  return (
    <>
      {/* Gray out background when profile dialog is showing */}
      <div className={showProfileDialog ? "opacity-30 pointer-events-none" : ""}>
        <WizardShell currentStep={state.step}>{stepComponent()}</WizardShell>
      </div>
      <ProfileDialog open={showProfileDialog} onComplete={handleProfileComplete} />
    </>
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
