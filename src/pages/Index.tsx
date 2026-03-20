import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { WizardProvider, useWizard } from "@/context/WizardContext";
import { WizardShell } from "@/components/wizard/WizardShell";
import { LandingStep } from "@/components/wizard/LandingStep";
import { MetaConnectStep } from "@/components/wizard/MetaConnectStep";
import { AccountSelectStep } from "@/components/wizard/AccountSelectStep";
import { DataSyncStep } from "@/components/wizard/DataSyncStep";
import { InsightsStep } from "@/components/wizard/InsightsStep";
import { PdpInputStep } from "@/components/wizard/PdpInputStep";
import { PdpScrapeStep } from "@/components/wizard/PdpScrapeStep";
import { StrategyStep } from "@/components/wizard/StrategyStep";
import { OutputStep } from "@/components/wizard/OutputStep";
import { supabase } from "@/integrations/supabase/client";

const WizardRouter = () => {
  const { state, setStep, updateState } = useWizard();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle return from Meta OAuth
    if (searchParams.get("meta") === "connected" && state.step === "landing") {
      updateState({ metaConnected: true });
      setStep("account-select");
    }
  }, [searchParams]);

  const stepComponent = () => {
    switch (state.step) {
      case "landing": return <LandingStep />;
      case "meta-connect": return <MetaConnectStep />;
      case "account-select": return <AccountSelectStep />;
      case "data-sync": return <DataSyncStep />;
      case "insights": return <InsightsStep />;
      case "pdp-input": return <PdpInputStep />;
      case "pdp-scrape": return <PdpScrapeStep />;
      case "strategy": return <StrategyStep />;
      case "output":
      case "regenerate": return <OutputStep />;
      default: return <LandingStep />;
    }
  };

  return <WizardShell currentStep={state.step}>{stepComponent()}</WizardShell>;
};

const Index = () => {
  return (
    <WizardProvider>
      <WizardRouter />
    </WizardProvider>
  );
};

export default Index;
