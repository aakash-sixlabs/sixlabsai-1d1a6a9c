import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/prod/client";
import { useWizard } from "@/context/WizardContext";
import { InsightsStep } from "@/components/wizard/InsightsStep";
import { BrandKitBanner } from "@/components/wizard/BrandKitBanner";
import { Loader2 } from "lucide-react";
import { isDevSession } from "@/lib/devMode";
import { getOnboardingState } from "@/lib/onboardingState";

const Insights = () => {
  const navigate = useNavigate();
  const { state, updateState } = useWizard();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      // Dev-mode bypass: tester completed onboarding flow without a real
      // Supabase session. Skip auth gating + DB hydration entirely.
      if (isDevSession()) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/loginvcollect"); return; }

      // Hard gate: until the full onboarding flow (account → brand kit →
      // ICPs → first completed sync) is done, send the user back to retry it.
      const onboarding = await getOnboardingState(user.id);
      if (!onboarding.complete) {
        const flowVersion = sessionStorage.getItem("auth_flow_version");
        const dest = flowVersion === "v1" ? "/onboarding" : "/onboarding-v2";
        navigate(dest, { replace: true });
        return;
      }

      if (!state.selectedAccount) {
        updateState({
          selectedAccount: onboarding.adAccountId!,
          selectedAccountName: onboarding.adAccountName,
          selectedMetaAccountId: onboarding.metaAccountId,
        });
      }

      setAuthorized(true);
      setLoading(false);
    };
    check();
  }, [navigate]);


  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (!authorized) return null;
  return (
    <>
      <BrandKitBanner />
      <InsightsStep />
    </>
  );
};

export default Insights;
