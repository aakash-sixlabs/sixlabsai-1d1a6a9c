import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Radio,
} from "lucide-react";
import { useInView } from "./useInView";

/* ----------------- Brand palette (matches ProblemSectionV2) ----------------- */
const BRAND = {
  indigo: "#4F46E5",
  violet: "#8B5CF6",
  ink: "#0B123F",
  body: "#334155",
  muted: "#64748B",
  border: "rgba(15,23,42,0.08)",
  surface: "#F7F7FA",
  tintIndigo: "#EEF2FF",
  tintViolet: "#F5F3FF",
  tintIndigoBorder: "#E0E7FF",
};
const GRADIENT = `linear-gradient(90deg, ${BRAND.indigo}, ${BRAND.violet})`;
const GRADIENT_DIAG = `linear-gradient(135deg, ${BRAND.indigo}, ${BRAND.violet})`;

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
          <stop offset="0%" stopColor={BRAND.indigo} />
          <stop offset="100%" stopColor={BRAND.violet} />
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
        stroke={BRAND.indigo}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const VisualCreative: React.FC = () => {
  const tiles = [
    `linear-gradient(135deg, ${BRAND.indigo}33, ${BRAND.indigo}0D)`,
    `linear-gradient(135deg, ${BRAND.violet}33, ${BRAND.violet}0D)`,
    `linear-gradient(135deg, ${BRAND.indigo}26, ${BRAND.violet}26)`,
    `linear-gradient(135deg, ${BRAND.violet}26, ${BRAND.indigo}0D)`,
    `linear-gradient(135deg, ${BRAND.indigo}1F, ${BRAND.violet}1F)`,
    `linear-gradient(135deg, ${BRAND.violet}33, ${BRAND.indigo}1F)`,
  ];
  return (
    <div className="grid grid-cols-3 gap-2 w-full h-full p-2">
      {tiles.map((bg, i) => (
        <div
          key={i}
          className="rounded-xl flex items-center justify-center"
          style={{ background: bg, border: `1px solid ${BRAND.tintIndigoBorder}` }}
        >
          <div className="w-5 h-5 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-3 h-3" style={{ color: BRAND.indigo }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const VisualQA: React.FC = () => (
  <div className="relative h-full w-full flex items-center justify-center">
    <div
      className="absolute w-32 h-32 rounded-full blur-2xl"
      style={{ background: `linear-gradient(135deg, ${BRAND.indigo}33, ${BRAND.violet}33)` }}
    />
    <svg viewBox="0 0 120 120" className="w-28 h-28 relative">
      <defs>
        <linearGradient id="v3g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={BRAND.indigo} />
          <stop offset="100%" stopColor={BRAND.violet} />
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
    <Sparkles className="absolute top-2 right-6 w-4 h-4" style={{ color: BRAND.violet }} />
    <Sparkles className="absolute bottom-4 left-8 w-3 h-3" style={{ color: BRAND.indigo }} />
  </div>
);

const VisualCampaign: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
    <div
      className="w-full rounded-2xl bg-white shadow-sm p-3 flex items-center justify-between"
      style={{ border: `1px solid ${BRAND.border}` }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: GRADIENT_DIAG }}
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="h-1.5 w-20 rounded" style={{ background: BRAND.tintIndigoBorder }} />
          <div className="h-1.5 w-12 rounded mt-1" style={{ background: BRAND.tintIndigo }} />
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
          className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-[11px] font-semibold"
          style={{ border: `1px solid ${BRAND.border}`, color: BRAND.body }}
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
          <stop offset="0%" stopColor={BRAND.indigo} />
          <stop offset="100%" stopColor={BRAND.violet} />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="28" fill="none" stroke={BRAND.tintIndigoBorder} strokeWidth="10" />
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
          className="w-2.5 rounded-t-md"
          style={{
            height: `${h}%`,
            opacity: 0.4 + i * 0.1,
            background: `linear-gradient(to top, ${BRAND.indigo}, ${BRAND.violet})`,
          }}
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
          <stop offset="0%" stopColor={BRAND.indigo} />
          <stop offset="100%" stopColor={BRAND.violet} />
        </linearGradient>
        <linearGradient id="v6f" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={BRAND.violet} stopOpacity="0.25" />
          <stop offset="100%" stopColor={BRAND.violet} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="0"
          y1={25 + i * 25}
          x2="200"
          y2={25 + i * 25}
          stroke={BRAND.tintIndigoBorder}
          strokeDasharray="2 4"
          opacity="0.7"
        />
      ))}
      <path d="M5 95 C 40 92, 60 80, 85 70 S 140 35, 195 15 L 195 115 L 5 115 Z" fill="url(#v6f)" />
      <path
        d="M5 95 C 40 92, 60 80, 85 70 S 140 35, 195 15"
        fill="none"
        stroke="url(#v6g)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="195" cy="15" r="5" fill={BRAND.violet} />
      <circle cx="195" cy="15" r="9" fill={BRAND.violet} opacity="0.3">
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
  offset: number;
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
      className="group absolute left-1/2 top-0 text-left rounded-[28px] bg-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        width: undefined,
        transform: `translate(calc(-50% + ${translateX}px), 0) scale(${scale})`,
        opacity,
        zIndex: z,
        transition:
          "transform 550ms cubic-bezier(0.22,1,0.36,1), opacity 450ms ease, box-shadow 450ms ease, border-color 450ms ease",
        border: `1px solid ${isActive ? BRAND.tintIndigoBorder : BRAND.border}`,
        boxShadow: isActive
          ? `0 30px 60px -25px ${BRAND.indigo}59, 0 10px 30px -15px ${BRAND.violet}59`
          : "0 10px 25px -15px rgba(15,23,42,0.18)",
      }}
    >
      <div className={`${widthClass} ${heightClass}`}>
        {isActive && (
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[28px]"
            style={{
              background: `linear-gradient(135deg, ${BRAND.indigo}1A, ${BRAND.violet}1A)`,
            }}
          />
        )}

        <div className="relative h-full w-full flex flex-col p-7">
          {/* number badge */}
          <div className="flex items-start justify-between">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-display font-semibold"
              style={
                isActive
                  ? { background: GRADIENT_DIAG, color: "#fff", boxShadow: `0 6px 16px -6px ${BRAND.indigo}80` }
                  : { background: BRAND.tintIndigo, color: BRAND.indigo }
              }
            >
              {feature.number}
            </div>
          </div>

          <div
            className={`mt-5 h-44 w-full rounded-2xl flex items-center justify-center transition-opacity ${
              isActive ? "opacity-100" : "opacity-80"
            }`}
          >
            <Visual />
          </div>

          <span
            className="mt-6 inline-flex self-start text-[10px] tracking-[0.18em] font-semibold uppercase px-2.5 py-1 rounded-md"
            style={{ background: BRAND.tintIndigo, color: BRAND.indigo }}
          >
            {feature.label}
          </span>

          <h3
            className="mt-3 font-display font-bold text-[22px] leading-[1.2]"
            style={{ color: BRAND.ink }}
          >
            {feature.title}
          </h3>

          <p
            className="mt-3 text-[13.5px] leading-relaxed font-body"
            style={{ color: BRAND.muted }}
          >
            {feature.description}
          </p>

          <div className="mt-auto pt-5">
            <div className="h-px w-full" style={{ background: BRAND.border }} />
            <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: BRAND.muted }}>
              <Radio className="w-3 h-3" />
              <span>SixLabs · {feature.label}</span>
            </div>
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
        className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all"
        style={{ border: `1px solid ${BRAND.border}`, color: BRAND.body }}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3 min-w-[280px] sm:min-w-[360px]">
        <span className="text-xs font-mono tabular-nums" style={{ color: BRAND.muted }}>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div
          className="flex-1 h-1 rounded-full overflow-hidden"
          style={{ background: BRAND.tintIndigoBorder }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%`, background: GRADIENT }}
          />
        </div>
        <span className="text-xs font-mono tabular-nums" style={{ color: BRAND.muted }}>
          {String(total).padStart(2, "0")}
        </span>
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next feature"
        className="w-11 h-11 rounded-full text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center justify-center"
        style={{ background: GRADIENT_DIAG }}
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
      className="relative pt-24 pb-28 overflow-hidden"
      style={{ background: BRAND.surface }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${BRAND.violet}1A, transparent 60%)`,
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
          <p
            className="text-[11px] font-mono tracking-[0.22em] font-bold"
            style={{ color: BRAND.indigo }}
          >
            {COPY.eyebrow}
          </p>
          <h2
            className="mt-4 font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight"
            style={{ color: BRAND.ink }}
          >
            {COPY.headA}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: GRADIENT }}
            >
              {COPY.headB}
            </span>
          </h2>
          <p
            className="mt-5 text-base md:text-lg font-body leading-relaxed"
            style={{ color: BRAND.body }}
          >
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
                    <article
                      className="mx-auto rounded-[24px] bg-white shadow-sm p-6"
                      style={{
                        width: "calc(100vw - 48px)",
                        maxWidth: 380,
                        border: `1px solid ${BRAND.border}`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-semibold text-white"
                        style={{ background: GRADIENT_DIAG }}
                      >
                        {f.number}
                      </div>
                      <div className="mt-4 h-36 flex items-center justify-center">
                        <Visual />
                      </div>
                      <span
                        className="mt-5 inline-flex text-[10px] tracking-[0.18em] font-semibold uppercase px-2.5 py-1 rounded-md"
                        style={{ background: BRAND.tintIndigo, color: BRAND.indigo }}
                      >
                        {f.label}
                      </span>
                      <h3 className="mt-3 font-display font-bold text-xl" style={{ color: BRAND.ink }}>
                        {f.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: BRAND.muted }}>
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
                  background: i === active ? GRADIENT : BRAND.tintIndigoBorder,
                }}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous feature"
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
              style={{ border: `1px solid ${BRAND.border}`, color: BRAND.body }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next feature"
              className="w-10 h-10 rounded-full text-white shadow-md flex items-center justify-center"
              style={{ background: GRADIENT_DIAG }}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Microcopy */}
        <p className="mt-12 text-center text-sm font-body" style={{ color: BRAND.muted }}>
          {COPY.micro.a}
          <span
            className="font-semibold bg-clip-text text-transparent"
            style={{ backgroundImage: GRADIENT }}
          >
            {COPY.micro.b}
          </span>
        </p>
      </div>

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
