import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, BarChart3, Sparkles, Eye, TrendingUp, ArrowRight, Layers, Target, Brain, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── tiny hook: observe element intersection ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── connecting vertical line segment ─── */
const ConnectorLine = ({ className = "" }: { className?: string }) => (
  <div className={`flex justify-center ${className}`}>
    <div className="w-px h-24 bg-gradient-to-b from-transparent via-[hsl(220,80%,52%/0.4)] to-transparent" />
  </div>
);

/* ─── animated node dot on the connector ─── */
const ConnectorNode = () => (
  <div className="flex justify-center -my-3 relative z-10">
    <div className="w-3 h-3 rounded-full bg-primary border-2 border-[hsl(222,47%,11%)] shadow-[0_0_12px_hsl(220,80%,52%/0.5)]" />
  </div>
);

/* ─── section wrapper with scroll-reveal ─── */
const Section = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => {
  const { ref, visible } = useInView(0.1);
  return (
    <section
      ref={ref}
      id={id}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </section>
  );
};

/* ─── feature card ─── */
const FeatureCard = ({ icon: Icon, title, desc }: { icon: typeof Zap; title: string; desc: string }) => (
  <div className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-300">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <h3 className="font-display font-semibold text-[15px] text-white mb-2">{title}</h3>
    <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
  </div>
);

/* ─── how-it-works step ─── */
const StepCard = ({ num, title, desc, icon: Icon }: { num: string; title: string; desc: string; icon: typeof Zap }) => {
  const { ref, visible } = useInView(0.2);
  return (
    <div ref={ref} className={`flex gap-6 items-start transition-all duration-600 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}>
      <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <span className="text-xs font-mono text-primary/60 tracking-wider uppercase">{num}</span>
        <h3 className="font-display font-semibold text-lg text-white mt-1">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed mt-2 max-w-md">{desc}</p>
      </div>
    </div>
  );
};

/* ━━━ MAIN PAGE ━━━ */
export default function SixLabsLanding() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(222,47%,11%)] text-white overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrollY > 40 ? "bg-[hsl(222,47%,11%)/0.85] backdrop-blur-xl border-b border-white/[0.06]" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-[17px] tracking-tight">SixLabs</span>
            <span className="text-[10px] font-mono text-primary/60 bg-primary/10 rounded px-1.5 py-0.5 ml-1">AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#product" className="hover:text-white transition-colors">Product</a>
          </div>
          <Button
            size="sm"
            className="bg-white text-[hsl(222,47%,11%)] hover:bg-white/90 font-semibold text-sm rounded-lg"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background grid effect */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(220,80%,52%) 1px, transparent 1px), linear-gradient(90deg, hsl(220,80%,52%) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/[0.08] rounded-full blur-[120px]" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-white/60 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            AI-powered creative intelligence for performance marketers
          </div>

          <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
            Your ads,{" "}
            <span className="text-gradient">decoded.</span>
          </h1>

          <p className="mt-6 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Connect your ad accounts. We analyze every creative, surface what's working, and generate your next winning ad.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl px-8 h-12 text-[15px] gap-2"
              onClick={() => navigate("/login")}
            >
              Start Free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/[0.1] bg-transparent text-white/70 hover:text-white hover:bg-white/[0.05] rounded-xl px-8 h-12 text-[15px]"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See how it works
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 text-white/20">
            <span className="text-[11px] font-mono tracking-widest uppercase">Scroll</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── CONNECTOR ── */}
      <ConnectorLine />
      <ConnectorNode />
      <ConnectorLine />

      {/* ── FEATURES GRID ── */}
      <Section id="features" className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-mono text-primary/60 tracking-wider uppercase mb-3">Why SixLabs</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl">
              Creative intelligence, simplified.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <FeatureCard
              icon={Eye}
              title="Creative Analysis"
              desc="Every ad scored and dissected — visuals, copy, CTA — so you know exactly what drives results."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Performance Insights"
              desc="Surface top performers and underperformers instantly. No more digging through dashboards."
            />
            <FeatureCard
              icon={Sparkles}
              title="AI Generation"
              desc="Generate new creatives based on your winning patterns. Backed by data, not guesses."
            />
            <FeatureCard
              icon={Target}
              title="Competitor Intelligence"
              desc="See what competitors are running. Understand industry trends before they become obvious."
            />
            <FeatureCard
              icon={Layers}
              title="All Accounts, One View"
              desc="Meta, Google, TikTok — all your ad accounts connected and analyzed in a single place."
            />
            <FeatureCard
              icon={Brain}
              title="Gets Smarter Over Time"
              desc="Every ad you create makes the next one smarter. Your creative playbook, always evolving."
            />
          </div>
        </div>
      </Section>

      {/* ── CONNECTOR ── */}
      <ConnectorLine />
      <ConnectorNode />
      <ConnectorLine />

      {/* ── PRODUCT SHOWCASE ── */}
      <Section id="product" className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-mono text-primary/60 tracking-wider uppercase mb-3">The Product</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl">
              Your creative command center
            </h2>
            <p className="mt-4 text-white/40 max-w-lg mx-auto">
              One dashboard to analyze, learn, and create. No more tab-hopping.
            </p>
          </div>

          {/* Browser mockup */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 mx-8">
                <div className="max-w-xs mx-auto h-6 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <span className="text-[11px] text-white/30 font-mono">app.sixlabs.ai</span>
                </div>
              </div>
            </div>
            {/* Dashboard content mockup */}
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Sidebar mock */}
                <div className="md:col-span-1 space-y-3">
                  <div className="h-8 w-3/4 rounded-lg bg-white/[0.04]" />
                  <div className="space-y-2 mt-6">
                    {["Home", "Top Performers", "Opportunities", "Ad Library"].map((label) => (
                      <div key={label} className="h-9 rounded-lg bg-white/[0.03] flex items-center px-3">
                        <span className="text-xs text-white/30">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Main area mock */}
                <div className="md:col-span-2 space-y-4">
                  <div className="h-10 w-2/3 rounded-lg bg-white/[0.04]" />
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-[4/5] rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.06] flex items-end p-3">
                        <div className="space-y-1.5 w-full">
                          <div className="h-2 w-full rounded bg-white/[0.08]" />
                          <div className="h-2 w-2/3 rounded bg-white/[0.06]" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-32 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                      <div className="h-2 w-1/2 rounded bg-white/[0.08] mb-3" />
                      <div className="flex items-end gap-1.5 h-16">
                        {[40, 65, 45, 80, 55, 72, 60, 85].map((h, i) => (
                          <div key={i} className="flex-1 rounded-sm bg-primary/20" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="h-32 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                      <div className="h-2 w-1/3 rounded bg-white/[0.08] mb-3" />
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded bg-primary/30" style={{ width: "78%" }} />
                          <span className="text-[10px] text-white/30 font-mono">3.2x</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded bg-accent/30" style={{ width: "55%" }} />
                          <span className="text-[10px] text-white/30 font-mono">2.1x</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded bg-white/10" style={{ width: "35%" }} />
                          <span className="text-[10px] text-white/30 font-mono">1.4x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── CONNECTOR ── */}
      <ConnectorLine />
      <ConnectorNode />
      <ConnectorLine />

      {/* ── HOW IT WORKS ── */}
      <Section id="how-it-works" className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-primary/60 tracking-wider uppercase mb-3">How it works</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl">Three steps to smarter ads</h2>
          </div>
          <div className="space-y-12">
            <StepCard
              num="01"
              icon={Layers}
              title="Connect your ad accounts"
              desc="Link Meta, Google, or TikTok in seconds. We pull in all your creatives and performance data automatically."
            />
            <StepCard
              num="02"
              icon={BarChart3}
              title="Get instant creative insights"
              desc="We analyze every ad — what's winning, what's not, and why. Visual breakdowns, not spreadsheets."
            />
            <StepCard
              num="03"
              icon={Sparkles}
              title="Generate your next winner"
              desc="Use AI to create new ads informed by your best performers, competitor trends, and industry patterns."
            />
          </div>
        </div>
      </Section>

      {/* ── CONNECTOR ── */}
      <ConnectorLine />
      <ConnectorNode />
      <ConnectorLine />

      {/* ── CTA ── */}
      <Section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl">
            Stop guessing.{" "}
            <span className="text-gradient">Start knowing.</span>
          </h2>
          <p className="mt-4 text-white/40 max-w-md mx-auto">
            Get AI-powered creative intelligence and make every ad count.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-white text-[hsl(222,47%,11%)] hover:bg-white/90 font-semibold rounded-xl px-10 h-12 text-[15px] gap-2"
            onClick={() => navigate("/login")}
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] mt-10 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-[15px]">SixLabs<span className="text-primary">.ai</span></span>
          </div>
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} SixLabs AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
