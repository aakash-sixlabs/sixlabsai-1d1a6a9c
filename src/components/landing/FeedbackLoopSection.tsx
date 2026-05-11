import {
  BarChart3,
  Target,
  Sparkles,
  Send,
  Infinity as InfinityIcon,
  TrendingUp,
  Megaphone,
  Triangle,
  Check,
  Facebook,
  Instagram,
  Music2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Section } from "./Section";
import { useInView } from "./useInView";
import hydrateAd from "@/assets/hydrate-ad.png";

/* ---------- color tokens (kept inline for the colorful diagram) ---------- */
const STEP = {
  learn: { bg: "bg-orange-50", ring: "ring-orange-200/70", text: "text-orange-600", chip: "bg-orange-500" },
  decide: { bg: "bg-emerald-50", ring: "ring-emerald-200/70", text: "text-emerald-600", chip: "bg-emerald-500" },
  create: { bg: "bg-violet-50", ring: "ring-violet-200/70", text: "text-violet-600", chip: "bg-violet-500" },
  launch: { bg: "bg-blue-50", ring: "ring-blue-200/70", text: "text-blue-600", chip: "bg-blue-500" },
} as const;

type StepKey = keyof typeof STEP;

const StepCard = ({
  step,
  num,
  title,
  desc,
  Icon,
  delay = 0,
  className = "",
}: {
  step: StepKey;
  num: string;
  title: string;
  desc: string;
  Icon: typeof BarChart3;
  delay?: number;
  className?: string;
}) => {
  const { ref, visible } = useInView(0.2);
  const c = STEP[step];
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`relative rounded-2xl bg-white ring-1 ${c.ring} shadow-[0_18px_40px_-22px_rgba(15,23,42,0.25)] p-5 w-[240px] transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {/* Floating step chip */}
      <div
        className={`absolute -top-5 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full ${c.chip} text-white flex items-center justify-center shadow-md`}
      >
        <Icon className="w-5 h-5" strokeWidth={2.25} />
      </div>
      <div className={`mt-3 inline-block px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold ${c.text} ${c.bg}`}>
        {num}
      </div>
      <h3 className="mt-1 font-display font-bold text-lg text-foreground tracking-tight">{title}</h3>
      <p className="mt-1.5 text-[13px] text-muted-foreground font-body leading-relaxed">{desc}</p>
    </div>
  );
};

/* ---------- supporting cards ---------- */
const InputsCard = () => {
  const { ref, visible } = useInView(0.2);
  const items = [
    { Icon: Megaphone, label: "Brand Ads", meta: "1,248 ads", color: "text-blue-500" },
    { Icon: Triangle, label: "Competitor Ads", meta: "2,856 ads", color: "text-violet-500" },
    { Icon: TrendingUp, label: "Trend Signals", meta: "Rising: Hydration, Energy", color: "text-emerald-500" },
  ];
  return (
    <div
      ref={ref}
      className={`rounded-2xl bg-white ring-1 ring-border/60 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.18)] p-3.5 w-[240px] transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3 py-1.5">
          <div className="w-7 h-7 rounded-md bg-muted/60 flex items-center justify-center">
            <it.Icon className={`w-3.5 h-3.5 ${it.color}`} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-display font-semibold text-foreground leading-tight">{it.label}</div>
            <div className="text-[10.5px] text-muted-foreground leading-tight">{it.meta}</div>
          </div>
          {/* sparkline */}
          <svg width="42" height="16" viewBox="0 0 42 16">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className={it.color}
              points="0,12 6,8 12,11 18,5 24,9 30,3 36,7 42,4"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

const MetricsHeaderCard = () => {
  const { ref, visible } = useInView(0.2);
  const cells = [
    { k: "CTR", v: "2.45%" },
    { k: "ROAS", v: "4.12x" },
    { k: "CAC", v: "$18.32" },
    { k: "CVR", v: "3.21%" },
  ];
  return (
    <div
      ref={ref}
      className={`rounded-2xl bg-white ring-1 ring-border/60 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.18)] p-3.5 w-[260px] transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <div className="text-[11px] font-display font-semibold text-foreground mb-2">Performance Metrics</div>
      <div className="grid grid-cols-4 gap-2">
        {cells.map((c) => (
          <div key={c.k}>
            <div className="text-[9.5px] font-mono text-muted-foreground tracking-wider">{c.k}</div>
            <div className="text-[12px] font-display font-bold text-foreground">{c.v}</div>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 240 28" className="mt-2 w-full h-6">
        <path d="M0,18 C30,8 60,22 90,12 C120,4 150,18 180,10 C210,4 230,14 240,8" fill="none" stroke="hsl(220 80% 52%)" strokeWidth="1.4" />
      </svg>
    </div>
  );
};

const SignalChips = () => {
  const { ref, visible } = useInView(0.2);
  const chips = [
    { label: "Hook", on: true },
    { label: "Offer", on: true },
    { label: "Visual", on: true },
    { label: "Audience", on: false },
    { label: "Trend", on: true },
    { label: "Format", on: false },
  ];
  return (
    <div
      ref={ref}
      className={`grid grid-cols-2 gap-2 w-[200px] transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {chips.map((c) => (
        <div
          key={c.label}
          className="flex items-center justify-between rounded-lg bg-white ring-1 ring-border/60 shadow-sm px-3 py-2 text-[12px] font-display font-semibold text-foreground"
        >
          <span>{c.label}</span>
          {c.on ? (
            <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </span>
          ) : (
            <span className="w-4 h-4 rounded-full ring-1 ring-border" />
          )}
        </div>
      ))}
    </div>
  );
};

/* ---------- ad creative cards ---------- */
type Ad = {
  bg: string;
  text: string;
  accent: string;
  title: string;
  body: string;
  cta?: string;
  quote?: boolean;
};

const ads: Ad[] = [
  { bg: "bg-gradient-to-br from-sky-100 to-blue-200", text: "text-blue-950", accent: "bg-blue-600", title: "Hydrate\nBetter.", body: "Clean electrolytes.\nMore energy. Everyday.", cta: "Shop Now" },
  { bg: "bg-gradient-to-br from-orange-100 to-amber-200", text: "text-orange-950", accent: "bg-orange-500", title: "Fuel Your\nBest Everyday", body: "Energy that\nkeeps up.", cta: "Shop Now" },
  { bg: "bg-gradient-to-br from-slate-800 to-slate-950", text: "text-white", accent: "bg-white text-slate-900", title: "Made for\nFocus.", body: "Sharper mind.\nBetter you.", cta: "Shop Now" },
  { bg: "bg-gradient-to-br from-emerald-100 to-emerald-200", text: "text-emerald-950", accent: "bg-emerald-600", title: "Train\nStronger.", body: "Support performance.\nBuild better.", cta: "Shop Now" },
  { bg: "bg-gradient-to-br from-violet-100 to-violet-200", text: "text-violet-950", accent: "bg-violet-600", quote: true, title: "“Game changer”\nfor my routine.", body: "— Alex R.\nTastes great. Works better.", cta: "Shop Now" },
  { bg: "bg-gradient-to-br from-stone-100 to-stone-200", text: "text-stone-900", accent: "bg-stone-900", title: "Clean Ingredients.\nReal Results.", body: "Nothing extra.\nEverything you need.", cta: "Shop Now" },
  { bg: "bg-gradient-to-br from-cyan-100 to-blue-300", text: "text-blue-950", accent: "bg-blue-700", title: "Power Your\nRecovery.", body: "Replenish. Refuel.\nCome back stronger.", cta: "Shop Now" },
];

const AdCard = ({ ad, index }: { ad: Ad; index: number }) => {
  const { ref, visible } = useInView(0.15);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 70}ms` }}
      className={`relative shrink-0 w-[160px] h-[210px] rounded-xl ${ad.bg} ${ad.text} p-3 flex flex-col justify-between shadow-[0_14px_30px_-18px_rgba(15,23,42,0.3)] ring-1 ring-black/5 transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {ad.quote && <div className="text-[10px] tracking-widest opacity-80">★★★★★</div>}
      <div className="font-display font-bold text-[15px] leading-tight whitespace-pre-line">{ad.title}</div>
      <div className="text-[10.5px] leading-snug whitespace-pre-line opacity-90">{ad.body}</div>
      {ad.cta && (
        <div className={`self-start mt-1 px-2.5 py-1 rounded-md text-[10px] font-semibold ${ad.accent} ${ad.accent.includes("text-") ? "" : "text-white"}`}>
          {ad.cta}
        </div>
      )}
    </div>
  );
};

/* ---------- launched preview ---------- */
const LaunchedAdCard = () => {
  const { ref, visible } = useInView(0.2);
  return (
    <div
      ref={ref}
      className={`relative w-[230px] transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
    >
      <div className="rounded-2xl bg-white ring-1 ring-border/60 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.3)] p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Launched
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Facebook className="w-3.5 h-3.5" />
            <Instagram className="w-3.5 h-3.5" />
            <Music2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="rounded-lg overflow-hidden h-[200px]">
          <img src={hydrateAd} alt="Hydrate Better launched ad" className="w-full h-full object-cover" />
        </div>
      </div>
      {/* metrics under the ad */}
      <div className="mt-3 rounded-2xl bg-white ring-1 ring-border/60 shadow-sm p-3 grid grid-cols-4 gap-2">
        {[
          { k: "CTR", v: "2.45%", up: true, d: "18%" },
          { k: "ROAS", v: "4.12x", up: true, d: "24%" },
          { k: "CAC", v: "$18.32", up: false, d: "11%" },
          { k: "CVR", v: "3.21%", up: true, d: "16%" },
        ].map((m) => (
          <div key={m.k}>
            <div className="text-[9.5px] font-mono text-muted-foreground tracking-wider">{m.k}</div>
            <div className="text-[12px] font-display font-bold text-foreground">{m.v}</div>
            <div className={`flex items-center gap-0.5 text-[9.5px] font-semibold ${m.up ? "text-emerald-600" : "text-rose-500"}`}>
              {m.up ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
              {m.d}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[11px] italic text-primary/80 font-display">Performance data feeds back</div>
    </div>
  );
};

/* ---------- center card ---------- */
const CenterCard = () => (
  <div className="rounded-2xl bg-white ring-1 ring-border/60 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.2)] p-3.5 w-[180px] text-center">
    <div className="w-8 h-8 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-1.5">
      <InfinityIcon className="w-4 h-4 text-primary" strokeWidth={2.2} />
    </div>
    <div className="font-display font-bold text-foreground text-[12px] leading-tight">Continuous feedback loop</div>
    <p className="mt-1 text-[10px] text-muted-foreground leading-snug">
      Every launched creative makes the next generation smarter.
    </p>
  </div>
);

/* ---------- desktop loop ---------- */
const LoopConnectors = () => {
  const { ref, visible } = useInView(0.15);
  const stroke = "hsl(220 14% 75%)";
  const dash = "5 6";
  // viewBox 1200x720
  // Approximate connector paths between the 4 step cards arranged as N/E/S/W around center.
  return (
    <svg
      ref={ref as unknown as React.Ref<SVGSVGElement>}
      viewBox="0 0 1200 720"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    >
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={stroke} />
        </marker>
      </defs>
      {[
        // Learn (top) -> Decide (right)
        "M 720 170 C 880 170, 980 230, 980 340",
        // Decide (right) -> Create (bottom)
        "M 980 420 C 980 540, 800 600, 600 600",
        // Create (bottom) -> Launch (left)
        "M 460 600 C 260 600, 220 540, 220 420",
        // Launch (left) -> Learn (top) — feedback (more visible / primary blue)
        "M 220 340 C 220 220, 320 170, 480 170",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={i === 3 ? "hsl(220 80% 52%)" : stroke}
          strokeWidth={i === 3 ? 1.8 : 1.4}
          strokeDasharray={dash}
          strokeLinecap="round"
          markerEnd="url(#arr)"
          pathLength={400}
          style={{
            strokeDashoffset: visible ? 0 : 400,
            transition: `stroke-dashoffset 1.6s ease ${i * 0.25 + 0.2}s`,
          }}
        />
      ))}
    </svg>
  );
};

export const FeedbackLoopSection = () => {
  const { ref, visible } = useInView(0.1);
  return (
    <Section id="solution" className="bg-white px-6 py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div
          ref={ref}
          className={`text-center max-w-3xl mx-auto transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <p className="text-xs font-mono font-semibold tracking-[0.2em] text-primary">THE SOLUTION</p>
          <h2 className="mt-3 font-display font-bold text-4xl md:text-5xl lg:text-[60px] leading-[1.05] tracking-tight text-foreground">
            A new approach to <span className="text-primary">generating creatives</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground font-display">A continuous feedback loop</p>
          <p className="mt-2 text-sm md:text-base text-muted-foreground font-body">
            Brand data + competitor data feed the system. Every launched creative makes the next generation smarter.
          </p>
        </div>

        {/* ============= DESKTOP LOOP ============= */}
        <div className="hidden lg:block relative mt-16 h-[720px]">
          <LoopConnectors />

          {/* Step 1 LEARN — top center */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[110px]">
            <StepCard step="learn" num="01" title="LEARN" desc="Ingest signals from brand, competitors, and the market." Icon={BarChart3} />
          </div>

          {/* Inputs supporting LEARN — upper left */}
          <div className="absolute left-[40px] top-[160px]">
            <InputsCard />
          </div>

          {/* Performance metrics card — upper right */}
          <div className="absolute right-[40px] top-[160px]">
            <MetricsHeaderCard />
          </div>

          {/* Step 2 DECIDE — right */}
          <div className="absolute right-[150px] top-[330px]">
            <StepCard step="decide" num="02" title="DECIDE" desc="Extract winning signals and prioritize what to test." Icon={Target} delay={150} />
          </div>

          {/* Signal chips beside DECIDE */}
          <div className="absolute right-[20px] top-[360px] hidden xl:block">
            <SignalChips />
          </div>

          {/* Center card */}
          <div className="absolute left-1/2 top-[330px] -translate-x-1/2">
            <CenterCard />
          </div>

          {/* Step 3 CREATE — bottom center */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[110px]">
            <StepCard step="create" num="03" title="CREATE" desc="Generate multiple creative variations at scale." Icon={Sparkles} delay={300} />
          </div>

          {/* Ad row under CREATE */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-90px]">
            <div className="flex gap-3">
              {ads.map((a, i) => (
                <AdCard key={i} ad={a} index={i} />
              ))}
            </div>
          </div>

          {/* Step 4 LAUNCH — left */}
          <div className="absolute left-[150px] top-[330px]">
            <StepCard step="launch" num="04" title="LAUNCH" desc="Launch top creatives. Measure performance." Icon={Send} delay={450} />
          </div>

          {/* Launched ad preview — far left */}
          <div className="absolute left-[20px] top-[470px] hidden xl:block">
            <LaunchedAdCard />
          </div>
        </div>

        {/* spacer for the overflowing ad row on desktop */}
        <div className="hidden lg:block h-[260px]" />

        {/* ============= MOBILE / TABLET STACK ============= */}
        <div className="lg:hidden mt-12 flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-3">
            <StepCard step="learn" num="01" title="LEARN" desc="Ingest signals from brand, competitors, and the market." Icon={BarChart3} />
            <InputsCard />
          </div>

          <div className="flex flex-col items-center gap-3">
            <StepCard step="decide" num="02" title="DECIDE" desc="Extract winning signals and prioritize what to test." Icon={Target} />
            <SignalChips />
          </div>

          <CenterCard />

          <div className="flex flex-col items-center gap-3 w-full">
            <StepCard step="create" num="03" title="CREATE" desc="Generate multiple creative variations at scale." Icon={Sparkles} />
            <div className="w-full overflow-x-auto -mx-6 px-6">
              <div className="flex gap-3 w-max">
                {ads.map((a, i) => (
                  <AdCard key={i} ad={a} index={i} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <StepCard step="launch" num="04" title="LAUNCH" desc="Launch top creatives. Measure performance." Icon={Send} />
            <LaunchedAdCard />
          </div>

          <div className="text-xs font-mono text-primary tracking-wider">↻ FEEDS BACK INTO LEARN</div>
        </div>
      </div>
    </Section>
  );
};

export default FeedbackLoopSection;
