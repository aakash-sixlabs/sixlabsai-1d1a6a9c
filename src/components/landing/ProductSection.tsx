import { useState, useEffect, useRef, useMemo } from "react";
import {
  BarChart3,
  Sparkles,
  ShieldCheck,
  Send,
  FlaskConical,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Megaphone,
  Target,
  Image as ImageIcon,
  Scale,
  Smartphone,
  Play,
  Pause,
  RefreshCw,
  Users,
  DollarSign,
  Activity,
  Star,
  Citrus,
  Infinity as InfinityIcon,
  Triangle,
  Music2,
  Globe,
  MessageSquare,
  Newspaper,
  MoreHorizontal,
} from "lucide-react";

/* ---------- Editable copy ---------- */
const COPY = {
  eyebrow: "THE PRODUCT",
  headlineA: "From signal to",
  headlineB: "execution.",
  sub: "SixLabs turns market signals, customer intelligence, and campaign performance into approved creative, automated campaign actions, continuous testing, and real-time optimization.",
  micro: "Signals in. Intelligence runs. Approved actions out.",
};

type CapId =
  | "market"
  | "creative"
  | "qa"
  | "campaign"
  | "testing"
  | "optimization";

type Capability = {
  id: CapId;
  num: string;
  title: string;
  short: string;
  long: string;
  Icon: any;
  nodeLabel: string;
};

const CAPS: Capability[] = [
  {
    id: "market",
    num: "1",
    title: "Market intelligence & dynamic segmentation",
    short:
      "24/7 market intelligence across competitor activity, category shifts, news, trends, and first-party customer behavior.",
    long: "Surface what changed, where performance is moving, and which audience, segment, product, hook, or offer deserves action.",
    Icon: BarChart3,
    nodeLabel: "Market intelligence",
  },
  {
    id: "creative",
    num: "2",
    title: "Personalized creative at scale",
    short:
      "Generate personalized ads, hooks, offers, variants, and landing-page concepts in seconds.",
    long: "Turn campaign learnings, product context, and market signals into performance-native creative grounded in what is already working.",
    Icon: Sparkles,
    nodeLabel: "Creative Generation",
  },
  {
    id: "qa",
    num: "3",
    title: "Automated Creative QA",
    short:
      "Every asset passes rigorous automated QA before it reaches review or deployment.",
    long: "Check brand fit, messaging accuracy, offer compliance, legal guardrails, product claims, channel specs, and visual quality — so every creative is on brand. No AI slop.",
    Icon: ShieldCheck,
    nodeLabel: "Automated Creative QA",
  },
  {
    id: "campaign",
    num: "4",
    title: "Automated campaign management",
    short:
      "Automatically launch, pause, and steer campaigns based on live performance signals and business goals.",
    long: "Pause inefficient spend, shift budget toward winners, deploy fresh assets, and keep campaign execution moving without waiting for manual handoffs.",
    Icon: Send,
    nodeLabel: "Campaign Management",
  },
  {
    id: "testing",
    num: "5",
    title: "Testing & cross-channel budget allocation",
    short:
      "Run continuous tests across creatives, audiences, offers, channels, and landing pages.",
    long: "Identify the combinations that are actually winning and reallocate budget toward the highest-performing opportunities.",
    Icon: FlaskConical,
    nodeLabel: "Testing & Budget",
  },
  {
    id: "optimization",
    num: "6",
    title: "Continuous optimization",
    short:
      "Machine learning models continuously improve decisions based on current performance.",
    long: "Feed real-time outcomes back into the system so every campaign sharpens the next creative, media decision, and testing roadmap.",
    Icon: TrendingUp,
    nodeLabel: "Continuous Optimization",
  },
];

const DEFAULT_ID: CapId = "market";

/* ---------- Reusable bits ---------- */
const Can = ({
  tint,
  fruit,
  size = "md",
}: {
  tint: string;
  fruit: "berry" | "lime" | "citrus" | "mint" | "grapefruit" | "mix";
  size?: "sm" | "md" | "lg";
}) => {
  const w = size === "lg" ? "w-20" : size === "md" ? "w-14" : "w-10";
  const h = size === "lg" ? "h-32" : size === "md" ? "h-24" : "h-16";
  const dot =
    fruit === "berry"
      ? "bg-fuchsia-400"
      : fruit === "lime"
        ? "bg-lime-400"
        : fruit === "citrus"
          ? "bg-amber-400"
          : fruit === "mint"
            ? "bg-emerald-300"
            : fruit === "grapefruit"
              ? "bg-rose-300"
              : "bg-cyan-400";
  return (
    <div className={`relative ${w} ${h} mx-auto`}>
      <div
        className={`absolute inset-0 rounded-md bg-gradient-to-b ${tint} border border-slate-200 shadow-sm`}
      />
      <div className="absolute inset-x-1 top-1.5 h-[2px] rounded bg-white/70" />
      <div className="absolute inset-x-1.5 top-3 bottom-2 rounded-sm bg-white/30 flex items-center justify-center">
        <span className="text-[9px] font-display font-bold text-slate-700 tracking-wider">
          6L
        </span>
      </div>
      <div
        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${dot}`}
      />
    </div>
  );
};

/* ---------- System Path ---------- */
const SystemPath = ({
  activeIdx,
  hoverIdx,
  compact = false,
}: {
  activeIdx: number;
  hoverIdx: number | null;
  compact?: boolean;
}) => {
  return (
    <div className={`flex items-start ${compact ? "gap-1" : "gap-2 md:gap-3"} overflow-x-auto no-scrollbar`}>
      {CAPS.map((c, i) => {
        const active = i === activeIdx;
        const hover = hoverIdx === i;
        const Icon = c.Icon;
        return (
          <div key={c.id} className="flex items-start gap-1 md:gap-2 shrink-0">
            <div className="flex flex-col items-center w-[88px] md:w-[110px]">
              <div
                className={`relative w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  active
                    ? "bg-gradient-to-br from-blue-500/15 to-violet-500/15 border border-blue-500/40 shadow-[0_0_24px_-6px_rgba(99,102,241,0.6)]"
                    : hover
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-white border border-slate-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${active ? "text-blue-600" : "text-slate-500"}`}
                  strokeWidth={2}
                />
              </div>
              <div
                className={`mt-2 text-[10.5px] md:text-[11px] leading-tight text-center font-display ${
                  active ? "text-blue-600 font-semibold" : "text-slate-500"
                }`}
              >
                {c.nodeLabel}
              </div>
            </div>
            {i < CAPS.length - 1 && (
              <div className="pt-5 md:pt-6">
                <svg width={compact ? 18 : 28} height="10" viewBox="0 0 28 10">
                  <line
                    x1="0"
                    y1="5"
                    x2="28"
                    y2="5"
                    stroke="#CBD5E1"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Visual States ---------- */
const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="px-3 py-1.5 rounded-full text-[12px] font-display text-slate-700 bg-white border border-slate-200 shadow-sm">
    {children}
  </span>
);

const InsightCard = ({
  title,
  body,
  Icon = Sparkles,
}: {
  title: string;
  body: string;
  Icon?: any;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm max-w-xs">
    <div className="flex items-center gap-2 mb-1.5">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/15 to-violet-500/15 border border-blue-200 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-blue-600" />
      </div>
      <div className="text-[12px] font-display font-semibold text-slate-900">{title}</div>
    </div>
    <div className="text-[12.5px] text-slate-600 leading-snug">{body}</div>
  </div>
);

/* ---------- Market Intelligence Compact Illustration ---------- */

const SIGNAL_CARDS: { label: string; Icon: any; cx: number }[] = [
  { label: "Ad platforms", Icon: Megaphone, cx: 110 },
  { label: "Social listening", Icon: MessageSquare, cx: 305 },
  { label: "News & trends", Icon: Newspaper, cx: 515 },
  { label: "Competitors", Icon: Target, cx: 710 },
];

const OPPORTUNITIES = [
  {
    title: "High-intent hydration segment accelerating",
    body: "New cluster of buyers showing stronger conversion lift vs baseline.",
    tags: ["New segment", "Conversion lift", "Scale-ready"],
  },
  {
    title: "Bundle offer performing with lime SKUs",
    body: "Offer-led creative is showing stronger engagement among value-seeking buyers.",
    tags: ["Offer gap", "Bundle", "Lime SKU"],
  },
  {
    title: "Fruit punch response increasing",
    body: "Fruit-forward creative cues are gaining traction across paid social.",
    tags: ["Winning hook", "Creative angle", "Audience shift"],
  },
];

const SectionLabel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`text-[13px] md:text-[14px] font-display font-semibold text-slate-800 leading-[1.25] ${className}`}
  >
    {children}
  </div>
);

const SignalCard = ({
  label,
  Icon,
  hovered,
  onHover,
  onLeave,
  delay,
}: {
  label: string;
  Icon: any;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  delay: number;
}) => (
  <div
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    className={`group flex items-center gap-2.5 pl-2.5 pr-3.5 h-[54px] w-[156px] rounded-2xl bg-white border shadow-[0_2px_8px_-3px_rgba(15,23,42,0.10)] cursor-default transition-all duration-300 animate-[mktFadeUp_0.55s_ease-out_both] ${
      hovered
        ? "-translate-y-0.5 border-lilac/40 shadow-[0_10px_24px_-8px_hsl(var(--lilac)/0.45)]"
        : "border-slate-200/90 hover:border-lilac/30"
    }`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <span
      className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center border transition-colors ${
        hovered ? "border-lilac/60 bg-lilac/15" : "border-lilac/40 bg-lilac/10"
      }`}
    >
      <Icon className="w-3.5 h-3.5 text-lilac" strokeWidth={2} />
    </span>
    <span className="text-[12.5px] font-display font-semibold text-slate-800 leading-tight">
      {label}
    </span>
  </div>
);

const SignalConnectorSvg = ({
  hoveredSrc,
  hubHover,
}: {
  hoveredSrc: number | null;
  hubHover: boolean;
}) => {
  // Container viewBox: 820 wide x 500 tall.
  // Signal card centers: x = 110, 305, 515, 710  (card bottom y ≈ 92)
  // Hub center: (410, 230), hub radius ≈ 55 → hub top ≈ 175
  const inputs = [
    { d: "M 110 92 C 110 150, 320 150, 370 195", from: 0 },
    { d: "M 305 92 C 305 140, 380 150, 395 192", from: 1 },
    { d: "M 515 92 C 515 140, 440 150, 425 192", from: 2 },
    { d: "M 710 92 C 710 150, 500 150, 450 195", from: 3 },
  ];
  const output = "M 410 285 C 410 305, 410 318, 410 332";

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      viewBox="0 0 820 500"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        {/* Flowing gradient — mirrors WorkflowVisual "flow": blue → lilac → blue */}
        <linearGradient id="mktFlow" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="mktFlowOut" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.3" />
        </linearGradient>
        {/* Hub convergence glow — mirrors WorkflowVisual "hexglow" */}
        <radialGradient id="mktHubGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </radialGradient>
        <marker
          id="mktArrowOut"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#A78BFA" />
        </marker>
      </defs>

      {/* Convergence glow behind the hub */}
      <circle cx="410" cy="230" r="48" fill="url(#mktHubGlow)" />

      {/* Inputs — dashed flowing lines like WorkflowVisual signals→hex */}
      {inputs.map((p, i) => {
        const active = hubHover || hoveredSrc === p.from;
        return (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke="url(#mktFlow)"
            strokeWidth={active ? 1.8 : 1.4}
            opacity={active ? 1 : 0.85}
            strokeLinecap="round"
            style={{
              strokeDasharray: "4 6",
              animation: `mktDashFlow 3s linear infinite`,
              animationDelay: `${i * 0.15}s`,
              transition: "opacity 250ms ease, stroke-width 250ms ease",
            }}
          />
        );
      })}

      {/* Output — single line down to opportunity */}
      <path
        d={output}
        fill="none"
        stroke="url(#mktFlowOut)"
        strokeWidth={hubHover ? 2 : 1.6}
        opacity={hubHover ? 1 : 0.9}
        strokeLinecap="round"
        markerEnd="url(#mktArrowOut)"
        style={{
          strokeDasharray: "5 7",
          animation: "mktDashFlow 3s linear infinite",
          transition: "opacity 250ms ease, stroke-width 250ms ease",
        }}
      />
    </svg>
  );
};

const SixLabsHub = ({ hover }: { hover: boolean }) => (
  <div className="relative w-[110px] h-[110px] flex items-center justify-center">
    <span className="absolute inset-0 rounded-full border border-violet-200/70 animate-[mktRing_4.8s_ease-out_infinite] motion-reduce:animate-none" />
    <span className="absolute inset-3 rounded-full border border-blue-200/60 animate-[mktRing_4.8s_ease-out_infinite] [animation-delay:1.2s] motion-reduce:animate-none" />
    <span className="absolute inset-6 rounded-full border border-violet-200/50 animate-[mktRing_4.8s_ease-out_infinite] [animation-delay:2.4s] motion-reduce:animate-none" />
    <div
      className={`relative w-[88px] h-[88px] rounded-full bg-white border border-violet-100 flex items-center justify-center shadow-[0_0_50px_-14px_rgba(124,58,237,0.45)] transition-all duration-500 animate-[mktBreathe_4s_ease-in-out_infinite] motion-reduce:animate-none ${
        hover ? "scale-[1.05] shadow-[0_0_70px_-14px_rgba(99,102,241,0.65)]" : ""
      }`}
    >
      <div className="w-[58px] h-[58px] rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-[0_14px_36px_-14px_rgba(99,102,241,0.8)]">
        <span className="text-white font-display font-bold text-[28px] leading-none">6</span>
      </div>
    </div>
  </div>
);

const OpportunityCardStack = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % OPPORTUNITIES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const op = OPPORTUNITIES[idx];
  return (
    <div className="group relative w-[460px] h-[180px]">
      {/* background cards */}
      <div className="absolute left-1/2 top-3 h-[160px] w-[420px] -translate-x-1/2 rotate-[-2deg] rounded-[22px] border border-slate-200 bg-white opacity-55 shadow-[0_14px_36px_-22px_rgba(15,23,42,0.30)] transition-transform duration-500 group-hover:rotate-[-3deg]" />
      <div className="absolute left-1/2 top-1.5 h-[170px] w-[440px] -translate-x-1/2 rotate-[1.5deg] rounded-[22px] border border-slate-200 bg-white opacity-80 shadow-[0_14px_36px_-22px_rgba(15,23,42,0.30)] transition-transform duration-500 group-hover:rotate-[2.5deg]" />
      {/* foreground card */}
      <div className="relative w-[460px] rounded-[24px] border border-violet-100 bg-white p-5 shadow-[0_22px_50px_-26px_rgba(99,102,241,0.4)] transition-transform duration-300 group-hover:-translate-y-[3px]">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-gradient-to-br from-blue-500/10 to-violet-500/20">
            <Sparkles className="h-4 w-4 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-display font-bold uppercase tracking-[0.18em] text-violet-600">
              Opportunity found
            </div>
            <div key={idx} className="animate-[mktFadeUp_0.5s_ease-out]">
              <h4 className="mt-1 font-display text-[15px] font-semibold leading-[1.2] tracking-tight text-slate-950">
                {op.title}
              </h4>
              <p className="mt-1.5 text-[12px] leading-snug text-slate-600">{op.body}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {op.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-violet-100 bg-violet-50 px-2 py-0.5 text-[10.5px] font-medium text-violet-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <button className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-blue-600 transition-colors hover:text-violet-600">
          View opportunity
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};

const MarketIntelligenceCompactIllustration = () => {
  const [hoveredSrc, setHoveredSrc] = useState<number | null>(null);
  const [hubHover, setHubHover] = useState(false);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <style>{`
        @keyframes mktBreathe {
          0%,100% { box-shadow: 0 0 40px -12px rgba(124,58,237,0.35); }
          50% { box-shadow: 0 0 64px -12px rgba(99,102,241,0.55); }
        }
        @keyframes mktRing {
          0% { transform: scale(0.85); opacity: 0.55; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes mktDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes mktDashFlow {
          to { stroke-dashoffset: -32; }
        }
        @keyframes mktFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="relative w-full max-w-[410px] mx-auto">
        {/* Scale wrapper: original canvas is 820x480; we render at 50% */}
        <div className="relative w-full" style={{ height: 240 }}>
          <div
            className="absolute left-1/2 top-0 origin-top"
            style={{
              width: 820,
              height: 480,
              transform: "translateX(-50%) scale(0.5)",
              transformOrigin: "top center",
            }}
          >
            {/* Connector layer */}
            <SignalConnectorSvg hoveredSrc={hoveredSrc} hubHover={hubHover} />

            {/* Top label */}
            <SectionLabel className="absolute left-0 right-0 top-0 text-center">
              Millions of signals from different sources
            </SectionLabel>

            {/* Signal cards row */}
            <div className="absolute left-0 right-0 top-[28px] flex justify-between items-start px-[26px]">
              {SIGNAL_CARDS.map((s, i) => (
                <SignalCard
                  key={s.label}
                  label={s.label}
                  Icon={s.Icon}
                  hovered={hoveredSrc === i}
                  onHover={() => setHoveredSrc(i)}
                  onLeave={() => setHoveredSrc(null)}
                  delay={i * 90}
                />
              ))}
            </div>

            {/* Middle label */}
            <div className="absolute left-0 right-0 top-[148px] text-center">
              <SectionLabel>SixLabs intelligence analyzes and connects the dots</SectionLabel>
            </div>

            {/* Hub */}
            <div
              className="absolute left-1/2 top-[175px] z-10 -translate-x-1/2"
              onMouseEnter={() => setHubHover(true)}
              onMouseLeave={() => setHubHover(false)}
            >
              <SixLabsHub hover={hubHover} />
            </div>

            {/* Bottom label */}
            <div className="absolute left-0 right-0 top-[306px] text-center">
              <SectionLabel>Finds opportunities</SectionLabel>
            </div>

            {/* Opportunity stack */}
            <div className="absolute left-1/2 top-[332px] -translate-x-1/2">
              <OpportunityCardStack />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

const MarketVisual = () => <MarketIntelligenceCompactIllustration />;

const CreativeVisual = () => (
  <div className="flex flex-col h-full">
    <div className="flex items-center gap-2 mb-4">
      {["Creative variants", "Angles", "Formats"].map((t, i) => (
        <span
          key={t}
          className={`px-3 py-1.5 rounded-full text-[12px] font-display border ${
            i === 0
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-white text-slate-500 border-slate-200"
          }`}
        >
          {t}
        </span>
      ))}
    </div>
    <div className="grid grid-cols-[1.4fr_1fr] gap-4 flex-1">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 flex flex-col items-center justify-center">
        <Can tint="from-amber-100 to-amber-200" fruit="citrus" size="lg" />
        <div className="mt-3 text-[12px] font-display font-semibold text-slate-900">Citrus Lime · Hero</div>
        <div className="flex gap-1.5 mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">On-brand</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">High ROAS</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { tint: "from-fuchsia-100 to-pink-100", fruit: "berry" as const, label: "Berry" },
          { tint: "from-emerald-100 to-lime-100", fruit: "mint" as const, label: "Cucumber Mint" },
          { tint: "from-rose-100 to-orange-100", fruit: "grapefruit" as const, label: "Grapefruit" },
          { tint: "from-cyan-100 to-blue-100", fruit: "mix" as const, label: "Mixed Berry" },
        ].map((v) => (
          <div key={v.label} className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col items-center">
            <Can tint={v.tint} fruit={v.fruit} size="md" />
            <div className="mt-2 text-[10.5px] font-display text-slate-600">{v.label}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2 text-[12px] text-slate-500 font-display">
      <Sparkles className="w-3.5 h-3.5 text-violet-500" /> 6 variants generated in seconds
    </div>
  </div>
);

const QAVisual = () => {
  const checks = [
    { label: "Brand voice", status: "Approved", Icon: Megaphone },
    { label: "Messaging accuracy", status: "Approved", Icon: Target },
    { label: "Offer compliance", status: "Approved", Icon: ShieldCheck },
    { label: "Legal / claims", status: "Flagged", Icon: Scale },
    { label: "Visual quality", status: "Approved", Icon: ImageIcon },
    { label: "Channel specs", status: "Approved", Icon: Smartphone },
  ];
  const cans = [
    { tint: "from-amber-100 to-amber-200", fruit: "citrus" as const },
    { tint: "from-fuchsia-100 to-pink-100", fruit: "berry" as const },
    { tint: "from-emerald-100 to-lime-100", fruit: "lime" as const },
    { tint: "from-cyan-100 to-blue-100", fruit: "mix" as const },
  ];
  return (
    <div className="grid grid-cols-[1fr_1.05fr_0.85fr] gap-5 h-full">
      {/* assets */}
      <div className="flex flex-col">
        <div className="grid grid-cols-2 gap-3 flex-1">
          {cans.map((c, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 flex items-center justify-center transition-transform hover:-translate-y-0.5"
            >
              <Can tint={c.tint} fruit={c.fruit} size="md" />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11.5px] text-slate-500 font-display">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Assets entering QA review
        </div>
      </div>

      {/* QA checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-[12px] font-display font-semibold text-slate-500 mb-3 uppercase tracking-wider">QA Check</div>
        <div className="space-y-2">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              <div className="flex items-center gap-2">
                <c.Icon className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[12px] text-slate-700 font-display">{c.label}</span>
              </div>
              {c.status === "Approved" ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-display text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-display text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Flagged
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* approval */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm flex flex-col items-center text-center justify-center">
        <div className="relative w-20 h-20 rounded-full bg-white border border-emerald-200 flex items-center justify-center shadow-[0_0_30px_-8px_rgba(16,185,129,0.5)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="mt-3 text-[14px] font-display font-bold text-slate-900">9 approved · 1 flagged</div>
        <div className="text-[12px] text-slate-600 mt-1 max-w-[180px]">Ready for campaign launch with confidence.</div>
        <button className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-display font-semibold text-blue-700 bg-white border border-slate-200 rounded-full px-3 py-1.5 hover:border-blue-300 transition-colors">
          View QA report <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const CampaignVisual = () => {
  const actions = [
    "Pause inefficient spend",
    "Shift budget to winners",
    "Launch new creative",
    "Update roadmap",
  ];
  const channels = [
    { name: "Meta", status: "Live", color: "emerald" },
    { name: "TikTok", status: "Live", color: "emerald" },
    { name: "Google", status: "Live", color: "emerald" },
    { name: "YouTube", status: "Scheduled", color: "amber" },
    { name: "Pinterest", status: "Review", color: "amber" },
  ];
  return (
    <div className="grid grid-cols-2 gap-5 h-full">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-[12px] font-display font-semibold text-slate-500 uppercase tracking-wider mb-3">Action queue</div>
        <div className="space-y-2">
          {actions.map((a) => (
            <div key={a} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
              <span className="text-[12.5px] text-slate-800 font-display">{a}</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
          {[
            "12 underperformers paused",
            "Budget moved to top performers",
            "New variants deployed",
          ].map((t) => (
            <div key={t} className="flex items-center gap-2 text-[11.5px] text-slate-600 font-display">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {t}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-[12px] font-display font-semibold text-slate-500 uppercase tracking-wider mb-3">Channels</div>
        <div className="space-y-2">
          {channels.map((c) => (
            <div key={c.name} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2.5">
              <span className="text-[13px] text-slate-800 font-display font-medium">{c.name}</span>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-display font-medium px-2 py-0.5 rounded-full border ${
                  c.color === "emerald"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${c.color === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`} />
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TestingVisual = () => {
  const rows = ["Creative", "Audience", "Offer", "Channel"];
  const cols = ["Test A", "Test B", "Test C"];
  const winners = new Set(["0-1", "1-2", "2-0", "3-1"]);
  return (
    <div className="grid grid-cols-[1.2fr_1fr] gap-5 h-full">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-[12px] font-display font-semibold text-slate-500 uppercase tracking-wider mb-3">Experiment matrix</div>
        <div className="grid grid-cols-[80px_1fr_1fr_1fr] gap-2 text-[11px] text-slate-500 font-display mb-1">
          <div />
          {cols.map((c) => <div key={c} className="text-center">{c}</div>)}
        </div>
        {rows.map((r, ri) => (
          <div key={r} className="grid grid-cols-[80px_1fr_1fr_1fr] gap-2 mb-1.5 items-center">
            <div className="text-[12px] font-display font-medium text-slate-700">{r}</div>
            {cols.map((_, ci) => {
              const win = winners.has(`${ri}-${ci}`);
              return (
                <div
                  key={ci}
                  className={`h-9 rounded-md border flex items-center justify-center text-[10.5px] font-display ${
                    win
                      ? "bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-300 text-blue-700 font-semibold"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  {win ? "Winner" : "—"}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[12px] font-display font-semibold text-slate-500 uppercase tracking-wider mb-3">Budget allocation</div>
          <div className="space-y-2.5">
            {[
              { l: "Winners", v: 72, c: "from-blue-500 to-violet-500" },
              { l: "Testing", v: 22, c: "from-blue-300 to-violet-300" },
              { l: "Paused", v: 6, c: "from-slate-300 to-slate-200" },
            ].map((b) => (
              <div key={b.l}>
                <div className="flex justify-between text-[11px] font-display text-slate-600 mb-1">
                  <span>{b.l}</span><span>{b.v}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${b.c}`} style={{ width: `${b.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-violet-50 p-4">
          <div className="text-[11px] font-display font-semibold text-blue-700 uppercase tracking-wider">Winner detected</div>
          <div className="text-[13px] text-slate-900 font-display font-semibold mt-1">Citrus bundle offer + UGC angle</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200">+18% CPA</span>
            <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">+2.8x ROAS</span>
            <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-white text-violet-700 border border-violet-200">Budget shifted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const OptimizationVisual = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 h-full">
    <div className="hidden lg:flex rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex-col">
      <div className="text-[12px] font-display font-semibold text-slate-500 uppercase tracking-wider mb-3">Performance trend</div>
      <svg viewBox="0 0 300 140" className="w-full flex-1">
        <defs>
          <linearGradient id="optGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,110 L40,95 L80,100 L120,75 L160,80 L200,55 L240,40 L300,18 L300,140 L0,140 Z" fill="url(#optGrad)" />
        <path d="M0,110 L40,95 L80,100 L120,75 L160,80 L200,55 L240,40 L300,18" stroke="#6366F1" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      <div className="flex items-center gap-2 mt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-display text-blue-700 font-semibold">Continuous learning loop</span>
        </div>
      </div>
    </div>
    <div className="space-y-3">
      {[
        { t: "Winning hook identified", b: "Hydration + bundle messaging outperforms by 34%" },
        { t: "Next test roadmap updated", b: "Adding lookalike 2% expansion and UGC variants" },
        { t: "Audience expansion recommended", b: "Hydration-curious 25–34 segment is converting" },
        { t: "Offer fatigue predicted", b: "Bundle discount peaks in 6 days — rotate now" },
      ].map((c) => (
        <div key={c.t} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-[12.5px] font-display font-semibold text-slate-900">{c.t}</div>
          <div className="text-[11.5px] text-slate-600 mt-0.5">{c.b}</div>
        </div>
      ))}
      <div className="text-[12px] font-display italic text-slate-500 text-center pt-1">
        Every result sharpens the next move.
      </div>
    </div>
  </div>
);

const VisualFor = ({ id }: { id: CapId }) => {
  switch (id) {
    case "market": return <MarketVisual />;
    case "creative": return <CreativeVisual />;
    case "qa": return <QAVisual />;
    case "campaign": return <CampaignVisual />;
    case "testing": return <TestingVisual />;
    case "optimization": return <OptimizationVisual />;
  }
};

/* ---------- Capability row ---------- */
const CapRow = ({
  cap,
  active,
  onClick,
  onHover,
  onLeave,
}: {
  cap: Capability;
  active: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      aria-expanded={active}
      className={`group relative w-full text-left rounded-xl transition-all duration-300 px-3.5 md:px-4 py-2 md:py-2.5 border ${
        active
          ? "bg-gradient-to-br from-blue-50/80 to-violet-50/40 border-blue-200 shadow-[0_4px_24px_-12px_rgba(99,102,241,0.4)]"
          : "border-transparent hover:bg-slate-50/70 border-b border-b-slate-100"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
      )}
      <div className="flex items-start gap-2.5 md:gap-3">
        <div
          className={`shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[11.5px] font-display font-semibold transition-colors ${
            active
              ? "bg-gradient-to-br from-blue-500 to-violet-500 text-white border border-blue-500"
              : "bg-white text-slate-500 border border-slate-300 group-hover:border-blue-300"
          }`}
        >
          {cap.num}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3
              className={`font-display font-semibold text-[13.5px] md:text-[14.5px] leading-snug ${
                active ? "text-slate-900" : "text-slate-700"
              }`}
            >
              {cap.title}
            </h3>
            {active ? (
              <ChevronDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
            )}
          </div>
          <div
            className={`grid transition-all duration-300 ${
              active ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <p className="text-[12.5px] text-slate-600 leading-relaxed">{cap.short}</p>
              <p className="text-[12px] text-slate-500 leading-relaxed mt-1">{cap.long}</p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

/* ---------- Main ---------- */
export const ProductSection = () => {
  const [activeId, setActiveId] = useState<CapId>(DEFAULT_ID);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const lastInteractRef = useRef<number>(Date.now());
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const activeIdx = CAPS.findIndex((c) => c.id === activeId);

  useEffect(() => {
    if (!autoplay || reduce) return;
    const t = setInterval(() => {
      if (Date.now() - lastInteractRef.current < 10000) return;
      setActiveId((prev) => {
        const i = CAPS.findIndex((c) => c.id === prev);
        return CAPS[(i + 1) % CAPS.length].id;
      });
    }, 6000);
    return () => clearInterval(t);
  }, [autoplay, reduce]);

  const handleSelect = (id: CapId) => {
    setActiveId(id);
    lastInteractRef.current = Date.now();
  };

  return (
    <section className="relative bg-[#F8FAFC] py-20 md:py-28 lg:py-32 overflow-hidden">
      <style>{`
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes floatY { 0%,100% { transform: translate(-50%, -50%) translateY(0); } 50% { transform: translate(-50%, -50%) translateY(-2px); } }
        @keyframes pulseDot { 0%,100% { opacity: 0.3; r: 2; } 50% { opacity: 1; r: 3.5; } }
        @keyframes softGlow { 0%,100% { box-shadow: 0 0 32px -10px rgba(167,139,250,0.35); } 50% { box-shadow: 0 0 48px -8px rgba(167,139,250,0.55); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* subtle decorative waves */}
      <svg className="pointer-events-none absolute -top-20 -left-20 w-[520px] opacity-50" viewBox="0 0 400 400" fill="none" aria-hidden>
        <defs>
          <linearGradient id="pw1" x1="0" x2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,200 C100,160 180,260 280,200 S400,200 400,200" stroke="url(#pw1)" strokeWidth="1.5" fill="none" />
        <path d="M0,220 C100,180 180,280 280,220 S400,220 400,220" stroke="url(#pw1)" strokeWidth="1.5" fill="none" />
        <path d="M0,240 C100,200 180,300 280,240 S400,240 400,240" stroke="url(#pw1)" strokeWidth="1.5" fill="none" />
      </svg>
      <svg className="pointer-events-none absolute -bottom-24 -right-20 w-[520px] opacity-50 rotate-180" viewBox="0 0 400 400" fill="none" aria-hidden>
        <path d="M0,200 C100,160 180,260 280,200 S400,200 400,200" stroke="url(#pw1)" strokeWidth="1.5" fill="none" />
        <path d="M0,220 C100,180 180,280 280,220 S400,220 400,220" stroke="url(#pw1)" strokeWidth="1.5" fill="none" />
      </svg>

      <div className="relative max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[36%_1fr] gap-10 lg:gap-14">
          {/* Left column */}
          <div>
            <div className="text-[11.5px] font-display font-semibold text-slate-500 tracking-[0.18em] mb-4">
              {COPY.eyebrow}
            </div>
            <h2 className="font-display text-[40px] sm:text-[48px] lg:text-[56px] leading-[1.02] tracking-tight text-slate-900 font-semibold">
              {COPY.headlineA}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">
                {COPY.headlineB}
              </span>
            </h2>
            <p className="mt-5 text-[15.5px] md:text-[16px] text-slate-600 leading-relaxed max-w-xl">
              {COPY.sub}
            </p>

            {/* Capability list */}
            <div className="mt-6 space-y-0.5">
              {CAPS.map((c, i) => (
                <CapRow
                  key={c.id}
                  cap={c}
                  active={c.id === activeId}
                  onClick={() => handleSelect(c.id)}
                  onHover={() => setHoverIdx(i)}
                  onLeave={() => setHoverIdx(null)}
                />
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 text-[12.5px] text-slate-600 font-display">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>{COPY.micro}</span>
              <button
                onClick={() => setAutoplay((v) => !v)}
                className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500 hover:text-blue-600 transition-colors border border-slate-200 rounded-full px-2.5 py-1 bg-white"
                aria-label={autoplay ? "Pause autoplay" : "Play autoplay"}
              >
                {autoplay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {autoplay ? "Pause" : "Autoplay"}
              </button>
            </div>
          </div>

          {/* Right canvas - desktop */}
          <div className="hidden lg:block">
            <div
              className="relative overflow-visible rounded-[28px] border bg-white/90 backdrop-blur-sm shadow-[0_30px_80px_-30px_rgba(15,23,42,0.18)] p-8 xl:p-10 min-h-[620px]"
              style={{ borderColor: "rgba(148,163,184,0.22)" }}
            >
              <SystemPath activeIdx={activeIdx} hoverIdx={hoverIdx} />
              <div className="mt-6 h-[500px] overflow-visible">
                <div key={activeId} className="h-full animate-[fadeIn_0.3s_ease-out]">
                  <VisualFor id={activeId} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile canvas */}
        <div className="lg:hidden mt-8">
          <div
            className="relative rounded-[24px] border bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.2)] p-5"
            style={{ borderColor: "rgba(148,163,184,0.22)" }}
          >
            <div key={activeId} className="min-h-[420px] animate-[fadeIn_0.3s_ease-out]">
              {/* Mobile uses same visuals; they're flexible enough */}
              <VisualFor id={activeId} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  );
};

export default ProductSection;
