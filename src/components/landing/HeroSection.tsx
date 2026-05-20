import { Sparkles, RefreshCw, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandWaveBackground } from "./BrandWaveBackground";
import { smoothScrollTo } from "@/lib/smoothScroll";

const pills = [
  { Icon: RefreshCw, label: "Always-on learning" },
  { Icon: Sparkles, label: "On-brand creative" },
  { Icon: BarChart3, label: "Media decisions in the loop" },
];

export const HeroSection = () => {
  const handleContact = () =>
    smoothScrollTo("#contact", { duration: 1100, offset: -64 });

  return (
    <section className="relative pt-32 md:pt-36 pb-10 md:pb-14 px-6 overflow-hidden">
      <BrandWaveBackground />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <h1 className="font-display font-bold text-white tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-[78px] leading-[1.03]">
          The AI-native growth
          <br className="hidden sm:block" /> engine for paid media.
        </h1>

        <p className="mt-6 md:mt-8 font-display font-semibold text-2xl md:text-3xl lg:text-[34px] leading-tight tracking-tight">
          <span className="text-brand-gradient">
            Replace your performance marketing agency
            <br className="hidden md:block" /> with a closed-loop intelligence system.
          </span>
        </p>

        <p className="mt-6 text-base md:text-lg text-white/70 font-body max-w-2xl mx-auto leading-relaxed">
          Detects performance shifts, generates on-brand creative,
          <br className="hidden md:block" /> deploys campaigns, and learns from every result.
        </p>

        <div className="mt-9">
          <Button
            onClick={handleContact}
            className="h-12 px-7 rounded-xl font-display font-semibold text-[15px] text-white bg-brand-gradient hover:opacity-95 border-0 shadow-[0_10px_40px_-10px_hsl(var(--signal)/0.7)] transition-opacity"
          >
            Book a demo
          </Button>
        </div>

        <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/80">
          {pills.map(({ Icon, label }) => (
            <div key={label} className="inline-flex items-center gap-2">
              <Icon className="w-4 h-4 text-lilac" strokeWidth={2} />
              <span className="font-display font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
