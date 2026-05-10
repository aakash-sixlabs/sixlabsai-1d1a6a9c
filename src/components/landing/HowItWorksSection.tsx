import { BarChart3, Zap, Radar, ArrowUpRight } from "lucide-react";
import { Section } from "./Section";
import { useInView } from "./useInView";

type Benefit = {
  icon: typeof BarChart3;
  title: string;
  eyebrow: string;
  subtext: string;
  description: string;
};

const benefits: Benefit[] = [
  {
    icon: BarChart3,
    title: "Learn what wins",
    eyebrow: "Patterns from your ads + competitor intelligence",
    subtext: "Move at the speed of culture.",
    description: "Turn market and ad insights into clear creative direction.",
  },
  {
    icon: Zap,
    title: "Launch 7x faster",
    eyebrow: "From 7 days to 1 day",
    subtext: "Test while others are still reading dashboards.",
    description: "Go from insight to live ads in a fraction of the time.",
  },
  {
    icon: Radar,
    title: "Never miss a signal",
    eyebrow: "Generate new variants when performance starts to fade",
    subtext: "Experiment more before fatigue hits.",
    description:
      "Catch early drops and automatically refresh with new high-potential variants.",
  },
];

const BenefitRow = ({ benefit, index }: { benefit: Benefit; index: number }) => {
  const { ref, visible } = useInView(0.15);
  const Icon = benefit.icon;
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${index * 80}ms` : "0ms" }}
      className={`group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start md:items-center py-8 md:py-10 transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Icon */}
      <div className="md:col-span-1">
        <div className="w-12 h-12 rounded-full border border-border/70 bg-background flex items-center justify-center transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/5">
          <Icon
            className="w-5 h-5 text-foreground/70 transition-colors duration-300 group-hover:text-primary"
            strokeWidth={1.75}
          />
        </div>
      </div>

      {/* Title block */}
      <div className="md:col-span-6">
        <h3 className="font-display font-semibold text-2xl md:text-[28px] leading-tight text-foreground tracking-tight">
          {benefit.title}
        </h3>
        <p className="mt-2 text-[11px] font-mono tracking-[0.14em] uppercase text-primary/70">
          {benefit.eyebrow}
        </p>
        <p className="mt-3 text-sm text-muted-foreground font-body">
          {benefit.subtext}
        </p>
      </div>

      {/* Description */}
      <div className="md:col-span-4">
        <p className="text-[15px] leading-relaxed text-muted-foreground font-body max-w-sm">
          {benefit.description}
        </p>
      </div>

      {/* Arrow */}
      <div className="md:col-span-1 md:flex md:justify-end hidden">
        <ArrowUpRight
          className="w-5 h-5 text-muted-foreground/40 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          strokeWidth={1.75}
        />
      </div>
    </div>
  );
};

export const HowItWorksSection = () => {
  const { ref, visible } = useInView(0.15);
  return (
    <Section id="how-it-works" className="bg-background px-6 py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto">
        <div
          ref={ref}
          className={`max-w-3xl transition-all duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-primary mb-6">
            Platform Benefits
          </p>
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-[56px] leading-[1.05] tracking-tight text-foreground">
            Unlock performance at the{" "}
            <span className="text-primary">speed of growth.</span>
          </h2>
          <p className="mt-6 max-w-[620px] text-base md:text-lg text-muted-foreground font-body leading-relaxed">
            Six Labs turns creative learnings into ready-to-run Meta ads, so
            growth teams can test faster, fight fatigue, and scale what works.
          </p>
        </div>

        <div className="mt-16 md:mt-20 border-t border-border/60">
          {benefits.map((b, i) => (
            <div key={b.title} className="border-b border-border/60">
              <BenefitRow benefit={b} index={i} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};
