import { useEffect, useMemo, useRef, useState } from "react";
import {
  TrendingUp,
  Image as ImageIcon,
  Zap,
  Users,
  Target,
  AlertCircle,
  BarChart3,
  FileText,
  UsersRound,
  Send,
  Clock,
  ChevronRight,
  Hourglass,
  Hash,
  MessageSquare,
  Tag,
  Maximize2,
  CircleDot,
} from "lucide-react";

const EYEBROW = "THE PROBLEM";
const HEADLINE_PRE = "Performance marketing is moving faster than teams ";
const HEADLINE_HL = "can respond.";
const SUBHEAD =
  "Campaigns generate signals every day — CAC drift, creative fatigue, winning hooks, audience shifts, and competitor moves. But turning those signals into new creative, media decisions, and tests still takes too long.";

const SIGNAL_CHIPS = [
  { label: "CAC DRIFT", Icon: TrendingUp },
  { label: "AUDIENCE SHIFTS", Icon: Users },
  { label: "CATEGORY TREND", Icon: Hash },
  { label: "WINNING HOOKS", Icon: Zap },
  { label: "MICRO TREND", Icon: TrendingUp },
  { label: "CREATIVE FATIGUE", Icon: ImageIcon },
  { label: "COMPETITOR MOVES", Icon: UsersRound },
  { label: "PRICING PRESSURE", Icon: Tag },
  { label: "OFFER RESPONSE", Icon: CircleDot },
  { label: "MESSAGE–MARKET FIT", Icon: MessageSquare },
  { label: "PLACEMENT SHIFT", Icon: Maximize2 },
];

const SIGNALS = [
  { id: "cac", label: "CAC drift", desc: "Acquisition costs shift before teams see the pattern", Icon: TrendingUp },
  { id: "fatigue", label: "Creative fatigue", desc: "Winning ads decay while spend keeps running", Icon: ImageIcon },
  { id: "hooks", label: "Winning hooks", desc: "Strong messages emerge inside the campaign data", Icon: Zap },
  { id: "audience", label: "Audience shifts", desc: "Segments respond differently to content changes", Icon: Users },
  { id: "competitor", label: "Competitor moves", desc: "Market changes create new pressure and opportunities", Icon: Target },
];

const ACTIONS = [
  { id: "cac", label: "Manual analysis", desc: "Teams pull reports and interpret signals after the fact", Icon: BarChart3 },
  { id: "fatigue", label: "Creative briefs", desc: "Learnings are translated into static requests", Icon: FileText },
  { id: "hooks", label: "Review queues", desc: "Assets wait on feedback, approvals, and reviews", Icon: UsersRound },
  { id: "audience", label: "Campaign updates", desc: "Media changes happen after performance has already moved", Icon: Send },
  { id: "competitor", label: "Delayed reporting", desc: "Insights arrive too late to shape the next decision", Icon: Clock },
];

/* ---------- Fiber-optic signal stream visual ---------- */

function SignalStream() {
  // Deterministic, lightweight fibers. The previous version animated 200+ SVG nodes,
  // which could make the Lovable preview iframe appear blank or stall on some reloads.
  const fibers = useMemo(() => {
    const arr: { d: string; w: number; o: number; delay: number; dur: number }[] = [];
    const COUNT = 52;
    for (let i = 0; i < COUNT; i++) {
      const band = i / (COUNT - 1);
      const wave = Math.sin(i * 1.73) * 34;
      const startY = 64 + band * 472;
      const ctrlY1 = 86 + ((i * 53) % 420);
      const ctrlY2 = 222 + wave;
      const endY = 272 + Math.sin(i * 0.9) * 28; // converge to funnel mouth band
      const d = `M -40 ${startY} C 260 ${ctrlY1} 520 ${ctrlY2} 880 ${endY}`;
      arr.push({
        d,
        w: 0.45 + (i % 5) * 0.12,
        o: 0.2 + (i % 7) * 0.07,
        delay: (i % 8) * 0.18,
        dur: 4 + (i % 5) * 0.45,
      });
    }
    return arr;
  }, []);

  const dots = useMemo(() => {
    const arr: { x: number; y: number; s: number; delay: number; dur: number; hue: string }[] = [];
    for (let i = 0; i < 32; i++) {
      arr.push({
        x: 28 + ((i * 83) % 760),
        y: 70 + ((i * 47) % 460),
        s: 1 + (i % 4) * 0.35,
        delay: (i % 9) * 0.22,
        dur: 2.4 + (i % 4) * 0.35,
        hue: i % 2 ? "#A78BFA" : "#6366F1",
      });
    }
    return arr;
  }, []);

  return (
    <svg viewBox="0 0 900 600" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="fiber" x1="0" x2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="20%" stopColor="#A78BFA" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#6366F1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="stream-glow" cx="0.55" cy="0.5" r="0.55">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#A78BFA" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#F7F7FA" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mouth-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <filter id="soft">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* Ambient lilac glow behind stream */}
      <ellipse cx="420" cy="300" rx="460" ry="240" fill="url(#stream-glow)" />

      {/* Mouth glow at funnel entry */}
      <ellipse cx="850" cy="300" rx="80" ry="120" fill="url(#mouth-glow)" />

      {/* Fibers */}
      <g filter="url(#soft)">
        {fibers.map((f, i) => (
          <path
            key={i}
            d={f.d}
            stroke="url(#fiber)"
            strokeWidth={f.w}
            fill="none"
            opacity={f.o}
            style={{
              animation: `pv2-shimmer ${f.dur}s ease-in-out ${f.delay}s infinite alternate`,
            }}
          />
        ))}
      </g>

      {/* Sparkle dots */}
      <g>
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.s}
            fill={d.hue}
            opacity={0.65}
            style={{ animation: `pv2-twinkle ${d.dur}s ease-in-out ${d.delay}s infinite` }}
          />
        ))}
      </g>
    </svg>
  );
}

function MetallicFunnel() {
  // Right-side metallic receiver where the fibers converge
  return (
    <svg viewBox="0 0 220 280" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="metal-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6B7280" />
          <stop offset="35%" stopColor="#E5E7EB" />
          <stop offset="55%" stopColor="#9CA3AF" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
        <linearGradient id="metal-rim" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9CA3AF" />
          <stop offset="50%" stopColor="#F3F4F6" />
          <stop offset="100%" stopColor="#4B5563" />
        </linearGradient>
        <radialGradient id="mouth-inner" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#312E81" />
          <stop offset="60%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <linearGradient id="mouth-edge" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
      </defs>

      {/* Outer funnel cone narrowing from left mouth to thin output pipe on right */}
      <path
        d="M 30 60 L 130 120 L 200 130 L 200 150 L 130 160 L 30 220 Q 20 140 30 60 Z"
        fill="url(#metal-body)"
        stroke="#4B5563"
        strokeWidth="0.6"
      />
      {/* Highlight */}
      <path d="M 32 70 Q 60 80 110 110" stroke="#F9FAFB" strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M 32 215 Q 60 200 110 170" stroke="#1F2937" strokeWidth="1" fill="none" opacity="0.5" />

      {/* Front rim ellipse */}
      <ellipse cx="30" cy="140" rx="14" ry="82" fill="url(#metal-rim)" />
      {/* Inner mouth */}
      <ellipse cx="30" cy="140" rx="10" ry="74" fill="url(#mouth-inner)" />
      {/* Glow edge */}
      <ellipse cx="30" cy="140" rx="10" ry="74" fill="none" stroke="url(#mouth-edge)" strokeWidth="1.2" opacity="0.9" />
      {/* Inner sparkle */}
      <ellipse cx="28" cy="140" rx="5" ry="60" fill="#A78BFA" opacity="0.25" />
    </svg>
  );
}

function BottleneckVisual() {
  // chip layout matches reference: chips drift centrally within the stream
  const chipPositions = [
    { x: 36, y: 16 }, // CAC DRIFT
    { x: 26, y: 26 }, // AUDIENCE SHIFTS
    { x: 46, y: 34 }, // CATEGORY TREND
    { x: 30, y: 42 }, // WINNING HOOKS
    { x: 50, y: 50 }, // MICRO TREND
    { x: 22, y: 52 }, // CREATIVE FATIGUE
    { x: 38, y: 60 }, // COMPETITOR MOVES
    { x: 18, y: 68 }, // PRICING PRESSURE
    { x: 44, y: 70 }, // OFFER RESPONSE
    { x: 24, y: 78 }, // MESSAGE-MARKET FIT
    { x: 34, y: 86 }, // PLACEMENT SHIFT
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl">
      <style>{`
        @keyframes pv2-shimmer { 0% { opacity: var(--o, .3);} 100% { opacity: 1;} }
        @keyframes pv2-twinkle { 0%,100% { opacity: .25; transform: scale(.8);} 50% { opacity: .9; transform: scale(1.1);} }
        @keyframes pv2-float { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-3px);} }
        @keyframes pv2-out { 0% { stroke-dashoffset: 24;} 100% { stroke-dashoffset: 0;} }
        @media (prefers-reduced-motion: reduce) {
          .pv2-anim, .pv2-chip { animation: none !important; }
          svg [style*="animation"] { animation: none !important; }
        }
      `}</style>

      <div className="relative h-[460px] sm:h-[520px] md:h-[560px] w-full bg-[#F7F7FA]">
        {/* Fiber stream */}
        <SignalStream />

        {/* Floating signal chips */}
        <div className="absolute inset-0 pointer-events-none">
          {SIGNAL_CHIPS.map((c, i) => {
            const pos = chipPositions[i];
            const Icon = c.Icon;
            return (
              <div
                key={c.label}
                className="pv2-chip absolute pointer-events-auto"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  animation: `pv2-float ${4 + (i % 4)}s ease-in-out ${(i % 5) * 0.3}s infinite`,
                }}
              >
                <div className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/90 backdrop-blur-sm border border-[rgba(167,139,250,0.4)] shadow-[0_4px_14px_-6px_rgba(99,102,241,0.45)] hover:border-[#8B5CF6] hover:shadow-[0_6px_18px_-4px_rgba(139,92,246,0.55)] transition-all duration-200 hover:-translate-y-0.5 cursor-default">
                  <Icon size={11} className="text-[#6D28D9]" />
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.12em] text-[#4F46E5]">
                    {c.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Metallic funnel on right */}
        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[180px] sm:w-[220px] md:w-[260px] h-[260px] sm:h-[300px]">
          <MetallicFunnel />
        </div>

        {/* Tiny output lines exiting funnel to the right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[12%] h-[120px] pointer-events-none">
          <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden>
            <defs>
              <linearGradient id="out-line" x1="0" x2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
            </defs>
            {[
              "M 0 40 Q 40 40 110 30",
              "M 0 52 Q 50 52 110 50",
              "M 0 64 L 110 64",
              "M 0 76 Q 50 76 110 80",
              "M 0 88 Q 40 88 110 98",
            ].map((d, i) => (
              <g key={i}>
                <path
                  d={d}
                  stroke="url(#out-line)"
                  strokeWidth="0.9"
                  fill="none"
                  strokeDasharray="4 3"
                  style={{ animation: `pv2-out 2s linear ${i * 0.15}s infinite` }}
                />
                <circle cx="110" cy={[30, 50, 64, 80, 98][i]} r="2" fill="#6D28D9" />
              </g>
            ))}
          </svg>
        </div>

        {/* "Only a small fraction gets captured." annotation */}
        <div className="absolute right-[14%] top-[22%] hidden sm:block">
          <div className="text-[12px] md:text-[13px] leading-tight max-w-[140px] font-semibold bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
            Only a small fraction gets captured.
          </div>
          <svg width="60" height="40" className="mt-1" aria-hidden>
            <path d="M 4 4 Q 30 20 50 36" stroke="#8B5CF6" strokeWidth="1" fill="none" strokeDasharray="3 3" />
            <circle cx="4" cy="4" r="2" fill="#8B5CF6" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ---------- Cards ---------- */

function SignalsCard() {
  return (
    <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/95 backdrop-blur-sm p-5 md:p-6 shadow-[0_10px_40px_-24px_rgba(79,70,229,0.35)]">
      <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] flex items-center justify-center text-[#4F46E5]">
          <Target size={18} />
        </div>
        <div>
          <h3 className="font-display font-bold text-[#0B123F] text-[15px] md:text-base leading-tight">
            Signals arrive daily
          </h3>
          <p className="text-xs md:text-[13px] text-[#64748B] mt-0.5">The market tells you everything.</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2.5">
        {SIGNALS.map((s) => (
          <li
            key={s.id}
            className="flex items-start gap-3 p-3 rounded-xl border border-[rgba(15,23,42,0.06)] bg-white hover:border-[#A78BFA] hover:shadow-[0_4px_14px_-8px_rgba(139,92,246,0.4)] transition-all"
          >
            <span className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] flex items-center justify-center text-[#4F46E5]">
              <s.Icon size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-[#0B123F]">{s.label}</div>
              <div className="text-[11.5px] text-[#64748B] leading-snug mt-0.5">{s.desc}</div>
            </div>
            <ChevronRight size={14} className="text-[#94A3B8] mt-1" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActionsCard() {
  return (
    <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/95 backdrop-blur-sm p-5 md:p-6 shadow-[0_10px_40px_-24px_rgba(79,70,229,0.35)]">
      <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6] flex items-center justify-center text-[#E11D48]">
          <Hourglass size={18} />
        </div>
        <div>
          <h3 className="font-display font-bold text-[#0B123F] text-[15px] md:text-base leading-tight">
            Action still moves in cycles
          </h3>
          <p className="text-xs md:text-[13px] text-[#64748B] mt-0.5">Traditional workflows can't keep up.</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2.5">
        {ACTIONS.map((a) => (
          <li
            key={a.id}
            className="flex items-start gap-3 p-3 rounded-xl border border-[rgba(15,23,42,0.06)] bg-white hover:border-[#FDA4AF] transition-all relative"
          >
            <span className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6] flex items-center justify-center text-[#E11D48]">
              <a.Icon size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-[#0B123F]">{a.label}</div>
              <div className="text-[11.5px] text-[#64748B] leading-snug mt-0.5">{a.desc}</div>
            </div>
            <span className="absolute right-3 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-[#FB7185] to-[#E11D48]" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Mobile visual ---------- */

function MobileBottleneck() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#F7F7FA]">
      <div className="relative h-[420px]">
        <SignalStream />

        {/* Chips list-style on the left to match mobile ref */}
        <div className="absolute inset-y-0 left-2 right-[42%] pointer-events-none flex flex-col justify-center gap-1.5">
          {SIGNAL_CHIPS.slice(0, 10).map((c, i) => {
            const Icon = c.Icon;
            return (
              <div
                key={c.label}
                className="pv2-chip inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-md bg-white/90 border border-[rgba(167,139,250,0.4)] shadow-sm"
                style={{
                  marginLeft: `${(i % 4) * 8}px`,
                  animation: `pv2-float ${4 + (i % 3)}s ease-in-out ${i * 0.25}s infinite`,
                }}
              >
                <Icon size={10} className="text-[#6D28D9]" />
                <span className="text-[9.5px] font-semibold tracking-[0.1em] text-[#4F46E5]">{c.label}</span>
              </div>
            );
          })}
        </div>

        {/* Funnel right-center */}
        <div className="absolute right-[6%] top-1/2 -translate-y-1/2 w-[140px] h-[200px]">
          <MetallicFunnel />
        </div>

        {/* Annotation top-right */}
        <div className="absolute right-3 top-3 max-w-[140px] text-right">
          <div className="text-[12px] font-semibold leading-tight bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
            Only a small fraction gets captured.
          </div>
        </div>

        {/* Tiny output lines */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[40px] h-[80px] pointer-events-none">
          <svg viewBox="0 0 40 80" className="w-full h-full" aria-hidden>
            {[20, 32, 44, 56].map((y, i) => (
              <line
                key={i}
                x1="0"
                y1={y}
                x2="40"
                y2={y + (i - 1) * 2}
                stroke="#8B5CF6"
                strokeWidth="0.8"
                strokeDasharray="3 2"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main section ---------- */

export const ProblemSectionV2 = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full bg-[#F7F7FA] py-20 md:py-28"
      aria-labelledby="problem-v2-title"
    >
      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8">
        {/* Header: split layout on desktop (headline left, body right) */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div>
            <div className="text-[11px] tracking-[0.22em] font-bold text-[#4F46E5]">{EYEBROW}</div>
            <h2
              id="problem-v2-title"
              className="mt-4 font-display text-[36px] sm:text-[46px] md:text-[56px] leading-[1.04] tracking-tight font-bold text-[#0B123F]"
            >
              Performance marketing is moving faster than teams{" "}
              <span className="bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
                {HEADLINE_HL}
              </span>
            </h2>
          </div>
          <p className="text-[15px] md:text-base leading-relaxed text-[#334155] md:pt-4 max-w-[520px]">
            {SUBHEAD}
          </p>
        </div>

        {/* Desktop main row: card | stream + funnel | card */}
        <div className="hidden lg:grid mt-12 md:mt-16 grid-cols-[260px_1fr_260px] gap-6 items-start">
          <SignalsCard />
          <BottleneckVisual />
          <ActionsCard />
        </div>

        {/* Tablet: stream full, cards below side-by-side */}
        <div className="hidden md:block lg:hidden mt-12">
          <BottleneckVisual />
          <div className="mt-6 grid grid-cols-2 gap-5">
            <SignalsCard />
            <ActionsCard />
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden mt-10 space-y-5">
          <MobileBottleneck />
          <SignalsCard />
          <ActionsCard />
        </div>

        {/* Bottom callout */}
        <div className="mt-8 md:mt-10 rounded-2xl border border-[#E0E7FF] bg-white p-5 md:p-6 shadow-[0_10px_40px_-24px_rgba(79,70,229,0.3)] flex items-center gap-4 md:gap-5">
          <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#8B5CF6] flex items-center justify-center text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.55)]">
            <AlertCircle size={22} />
          </div>
          <p className="text-[14px] md:text-[17px] leading-relaxed text-[#334155]">
            <span className="text-[#0B123F]">The result: brands keep spending against </span>
            <span className="font-semibold bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
              yesterday's learnings
            </span>
            <span className="text-[#0B123F]"> while the next opportunity window closes.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSectionV2;
