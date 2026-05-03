import { Component, ReactNode, useEffect, useRef, useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Sparkles,
  Loader2,
  ArrowRight,
  Palette,
  Type as TypeIcon,
  AlertCircle,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/prod/client";
import { getCurrentAccountId } from "@/lib/accountContext";
import { toast } from "sonner";

/* ── Types ──────────────────────────────────────────────────── */

interface ExtractedKit {
  brand_name: string | null;
  tagline: string | null;
  website_url: string;
  logo_url: string | null;
  favicon_url: string | null;
  screenshot_url: string | null;
  colors: {
    primary: string | null;
    secondary: string | null;
    accent: string | null;
    background: string | null;
    text_primary: string | null;
    text_secondary: string | null;
  };
  fonts: {
    primary: string | null;
    heading: string | null;
    all: string[];
  };
  // Hidden from UI but persisted
  tone_of_voice: string | null;
  product_categories: string[];
  target_audience: string | null;
  value_propositions: string[];
  raw: Record<string, unknown>;
  warnings: string[];
}

interface EditableFields {
  brand_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  heading_font: string;
  body_font: string;
  tagline: string;
}

interface BrandKitStepProps {
  open: boolean;
  adAccountId: string;
  defaultBrandName?: string;
  initialWebsite?: string;
  isDevMode?: boolean;
  onComplete: () => void;
}

type Phase = "input" | "building" | "preview";

/* ── Defensive normalization of streamed result ─────────────── */
function normalizeKit(raw: any): ExtractedKit {
  return {
    brand_name: raw?.brand_name ?? null,
    tagline: raw?.tagline ?? null,
    website_url: String(raw?.website_url ?? ""),
    logo_url: raw?.logo_url ?? null,
    favicon_url: raw?.favicon_url ?? null,
    screenshot_url: raw?.screenshot_url ?? null,
    colors: {
      primary: raw?.colors?.primary ?? null,
      secondary: raw?.colors?.secondary ?? null,
      accent: raw?.colors?.accent ?? null,
      background: raw?.colors?.background ?? null,
      text_primary: raw?.colors?.text_primary ?? null,
      text_secondary: raw?.colors?.text_secondary ?? null,
    },
    fonts: {
      primary: raw?.fonts?.primary ?? null,
      heading: raw?.fonts?.heading ?? null,
      all: Array.isArray(raw?.fonts?.all) ? raw.fonts.all : [],
    },
    tone_of_voice: raw?.tone_of_voice ?? null,
    product_categories: Array.isArray(raw?.product_categories) ? raw.product_categories : [],
    target_audience: raw?.target_audience ?? null,
    value_propositions: Array.isArray(raw?.value_propositions) ? raw.value_propositions : [],
    raw: raw?.raw ?? {},
    warnings: Array.isArray(raw?.warnings) ? raw.warnings : [],
  };
}

function cirkulStubKit(): ExtractedKit {
  return normalizeKit({
    brand_name: "Cirkul",
    tagline: "Drink More Water. Enjoy Every Sip.",
    website_url: "https://drinkcirkul.com",
    logo_url: "https://www.google.com/s2/favicons?domain=drinkcirkul.com&sz=128",
    favicon_url: "https://www.google.com/s2/favicons?domain=drinkcirkul.com&sz=64",
    screenshot_url: null,
    colors: {
      primary: "#00B4E4",
      secondary: "#0A2540",
      accent: "#FF6B35",
      background: "#FFFFFF",
      text_primary: "#0A2540",
      text_secondary: "#4A5A6A",
    },
    fonts: { primary: "Inter", heading: "Inter", all: ["Inter"] },
    tone_of_voice: "energetic, friendly, health-forward",
    product_categories: ["hydration", "flavor cartridges", "water bottles"],
    target_audience:
      "Health-conscious consumers, athletes, and busy professionals who want to drink more water with great-tasting, customizable flavors.",
    value_propositions: [
      "Personalized flavor and caffeine dial",
      "Helps you drink more water effortlessly",
      "Zero sugar options with vitamins and electrolytes",
    ],
    raw: { stub: "cirkul" },
    warnings: [],
  });
}

function devStubKit(brandName?: string): ExtractedKit {
  const name = brandName || "Acme Co";
  return normalizeKit({
    brand_name: name,
    tagline: `${name} — built for what's next.`,
    website_url: "https://example.com",
    logo_url: `https://www.google.com/s2/favicons?domain=example.com&sz=128`,
    colors: {
      primary: "#0F172A",
      secondary: "#64748B",
      accent: "#3B82F6",
      background: "#FFFFFF",
      text_primary: "#0F172A",
      text_secondary: "#475569",
    },
    fonts: { primary: "Inter", heading: "Inter", all: ["Inter"] },
    tone_of_voice: "confident, modern, friendly",
    product_categories: ["general"],
    target_audience: "Modern consumers seeking quality and design.",
    value_propositions: ["Quality", "Design", "Trust"],
    raw: { dev_stub: true },
    warnings: [],
  });
}

/* ── Error boundary ─────────────────────────────────────────── */
class BrandKitErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error("[BrandKitStep] render error:", error);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              Something went wrong rendering the brand kit
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono break-all">
            {this.state.error.message}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              this.setState({ error: null });
              this.props.onReset();
            }}
          >
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Map raw backend log → friendly headline ────────────────── */
function friendlyLog(message: string): string {
  if (message.includes("Starting")) return "Getting started…";
  if (message.includes("Scanning")) return "Scanning your website…";
  if (message.includes("Site scanned")) return "Site scanned ✓";
  if (message.includes("Reading your brand")) return "Reading your colors and fonts…";
  if (message.includes("Analyzing brand voice")) return "Analyzing your brand voice…";
  if (message.includes("Voice analysis complete")) return "Voice analysis complete ✓";
  if (message.includes("Brand kit ready")) return "Brand kit ready ✓";
  if (message.includes("skipped")) return "Some steps skipped — using best available data";
  if (message.startsWith("✗")) return message.replace(/^✗\s*/, "");
  return message.replace(/^[▶→✓✅⚠✗]\s*/, "");
}

/* ── Font display: loads Google Font and renders name in that face ── */
const loadedFonts = new Set<string>();
function loadGoogleFont(family: string) {
  if (!family) return;
  const key = family.trim();
  if (!key || loadedFonts.has(key)) return;
  loadedFonts.add(key);
  const id = `gf-${key.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    key,
  )}:wght@400;600&display=swap`;
  document.head.appendChild(link);
}

const FontDisplay = ({ name }: { name: string }) => {
  useEffect(() => {
    loadGoogleFont(name);
  }, [name]);
  const display = name?.trim() || "—";
  return (
    <div className="h-10 px-3 flex items-center rounded-md border border-input bg-background text-sm">
      <span style={{ fontFamily: `"${display}", system-ui, sans-serif` }} className="truncate">
        {display}
      </span>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────── */
export const BrandKitStep = ({
  open,
  adAccountId,
  defaultBrandName,
  initialWebsite,
  isDevMode = false,
  onComplete,
}: BrandKitStepProps) => {
  const [phase, setPhase] = useState<Phase>("input");
  const [website, setWebsite] = useState(initialWebsite ?? "");
  const [kit, setKit] = useState<ExtractedKit | null>(null);
  const [edits, setEdits] = useState<EditableFields | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [guidelinesFile, setGuidelinesFile] = useState<File | null>(null);
  const [uploadingGuidelines, setUploadingGuidelines] = useState(false);
  const guidelinesInputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const autoStartedRef = useRef(false);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // Auto-start extraction if website was provided up front (e.g. from profile step).
  useEffect(() => {
    if (!open || autoStartedRef.current) return;
    const seed = (initialWebsite ?? "").trim();
    if (seed) {
      autoStartedRef.current = true;
      setWebsite(seed);
      // defer to next tick so state is set before handleBuild reads it
      setTimeout(() => handleBuild(seed), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialWebsite]);

  const resetToInput = () => {
    abortRef.current?.abort();
    setPhase("input");
    setKit(null);
    setEdits(null);
    setLogs([]);
    setError(null);
  };

  const seedEdits = (k: ExtractedKit) => {
    setEdits({
      brand_name: k.brand_name ?? defaultBrandName ?? "",
      logo_url: k.logo_url ?? "",
      primary_color: k.colors.primary ?? "#0F172A",
      secondary_color: k.colors.secondary ?? "#64748B",
      accent_color: k.colors.accent ?? "#3B82F6",
      heading_font: k.fonts.heading ?? k.fonts.primary ?? "Inter",
      body_font: k.fonts.primary ?? "Inter",
      tagline: k.tagline ?? "",
    });
  };

  const handleBuild = async (override?: string) => {
    const trimmed = (override ?? website).trim();
    if (!trimmed) return;
    setError(null);
    setLogs([]);
    setPhase("building");

    if (isDevMode) {
      // Simulate streaming logs in dev mode
      const fake = [
        "Scanning your website…",
        "Reading your colors and fonts…",
        "Analyzing your brand voice…",
        "Brand kit ready ✓",
      ];
      for (const m of fake) {
        await new Promise((r) => setTimeout(r, 450));
        setLogs((prev) => [...prev, m]);
      }
      const stub = devStubKit(defaultBrandName);
      setKit(stub);
      seedEdits(stub);
      setPhase("preview");
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const controller = new AbortController();
      abortRef.current = controller;

      const url = `https://bhcusyaonpevmwaruvlx.supabase.co/functions/v1/extract-brand-kit`;
      // NOTE: apikey header is required by the Lovable Cloud functions gateway,
      // even when verify_jwt=false. Without it the gateway returns 401 before
      // our code runs. Use the prod anon key (same key the supabase-js client
      // uses internally for invoke()).
      const { SUPABASE_PUBLISHABLE_KEY } = await import("@/integrations/prod/client");
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ websiteUrl: trimmed }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Extractor failed [${resp.status}]: ${text.slice(0, 200)}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent: string | null = null;
      let finished = false;

      while (!finished) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);

          if (line === "") {
            currentEvent = null;
            continue;
          }
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
            continue;
          }
          if (line.startsWith("data: ")) {
            const payload = line.slice(6);
            try {
              const data = JSON.parse(payload);
              if (currentEvent === "log") {
                const friendly = friendlyLog(String(data?.message ?? ""));
                setLogs((prev) => [...prev, friendly]);
                console.debug("[brand-kit log]", data);
              } else if (currentEvent === "result") {
                const normalized = normalizeKit(data);
                setKit(normalized);
                seedEdits(normalized);
                setPhase("preview");
                finished = true;
                break;
              } else if (currentEvent === "error") {
                throw new Error(data?.error || "Extractor error");
              }
            } catch (parseErr) {
              if (currentEvent === "error") throw parseErr;
              // partial JSON — re-buffer
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      }

      if (!finished) throw new Error("Stream ended before result was received.");
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Brand kit extraction error:", err);
      setError(err?.message || "Failed to build brand kit.");
      setPhase("input");
    }
  };

  const handleConfirm = async () => {
    if (!kit || !edits) return;
    setSaving(true);
    try {
      // Compose the full jsonb payload — everything we extracted, including hidden fields.
      const brandKitJson = {
        ...kit.raw,
        target_audience: kit.target_audience,
        value_propositions: kit.value_propositions,
        favicon_url: kit.favicon_url,
        screenshot_url: kit.screenshot_url,
        heading_font: edits.heading_font,
        body_font: edits.body_font,
        all_fonts: kit.fonts.all,
        all_colors: kit.colors,
        warnings: kit.warnings,
      };

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // In dev mode, the selected adAccountId is a Meta string id (e.g.
      // "act_111222333"), not a uuid — bypass all Supabase writes regardless
      // of whether a real auth session happens to exist.
      if (isDevMode || !user) {
        if (!isDevMode && !user) throw new Error("Not authenticated");

        sessionStorage.setItem(
          "dev_brand_kit_profile",
          JSON.stringify({
            ad_account_id: adAccountId,
            brand_name: edits.brand_name || null,
            logo_url: edits.logo_url || null,
            primary_color: edits.primary_color,
            secondary_color: edits.secondary_color,
            accent_color: edits.accent_color,
            font_family: edits.body_font,
            tagline: edits.tagline || null,
            tone_of_voice: kit.tone_of_voice,
            product_categories: kit.product_categories,
            website_url: kit.website_url,
            brand_kit: brandKitJson,
            brand_kit_status: "completed",
            brand_kit_updated_at: new Date().toISOString(),
            confirmed: true,
          }),
        );
        toast.success("Brand kit saved for dev session!");
        onComplete();
        return;
      }

      // Optional: upload brand guidelines PDF to private storage (skipped in dev mode)
      if (guidelinesFile && !isDevMode) {
        setUploadingGuidelines(true);
        try {
          const safeName = guidelinesFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `${user.id}/${adAccountId}/${Date.now()}-${safeName}`;
          const { error: uploadErr } = await supabase.storage
            .from("brand-guidelines")
            .upload(path, guidelinesFile, {
              contentType: guidelinesFile.type || "application/pdf",
              upsert: false,
            });
          if (uploadErr) throw uploadErr;
        } finally {
          setUploadingGuidelines(false);
        }
      }

      const lovableAccountId = await getCurrentAccountId();
      const { error: upsertErr } = await supabase
        .from("ad_account_profiles")
        .upsert(
          {
            account_id: lovableAccountId,
            ad_account_id: adAccountId,
            user_id: user.id,
            brand_name: edits.brand_name || null,
            logo_url: edits.logo_url || null,
            primary_color: edits.primary_color,
            secondary_color: edits.secondary_color,
            accent_color: edits.accent_color,
            font_family: edits.body_font,
            tagline: edits.tagline || null,
            tone_of_voice: kit.tone_of_voice, // hidden from UI, still saved
            product_categories: kit.product_categories, // hidden from UI, still saved
            website_url: kit.website_url,
            brand_kit: brandKitJson,
            brand_kit_status: "completed",
            brand_kit_updated_at: new Date().toISOString(),
            confirmed: true,
          },
          { onConflict: "user_id,ad_account_id" },
        );

      if (upsertErr) throw upsertErr;
      toast.success("Brand kit saved!");
      onComplete();
    } catch (err: any) {
      console.error("Brand kit confirm error:", err);
      toast.error(err?.message || "Failed to save brand kit");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof EditableFields>(key: K, value: EditableFields[K]) => {
    setEdits((prev) => (prev ? { ...prev, [key]: value } : prev));
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
            We'll build a brand kit so every generated creative looks on-brand.
          </DialogDescription>
        </DialogHeader>

        <BrandKitErrorBoundary onReset={resetToInput}>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && website.trim()) handleBuild();
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  We'll extract your logo, colors, fonts, and tagline from this site.
                </p>
              </div>
              {error && (
                <div className="p-3 rounded-md border border-destructive/30 bg-destructive/5 text-xs text-destructive">
                  {error}
                </div>
              )}
              <Button
                className="w-full gap-2"
                size="lg"
                disabled={!website.trim()}
                onClick={() => handleBuild()}
              >
                Build my brand kit <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {phase === "building" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 space-y-4"
            >
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing {website}…</p>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3 max-h-44 overflow-hidden">
                <div className="space-y-1.5">
                  <AnimatePresence initial={false}>
                    {logs.slice(-6).map((line, i, arr) => {
                      const opacity = 0.4 + (0.6 * (i + 1)) / arr.length;
                      return (
                        <motion.div
                          key={`${logs.length - arr.length + i}-${line}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-xs text-foreground font-mono leading-relaxed"
                        >
                          {line}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {logs.length === 0 && (
                    <div className="text-xs text-muted-foreground italic">Connecting…</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {phase === "preview" && kit && edits && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 pt-2 max-h-[60vh] overflow-y-auto pr-1"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                {edits.logo_url ? (
                  <img
                    src={edits.logo_url}
                    alt={`${edits.brand_name || "Brand"} logo`}
                    className="w-10 h-10 rounded object-contain bg-muted"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted" />
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <Input
                    value={edits.brand_name}
                    onChange={(e) => updateField("brand_name", e.target.value)}
                    className="h-8 text-sm font-semibold"
                    placeholder="Brand name"
                  />
                  <Input
                    value={edits.logo_url}
                    onChange={(e) => updateField("logo_url", e.target.value)}
                    className="h-7 text-xs font-mono text-muted-foreground"
                    placeholder="Logo URL"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                  Color palette
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["primary_color", "Primary"],
                      ["secondary_color", "Secondary"],
                      ["accent_color", "Accent"],
                    ] as const
                  ).map(([k, label]) => (
                    <div key={k} className="space-y-1">
                      <div
                        className="h-12 rounded-md border border-border"
                        style={{ background: edits[k] }}
                      />
                      <Input
                        value={edits[k]}
                        onChange={(e) => updateField(k, e.target.value)}
                        className="h-7 text-xs font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground text-center">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    Heading font
                  </Label>
                  <FontDisplay name={edits.heading_font} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    Body font
                  </Label>
                  <FontDisplay name={edits.body_font} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Tagline</Label>
                <Textarea
                  value={edits.tagline}
                  onChange={(e) => updateField("tagline", e.target.value)}
                  rows={2}
                  placeholder="A short line that captures your brand"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Brand guidelines (optional)
                </Label>
                <input
                  ref={guidelinesInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (f && f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
                      toast.error("Please upload a PDF file.");
                      e.target.value = "";
                      return;
                    }
                    if (f && f.size > 20 * 1024 * 1024) {
                      toast.error("File too large. Max 20MB.");
                      e.target.value = "";
                      return;
                    }
                    setGuidelinesFile(f);
                  }}
                />
                {guidelinesFile ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-md border border-border bg-muted/30">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{guidelinesFile.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {(guidelinesFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setGuidelinesFile(null);
                        if (guidelinesInputRef.current) guidelinesInputRef.current.value = "";
                      }}
                      disabled={saving}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 h-auto py-3 border-dashed"
                    onClick={() => guidelinesInputRef.current?.click()}
                    disabled={saving}
                  >
                    <Upload className="w-4 h-4" />
                    Upload brand guidelines PDF
                  </Button>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Optional. We'll keep this on file for future reference.
                </p>
              </div>

              {kit.warnings.length > 0 && (
                <div className="text-xs text-muted-foreground italic">
                  Note: some details were inferred — please review before confirming.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={resetToInput}
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
                  {saving ? (uploadingGuidelines ? "Uploading…" : "Saving…") : "Confirm brand kit"}
                </Button>
              </div>
            </motion.div>
          )}
        </BrandKitErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};
