import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Bug, KeyRound, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWizard } from "@/context/WizardContext";
import metaLogo from "@/assets/meta-logo.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enableDevSession } from "@/lib/devMode";

/**
 * LandingV1Step
 *
 * Variant of LandingStep wired to onboarding flow **v1** (`/onboarding`).
 * Does NOT reference `/onboarding-v2` anywhere.
 */

const MetaLogo = ({ className }: { className?: string }) => (
  <img src={metaLogo} alt="Meta" className={className} style={{ objectFit: "contain" }} />
);

const mockAds = [
  { brand: "Glow Skin Co.", category: "Beauty & Skincare", type: "Static ad", color: "from-rose-400 to-orange-300", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop" },
  { brand: "FitFuel", category: "Health & Nutrition", type: "Carousel ad", color: "from-emerald-400 to-teal-500", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=500&fit=crop" },
  { brand: "UrbanThreads", category: "Fashion", type: "UGC video", color: "from-violet-400 to-indigo-500", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop" },
  { brand: "PetPals", category: "Pet supplies", type: "Animated ad", color: "from-amber-300 to-yellow-500", img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=500&fit=crop" },
  { brand: "WanderPack", category: "Travel gear", type: "Static ad", color: "from-sky-400 to-blue-500", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop" },
  { brand: "BrightHome", category: "Home decor", type: "Static ad", color: "from-pink-400 to-fuchsia-500", img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=500&fit=crop" },
  { brand: "BrewCraft", category: "Food & Beverage", type: "Carousel ad", color: "from-orange-400 to-red-500", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=500&fit=crop" },
  { brand: "ZenMat", category: "Wellness", type: "UGC video", color: "from-teal-300 to-cyan-500", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop" },
];

const col1 = [mockAds[0], mockAds[1], mockAds[2], mockAds[3]];
const col2 = [mockAds[4], mockAds[5], mockAds[6], mockAds[7]];
const col3 = [mockAds[2], mockAds[5], mockAds[0], mockAds[7]];

const AdCard = ({ ad }: { ad: typeof mockAds[0] }) => (
  <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex-shrink-0 w-full">
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${ad.color} flex items-center justify-center text-[10px] font-bold text-white`}>{ad.brand.charAt(0)}</div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{ad.brand}</p>
          <p className="text-[10px] text-muted-foreground">{ad.category}</p>
        </div>
      </div>
      <div className="rounded-lg overflow-hidden aspect-[3/4] bg-muted">
        <img src={ad.img} alt={ad.brand} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="mt-2">
        <span className="text-[10px] font-medium bg-secondary text-muted-foreground rounded px-1.5 py-0.5">{ad.type}</span>
      </div>
    </div>
  </div>
);

const ScrollColumn = ({ ads, direction = "up", duration = 35 }: { ads: typeof mockAds; direction?: "up" | "down"; duration?: number }) => {
  const doubled = [...ads, ...ads];
  const animName = direction === "up" ? "scrollUp" : "scrollDown";
  return (
    <div className="overflow-hidden h-full relative">
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-secondary/50 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-secondary/50 to-transparent z-10 pointer-events-none" />
      <div className="flex flex-col gap-4" style={{ animation: `${animName} ${duration}s linear infinite` }}>
        {doubled.map((ad, i) => <AdCard key={`${ad.brand}-${i}`} ad={ad} />)}
      </div>
    </div>
  );
};

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight"];

// Onboarding v1 destination — used everywhere this component navigates after auth.
const ONBOARDING_V1_PATH = "/onboarding";

export const LandingV1Step = () => {
  const [connecting, setConnecting] = useState(false);
  const [easterEgg, setEasterEgg] = useState(false);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [adAccountInput, setAdAccountInput] = useState("");
  const [submittingToken, setSubmittingToken] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemoMode = searchParams.get("demo") === "true";
  const demoSuffix = isDemoMode ? "&demo=true" : "";
  const { updateState } = useWizard();

  const handleTokenSubmit = async () => {
    const token = tokenInput.trim();
    if (!token) {
      toast.error("Please paste an access token");
      return;
    }
    setSubmittingToken(true);
    try {
      const meRes = await fetch(
        `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${encodeURIComponent(token)}`
      );
      const me = await meRes.json();
      if (!meRes.ok || me.error) {
        throw new Error(me?.error?.message || "Invalid access token");
      }

      const placeholderEmail = `meta_${me.id}@users.noreply`;
      const placeholderPassword = `meta_${me.id}_pw_${me.id.slice(-6)}`;

      let signInRes = await supabase.auth.signInWithPassword({
        email: placeholderEmail,
        password: placeholderPassword,
      });

      if (signInRes.error) {
        const signUpRes = await supabase.auth.signUp({
          email: placeholderEmail,
          password: placeholderPassword,
          options: { data: { full_name: me.name, meta_user_id: me.id } },
        });
        if (signUpRes.error) throw signUpRes.error;
        signInRes = await supabase.auth.signInWithPassword({
          email: placeholderEmail,
          password: placeholderPassword,
        });
        if (signInRes.error) throw signInRes.error;
      }

      const { data, error } = await supabase.functions.invoke(
        "meta-token-connect",
        {
          body: {
            accessToken: token,
            adAccountId: adAccountInput.trim() || undefined,
          },
        }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      sessionStorage.setItem("meta_connection", JSON.stringify({
        connectionId: data.connectionId,
        userName: data.userName,
        accounts: data.accounts,
      }));
      if (adAccountInput.trim() && data.accounts?.[0]) {
        sessionStorage.setItem(
          "preselected_ad_account_id",
          data.accounts[0].id
        );
      }
      updateState({ metaConnected: true });
      setTokenInput("");
      setAdAccountInput("");
      setTokenDialogOpen(false);
      toast.success(`Connected as ${data.userName}`);
      navigate(`${ONBOARDING_V1_PATH}?meta=connected${demoSuffix}`);
    } catch (err: any) {
      console.error("Token connect error:", err);
      toast.error(err.message || "Failed to connect with token");
    } finally {
      setSubmittingToken(false);
    }
  };

  useEffect(() => {
    let pos = 0;
    const handler = (e: KeyboardEvent) => {
      if (e.key === KONAMI[pos]) {
        pos++;
        if (pos === KONAMI.length) {
          setEasterEgg(true);
          pos = 0;
        }
      } else {
        pos = 0;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleAuthMessage = useCallback((event: MessageEvent) => {
    if (event.data?.type === "META_AUTH_COMPLETE") {
      const connectionData = event.data.connectionData;
      sessionStorage.setItem("meta_connection", JSON.stringify(connectionData));
      navigate(`${ONBOARDING_V1_PATH}?meta=connected${demoSuffix}`);
      setConnecting(false);
    }
    if (event.data?.type === "META_AUTH_ERROR") {
      toast.error(event.data.error || "Meta connection failed");
      setConnecting(false);
    }
  }, [navigate, demoSuffix]);

  useEffect(() => {
    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [handleAuthMessage]);

  const handleConnectMeta = async () => {
    setConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.functions.invoke("meta-oauth?action=get-auth-url", { body: { redirectUri } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      const popup = window.open(
        data.authUrl,
        "meta-auth",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      if (!popup) {
        window.location.href = data.authUrl;
        return;
      }

      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          setConnecting(false);
        }
      }, 500);
    } catch (err: any) {
      console.error("Meta connect error:", err);
      toast.error(err.message || "Failed to start Meta connection");
      setConnecting(false);
    }
  };

  const handleDevBypass = () => {
    const mockConnectionData = {
      connectionId: "mock-connection-id",
      userName: "Alex Johnson",
      userEmail: "alex@example.com",
      metaUserId: "mock-meta-123",
      accounts: [
        { account_id: "act_111222333", name: "Glow Skin Co. Ads", currency: "USD" },
        { account_id: "act_444555666", name: "FitFuel Performance", currency: "USD" },
        { account_id: "act_777888999", name: "UrbanThreads Growth", currency: "EUR" },
      ],
      pages: [
        { id: "page_001", name: "Glow Skin Co.", category: "Beauty & Skincare" },
        { id: "page_002", name: "FitFuel", category: "Health & Nutrition" },
      ],
    };
    sessionStorage.setItem("meta_connection", JSON.stringify(mockConnectionData));
    enableDevSession();
    updateState({ metaConnected: true });
    navigate(`${ONBOARDING_V1_PATH}?dev=true&meta=connected&new=true`);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[55%] bg-secondary/50 p-8 items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="relative w-full max-w-2xl h-[calc(100vh-4rem)] grid grid-cols-3 gap-4 px-4">
          <ScrollColumn ads={col1} direction="up" duration={40} />
          <ScrollColumn ads={col2} direction="down" duration={35} />
          <ScrollColumn ads={col3} direction="up" duration={45} />
        </motion.div>
      </div>
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center px-6 sm:px-12 lg:px-16 bg-background py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          <div className="flex items-center justify-center mb-6 lg:hidden">
            <Logo heightClass="h-8" />
          </div>
          <div className="lg:hidden mb-8 relative h-56 overflow-hidden rounded-xl bg-secondary/40">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
            <div className="grid grid-cols-2 gap-3 px-3 h-full">
              <ScrollColumn ads={col1} direction="up" duration={40} />
              <ScrollColumn ads={col2} direction="down" duration={35} />
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">Better ads, that actually work.</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">Connect your Meta account to get started</p>
          <Button size="lg" variant="outline" onClick={handleConnectMeta} disabled={connecting} className="w-full gap-1.5 h-12 text-sm font-medium border-border bg-background hover:bg-accent hover:text-accent-foreground rounded-full">
            {connecting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</>
            ) : (
              <>Login with <MetaLogo className="h-6 w-auto" /></>
            )}
          </Button>
          <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" /></div>
          <div className="relative">
            {isDemoMode ? (
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            ) : (
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            )}
            <input type="email" placeholder="Email" disabled className="w-full h-12 pl-11 pr-4 rounded-full border bg-secondary/40 text-sm text-muted-foreground placeholder:text-muted-foreground/60 cursor-not-allowed" />
          </div>
          <Button variant="secondary" disabled className="w-full mt-3 h-12 rounded-full text-sm font-medium text-muted-foreground">Continue with email</Button>
          {easterEgg && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTokenDialogOpen(true)}
                className="w-full mt-2 gap-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Have an access token? Connect with token
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDevBypass}
                className="w-full mt-4 gap-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Bug className="w-3.5 h-3.5" />
                Dev Mode — Test New User Flow (v1)
              </Button>
            </>
          )}

          <p className="text-[11px] text-muted-foreground text-center mt-6"><a href="/privacy" className="hover:underline text-primary">Privacy Policy</a>{" · "}<a href="#" className="hover:underline text-primary">Terms of Service</a></p>
          {easterEgg && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mt-3 space-y-1.5">
              <button
                onClick={() => {
                  sessionStorage.setItem("easter_egg_access", "true");
                  navigate("/");
                }}
                className="text-[11px] text-muted-foreground/60 hover:text-primary transition-colors block mx-auto"
              >
                Explore Six Labs →
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              Connect with Access Token
            </DialogTitle>
            <DialogDescription>
              Paste a Meta access token to connect without OAuth. Use a long-lived
              <strong> System User token</strong> from Business Settings with
              <code className="mx-1">ads_read</code> +
              <code className="mx-1">ads_management</code> scopes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Access Token</Label>
              <Textarea
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="EAAB..."
                className="font-mono text-xs h-24 resize-none"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Ad Account ID <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                value={adAccountInput}
                onChange={(e) => setAdAccountInput(e.target.value)}
                placeholder="act_123456789 or 123456789"
                className="font-mono text-xs"
                autoComplete="off"
                spellCheck={false}
              />
              <p className="text-[11px] text-muted-foreground">
                Pull data only for this account. Leave empty to list all accessible accounts.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setTokenInput("");
                setTokenDialogOpen(false);
              }}
              disabled={submittingToken}
            >
              Cancel
            </Button>
            <Button onClick={handleTokenSubmit} disabled={submittingToken}>
              {submittingToken && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {submittingToken ? "Validating…" : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
