import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  LayoutGrid,
  ShieldCheck,
  Send,
  BarChart3,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { useInView } from "./useInView";

/* ----------------- Copy ----------------- */
const COPY = {
  eyebrow: "THE PRODUCT",
  headA: "From signal to ",
  headB: "execution.",
  sub: "SixLabs turns market signals, customer intelligence, and campaign performance into approved creative, automated campaign actions, continuous testing, and real-time optimization.",
  micro: {
    a: "Signals in. Intelligence runs. ",
    b: "Approved actions out.",
  },
};

/* ----------------- Features ----------------- */
type Feature = {
  id: string;
  number: string;
  label: string;
  title: string;
  description: string;
  Visual: React.FC;
};

/* ---- Visual motifs (small, clean, on-brand) ---- */

const VisualIntelligence: React.FC = () => (
  <div className="relative h-full w-full flex items-center justify-center">
    <svg viewBox="0 0 200 140" className="w-full h-full">
      <defs>
        <linearGradient id="v1g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--signal))" />
          <stop offset="100%" stopColor="hsl(var(--lilac))" />
        </linearGradient>
      </defs>
      {Array.from({ length: 38 }).map((_, i) => {
        const x = 20 + (i * 37) % 160;
        const y = 15 + (i * 53) % 100;
        const r = 1 + (i % 3) * 0.6;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill="url(#v1g)"
            opacity={0.35 + ((i % 5) / 10)}
          >
            <animate
              attributeName="opacity"
              values="0.3;0.85;0.3"
              dur={`${2 + (i % 4)}s`}
              repeatCount="indefinite"
              begin={`${(i % 5) * 0.2}s`}
            />
          </circle>
        );
      })}
      <circle cx="130" cy="80" r="34" fill="none" stroke="url(#v1g)" strokeWidth="2.5" />
      <line x1="153" y1="103" x2="172" y2="122" stroke="url(#v1g)" strokeWidth="3" strokeLinecap="round" />
      <polyline
        points="110,90 122,78 132,84 146,68"
        fill="none"
        stroke="hsl(var(--signal))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const VisualCreative: React.FC = () => {
  const tiles = [
    "from-[hsl(var(--signal))]/25 to-[hsl(var(--signal))]/5",
    "from-[hsl(var(--lilac))]/30 to-[hsl(var(--lilac))]/5",
    "from-emerald-200 to-emerald-50",
    "from-rose-200 to-rose-50",
    "from-amber-200 to-amber-50",
    "from-[hsl(var(--signal))]/20 to-[hsl(var(--lilac))]/20",
  ];
  return (
    <div className="grid grid-cols-3 gap-2 w-full h-full p-2">
      {tiles.map((t, i) => (
        <div
          key={i}
          className={`rounded-xl bg-gradient-to-br ${t} border border-slate-200/60 flex items-center justify-center`}
        >
          <div className="w-5 h-5 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-slate-500" />
          </div>
        </div>
      ))}
    </div>
  );
};

const VisualQA: React.FC = () => (
  <div className="relative h-full w-full flex items-center justify-center">
    <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-[hsl(var(--signal))]/20 to-[hsl(var(--lilac))]/20 blur-2xl" />
    <svg viewBox="0 0 120 120" className="w-28 h-28 relative">
      <defs>
        <linearGradient id="v3g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--signal))" />
          <stop offset="100%" stopColor="hsl(var(--lilac))" />
        </linearGradient>
      </defs>
      <path
        d="M60 10 L100 26 L100 62 C100 88 80 104 60 112 C40 104 20 88 20 62 L20 26 Z"
        fill="url(#v3g)"
        opacity="0.95"
      />
      <path
        d="M44 62 L56 74 L80 50"
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <Sparkles className="absolute top-2 right-6 w-4 h-4 text-[hsl(var(--lilac))]" />
    <Sparkles className="absolute bottom-4 left-8 w-3 h-3 text-[hsl(var(--signal))]" />
  </div>
);

const VisualCampaign: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(var(--signal))] to-[hsl(var(--lilac))] flex items-center justify-center">
          <Send className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="h-1.5 w-20 rounded bg-slate-200" />
          <div className="h-1.5 w-12 rounded bg-slate-100 mt-1" />
        </div>
      </div>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live
      </span>
    </div>
    <div className="flex gap-2">
      {["M", "G", "T"].map((c, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[11px] font-semibold text-slate-600"
        >
          {c}
        </div>
      ))}
    </div>
  </div>
);

const VisualTesting: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center gap-4 p-2">
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      <defs>
        <linearGradient id="v5g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--signal))" />
          <stop offset="100%" stopColor="hsl(var(--lilac))" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
      <circle
        cx="40"
        cy="40"
        r="28"
        fill="none"
        stroke="url(#v5g)"
        strokeWidth="10"
        strokeDasharray="120 176"
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
      />
    </svg>
    <div className="flex items-end gap-1.5 h-20">
      {[30, 55, 40, 70, 50, 85].map((h, i) => (
        <div
          key={i}
          className="w-2.5 rounded-t-md bg-gradient-to-t from-[hsl(var(--signal))] to-[hsl(var(--lilac))]"
          style={{ height: `${h}%`, opacity: 0.4 + i * 0.1 }}
        />
      ))}
    </div>
  </div>
);

const VisualOptimization: React.FC = () => (
  <div className="w-full h-full p-2">
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <linearGradient id="v6g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="hsl(var(--signal))" />
          <stop offset="100%" stopColor="hsl(var(--lilac))" />
        </linearGradient>
        <linearGradient id="v6f" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--lilac))" stopOpacity="0.25" />
          <stop offset="100%" stopColor="hsl(var(--lilac))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="0"
          y1={25 + i * 25}
          x2="200"
          y2={25 + i * 25}
          stroke="hsl(var(--border))"
          strokeDasharray="2 4"
          opacity="0.5"
        />
      ))}
      <path
        d="M5 95 C 40 92, 60 80, 85 70 S 140 35, 195 15 L 195 115 L 5 115 Z"
        fill="url(#v6f)"
      />
      <path
        d="M5 95 C 40 92, 60 80, 85 70 S 140 35, 195 15"
        fill="none"
        stroke="url(#v6g)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="195" cy="15" r="5" fill="hsl(var(--lilac))" />
      <circle cx="195" cy="15" r="9" fill="hsl(var(--lilac))" opacity="0.3">
        <animate attributeName="r" values="6;12;6" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
);

const FEATURES: Feature[] = [
  {
    id: "intel",
    number: "01",
    label: "Intelligence",
    title: "Market intelligence & dynamic segmentation",
    description:
      "Surface what changed, where performance is moving, and which audience, segment, product, hook, or offer deserves action.",
    Visual: VisualIntelligence,
  },
  {
    id: "creative",
    number: "02",
    label: "Creative",
    title: "Personalized creative at scale",
    description:
      "Generate personalized ads, hooks, offers, variants, and landing-page concepts in seconds — grounded in what's already working.",
    Visual: VisualCreative,
  },
  {
    id: "qa",
    number: "03",
    label: "Quality",
    title: "Automated Creative QA",
    description:
      "AI-powered checks for brand compliance, policy, fatigue risk, offer accuracy, and performance prediction before anything goes live.",
    Visual: VisualQA,
  },
  {
    id: "campaign",
    number: "04",
    label: "Activation",
    title: "Automated campaign management",
    description:
      "Launch and manage campaigns across channels with automated workflows, pacing, and guardrails built in.",
    Visual: VisualCampaign,
  },
  {
    id: "testing",
    number: "05",
    label: "Testing & Budgets",
    title: "Testing & cross-channel budget allocation",
    description:
      "Continuously test what matters and shift budget to the winning creative, audience, and offer across every channel.",
    Visual: VisualTesting,
  },
  {
    id: "optim",
    number: "06",
    label: "Optimization",
    title: "Continuous optimization",
    description:
      "Real-time performance feedback loops optimize creative, targeting, and spend — so results compound every day.",
    Visual: VisualOptimization,
  },
];

/* ----------------- Feature card ----------------- */

type CardProps = {
  feature: Feature;
  state: "active" | "near" | "far";
  offset: number; // -2, -1, 0, 1, 2
  onClick: () => void;
};

const FeatureCard: React.FC<CardProps> = ({ feature, state, offset, onClick }) => {
  const isActive = state === "active";
  const Visual = feature.Visual;

  const widthClass = isActive ? "w-[440px]" : state === "near" ? "w-[330px]" : "w-[300px]";
  const heightClass = isActive ? "h-[540px]" : state === "near" ? "h-[480px]" : "h-[460px]";

  const scale = isActive ? 1 : state === "near" ? 0.95 : 0.88;
  const opacity = isActive ? 1 : state === "near" ? 0.75 : 0.45;
  const translateX = offset * 360;
  const z = 50 - Math.abs(offset);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive}
      aria-label={`${feature.number} ${feature.title}`}
      className={`group absolute left-1/2 top-0 -translate-x-1/2 ${widthClass} ${heightClass} text-left rounded-[28px] border bg-white outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--signal))] focus-visible:ring-offset-2`}
      style={{
        transform: `translate(calc(-50% + ${translateX}px), 0) scale(${scale})`,
        opacity,
        zIndex: z,
        transition:
          "transform 550ms cubic-bezier(0.22,1,0.36,1), opacity 450ms ease, box-shadow 450ms ease, border-color 450ms ease",
        borderColor: isActive ? "hsl(var(--lilac) / 0.45)" : "rgba(15,23,42,0.08)",
        boxShadow: isActive
          ? "0 30px 60px -25px hsl(var(--signal) / 0.35), 0 10px 30px -15px hsl(var(--lilac) / 0.35)"
          : "0 10px 25px -15px rgba(15,23,42,0.18)",
      }}
    >
      {/* glow */}
      {isActive && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[28px]"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--signal) / 0.10), hsl(var(--lilac) / 0.10))",
          }}
        />
      )}

      <div className="relative h-full w-full flex flex-col p-7">
        {/* number badge */}
        <div className="flex items-start justify-between">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-display font-semibold ${
              isActive
                ? "text-white shadow-md"
                : "bg-slate-100 text-slate-500"
            }`}
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(135deg, hsl(var(--signal)), hsl(var(--lilac)))",
                  }
                : undefined
            }
          >
            {feature.number}
          </div>
        </div>

        {/* visual */}
        <div
          className={`mt-5 h-44 w-full rounded-2xl flex items-center justify-center transition-opacity ${
            isActive ? "opacity-100" : "opacity-80"
          }`}
        >
          <Visual />
        </div>

        {/* label */}
        <span className="mt-6 inline-flex self-start text-[10px] tracking-[0.18em] font-semibold uppercase px-2.5 py-1 rounded-md bg-[hsl(var(--mist))] text-[hsl(var(--signal))]">
          {feature.label}
        </span>

        {/* title */}
        <h3 className="mt-3 font-display font-bold text-[22px] leading-[1.2] text-slate-900">
          {feature.title}
        </h3>

        {/* description */}
        <p className="mt-3 text-[13.5px] leading-relaxed text-slate-500 font-body">
          {feature.description}
        </p>

        {/* bottom accent */}
        <div className="mt-auto pt-5">
          <div className="h-px w-full bg-slate-100" />
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <Radio className="w-3 h-3" />
            <span>SixLabs · {feature.label}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

/* ----------------- Controls ----------------- */

const CarouselControls: React.FC<{
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}> = ({ index, total, onPrev, onNext }) => {
  const progress = ((index + 1) / total) * 100;
  return (
    <div className="mt-10 flex items-center justify-center gap-6">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous feature"
        className="w-11 h-11 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600 hover:-translate-y-0.5 hover:shadow-md transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3 min-w-[280px] sm:min-w-[360px]">
        <span className="text-xs font-mono text-slate-500 tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, hsl(var(--signal)), hsl(var(--lilac)))",
            }}
          />
        </div>
        <span className="text-xs font-mono text-slate-400 tabular-nums">
          {String(total).padStart(2, "0")}
        </span>
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next feature"
        className="w-11 h-11 rounded-full text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, hsl(var(--signal)), hsl(var(--lilac)))",
        }}
      >
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

/* ----------------- Main ----------------- */

export const ProductSectionV2: React.FC = () => {
  const [active, setActive] = useState(0);
  const total = FEATURES.length;
  const sectionRef = useRef<HTMLElement>(null);
  const { ref: headerRef, visible: headerVisible } = useInView(0.2);
  const { ref: carouselRef, visible: carouselVisible } = useInView(0.1);

  const next = useCallback(() => setActive((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setActive((i) => (i - 1 + total) % total), [total]);

  // keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // mobile swipe
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    touchStartX.current = null;
  };

  const visibleCards = useMemo(() => {
    return FEATURES.map((f, i) => {
      let offset = i - active;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      const abs = Math.abs(offset);
      const state: "active" | "near" | "far" =
        abs === 0 ? "active" : abs === 1 ? "near" : "far";
      return { feature: f, offset, state, key: f.id, visible: abs <= 2 };
    });
  }, [active, total]);

  return (
    <section
      id="product"
      ref={sectionRef}
      aria-label="SixLabs platform capabilities"
      className="relative bg-[hsl(var(--mist))]/40 pt-24 pb-28 overflow-hidden"
    >
      {/* subtle background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(var(--lilac) / 0.10), transparent 60%)",
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-6">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-xs font-mono tracking-[0.22em] text-slate-500">
            {COPY.eyebrow}
          </p>
          <h2 className="mt-4 font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight text-slate-900">
            {COPY.headA}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, hsl(var(--signal)), hsl(var(--lilac)))",
              }}
            >
              {COPY.headB}
            </span>
          </h2>
          <p className="mt-5 text-slate-500 text-base md:text-lg font-body leading-relaxed">
            {COPY.sub}
          </p>
        </div>

        {/* Carousel — desktop / tablet */}
        <div
          ref={carouselRef}
          className={`hidden md:block relative mt-16 transition-all duration-700 ${
            carouselVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div
            className="relative mx-auto h-[560px]"
            style={{ maxWidth: 1200 }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {visibleCards.map(({ feature, offset, state, key, visible }) =>
              visible ? (
                <FeatureCard
                  key={key}
                  feature={feature}
                  state={state}
                  offset={offset}
                  onClick={() =>
                    setActive(FEATURES.findIndex((f) => f.id === feature.id))
                  }
                />
              ) : null,
            )}
          </div>
          <CarouselControls index={active} total={total} onPrev={prev} onNext={next} />
        </div>

        {/* Mobile single-card carousel */}
        <div
          className="md:hidden mt-12"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {FEATURES.map((f) => {
                const Visual = f.Visual;
                return (
                  <div key={f.id} className="w-full shrink-0 px-1">
                    <article className="mx-auto rounded-[24px] border border-slate-200 bg-white shadow-sm p-6"
                      style={{ width: "calc(100vw - 48px)", maxWidth: 380 }}>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-semibold text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, hsl(var(--signal)), hsl(var(--lilac)))",
                        }}
                      >
                        {f.number}
                      </div>
                      <div className="mt-4 h-36 flex items-center justify-center">
                        <Visual />
                      </div>
                      <span className="mt-5 inline-flex text-[10px] tracking-[0.18em] font-semibold uppercase px-2.5 py-1 rounded-md bg-[hsl(var(--mist))] text-[hsl(var(--signal))]">
                        {f.label}
                      </span>
                      <h3 className="mt-3 font-display font-bold text-xl text-slate-900">
                        {f.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                        {f.description}
                      </p>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>

          {/* dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {FEATURES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Go to feature ${i + 1}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === active ? 22 : 8,
                  background:
                    i === active
                      ? "linear-gradient(90deg, hsl(var(--signal)), hsl(var(--lilac)))"
                      : "hsl(var(--border))",
                }}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous feature"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next feature"
              className="w-10 h-10 rounded-full text-white shadow-md flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--signal)), hsl(var(--lilac)))",
              }}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Microcopy */}
        <p className="mt-12 text-center text-sm text-slate-500 font-body">
          {COPY.micro.a}
          <span
            className="font-semibold bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, hsl(var(--signal)), hsl(var(--lilac)))",
            }}
          >
            {COPY.micro.b}
          </span>
        </p>
      </div>

      {/* reduced motion */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          #product * {
            transition-duration: 1ms !important;
            animation-duration: 1ms !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ProductSectionV2;
