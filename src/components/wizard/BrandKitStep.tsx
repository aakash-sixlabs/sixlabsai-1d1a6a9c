import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Globe,
  Sparkles,
  Loader2,
  ArrowRight,
  Palette,
  Type as TypeIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BrandKit {
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  tone_of_voice: string;
  tagline: string;
  product_categories: string[];
  raw?: Record<string, unknown>;
}

interface BrandKitStepProps {
  open: boolean;
  adAccountId: string;
  defaultBrandName?: string;
  onComplete: () => void;
}

type Phase = "input" | "building" | "preview";

export const BrandKitStep = ({
  open,
  adAccountId,
  defaultBrandName,
  onComplete,
}: BrandKitStepProps) => {
  const [phase, setPhase] = useState<Phase>("input");
  const [website, setWebsite] = useState("");
  const [kit, setKit] = useState<BrandKit | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuild = async () => {
    if (!website.trim()) return;
    setError(null);
    setPhase("building");
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "build-brand-kit",
        {
          body: {
            adAccountId,
            websiteUrl: website.trim(),
            brandName: defaultBrandName ?? null,
          },
        },
      );
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (!data?.kit) throw new Error("No brand kit returned.");
      setKit(data.kit as BrandKit);
      setPhase("preview");
    } catch (err: any) {
      console.error("Brand kit build error:", err);
      setError(err?.message || "Failed to build brand kit.");
      setPhase("input");
    }
  };

  const handleConfirm = async () => {
    if (!kit) return;
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: updateErr } = await supabase
        .from("ad_account_profiles")
        .update({
          brand_name: kit.brand_name,
          logo_url: kit.logo_url,
          primary_color: kit.primary_color,
          secondary_color: kit.secondary_color,
          accent_color: kit.accent_color,
          font_family: kit.font_family,
          tone_of_voice: kit.tone_of_voice,
          tagline: kit.tagline,
          product_categories: kit.product_categories,
          confirmed: true,
        })
        .eq("ad_account_id", adAccountId)
        .eq("user_id", user.id);

      if (updateErr) throw updateErr;

      toast.success("Brand kit saved!");
      onComplete();
    } catch (err: any) {
      console.error("Brand kit confirm error:", err);
      toast.error(err?.message || "Failed to save brand kit");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof BrandKit>(key: K, value: BrandKit[K]) => {
    setKit((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="sm:max-w-xl [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            Tell us about your brand
          </DialogTitle>
          <DialogDescription>
            We'll build a brand kit (logo, colors, tone) so every generated creative looks on-brand.
          </DialogDescription>
        </DialogHeader>

        {phase === "input" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 pt-2"
          >
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-1.5 text-sm">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                Brand website
              </Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="yourbrand.com"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                We'll extract your logo, colors, fonts, and tone of voice from this site.
              </p>
            </div>
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
            <Button
              className="w-full gap-2"
              size="lg"
              disabled={!website.trim()}
              onClick={handleBuild}
            >
              Build my brand kit <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {phase === "building" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-10 flex flex-col items-center justify-center gap-3"
          >
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing {website}…</p>
          </motion.div>
        )}

        {phase === "preview" && kit && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 pt-2 max-h-[60vh] overflow-y-auto pr-1"
          >
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              {kit.logo_url ? (
                <img
                  src={kit.logo_url}
                  alt={`${kit.brand_name ?? "Brand"} logo`}
                  className="w-10 h-10 rounded object-contain bg-muted"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-muted" />
              )}
              <div className="flex-1 min-w-0">
                <Input
                  value={kit.brand_name ?? ""}
                  onChange={(e) => updateField("brand_name", e.target.value)}
                  className="h-8 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                Color palette
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(["primary_color", "secondary_color", "accent_color"] as const).map(
                  (k) => (
                    <div key={k} className="space-y-1">
                      <div
                        className="h-12 rounded-md border border-border"
                        style={{ background: kit[k] }}
                      />
                      <Input
                        value={kit[k]}
                        onChange={(e) => updateField(k, e.target.value)}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  Font
                </Label>
                <Input
                  value={kit.font_family}
                  onChange={(e) => updateField("font_family", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Tone of voice</Label>
                <Input
                  value={kit.tone_of_voice}
                  onChange={(e) => updateField("tone_of_voice", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Tagline</Label>
              <Textarea
                value={kit.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPhase("input")}
                disabled={saving}
              >
                Try a different URL
              </Button>
              <Button
                className="flex-1 gap-2"
                size="lg"
                onClick={handleConfirm}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                {saving ? "Saving…" : "Confirm brand kit"}
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};
