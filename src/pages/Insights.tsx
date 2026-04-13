import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isSuperAdmin } from "@/lib/superAdmin";
import { InsightsStep } from "@/components/wizard/InsightsStep";
import { Loader2 } from "lucide-react";

const Insights = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();

      if (isSuperAdmin(profile?.email)) {
        setAuthorized(true);
      } else {
        navigate("/onboarding-v2");
      }
      setLoading(false);
    };
    check();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (!authorized) return null;
  return <InsightsStep />;
};

export default Insights;
