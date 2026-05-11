import { BarChart3, Rocket, Bell, ArrowRight } from "lucide-react";
import { Section } from "./Section";
import { useInView } from "./useInView";
import benefitsCreatives from "@/assets/benefits-creatives.png";

const ConnectingLine = () => {
  const { ref, visible } = useInView(0.2);
  // Path traces: card 1 icon → card 2 icon → card 3 icon → target on right
  // Coordinates in a 1200x260 viewBox (cards row area).
  const d = "M 175 70 Q 280 30, 410 110 T 720 130 Q 880 150, 1020 110";
  return (
    <div ref={ref} className="hidden md:block absolute inset-0 z-[15] pointer-events-none" aria-hidden>
      <svg viewBox="0 0 1200 260" preserveAspectRatio="none" className="w-full h-[260px]">
        <path
          d={d}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeDasharray="6 7"
          strokeLinecap="round"
          style={{
            strokeDashoffset: visible ? 0 : 1400,
            transition: "stroke-dashoffset 2.4s cubic-bezier(0.65, 0, 0.35, 1)",
            // dash pattern length to support animation
            strokeDasharray: "6 7",
          }}
          pathLength={1400}
        />
        {/* Target / radar on the right */}
        <g transform="translate(1080 110)" opacity={visible ? 1 : 0} style={{ transition: "opacity 0.6s ease 1.8s" }}>
          <circle r="34" fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.18" strokeWidth="1" />
          <circle r="22" fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.28" strokeWidth="1" />
          <circle r="12" fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.45" strokeWidth="1" />
          <circle r="5" fill="hsl(var(--primary))" />
        </g>
      </svg>
    </div>
  );
};

type Benefit = {
  icon: typeof BarChart3;
  title: string;
  description: string;
};

const benefits: Benefit[] = [
  {
    icon: BarChart3,
    title: "Learn what wins",
    description: "Turn creative data into proven performance insights.",
  },
  {
    icon: Rocket,
    title: "Launch 7x faster",
    description: "Ship high-performing ads in minutes, not days.",
  },
  {
    icon: Bell,
    title: "Never miss a signal",
    description: "Auto-detect trends and act on opportunities instantly.",
  },
];

const BenefitCard = ({ benefit, index, offsetClass }: { benefit: Benefit; index: number; offsetClass: string }) => {
  const { ref, visible } = useInView(0.15);
  const Icon = benefit.icon;
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${index * 100}ms` : "0ms" }}
      className={`relative bg-background rounded-2xl border border-border/60 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.18)] p-6 md:p-7 w-full md:w-[300px] ${offsetClass} transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/30">
          <ArrowRight className="w-4 h-4 text-primary-foreground" strokeWidth={2.25} />
        </div>
      </div>
      <h3 className="mt-6 font-display font-bold text-xl text-foreground tracking-tight">{benefit.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground font-body leading-relaxed">{benefit.description}</p>
    </div>
  );
};

export const HowItWorksSection = () => {
  const { ref, visible } = useInView(0.15);
  return (
    <Section id="how-it-works" className="bg-background px-6 pt-24 md:pt-32 pb-0 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        {/* Headline */}
        <div
          ref={ref}
          className={`text-center max-w-4xl mx-auto transition-all duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <h2 className="font-display font-bold text-4xl md:text-6xl lg:text-[72px] leading-[1.05] tracking-tight text-foreground">
            Unlock performance
            <br />
            at the <span className="text-primary">speed of growth.</span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-muted-foreground font-body">
            Ready-to-run Meta ads built from creative learnings.
          </p>
        </div>

        <div className="relative mt-10 md:mt-14">
          <div className="hidden md:flex justify-center items-start gap-6 lg:gap-10 relative z-20">
            <BenefitCard benefit={benefits[0]} index={0} offsetClass="translate-y-0" />
            <BenefitCard benefit={benefits[1]} index={1} offsetClass="translate-y-8" />
            <BenefitCard benefit={benefits[2]} index={2} offsetClass="translate-y-12" />
          </div>

          <ConnectingLine />

          <div className="md:hidden flex flex-col gap-5 relative z-20">
            {benefits.map((b, i) => (
              <BenefitCard key={b.title} benefit={b} index={i} offsetClass="" />
            ))}
          </div>

          <div className="relative -mt-12 md:-mt-20 lg:-mt-28 z-10 h-[300px] md:h-[360px] lg:h-[420px] overflow-hidden">
            <img
              src={benefitsCreatives}
              alt="Examples of Meta ad creatives generated by Six Labs"
              className="w-full h-full object-cover object-bottom select-none pointer-events-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </Section>
  );
};
