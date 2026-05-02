import { useEffect, useState } from "react";
import { supabase } from "@/integrations/prod/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, Save, Sparkles, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { BrandKitStep } from "@/components/wizard/BrandKitStep";
import { getCurrentUserAndAccount } from "@/lib/accountContext";

interface Profile {
  id: string;
  brand_name: string | null;
  website_url: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_family: string | null;
  tagline: string | null;
}

interface Props {
  adAccountId: string;
}

export const BrandKitSettings = ({ adAccountId }: Props) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rebuildOpen, setRebuildOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ad_account_profiles")
      .select("id, brand_name, website_url, logo_url, primary_color, secondary_color, accent_color, font_family, tagline")
      .eq("ad_account_id", adAccountId)
      .maybeSingle();
    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    if (adAccountId) load();
  }, [adAccountId]);

  const updateField = (k: keyof Profile, v: string) => {
    setProfile((p) => p ? { ...p, [k]: v } : p);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("ad_account_profiles")
      .update({
        brand_name: profile.brand_name,
        website_url: profile.website_url,
        logo_url: profile.logo_url,
        primary_color: profile.primary_color,
        secondary_color: profile.secondary_color,
        accent_color: profile.accent_color,
        font_family: profile.font_family,
        tagline: profile.tagline,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Brand kit updated");
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  const handleSetupManual = async () => {
    const { userId, accountId } = await getCurrentUserAndAccount().catch(() => ({ userId: null as any, accountId: null as any }));
    if (!userId) { toast.error("Not signed in"); return; }
    const { data, error } = await supabase
      .from("ad_account_profiles")
      .insert({
        account_id: accountId,
        ad_account_id: adAccountId,
        user_id: userId,
        brand_kit_status: "pending",
      })
      .select("id, brand_name, website_url, logo_url, primary_color, secondary_color, accent_color, font_family, tagline")
      .single();
    if (error) { toast.error("Could not initialize brand kit"); return; }
    setProfile(data);
  };

  if (!profile) {
    return (
      <>
        <Card className="p-8 text-center space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">No brand kit yet</h2>
            <p className="text-sm text-muted-foreground">
              Extract one automatically from your website, or set it up manually.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setRebuildOpen(true)}>
              <Sparkles className="w-4 h-4" />
              Extract from website
            </Button>
            <Button variant="outline" onClick={handleSetupManual}>
              <PencilLine className="w-4 h-4" />
              Set up manually
            </Button>
          </div>
        </Card>

        {rebuildOpen && (
          <BrandKitStep
            open={rebuildOpen}
            adAccountId={adAccountId}
            defaultBrandName=""
            initialWebsite=""
            onComplete={() => { setRebuildOpen(false); load(); }}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Brand Kit</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Edit how your brand appears in generated creatives.
          </p>
        </div>
        <Button variant="outline" onClick={() => setRebuildOpen(true)}>
          <RefreshCw className="w-4 h-4" />
          Re-extract from website
        </Button>
      </div>

      <Card className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Brand name</Label>
            <Input value={profile.brand_name ?? ""} onChange={(e) => updateField("brand_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input value={profile.website_url ?? ""} onChange={(e) => updateField("website_url", e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Tagline</Label>
            <Input value={profile.tagline ?? ""} onChange={(e) => updateField("tagline", e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Logo URL</Label>
            <Input value={profile.logo_url ?? ""} onChange={(e) => updateField("logo_url", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {(["primary_color", "secondary_color", "accent_color"] as const).map((key) => (
            <div key={key} className="space-y-2">
              <Label className="capitalize">{key.replace("_", " ")}</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={profile[key] ?? "#000000"}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="h-10 w-12 rounded border border-input cursor-pointer"
                />
                <Input value={profile[key] ?? ""} onChange={(e) => updateField(key, e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Font family</Label>
          <Input value={profile.font_family ?? ""} onChange={(e) => updateField("font_family", e.target.value)} placeholder="e.g. Inter, Helvetica" />
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </Button>
        </div>
      </Card>

      {rebuildOpen && (
        <BrandKitStep
          open={rebuildOpen}
          adAccountId={adAccountId}
          defaultBrandName={profile.brand_name ?? ""}
          initialWebsite={profile.website_url ?? ""}
          onComplete={() => { setRebuildOpen(false); load(); }}
        />
      )}
    </div>
  );
};
