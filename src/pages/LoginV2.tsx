import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/prod/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LandingV2Step } from "@/components/wizard/LandingV2Step";
import { DashboardBackground } from "@/components/wizard/DashboardBackground";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  Building2,
  ArrowRight,
  Check,
  Sparkles,
  Globe,
  Palette,
  Type as TypeIcon,
  PartyPopper,
  Rocket,
  Wand2,
  BarChart3,
  Star,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */
interface AdAccount {
  id: string;
  account_id_meta: string;
  account_name: string;
  currency: string | null;
  timezone: string | null;
}

interface BrandKit {
  brand_name: string | null;
  tagline: string | null;
  logo_url: string | null;
  website_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_family: string | null;
  industry: string | null;
  product_categories: string[] | null;
}

type Phase =
  | "landing"
  | "select-account"
  | "explainer"
  | "website-input"
  | "brand-loading"
  | "brand-preview"
  | "ads-loading"
  | "complete";

/* ── Mocked sync steps ─────────────────────────────────────── */
const ADS_STEPS = [
  { label: "Connecting to Meta", duration: 1200 },
  { label: "Pulling campaigns", duration: 1500 },
  { label: "Pulling ads & creatives", duration: 4500 },
  { label: "Pulling performance insights", duration: 4500 },
  { label: "Finalizing your dashboard", duration: 1500 },
];

const BRAND_STEPS = [
  { label: "Fetching website", duration: 1200 },
  { label: "Extracting colors & typography", duration: 1400 },
  { label: "Analyzing brand voice", duration: 1400 },
];

/* ── Page ──────────────────────────────────────────────────── */
const LoginV2 = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [phase, setPhase] = useState<Phase>("landing");

  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  const [website, setWebsite] = useState("");
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  const [brandStepIdx, setBrandStepIdx] = useState(0);
  const [adsStepIdx, setAdsStepIdx] = useState(0);

  /* ── On mount: handle ?meta=connected return ─────────────── */
  useEffect(() => {
    sessionStorage.setItem("auth_flow_version", "v2new");

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Returning from Meta OAuth fallback redirect
      if (session && searchParams.get("meta") === "connected") {
        await loadAccountsAndContinue();
        return;
      }

      setPhase("landing");
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Listen for popup completion ─────────────────────────── */
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "META_AUTH_COMPLETE") {
        const conn = event.data.connectionData;
        sessionStorage.setItem("meta_connection", JSON.stringify(conn));
        loadAccountsAndContinue();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  /* ── After Meta auth: fetch ad accounts from DB ──────────── */
  const loadAccountsAndContinue = async () => {
    setPhase("select-account");
    try {
      const { data, error } = await supabase
        .from("ad_accounts")
        .select("id, account_id_meta, account_name, currency, timezone")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAccounts((data as AdAccount[]) || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load ad accounts");
    }
  };

  /* ── Select account → save default → explainer ───────────── */
  const handleAccountContinue = async () => {
    if (!selectedAccountId) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ default_ad_account_id: selectedAccountId })
          .eq("id", user.id);
      }
    } catch (err) {
      console.error("save default failed", err);
    }
    setPhase("explainer");
  };

  /* ── Brand kit pull (mocked progress + DB read) ──────────── */
  const startBrandPull = async () => {
    if (!website.trim()) {
      toast.error("Enter your website URL");
      return;
    }
    setPhase("brand-loading");
    setBrandStepIdx(0);

    // Step through fake progress
    let i = 0;
    const advance = () => {
      i++;
      if (i < BRAND_STEPS.length) {
        setBrandStepIdx(i);
        setTimeout(advance, BRAND_STEPS[i].duration);
      }
    };
    setTimeout(advance, BRAND_STEPS[0].duration);

    // Load brand kit from DB (no live calls)
    const totalDelay = BRAND_STEPS.reduce((s, st) => s + st.duration, 0);
    setTimeout(async () => {
      try {
        if (!selectedAccountId) {
          setBrandKit(fallbackKit(website));
        } else {
          const { data } = await supabase
            .from("ad_account_profiles")
            .select(
              "brand_name, tagline, logo_url, website_url, primary_color, secondary_color, accent_color, font_family, industry, product_categories"
            )
            .eq("ad_account_id", selectedAccountId)
            .maybeSingle();

          setBrandKit(
            (data as BrandKit) ?? fallbackKit(website)
          );
        }
      } catch {
        setBrandKit(fallbackKit(website));
      }
      setPhase("brand-preview");
    }, totalDelay + 300);
  };

  /* ── Ads pull (fully mocked) ─────────────────────────────── */
  const startAdsPull = () => {
    setPhase("ads-loading");
    setAdsStepIdx(0);
    let i = 0;
    const advance = () => {
      i++;
      if (i < ADS_STEPS.length) {
        setAdsStepIdx(i);
        setTimeout(advance, ADS_STEPS[i].duration);
      } else {
        setPhase("complete");
      }
    };
    setTimeout(advance, ADS_STEPS[0].duration);
  };

  const selectedAccountName =
    accounts.find((a) => a.id === selectedAccountId)?.account_name ?? "";

  // Landing phase: full-screen split layout (matches LoginV1)
  if (phase === "landing") {
    return (
      <div className="min-h-screen bg-background">
        <LandingV2Step />
      </div>
    );
  }

  // All subsequent phases: dashboard skeleton background + modal dialogs (matches OnboardingV2)
  return (
    <>
      <DashboardBackground />

      {/* Phase: Select Account */}
      <Dialog open={phase === "select-account"} modal>
        <DialogContent
          className="sm:max-w-lg [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-primary" />
              </div>
              Select Your Default Ad Account
            </DialogTitle>
            <DialogDescription>
              Choose the primary account you'd like to analyze. You can change this later.
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-2"
          >
            {accounts.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedAccountId === acc.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-foreground">
                          {acc.account_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {acc.account_id_meta}
                          {acc.currency ? ` · ${acc.currency}` : ""}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <Button
              className="w-full gap-2"
              size="lg"
              disabled={!selectedAccountId}
              onClick={handleAccountContinue}
            >
              Set as Default & Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Phase: Explainer */}
      <Dialog open={phase === "explainer"} modal>
        <DialogContent
          className="sm:max-w-2xl [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-primary" />
              </div>
              Here's what SixLabs will do for you
            </DialogTitle>
            <DialogDescription>
              Three things, all running in the background.
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 pt-2"
          >
            <div className="grid sm:grid-cols-3 gap-3">
              <ExplainerTile
                icon={<Palette className="w-5 h-5" />}
                title="Build your brand kit"
                body="Colors, fonts, voice — pulled straight from your site."
              />
              <ExplainerTile
                icon={<BarChart3 className="w-5 h-5" />}
                title="Analyze your ads"
                body="We sync your Meta ads, creatives & performance data."
              />
              <ExplainerTile
                icon={<Wand2 className="w-5 h-5" />}
                title="Generate winning creatives"
                body="On-brand ad variations, ready to ship."
              />
            </div>
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => setPhase("website-input")}
            >
              Let's go <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Phase: Website Input */}
      <Dialog open={phase === "website-input"} modal>
        <DialogContent
          className="sm:max-w-md [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              What's your website?
            </DialogTitle>
            <DialogDescription>
              We'll use it to build your brand kit (logo, colors, fonts).
            </DialogDescription>
          </DialogHeader>
          <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              startBrandPull();
            }}
            className="space-y-4 pt-2"
          >
            <Input
              placeholder="yourbrand.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full gap-2" size="lg">
              Analyze brand <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.form>
        </DialogContent>
      </Dialog>

      {/* Phase: Brand Loading */}
      <Dialog open={phase === "brand-loading"} modal>
        <DialogContent
          className="sm:max-w-md [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
              Building your brand kit
            </DialogTitle>
            <DialogDescription>
              Analyzing your website to extract brand details.
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <StepList steps={BRAND_STEPS} activeIdx={brandStepIdx} />
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Phase: Brand Preview */}
      <Dialog open={phase === "brand-preview" && !!brandKit} modal>
        <DialogContent
          className="sm:max-w-2xl [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              Your brand kit
            </DialogTitle>
            <DialogDescription>
              Here's what we found for{" "}
              <span className="font-medium text-foreground">
                {brandKit?.brand_name || website}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          {brandKit && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 pt-2"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Brand
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">
                      {brandKit.brand_name || "—"}
                    </div>
                    {brandKit.tagline && (
                      <div className="text-sm text-muted-foreground italic">
                        "{brandKit.tagline}"
                      </div>
                    )}
                    {brandKit.industry && (
                      <div className="text-xs text-muted-foreground">
                        Industry: {brandKit.industry}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> Colors
                  </div>
                  <div className="flex gap-2">
                    {[
                      brandKit.primary_color,
                      brandKit.secondary_color,
                      brandKit.accent_color,
                    ]
                      .filter(Boolean)
                      .map((c, i) => (
                        <div key={i} className="text-center">
                          <div
                            className="w-12 h-12 rounded-lg border border-border"
                            style={{ backgroundColor: c as string }}
                          />
                          <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                            {c}
                          </div>
                        </div>
                      ))}
                    {!brandKit.primary_color &&
                      !brandKit.secondary_color &&
                      !brandKit.accent_color && (
                        <div className="text-sm text-muted-foreground">
                          No colors detected
                        </div>
                      )}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                    <TypeIcon className="w-3.5 h-3.5" /> Typography
                  </div>
                  <div className="text-sm text-foreground">
                    {brandKit.font_family || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Categories
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(brandKit.product_categories ?? []).slice(0, 6).map(
                      (cat, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground"
                        >
                          {cat}
                        </span>
                      )
                    )}
                    {(!brandKit.product_categories ||
                      brandKit.product_categories.length === 0) && (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={startAdsPull}
              >
                Looks good — pull my ads <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Phase: Ads Loading */}
      <Dialog open={phase === "ads-loading"} modal>
        <DialogContent
          className="sm:max-w-md [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
              Pulling Your Data
            </DialogTitle>
            <DialogDescription>
              We're importing your campaign, ad, and creative data from Meta.
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <StepList steps={ADS_STEPS} activeIdx={adsStepIdx} />
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Phase: Complete */}
      <Dialog open={phase === "complete"} modal>
        <DialogContent
          className="sm:max-w-md [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <PartyPopper className="w-4 h-4 text-emerald-600" />
              </div>
              You're all set!
            </DialogTitle>
            <DialogDescription>
              {selectedAccountName
                ? `${selectedAccountName} is connected and your data is ready.`
                : "Your account is connected and your data is ready."}
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => navigate("/home")}
            >
              Go to dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ── Helpers ───────────────────────────────────────────────── */
function fallbackKit(website: string): BrandKit {
  return {
    brand_name: website.replace(/^https?:\/\//, "").split("/")[0],
    tagline: null,
    logo_url: null,
    website_url: website,
    primary_color: null,
    secondary_color: null,
    accent_color: null,
    font_family: null,
    industry: null,
    product_categories: [],
  };
}

const PhaseShell = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.25 }}
    className="min-h-screen flex items-center justify-center px-4 py-10"
  >
    {children}
  </motion.div>
);

const ExplainerTile = ({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
      {icon}
    </div>
    <div className="font-semibold text-sm text-foreground mb-1">{title}</div>
    <div className="text-xs text-muted-foreground">{body}</div>
  </div>
);

const StepList = ({
  steps,
  activeIdx,
}: {
  steps: { label: string; duration: number }[];
  activeIdx: number;
}) => (
  <div className="space-y-3">
    {steps.map((s, i) => {
      const done = i < activeIdx;
      const active = i === activeIdx;
      return (
        <div key={i} className="flex items-center gap-3">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              done
                ? "bg-emerald-500 text-white"
                : active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {done ? (
              <Check className="w-3 h-3" />
            ) : active ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <span className="text-[10px]">{i + 1}</span>
            )}
          </div>
          <span
            className={`text-sm ${
              active
                ? "text-foreground font-medium"
                : done
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {s.label}
          </span>
        </div>
      );
    })}
  </div>
);

export default LoginV2;
