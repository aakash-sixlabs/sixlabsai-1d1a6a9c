import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${ad.color} flex items-center justify-center text-[10px] font-bold text-white`}>
          {ad.brand.charAt(0)}
        </div>
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

/* Infinite vertical scroll column */
const ScrollColumn = ({ ads, direction = "up", duration = 35 }: { ads: typeof mockAds; direction?: "up" | "down"; duration?: number }) => {
  const doubled = [...ads, ...ads]; // duplicate for seamless loop
  const animName = direction === "up" ? "scrollUp" : "scrollDown";
  return (
    <div className="overflow-hidden h-full relative">
      {/* Top/bottom fade masks */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-secondary/50 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-secondary/50 to-transparent z-10 pointer-events-none" />
      <div
        className="flex flex-col gap-4"
        style={{
          animation: `${animName} ${duration}s linear infinite`,
        }}
      >
        {doubled.map((ad, i) => (
          <AdCard key={`${ad.brand}-${i}`} ad={ad} />
        ))}
      </div>
    </div>
  );
};

export const LandingStep = () => {
  const { setStep, updateState } = useWizard();
  const [connecting, setConnecting] = useState(false);

  const handleConnectMeta = async () => {
    setConnecting(true);
    try {
      const stored = sessionStorage.getItem("meta_connection");
      if (stored) {
        updateState({ metaConnected: true });
        setStep("account-select");
        return;
      }

      const redirectUri = `${window.location.origin}/meta-callback`;
      const { data, error } = await supabase.functions.invoke(
        "meta-oauth?action=get-auth-url",
        { body: { redirectUri } }
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      window.location.href = data.authUrl;
    } catch (err: any) {
      console.error("Meta connect error:", err);
      toast.error(err.message || "Failed to start Meta connection");
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: Ad creative showcase ── */}
      <div className="hidden lg:flex lg:w-[55%] bg-secondary/50 p-8 items-center justify-center overflow-hidden relative">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        {/* Floating brand mark */}
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">CreativeGen</span>
        </div>

        {/* Scrolling columns */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative w-full max-w-2xl h-[calc(100vh-4rem)] grid grid-cols-3 gap-4 px-4"
        >
          <ScrollColumn ads={col1} direction="up" duration={40} />
          <ScrollColumn ads={col2} direction="down" duration={35} />
          <ScrollColumn ads={col3} direction="up" duration={45} />
        </motion.div>
      </div>

      {/* ── Right panel: Login ── */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center px-6 sm:px-12 lg:px-16 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile-only brand mark */}
          <div className="flex items-center gap-2 justify-center mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">CreativeGen</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
            Welcome to CreativeGen
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-10">
            Generate data-driven ad creatives in minutes.
          </p>

          {/* Meta login button */}
          <Button
            size="lg"
            variant="outline"
            onClick={handleConnectMeta}
            disabled={connecting}
            className="w-full gap-3 h-12 text-sm font-medium border-border hover:bg-secondary/80 rounded-full"
          >
            {connecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1877F2]" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            )}
            {connecting ? "Connecting…" : "Continue with Meta"}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email placeholder (disabled/coming soon feel) */}
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              type="email"
              placeholder="Email"
              disabled
              className="w-full h-12 pl-11 pr-4 rounded-full border bg-secondary/40 text-sm text-muted-foreground placeholder:text-muted-foreground/60 cursor-not-allowed"
            />
          </div>

          <Button
            variant="secondary"
            disabled
            className="w-full mt-3 h-12 rounded-full text-sm font-medium text-muted-foreground"
          >
            Continue with email
          </Button>

          <p className="text-[11px] text-muted-foreground text-center mt-8">
            <a href="#" className="hover:underline text-primary">Privacy Policy</a>
            {" · "}
            <a href="#" className="hover:underline text-primary">Terms of Service</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
