import { Link2, Layers, Sparkles, RotateCcw } from "lucide-react";
import { Section } from "./Section";
import { useInView } from "./useInView";

const StepCard = ({ num, title, desc, icon: Icon }: { num: string; title: string; desc: string; icon: typeof Link2 }) => {
  const { ref, visible } = useInView(0.2);
  return (
    <div ref={ref} className={`flex gap-6 items-start transition-all duration-600 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}>
      <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <span className="text-xs font-mono text-primary/50 tracking-wider uppercase">{num}</span>
        <h3 className="font-display font-semibold text-lg text-foreground mt-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-md font-body">{desc}</p>
      </div>
    </div>
  );
};

export const HowItWorksSection = () => (
  <Section id="how-it-works" className="relative px-6 py-16 overflow-hidden">
    <video
      className="absolute inset-0 w-full h-full object-cover"
      src="/how-it-works-bg.mp4"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
    />
    <div className="absolute inset-0 bg-background/70" />
    <div className="relative max-w-3xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-xs font-mono text-primary/60 tracking-wider uppercase mb-3">How it works</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
          Ad → Atoms → Signals → Better Ad → Repeat
        </h2>
      </div>
      <div className="space-y-12">
        <StepCard num="01" icon={Link2} title="Ingest" desc="Connect your Meta account. We pull every creative and its performance data automatically." />
        <StepCard num="02" icon={Layers} title="Decompose" desc="Each ad is broken into atoms — hook, visuals, copy, CTA, layout — and scored against real metrics." />
        <StepCard num="03" icon={Sparkles} title="Generate" desc="We recombine winning signals into net-new creatives optimized for your audience." />
        <StepCard num="04" icon={RotateCcw} title="Learn" desc="Performance feeds back into the system. Every campaign makes the next generation smarter." />
      </div>
    </div>
  </Section>
);
