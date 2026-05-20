import {
  AlertTriangle,
  TrendingUp,
  Trophy,
  PieChart,
  RefreshCw,
  ChevronRight,
  Play,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
} from "lucide-react";

/* ---------- Editable copy ---------- */
const COPY = {
  detect: {
    n: "01",
    t: "Detect",
    rows: [
      { Icon: AlertTriangle, title: "Fatigue detected", sub: "CTR ↓ 28% in 3 days" },
      { Icon: TrendingUp, title: "CAC drift", sub: "↑ 18% vs 7-day avg" },
      { Icon: Trophy, title: "Winning hooks", sub: "3 hooks outperforming" },
    ],
  },
  generate: {
    n: "02",
    t: "Generate",
    tabs: ["Dashboard", "Ads Library", "Top Performers"],
    videos: [
      { tint: "from-blue-500/50 to-cyan-400/30", fruit: "mix" as const },
      { tint: "from-lime-400/50 to-emerald-500/30", fruit: "lime" as const },
      { tint: "from-rose-400/40 to-fuchsia-500/30", fruit: "berry" as const },
    ],
    statics: [
      { tint: "from-cyan-500/40 to-blue-600/30", label: "BUNDLE", sub: "2 FOR $9" },
      { tint: "from-blue-500/40 to-indigo-600/30", label: "20% OFF", sub: "All bundles" },
      { tint: "from-fuchsia-500/40 to-pink-600/30", label: "NEW FLAVOR", sub: "Fruit Punch" },
    ],
  },
  deploy: {
    n: "03",
    t: "Deploy",
    rows: [
      { name: "Meta Ads", letter: "M", color: "bg-blue-500" },
      { name: "TikTok Ads", letter: "T", color: "bg-black border border-white/20" },
      { name: "Google Ads", letter: "G", color: "bg-white text-blue-600" },
      { name: "YouTube Ads", letter: "Y", color: "bg-red-600" },
      { name: "Pinterest Ads", letter: "P", color: "bg-red-500" },
    ],
  },
  learn: {
    n: "04",
    t: "Learn",
    rows: [
      { Icon: PieChart, title: "Budget shift", sub: "+24% to top performers" },
      { Icon: TrendingUp, title: "ROAS improving", sub: "3.2x → 4.7x" },
      { Icon: RefreshCw, title: "Learning loop", sub: "Model updated 12 min ago" },
    ],
  },
  loop: "Continuous loop",
};

const CARD =
  "rounded-[20px] bg-[#050816] border border-lilac/25 shadow-[0_8px_30px_-12px_rgba(167,139,250,0.35)] p-3.5 relative overflow-hidden";

const StepHeader = ({ n, t }: { n: string; t: string }) => (
  <div className="flex items-baseline gap-1.5 mb-2.5">
    <span className="text-signal font-display font-bold text-[15px]">{n}</span>
    <span className="text-white font-display font-semibold text-[15px]">{t}</span>
  </div>
);

const Row = ({
  Icon,
  title,
  sub,
}: {
  Icon: any;
  title: string;
  sub: string;
}) => (
  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-2.5 py-2">
    <div className="w-7 h-7 rounded-lg border border-lilac/40 bg-lilac/10 flex items-center justify-center shrink-0">
      <Icon className="w-3.5 h-3.5 text-lilac" strokeWidth={2} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-white font-display font-semibold text-[11px] leading-tight truncate">
        {title}
      </div>
      <div className="text-white/55 text-[9.5px] leading-tight truncate">{sub}</div>
    </div>
    <ChevronRight className="w-3 h-3 text-white/35 shrink-0" />
  </div>
);

/* ---------- Cards ---------- */
const DetectCard = () => (
  <div className={CARD}>
    <StepHeader n={COPY.detect.n} t={COPY.detect.t} />
    <div className="space-y-1.5">
      {COPY.detect.rows.map((r) => (
        <Row key={r.title} {...r} />
      ))}
    </div>
  </div>
);

const Thumb = ({ tint, kind }: { tint: string; kind: "video" | "static"; }) => (
  <div
    className={`relative aspect-square rounded-md overflow-hidden bg-gradient-to-br ${tint} border border-white/10`}
  >
    {/* fizz dots */}
    <div className="absolute inset-0 opacity-40">
      <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-white/60" />
      <div className="absolute top-3 right-2 w-0.5 h-0.5 rounded-full bg-white/60" />
      <div className="absolute bottom-2 left-2 w-0.5 h-0.5 rounded-full bg-white/60" />
    </div>
    {kind === "video" && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-black/40 border border-white/40 flex items-center justify-center">
          <Play className="w-2 h-2 text-white fill-white" />
        </div>
      </div>
    )}
  </div>
);

const StaticAd = ({
  tint,
  label,
  sub,
}: {
  tint: string;
  label: string;
  sub: string;
}) => (
  <div
    className={`relative aspect-square rounded-md overflow-hidden bg-gradient-to-br ${tint} border border-white/10 p-1.5 flex flex-col justify-between`}
  >
    <div>
      <div className="text-[7px] font-display font-bold text-white leading-tight">{label}</div>
      <div className="text-[6px] text-white/85 leading-tight mt-0.5">{sub}</div>
    </div>
    <div className="self-start text-[5.5px] font-display font-bold text-white bg-white/20 rounded px-1 py-[1px]">
      SHOP
    </div>
  </div>
);

const GenerateCard = () => (
  <div className={CARD}>
    <StepHeader n={COPY.generate.n} t={COPY.generate.t} />
    <div className="flex gap-1 mb-2 overflow-hidden">
      {COPY.generate.tabs.map((tab, i) => (
        <span
          key={tab}
          className={`text-[7.5px] font-display font-semibold px-1.5 py-0.5 rounded ${
            i === 0
              ? "bg-signal text-white"
              : "bg-white/[0.04] text-white/55 border border-white/10"
          }`}
        >
          {tab}
        </span>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-1 mb-1">
      {COPY.generate.videos.map((v, i) => (
        <Thumb key={i} tint={v.tint} kind="video" />
      ))}
    </div>
    <div className="grid grid-cols-3 gap-1">
      {COPY.generate.statics.map((s, i) => (
        <StaticAd key={i} {...s} />
      ))}
    </div>
  </div>
);

const DeployCard = () => (
  <div className={CARD}>
    <StepHeader n={COPY.deploy.n} t={COPY.deploy.t} />
    <div className="space-y-1.5">
      {COPY.deploy.rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-2.5 py-1.5"
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-display font-bold text-white shrink-0 ${r.color}`}
          >
            {r.letter}
          </div>
          <div className="flex-1 text-white font-display font-medium text-[10.5px] truncate">
            {r.name}
          </div>
          <span className="inline-flex items-center gap-1 text-[8.5px] font-display font-semibold text-emerald-400">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>
      ))}
    </div>
  </div>
);

const LearnCard = () => (
  <div className={CARD}>
    <StepHeader n={COPY.learn.n} t={COPY.learn.t} />
    <div className="space-y-1.5">
      {COPY.learn.rows.map((r) => (
        <Row key={r.title} {...r} />
      ))}
    </div>
  </div>
);

/* ---------- Center loop ---------- */
const CenterLoop = () => (
  <div className="relative w-[78px] h-[78px] flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[loopSpin_14s_linear_infinite]">
      <defs>
        <linearGradient id="mloop" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <marker
          id="mloopArrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#A78BFA" />
        </marker>
      </defs>
      {/* two arc halves with arrowheads to suggest circular flow */}
      <path
        d="M 50 12 A 38 38 0 0 1 88 50"
        fill="none"
        stroke="url(#mloop)"
        strokeWidth="2.5"
        strokeLinecap="round"
        markerEnd="url(#mloopArrow)"
      />
      <path
        d="M 50 88 A 38 38 0 0 1 12 50"
        fill="none"
        stroke="url(#mloop)"
        strokeWidth="2.5"
        strokeLinecap="round"
        markerEnd="url(#mloopArrow)"
      />
    </svg>
    <div className="relative z-10 text-center px-1">
      <div className="text-[8px] font-display font-semibold text-white leading-tight">
        Continuous
      </div>
      <div className="text-[8px] font-display font-semibold text-lilac leading-tight">
        loop
      </div>
    </div>
  </div>
);

/* ---------- Arrow pills ---------- */
const ArrowPill = ({
  dir,
  className = "",
}: {
  dir: "right" | "down" | "left" | "up";
  className?: string;
}) => {
  const Icon =
    dir === "right" ? ArrowRight : dir === "down" ? ArrowDown : dir === "left" ? ArrowLeft : ArrowUp;
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center bg-[#050816] border border-lilac/40 shadow-[0_0_12px_-2px_rgba(167,139,250,0.7)] animate-[pulseGlow_2.6s_ease-in-out_infinite] ${className}`}
    >
      <Icon className="w-3.5 h-3.5 text-lilac" strokeWidth={2.5} />
    </div>
  );
};

/* ---------- Main ---------- */
export const SixLabsMobileWorkflowVisual = () => (
  <div className="relative w-full max-w-[420px] mx-auto px-1">
    <style>{`
      @keyframes loopSpin { to { transform: rotate(360deg); } }
      @keyframes pulseGlow { 0%,100%{opacity:.85; transform:scale(1)} 50%{opacity:1; transform:scale(1.08)} }
    `}</style>

    <div className="relative grid grid-cols-2 gap-x-2.5 gap-y-3">
      <DetectCard />
      <GenerateCard />
      <LearnCard />
      <DeployCard />

      {/* Center loop overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <CenterLoop />
      </div>

      {/* Arrows */}
      {/* top row: Detect → Generate (right) */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2" style={{ top: "22%" }}>
        <ArrowPill dir="right" />
      </div>
      {/* right column: Generate → Deploy (down) */}
      <div className="pointer-events-none absolute top-1/2 -translate-y-1/2" style={{ right: "0%" }}>
        <ArrowPill dir="down" />
      </div>
      {/* bottom row: Deploy → Learn (left) */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2" style={{ bottom: "22%" }}>
        <ArrowPill dir="left" />
      </div>
      {/* left column: Learn → Detect (up) */}
      <div className="pointer-events-none absolute top-1/2 -translate-y-1/2" style={{ left: "0%" }}>
        <ArrowPill dir="up" />
      </div>
    </div>
  </div>
);

export default SixLabsMobileWorkflowVisual;
