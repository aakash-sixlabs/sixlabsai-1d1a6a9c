import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useWizard } from "@/context/WizardContext";
import { DashboardBackground } from "@/components/wizard/DashboardBackground";
import { ProfileOverlay, AccountSelectOverlay } from "@/components/wizard/OnboardingOverlay";
import { DataSyncStep } from "@/components/wizard/DataSyncStep";
import { supabase } from "@/integrations/supabase/client";

const Onboarding = () => {
  const { state, updateState } = useWizard();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<"loading" | "profile" | "account-select" | "data-sync">("loading");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }

      if (searchParams.get("meta") === "connected") {
        updateState({ metaConnected: true });
        await checkProfileComplete();
      } else if (state.selectedAccount && !state.syncComplete) {
        setOnboardingStep("data-sync");
      } else {
        setOnboardingStep("account-select");
      }
    };
    init();
  }, []);

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
        setOnboardingStep("profile");
      } else {
        updateState({ profileComplete: true });
        setOnboardingStep("account-select");
      }
    } catch {
      setShowProfileDialog(true);
      setOnboardingStep("profile");
    }
  };

  const handleProfileComplete = () => {
    setShowProfileDialog(false);
    updateState({ profileComplete: true });
    setOnboardingStep("account-select");
  };

  const handleSyncComplete = () => {
    navigate("/data-review");
  };

  return (
    <>
      <DashboardBackground />
      <ProfileOverlay open={showProfileDialog} onComplete={handleProfileComplete} />
      <AccountSelectOverlay
        open={onboardingStep === "account-select" && !showProfileDialog}
        onStartSync={() => setOnboardingStep("data-sync")}
      />
      {onboardingStep === "data-sync" && (
        <DataSyncStep asOverlay onComplete={handleSyncComplete} />
      )}
    </>
  );
};

export default Onboarding;
