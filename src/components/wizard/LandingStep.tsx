import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Bug } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWizard } from "@/context/WizardContext";
import metaLogo from "@/assets/meta-logo.png";

/* ── Meta logo as image ── */
const MetaLogo = ({ className }: { className?: string }) => (
  <img src={metaLogo} alt="Meta" className={className} style={{ objectFit: "contain" }} />
);

/* ── Mock ad creative cards for the showcase ── */
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

export const LandingStep = () => {
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();
  const { updateState } = useWizard();

  // Listen for popup auth completion
  const handleAuthMessage = useCallback((event: MessageEvent) => {
    if (event.data?.type === "META_AUTH_COMPLETE") {
      const { connectionData } = event.data;
      sessionStorage.setItem("meta_connection", JSON.stringify(connectionData));
      // Check if new or returning user
      if (connectionData.isNewUser) {
        navigate("/onboarding?meta=connected&new=true");
      } else {
        // Returning user — go straight to insights with their default account
        updateState({
          metaConnected: true,
          profileComplete: true,
          selectedAccount: connectionData.defaultAdAccountId || null,
          selectedAccountName: connectionData.defaultAdAccountName || null,
          selectedMetaAccountId: connectionData.defaultMetaAccountId || null,
        });
        navigate("/home");
      }
      setConnecting(false);
    }
    if (event.data?.type === "META_AUTH_ERROR") {
      toast.error(event.data.error || "Meta connection failed");
      setConnecting(false);
    }
  }, [navigate, updateState]);

  useEffect(() => {
    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [handleAuthMessage]);

  const handleConnectMeta = async () => {
    setConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/meta-callback`;
      const { data, error } = await supabase.functions.invoke("meta-oauth?action=get-auth-url", { body: { redirectUri } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Open Meta login in a new window; callback posts message back
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      const popup = window.open(
        data.authUrl,
        "meta-auth",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      // If popup was blocked, fall back to same-window redirect
      if (!popup) {
        window.location.href = data.authUrl;
        return;
      }

      // Poll for popup close without completion
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
    // Mock a new user with sample data
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
    updateState({ metaConnected: true });
    navigate("/onboarding?meta=connected&new=true&dev=true");
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
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center px-6 sm:px-12 lg:px-16 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          <div className="flex items-center gap-2 justify-center mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Zap className="w-4 h-4 text-primary-foreground" /></div>
            <span className="font-display font-bold text-lg text-foreground">CreativeGen</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">Better ads, that actually works.</h1>
          <p className="text-sm text-muted-foreground text-center mb-10">Connect your Meta account to get started</p>
          <Button size="lg" variant="outline" onClick={handleConnectMeta} disabled={connecting} className="w-full gap-1.5 h-12 text-sm font-medium border-border bg-background hover:bg-accent hover:text-accent-foreground rounded-full">
            {connecting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</>
            ) : (
              <>Login with <MetaLogo className="h-6 w-auto" /></>
            )}
          </Button>
          <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" /></div>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <input type="email" placeholder="Email" disabled className="w-full h-12 pl-11 pr-4 rounded-full border bg-secondary/40 text-sm text-muted-foreground placeholder:text-muted-foreground/60 cursor-not-allowed" />
          </div>
          <Button variant="secondary" disabled className="w-full mt-3 h-12 rounded-full text-sm font-medium text-muted-foreground">Continue with email</Button>
          
          {/* Dev bypass button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDevBypass}
            className="w-full mt-4 gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Bug className="w-3.5 h-3.5" />
            Dev Mode — Test New User Flow
          </Button>

          <p className="text-[11px] text-muted-foreground text-center mt-6"><a href="#" className="hover:underline text-primary">Privacy Policy</a>{" · "}<a href="#" className="hover:underline text-primary">Terms of Service</a></p>
        </motion.div>
      </div>
    </div>
  );
};
