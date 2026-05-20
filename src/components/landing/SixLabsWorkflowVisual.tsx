import {
  LayoutDashboard,
  Library,
  Trophy,
  AlertTriangle,
  FileText,
  BarChart3,
  Users,
  TrendingUp,
  Target,
  Sparkles,
  ChevronRight,
  Play,
  RefreshCw,
} from "lucide-react";
import sixIcon from "@/assets/six-icon.png";


/* ---------- Editable copy ---------- */
const COPY = {
  signalsTitle: "Signals in",
  signals: [
    { label: "Campaign performance", Icon: BarChart3 },
    { label: "Audience behavior", Icon: Users },
    { label: "Market trends", Icon: TrendingUp },
    { label: "Competitor activity", Icon: Target },
    { label: "Creative performance", Icon: Sparkles },
  ],
  brand: "SixLabs",
  nav: [
    { label: "Dashboard", Icon: LayoutDashboard, active: true },
    { label: "Ads Library", Icon: Library },
    { label: "Top Performers", Icon: Trophy },
    { label: "Needs attention", Icon: AlertTriangle },
    { label: "Reports", Icon: FileText },
  ],
  overview: "Overview",
  metrics: [
    {
      title: "Creative factory",
      a: { v: "124", s: "New creatives" },
      b: { v: "+23%", s: "vs last 7 days" },
    },
    {
      title: "Media management",
      a: { v: "$1.42M", s: "Spend" },
      b: { v: "3.6x", s: "ROAS" },
    },
    {
      title: "Growth strategy",
      a: { v: "+18%", s: "Projected impact" },
      b: { v: "72", s: "Active initiatives" },
    },
  ],
  competitiveTitle: "Competitive intelligence",
  competitiveMeta: ["7 new ads detected", "2 brands increased"],
  recsTitle: "Recommendations",
  recs: [
    "Increase investment in lemon-lime creatives",
    "Expand lookalike audience 2%",
  ],
  outTitle: "Creative out",
  out: [
    { tint: "from-fuchsia-500/40 to-pink-500/20", fruit: "berry", roas: "3.4x" },
    { tint: "from-cyan-400/40 to-blue-500/20", fruit: "lime", roas: "2.8x" },
    { tint: "from-lime-400/40 to-emerald-500/20", fruit: "citrus", roas: "2.5x" },
  ],
  loop: "Continuous learning loop",
};

/* ---------- Small primitives ---------- */
const CARD =
  "rounded-[22px] border bg-[#050816]/90 backdrop-blur-sm";
const CARD_BORDER = { borderColor: "rgba(120,130,255,0.18)" } as const;

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[9px] font-display font-semibold px-1.5 py-0.5 rounded-md bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 inline-flex items-center gap-1">
    <span className="w-1 h-1 rounded-full bg-emerald-400" />
    {children}
  </span>
);

/* Stylized flavored-water can placeholder */
const Can = ({
  tint,
  fruit,
  size = "md",
}: {
  tint: string;
  fruit: "berry" | "lime" | "citrus" | "mix";
  size?: "sm" | "md";
}) => {
  const w = size === "sm" ? "w-8" : "w-10";
  const h = size === "sm" ? "h-12" : "h-14";
  return (
    <div className={`relative ${w} ${h} mx-auto`}>
      <div
        className={`absolute inset-0 rounded-[6px] bg-gradient-to-b ${tint} border border-white/20 shadow-[0_6px_20px_-6px_rgba(167,139,250,0.6)]`}
      />
      <div className="absolute inset-x-1 top-1.5 h-[2px] rounded bg-white/40" />
      <div className="absolute inset-x-1.5 top-3 bottom-2 rounded-sm bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
        <span className="text-[7px] font-display font-bold text-white/80 tracking-wider">
          6L
        </span>
      </div>
      {/* fruit dot */}
      <div
        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white/30 ${
          fruit === "berry"
            ? "bg-fuchsia-400"
            : fruit === "lime"
              ? "bg-lime-400"
              : fruit === "citrus"
                ? "bg-orange-400"
                : "bg-cyan-400"
        }`}
      />
    </div>
  );
};

/* ---------- Signals card ---------- */
const SignalsCard = () => (
  <div className={`${CARD} p-4 w-full`} style={CARD_BORDER}>
    <h3 className="text-white font-display font-semibold text-[15px] mb-3 px-1">
      {COPY.signalsTitle}
    </h3>
    <div className="space-y-2">
      {COPY.signals.map(({ label, Icon }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-lilac/30 transition-all px-3 py-2.5"
        >
          <div className="w-7 h-7 rounded-lg border border-lilac/40 bg-lilac/10 flex items-center justify-center shrink-0">
            <Icon className="w-3.5 h-3.5 text-lilac" strokeWidth={2} />
          </div>
          <span className="text-[12.5px] text-white/85 font-display">
            {label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ---------- Creative out card ---------- */
const CreativeOutCard = () => (
  <div className={`${CARD} p-4 w-full`} style={CARD_BORDER}>
    <h3 className="text-white font-display font-semibold text-[15px] mb-3 px-1 text-center">
      {COPY.outTitle}
    </h3>
    <div className="space-y-2.5">
      {COPY.out.map((o, i) => (
        <div
          key={i}
          className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 animate-[float_5s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.4}s` }}
        >
          <Can tint={o.tint} fruit={o.fruit as any} />
          <div className="flex-1 text-right">
            <div className="text-white font-display font-bold text-[16px] leading-none">
              {o.roas}
            </div>
            <div className="text-[10px] text-white/55 mt-0.5">ROAS</div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
            <Play className="w-3 h-3 text-white fill-white" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ---------- Mini chart ---------- */
const MiniLine = ({ color = "#A78BFA" }: { color?: string }) => (
  <svg viewBox="0 0 100 24" className="w-full h-6 mt-1.5">
    <defs>
      <linearGradient id={`g-${color}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.5" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0,18 L15,14 L28,16 L42,9 L58,12 L72,5 L88,8 L100,3"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M0,18 L15,14 L28,16 L42,9 L58,12 L72,5 L88,8 L100,3 L100,24 L0,24 Z"
      fill={`url(#g-${color})`}
    />
  </svg>
);

/* ---------- Dashboard ---------- */
const DashboardCard = () => (
  <div
    className={`${CARD} p-5 w-full transition-transform duration-500 hover:-translate-y-1`}
    style={CARD_BORDER}
  >
    {/* header */}
    <div className="flex items-center gap-2 mb-4">
      <img src={sixIcon} alt="" className="w-6 h-6 object-contain" draggable={false} />

      <span className="text-white font-display font-semibold text-[14px]">
        {COPY.brand}
      </span>
    </div>

    <div className="flex gap-4">
      {/* sidebar */}
      <div className="w-[130px] shrink-0 space-y-1">
        {COPY.nav.map(({ label, Icon, active }) => (
          <div
            key={label}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] font-display ${
              active
                ? "bg-white/10 text-white"
                : "text-white/55 hover:text-white/80"
            }`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-display font-semibold text-[14px] mb-2.5">
          {COPY.overview}
        </h4>

        <div className="grid grid-cols-3 gap-2 mb-2.5">
          {COPY.metrics.map((m, i) => (
            <div
              key={m.title}
              className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-white/60 font-display">
                  {m.title}
                </span>
                <Badge>Live</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-display font-bold text-[15px] leading-none">
                  {m.a.v}
                </span>
                <span className="text-lilac font-display font-semibold text-[10px]">
                  {m.b.v}
                </span>
              </div>
              <div className="text-[9px] text-white/45 mt-0.5">{m.a.s}</div>
              <MiniLine color={i === 1 ? "#A78BFA" : i === 2 ? "#2563EB" : "#A78BFA"} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* competitive */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <div className="text-[11px] text-white font-display font-semibold mb-0.5">
              {COPY.competitiveTitle}
            </div>
            <div className="text-[9px] text-white/50 mb-2">
              {COPY.competitiveMeta.join(" · ")}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <Can size="sm" tint="from-lime-400/40 to-emerald-500/20" fruit="lime" />
              <Can size="sm" tint="from-fuchsia-500/40 to-pink-500/20" fruit="berry" />
              <Can size="sm" tint="from-cyan-400/40 to-blue-500/20" fruit="mix" />
              <Can size="sm" tint="from-orange-400/40 to-amber-500/20" fruit="citrus" />
            </div>
          </div>

          {/* recommendations */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <div className="text-[11px] text-white font-display font-semibold mb-2">
              {COPY.recsTitle}
            </div>
            <div className="space-y-1.5">
              {COPY.recs.map((r) => (
                <div
                  key={r}
                  className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-black/30 px-2 py-1.5"
                >
                  <span className="text-[10px] text-white/80 truncate">{r}</span>
                  <ChevronRight className="w-3 h-3 text-white/40 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ---------- Loop pill ---------- */
const LoopPill = () => (
  <div className="inline-flex items-center gap-2 rounded-full border border-lilac/40 bg-[#050816] pl-3 pr-4 py-2 shadow-[0_0_30px_-5px_rgba(167,139,250,0.55)]">
    <span className="w-5 h-5 rounded-full bg-lilac/15 border border-lilac/50 flex items-center justify-center">
      <RefreshCw className="w-3 h-3 text-lilac" strokeWidth={2.2} />
    </span>
    <span className="text-[12px] font-display font-medium text-white">
      {COPY.loop}
    </span>
  </div>
);

/* ---------- Main ---------- */
export const SixLabsWorkflowVisual = () => {
  return (
    <section className="relative w-full px-4 md:px-8 pb-20 md:pb-28">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes dashFlow { to { stroke-dashoffset: -32; } }
        @keyframes dashFlowRev { to { stroke-dashoffset: 32; } }
        @keyframes pulseGlow { 0%,100%{opacity:.55} 50%{opacity:1} }
      `}</style>

      <div className="max-w-[1280px] mx-auto">
        {/* ============== DESKTOP ============== */}
        <div className="hidden lg:block relative">
          <div className="relative grid grid-cols-[260px_1fr_280px] gap-[90px] items-start">
            <SignalsCard />
            <DashboardCard />
            <CreativeOutCard />

            {/* Connector SVG overlay */}
            <svg
              className="pointer-events-none absolute inset-0 w-full h-full"
              viewBox="0 0 1280 460"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="flow" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.1" />
                </linearGradient>
                <radialGradient id="hexglow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
                </radialGradient>
                <marker
                  id="arrowL"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M0,0 L10,5 L0,10 z" fill="#A78BFA" />
                </marker>
              </defs>

              {/* signal lines into hexagon (left card right edge ~260, hex ~310) */}
              {[60, 130, 200, 270, 340].map((y, i) => (
                <path
                  key={i}
                  d={`M260 ${y} C 285 ${y}, 295 215, 320 215`}
                  stroke="url(#flow)"
                  strokeWidth="1.4"
                  fill="none"
                  style={{
                    strokeDasharray: "4 6",
                    animation: `dashFlow 3s linear infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}

              {/* hex glow */}
              <circle cx="320" cy="215" r="38" fill="url(#hexglow)" />

              {/* dashboard → creative out: mirror of signals, diverging from one glowing point */}
              {[120, 215, 310].map((y, i) => (
                <path
                  key={i}
                  d={`M960 215 C 985 215, 975 ${y}, 1000 ${y}`}
                  stroke="url(#flow)"
                  strokeWidth="1.4"
                  fill="none"
                  markerEnd="url(#arrowL)"
                  style={{
                    strokeDasharray: "4 6",
                    animation: `dashFlowRev 3s linear infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}

              {/* right-side divergence glow */}
              <circle cx="960" cy="215" r="30" fill="url(#hexglow)" />
            </svg>

            {/* Six icon mark — centered on the convergence glow (x=320/1280=25%, y=215/460=46.7%) */}
            <div className="pointer-events-none absolute left-[25%] top-[46.7%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center drop-shadow-[0_0_24px_rgba(167,139,250,0.75)]">
              <img src={sixIcon} alt="" className="w-12 h-12 object-contain" draggable={false} />
            </div>
          </div>


          {/* Loop pill + dashed return loop */}
          <div className="relative mt-10 h-14">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1280 56"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <marker
                  id="arrowBack"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M0,0 L10,5 L0,10 z" fill="#A78BFA" />
                </marker>
              </defs>
              {/* right side: Creative out (~1140) gently arcs down into pill (right edge ~720, y=28) */}
              <path
                d="M1140 4 C 1080 8, 900 50, 720 32"
                stroke="#A78BFA"
                strokeOpacity="0.7"
                strokeWidth="1.4"
                fill="none"
                strokeDasharray="5 7"
                style={{ animation: "dashFlow 4s linear infinite" }}
              />
              {/* left side: pill (left edge ~560, y=28) arcs down and back up to Signals in (~140) */}
              <path
                d="M560 32 C 380 50, 200 8, 140 4"
                stroke="#A78BFA"
                strokeOpacity="0.7"
                strokeWidth="1.4"
                fill="none"
                strokeDasharray="5 7"
                markerEnd="url(#arrowBack)"
                style={{ animation: "dashFlow 4s linear infinite" }}
              />

            </svg>
            <div className="absolute inset-0 flex justify-center items-center">
              <LoopPill />
            </div>
          </div>
        </div>

        {/* ============== MOBILE / TABLET ============== */}
        <div className="lg:hidden">
          <SixLabsMobileWorkflowVisual />
        </div>

      </div>
    </section>
  );
};

export default SixLabsWorkflowVisual;
