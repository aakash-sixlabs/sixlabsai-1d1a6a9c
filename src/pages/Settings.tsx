import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BrandKitSettings } from "@/components/settings/BrandKitSettings";
import { IcpSettings } from "@/components/settings/IcpSettings";
import { DisclaimerSettings } from "@/components/settings/DisclaimerSettings";
import { isDevSession } from "@/lib/devMode";

const Settings = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [adAccountId, setAdAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tab = searchParams.get("tab") ?? "brand";

  useEffect(() => {
    (async () => {
      // Dev-mode sandbox: skip Supabase auth + profile lookup, use mock ad account.
      if (isDevSession()) {
        setAdAccountId("mock-acc-1");
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/loginvcollect"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("default_ad_account_id")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile?.default_ad_account_id) {
        navigate("/onboarding-v2");
        return;
      }
      setAdAccountId(profile.default_ad_account_id);
      setLoading(false);
    })();
  }, [navigate]);

  if (loading || !adAccountId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your brand and audiences.</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })}>
          <TabsList>
            <TabsTrigger value="brand">Brand Kit</TabsTrigger>
            <TabsTrigger value="icps">ICPs</TabsTrigger>
            <TabsTrigger value="disclaimers">Disclaimers</TabsTrigger>
          </TabsList>
          <TabsContent value="brand" className="mt-6">
            <BrandKitSettings adAccountId={adAccountId} />
          </TabsContent>
          <TabsContent value="icps" className="mt-6">
            <IcpSettings adAccountId={adAccountId} />
          </TabsContent>
          <TabsContent value="disclaimers" className="mt-6">
            <DisclaimerSettings adAccountId={adAccountId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
