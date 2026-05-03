import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/prod/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  ExternalLink,
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
  | "auth"
  | "connect-meta"
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

  const [phase, setPhase] = useState<Phase>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  const [website, setWebsite] = useState("");
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  const [brandStepIdx, setBrandStepIdx] = useState(0);
  const [adsStepIdx, setAdsStepIdx] = useState(0);

  const popupRef = useRef<Window | null>(null);

  /* ── On mount: check session / handle ?meta=connected return ── */
  useEffect(() => {
    sessionStorage.setItem("auth_flow_version", "v2new");

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setPhase("auth");
        return;
      }

      // Returning from Meta OAuth fallback redirect
      if (searchParams.get("meta") === "connected") {
        await loadAccountsAndContinue();
        return;
      }

      // Already authed but no Meta yet
      setPhase("connect-meta");
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
      } else if (event.data?.type === "META_AUTH_ERROR") {
        toast.error(event.data.error || "Meta connection failed");
        setConnecting(false);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  /* ── Auth: email/password sign-in (or sign-up if not exists) ── */
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        // try sign-up as a fallback
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/loginv2" },
        });
        if (signUpErr) throw signUpErr;
        toast.success("Account created — check your email to confirm.");
        return;
      }
      setPhase("connect-meta");
    } catch (err: any) {
      toast.error(err.message || "Sign in failed");
    } finally {
      setAuthLoading(false);
    }
  };

  /* ── Meta OAuth ──────────────────────────────────────────── */
  const handleConnectMeta = async () => {
    setConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.functions.invoke(
        "meta-oauth?action=get-auth-url",
        { body: { redirectUri } }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Open in popup; fall back to full redirect if blocked
      const popup = window.open(
        data.authUrl,
        "meta-oauth",
        "width=600,height=720"
      );
      if (!popup) {
        window.location.href = data.authUrl;
        return;
      }
      popupRef.current = popup;
    } catch (err: any) {
      toast.error(err.message || "Failed to start Meta connection");
      setConnecting(false);
    }
  };

  /* ── After Meta auth: fetch ad accounts from DB ──────────── */
  const loadAccountsAndContinue = async () => {
    setConnecting(false);
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

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {phase === "auth" && (
          <PhaseShell key="auth">
            <Card className="w-full max-w-sm p-8">
              <div className="flex items-center gap-2 justify-center mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-lg text-foreground">
                  SixLabs
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground text-center mb-1">
                Welcome to SixLabs
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Sign in to continue
              </p>
              <form onSubmit={handleAuth} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Continue <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </PhaseShell>
        )}

        {phase === "connect-meta" && (
          <PhaseShell key="connect-meta">
            <Card className="w-full max-w-md p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 text-primary"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Connect your Meta Ads account
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                We'll pull your ad accounts so you can pick the one you want to
                analyze. Read-only access.
              </p>
              <Button
                size="lg"
                className="gap-2 w-full"
                onClick={handleConnectMeta}
                disabled={connecting}
              >
                {connecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                {connecting ? "Connecting…" : "Connect with Meta"}
              </Button>
            </Card>
          </PhaseShell>
        )}

        {phase === "select-account" && (
          <PhaseShell key="select-account">
            <Card className="w-full max-w-lg p-8">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  Select your default ad account
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                You can change this later in settings.
              </p>
              {accounts.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Loading your ad accounts…
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedAccountId === acc.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="font-semibold text-sm text-foreground">
                        {acc.account_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {acc.account_id_meta}
                        {acc.currency ? ` · ${acc.currency}` : ""}
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
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          </PhaseShell>
        )}

        {phase === "explainer" && (
          <PhaseShell key="explainer">
            <Card className="w-full max-w-2xl p-10">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Here's what SixLabs will do for you
                </h2>
                <p className="text-muted-foreground">
                  Three things, all running in the background.
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
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
            </Card>
          </PhaseShell>
        )}

        {phase === "website-input" && (
          <PhaseShell key="website-input">
            <Card className="w-full max-w-md p-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                What's your website?
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                We'll use it to build your brand kit.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  startBrandPull();
                }}
                className="space-y-4"
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
              </form>
            </Card>
          </PhaseShell>
        )}

        {phase === "brand-loading" && (
          <PhaseShell key="brand-loading">
            <Card className="w-full max-w-md p-8">
              <div className="flex items-center gap-3 mb-5">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  Building your brand kit
                </h2>
              </div>
              <StepList steps={BRAND_STEPS} activeIdx={brandStepIdx} />
            </Card>
          </PhaseShell>
        )}

        {phase === "brand-preview" && brandKit && (
          <PhaseShell key="brand-preview">
            <Card className="w-full max-w-2xl p-8">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Your brand kit
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Here's what we found for{" "}
                <span className="font-medium text-foreground">
                  {brandKit.brand_name || website}
                </span>
                .
              </p>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
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

              <Button size="lg" className="w-full gap-2" onClick={startAdsPull}>
                Looks good — pull my ads <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          </PhaseShell>
        )}

        {phase === "ads-loading" && (
          <PhaseShell key="ads-loading">
            <Card className="w-full max-w-md p-8">
              <div className="flex items-center gap-3 mb-1">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  Pulling your Meta data
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Hang tight — this takes a moment.
              </p>
              <StepList steps={ADS_STEPS} activeIdx={adsStepIdx} />
            </Card>
          </PhaseShell>
        )}

        {phase === "complete" && (
          <PhaseShell key="complete">
            <Card className="w-full max-w-md p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5"
              >
                <PartyPopper className="w-8 h-8 text-emerald-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                You're all set!
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {selectedAccountName
                  ? `${selectedAccountName} is connected and your data is ready.`
                  : "Your account is connected and your data is ready."}
              </p>
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={() => navigate("/home")}
              >
                Go to dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          </PhaseShell>
        )}
      </AnimatePresence>
    </div>
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
