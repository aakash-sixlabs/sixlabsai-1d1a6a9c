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

const MARKET_CHIPS: {
  label: string;
  Icon: any;
  // position relative to orbit container (percent)
  top: string;
  left: string;
}[] = [
  { label: "Competitor move", Icon: Users, top: "8%", left: "22%" },
  { label: "CAC drift", Icon: DollarSign, top: "8%", left: "78%" },
  { label: "Creative fatigue", Icon: BarChart3, top: "50%", left: "96%" },
  { label: "Audience shift", Icon: Users, top: "88%", left: "76%" },
  { label: "Winning hook", Icon: Star, top: "88%", left: "24%" },
  { label: "Category trend", Icon: TrendingUp, top: "50%", left: "4%" },
];

const SignalChip = ({
  label,
  Icon,
  style,
}: {
  label: string;
  Icon: any;
  style?: React.CSSProperties;
}) => (
  <div
    className="absolute -translate-x-1/2 -translate-y-1/2 group"
    style={style}
  >
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08)] text-[11.5px] font-display text-slate-700 whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_4px_14px_-4px_rgba(99,102,241,0.35)] animate-[floatY_6s_ease-in-out_infinite]">
      <Icon className="w-3 h-3 text-blue-500" strokeWidth={2.2} />
      {label}
    </div>
  </div>
);

const MarketVisual = () => {
  return (
    <div className="relative flex flex-col h-full gap-4">
      {/* Orbit area */}
      <div className="relative flex-1 min-h-[280px]">
        {/* SVG orbit */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 600 320"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="orbitStroke" x1="0" x2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.55" />
            </linearGradient>
            <marker
              id="orbitArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="#A78BFA" />
            </marker>
          </defs>
          {/* outer dashed ellipse */}
          <ellipse
            cx="300"
            cy="160"
            rx="250"
            ry="130"
            fill="none"
            stroke="url(#orbitStroke)"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
          {/* inner dashed ellipse */}
          <ellipse
            cx="300"
            cy="160"
            rx="210"
            ry="105"
            fill="none"
            stroke="#C4B5FD"
            strokeOpacity="0.5"
            strokeWidth="1"
            strokeDasharray="1 5"
          />
          {/* arrowheads suggesting motion */}
          <path
            d="M 295 30 L 305 30"
            stroke="#A78BFA"
            strokeWidth="1.4"
            markerEnd="url(#orbitArrow)"
          />
          <path
            d="M 295 290 L 285 290"
            stroke="#A78BFA"
            strokeWidth="1.4"
            markerEnd="url(#orbitArrow)"
          />
          {/* tiny pulsing dots */}
          {[
            { cx: 50, cy: 160 },
            { cx: 550, cy: 160 },
            { cx: 300, cy: 30 },
            { cx: 300, cy: 290 },
            { cx: 120, cy: 60 },
            { cx: 480, cy: 260 },
          ].map((d, i) => (
            <circle
              key={i}
              cx={d.cx}
              cy={d.cy}
              r="2.5"
              fill="#6366F1"
              className="animate-[pulseDot_2.4s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
          ))}
        </svg>

        {/* Signal chips */}
        {MARKET_CHIPS.map((c, i) => (
          <SignalChip
            key={c.label}
            label={c.label}
            Icon={c.Icon}
            style={{ top: c.top, left: c.left, animationDelay: `${i * 0.4}s` }}
          />
        ))}

        {/* Center insight card */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] md:w-[280px]">
          <div className="rounded-2xl bg-white border border-violet-200 p-4 shadow-[0_0_40px_-8px_rgba(167,139,250,0.45)] animate-[softGlow_4s_ease-in-out_infinite]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500/15 to-violet-500/20 border border-violet-200 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-violet-600" />
              </div>
              <div className="text-[12px] font-display font-semibold text-slate-900">
                New segment detected
              </div>
            </div>
            <p className="text-[12.5px] text-slate-700 leading-snug">
              Hydration-focused buyers responding to citrus + bundle offers
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-display bg-blue-50 text-blue-700 border border-blue-200">
                Intent shift
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-display bg-violet-50 text-violet-700 border border-violet-200">
                Offer sensitivity
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-display bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200">
                High-propensity segment
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-3">
        {/* Market context */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm flex items-center gap-3">
          <div className="shrink-0 relative w-10 h-12 rounded-md bg-gradient-to-b from-cyan-50 to-blue-100 border border-slate-200 flex items-center justify-center">
            <Citrus className="w-5 h-5 text-amber-500" />
            <div className="absolute inset-x-1 top-1 h-[2px] rounded bg-white/70" />
          </div>
          <div className="min-w-0">
            <div className="text-[12.5px] font-display font-semibold text-slate-900">
              Flavored water market
            </div>
            <div className="text-[11.5px] text-slate-600 leading-snug mt-0.5">
              Monitoring 12M+ signals across news, social, search, reviews, and
              first-party customer data.
            </div>
          </div>
        </div>

        {/* Signal velocity */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-display font-semibold text-slate-500 uppercase tracking-wider">
              Real-time signal velocity
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-display font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <svg viewBox="0 0 160 36" className="w-full h-8 mt-1.5">
            <defs>
              <linearGradient id="velGrad" x1="0" x2="1">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
            <path
              d="M0,24 L20,20 L36,26 L54,16 L72,22 L92,12 L112,18 L132,10 L150,14 L160,8"
              fill="none"
              stroke="url(#velGrad)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="160" cy="8" r="2.5" fill="#6366F1" />
          </svg>
          <div className="mt-1.5 space-y-1 text-[10.5px] font-display">
            <div className="flex items-center justify-between text-slate-600">
              <span>Category shifts</span>
              <span className="text-emerald-600 font-semibold">↑ 23%</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Audience clusters</span>
              <span className="text-emerald-600 font-semibold">↑ 17%</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Signal velocity</span>
              <span className="text-blue-600 font-semibold">High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      className={`group relative w-full text-left rounded-2xl transition-all duration-300 px-4 md:px-5 py-4 md:py-5 border ${
        active
          ? "bg-gradient-to-br from-blue-50/80 to-violet-50/40 border-blue-200 shadow-[0_4px_24px_-12px_rgba(99,102,241,0.4)]"
          : "border-transparent hover:bg-slate-50/70 border-b border-b-slate-100"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
      )}
      <div className="flex items-start gap-3 md:gap-4">
        <div
          className={`shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[12.5px] font-display font-semibold transition-colors ${
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
              className={`font-display font-semibold text-[15px] md:text-[16.5px] leading-snug ${
                active ? "text-slate-900" : "text-slate-700"
              }`}
            >
              {cap.title}
            </h3>
            {active ? (
              <ChevronDown className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
            )}
          </div>
          <div
            className={`grid transition-all duration-300 ${
              active ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <p className="text-[13px] md:text-[13.5px] text-slate-600 leading-relaxed">{cap.short}</p>
              <p className="text-[12.5px] md:text-[13px] text-slate-500 leading-relaxed mt-1.5">{cap.long}</p>
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
            <div className="mt-8 space-y-1.5">
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
              className="relative rounded-[28px] border bg-white/90 backdrop-blur-sm shadow-[0_30px_80px_-30px_rgba(15,23,42,0.18)] p-8 xl:p-12 min-h-[560px]"
              style={{ borderColor: "rgba(148,163,184,0.22)" }}
            >
              <SystemPath activeIdx={activeIdx} hoverIdx={hoverIdx} />
              <div className="mt-8 h-[420px]">
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
