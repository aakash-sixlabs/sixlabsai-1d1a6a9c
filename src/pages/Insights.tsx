import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWizard } from "@/context/WizardContext";
import { InsightsStep } from "@/components/wizard/InsightsStep";
import { BrandKitBanner } from "@/components/wizard/BrandKitBanner";
import { Loader2 } from "lucide-react";
import { isDevSession } from "@/lib/devMode";

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

      // Hydrate wizard state from profile so background resync can run
      // for returning users who land here directly.
      if (!state.selectedAccount) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("default_ad_account_id")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile?.default_ad_account_id) {
          navigate("/onboarding-v2");
          return;
        }

        const { data: acct } = await supabase
          .from("ad_accounts")
          .select("id, account_id, account_name")
          .eq("id", profile.default_ad_account_id)
          .maybeSingle();

        if (!acct) {
          navigate("/onboarding-v2");
          return;
        }

        updateState({
          selectedAccount: acct.id,
          selectedAccountName: acct.account_name,
          selectedMetaAccountId: acct.account_id,
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
