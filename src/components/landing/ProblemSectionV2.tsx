import { useEffect, useMemo, useRef, useState } from "react";
import {
  TrendingDown,
  Flame,
  Sparkles,
  Users,
  Swords,
  AlertCircle,
  FileText,
  ClipboardList,
  CheckSquare,
  Megaphone,
  Clock,
  ChevronRight,
} from "lucide-react";

const EYEBROW = "THE PROBLEM";
const HEADLINE_PRE = "Performance marketing is moving faster than teams ";
const HEADLINE_HL = "can respond.";
const SUBHEAD =
  "Campaigns generate signals every day — CAC drift, creative fatigue, winning hooks, audience shifts, and competitor moves. But turning those signals into new creative, media decisions, and tests still takes too long.";

const SIGNAL_CHIPS = [
  "CAC drift",
  "Audience shifts",
  "Category trend",
  "Winning hooks",
  "Creative fatigue",
  "Micro trend",
  "Competitor moves",
  "Pricing pressure",
  "Offer response",
  "Message-market fit",
  "Placement shift",
];

const SIGNALS = [
  { id: "cac", label: "CAC drift", Icon: TrendingDown },
  { id: "fatigue", label: "Creative fatigue", Icon: Flame },
  { id: "hooks", label: "Winning hooks", Icon: Sparkles },
  { id: "audience", label: "Audience shifts", Icon: Users },
  { id: "competitor", label: "Competitor moves", Icon: Swords },
];

const ACTIONS = [
  { id: "cac", label: "Manual analysis", Icon: FileText },
  { id: "fatigue", label: "Creative briefs", Icon: ClipboardList },
  { id: "hooks", label: "Review queues", Icon: CheckSquare },
  { id: "audience", label: "Campaign updates", Icon: Megaphone },
  { id: "competitor", label: "Delayed reporting", Icon: Clock },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

function BottleneckVisual({ hovered, setHovered }: { hovered: string | null; setHovered: (v: string | null) => void }) {
  const reduced = usePrefersReducedMotion();

  // pre-generate stream lines
  const lines = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        y: 30 + i * 14,
        delay: (i % 8) * 0.25,
        opacity: 0.18 + ((i * 37) % 50) / 200,
      })),
    []
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        y: 30 + ((i * 53) % 360),
        delay: (i % 10) * 0.4,
        dur: 3 + ((i * 7) % 30) / 10,
        size: 1.5 + ((i * 11) % 20) / 10,
      })),
    []
  );

  // chip positions across left stream
  const chipPositions = [
    { x: 4, y: 8 },
    { x: 18, y: 22 },
    { x: 8, y: 36 },
    { x: 22, y: 50 },
    { x: 6, y: 62 },
    { x: 26, y: 74 },
    { x: 12, y: 86 },
    { x: 30, y: 14 },
    { x: 34, y: 44 },
    { x: 38, y: 68 },
    { x: 16, y: 92 },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white/80 backdrop-blur-sm shadow-[0_10px_40px_-20px_rgba(79,70,229,0.25)]">
      <style>{`
        @keyframes pv2-drift { 0% { transform: translateX(-8%);} 100% { transform: translateX(8%);} }
        @keyframes pv2-particle { 0% { transform: translateX(0) translateY(0); opacity:0;} 10%{opacity:1;} 70%{opacity:1;} 100% { transform: translateX(420px) translateY(var(--ty,0)); opacity:0;} }
        @keyframes pv2-capture { 0% { stroke-dashoffset: 60; } 100% { stroke-dashoffset: 0;} }
        @keyframes pv2-pulse { 0%,100% { opacity: .6; transform: scale(1);} 50% { opacity:1; transform: scale(1.06);} }
        @keyframes pv2-float { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-4px);} }
        .pv2-stream { animation: pv2-drift 8s ease-in-out infinite alternate; }
        .pv2-particle { animation: pv2-particle var(--d,4s) linear infinite; }
        .pv2-chip { animation: pv2-float 5s ease-in-out infinite; }
        .pv2-pipe-glow { animation: pv2-pulse 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pv2-stream, .pv2-particle, .pv2-chip, .pv2-pipe-glow { animation: none !important; }
        }
      `}</style>

      <div className="relative h-[440px] sm:h-[480px] md:h-[520px] w-full">
        {/* soft bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAFC] via-white to-[#F5F3FF]" />

        {/* LEFT: massive signal stream (≈ 0–58% width) */}
        <div className="absolute inset-y-0 left-0 w-[62%] overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full pv2-stream"
            viewBox="0 0 500 480"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="pv2-line" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0" />
                <stop offset="40%" stopColor="#6366F1" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="pv2-fade" x1="0" x2="1">
                <stop offset="0%" stopColor="#F8FAFC" stopOpacity="1" />
                <stop offset="20%" stopColor="#F8FAFC" stopOpacity="0" />
                <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0" />
              </linearGradient>
            </defs>
            {lines.map((l, i) => (
              <path
                key={i}
                d={`M -20 ${l.y} Q 200 ${l.y + (i % 2 ? 6 : -6)} 520 ${l.y + (i % 3 === 0 ? -2 : 2)}`}
                stroke="url(#pv2-line)"
                strokeWidth={0.7 + (i % 3) * 0.3}
                fill="none"
                opacity={l.opacity}
              />
            ))}
            <rect width="500" height="480" fill="url(#pv2-fade)" />
          </svg>

          {/* moving particles */}
          <div className="absolute inset-0">
            {particles.map((p, i) => (
              <span
                key={i}
                className="pv2-particle absolute rounded-full"
                style={{
                  top: `${p.y}px`,
                  left: 0,
                  width: p.size,
                  height: p.size,
                  background: i % 3 === 0 ? "#8B5CF6" : "#4F46E5",
                  boxShadow: "0 0 6px rgba(139,92,246,0.7)",
                  ["--d" as any]: `${p.dur}s`,
                  ["--ty" as any]: `${((i * 13) % 20) - 10}px`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>

          {/* floating signal chips */}
          <div className="absolute inset-0">
            {SIGNAL_CHIPS.map((c, i) => {
              const pos = chipPositions[i % chipPositions.length];
              const active = hovered === c;
              return (
                <button
                  key={c}
                  type="button"
                  onMouseEnter={() => setHovered(c)}
                  onMouseLeave={() => setHovered(null)}
                  className={`pv2-chip absolute text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full border bg-white/90 backdrop-blur-sm transition-all duration-200 ${
                    active
                      ? "border-[#8B5CF6] shadow-[0_0_0_3px_rgba(139,92,246,0.15)] -translate-y-0.5"
                      : "border-[rgba(15,23,42,0.08)] hover:border-[#A78BFA]"
                  }`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    color: "#334155",
                    animationDelay: `${(i % 5) * 0.4}s`,
                  }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] mr-1.5 align-middle" />
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER: bottleneck pipe */}
        <div className="absolute inset-y-0 left-[58%] right-[28%] flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 200 480" className="w-full h-full" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="pv2-pipe" x1="0" x2="1">
                  <stop offset="0%" stopColor="#EEF2FF" />
                  <stop offset="100%" stopColor="#F5F3FF" />
                </linearGradient>
                <linearGradient id="pv2-pipe-edge" x1="0" x2="1">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              {/* large funnel mouth that ONLY captures a small middle slice */}
              <path
                d="M 0 200 Q 60 220 90 230 L 200 230 L 200 250 L 90 250 Q 60 260 0 280 Z"
                fill="url(#pv2-pipe)"
                stroke="url(#pv2-pipe-edge)"
                strokeWidth="1.2"
                className="pv2-pipe-glow"
              />
              {/* spillover indicators: arrows continuing past */}
              {[80, 110, 140, 170, 320, 360, 400].map((y, i) => (
                <g key={i} opacity="0.35">
                  <path d={`M 0 ${y} L 60 ${y}`} stroke="#94A3B8" strokeWidth="0.6" strokeDasharray="2 3" />
                </g>
              ))}
            </svg>

            <div
              className="group absolute inset-0 cursor-help"
              title="Traditional workflows can only absorb a fraction of the available signal."
            />

            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-slate-500 whitespace-nowrap">
              Traditional workflow bottleneck
            </div>
          </div>
        </div>

        {/* RIGHT: tiny captured output */}
        <div className="absolute inset-y-0 right-0 w-[28%] flex flex-col justify-center pl-2 pr-4 sm:pr-6">
          <svg viewBox="0 0 200 200" className="w-full h-32 sm:h-40" aria-hidden>
            <defs>
              <linearGradient id="pv2-out" x1="0" x2="1">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            {[80, 95, 105, 115, 125].map((y, i) => (
              <line
                key={i}
                x1="0"
                y1={y}
                x2="200"
                y2={y}
                stroke="url(#pv2-out)"
                strokeWidth="1.2"
                strokeDasharray="6 4"
                style={{ animation: reduced ? undefined : `pv2-capture 2.5s linear infinite`, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </svg>
          <div className="mt-3 text-[11px] sm:text-xs text-slate-600 max-w-[200px]">
            <span className="font-semibold bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
              Only a small fraction
            </span>{" "}
            gets captured.
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileBottleneck() {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/80 shadow-[0_10px_30px_-20px_rgba(79,70,229,0.25)]">
      <div className="relative h-[360px] bg-gradient-to-b from-[#F8FAFC] via-white to-[#F5F3FF]">
        <svg viewBox="0 0 360 360" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="pv2m-line" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {Array.from({ length: 22 }).map((_, i) => (
            <path
              key={i}
              d={`M -10 ${340 - i * 6} Q 180 ${220 - i * 4} 380 ${180 + (i % 3) * 3}`}
              stroke="url(#pv2m-line)"
              strokeWidth={0.6}
              fill="none"
              opacity={0.2 + ((i * 17) % 30) / 100}
            />
          ))}
          {/* small intake pipe right-middle */}
          <path
            d="M 220 160 Q 260 170 280 175 L 360 175 L 360 195 L 280 195 Q 260 200 220 210 Z"
            fill="#F5F3FF"
            stroke="url(#pv2m-line)"
            strokeWidth="1"
          />
        </svg>

        {/* chips */}
        <div className="absolute inset-0">
          {["CAC drift", "Audience shifts", "Winning hooks", "Creative fatigue", "Competitor moves", "Pricing pressure"].map(
            (c, i) => {
              const pos = [
                { x: 6, y: 70 },
                { x: 28, y: 84 },
                { x: 10, y: 50 },
                { x: 38, y: 60 },
                { x: 18, y: 30 },
                { x: 4, y: 18 },
              ][i];
              return (
                <span
                  key={c}
                  className="absolute text-[10px] px-2 py-0.5 rounded-full border border-[rgba(15,23,42,0.08)] bg-white/90 text-slate-700"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {c}
                </span>
              );
            }
          )}
        </div>

        {/* output */}
        <div className="absolute right-3 top-[46%] -translate-y-1/2 w-[34%]">
          <svg viewBox="0 0 120 60" className="w-full h-12" aria-hidden>
            {[20, 30, 40].map((y, i) => (
              <line
                key={i}
                x1="0"
                y1={y}
                x2="120"
                y2={y}
                stroke="#8B5CF6"
                strokeWidth="1"
                strokeDasharray="5 3"
                style={{ animation: reduced ? undefined : `pv2-capture 2.5s linear infinite`, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </svg>
          <div className="text-[10px] text-slate-600 mt-1">
            <span className="font-semibold bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
              Only a small fraction
            </span>{" "}
            gets captured.
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProblemSectionV2 = () => {
  const [hoverRow, setHoverRow] = useState<string | null>(null);
  const [hoverChip, setHoverChip] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full bg-[#F7F7FA] py-20 md:py-28"
      aria-labelledby="problem-v2-title"
    >
      {/* soft bg accent */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8">
        {/* Headline block */}
        <div
          className={`max-w-[860px] mx-auto text-center transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] font-semibold text-[#4F46E5]">
            <span className="w-6 h-px bg-gradient-to-r from-transparent to-[#4F46E5]" />
            {EYEBROW}
            <span className="w-6 h-px bg-gradient-to-l from-transparent to-[#4F46E5]" />
          </div>
          <h2
            id="problem-v2-title"
            className="mt-5 font-display text-[34px] sm:text-[44px] md:text-[56px] leading-[1.05] tracking-tight font-bold text-[#0B123F]"
          >
            {HEADLINE_PRE}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
              {HEADLINE_HL}
            </span>
          </h2>
          <p className="mt-5 mx-auto max-w-[780px] text-[15px] sm:text-base md:text-lg leading-relaxed text-[#334155]">
            {SUBHEAD}
          </p>
        </div>

        {/* Main visual */}
        <div
          className={`mt-12 md:mt-16 transition-all duration-700 delay-100 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="hidden md:block">
            <BottleneckVisual hovered={hoverChip} setHovered={setHoverChip} />
          </div>
          <div className="md:hidden">
            <MobileBottleneck />
          </div>
        </div>

        {/* Supporting cards */}
        <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* Signals card */}
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 md:p-7 shadow-[0_8px_30px_-20px_rgba(79,70,229,0.3)]">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display font-semibold text-[#0B123F] text-lg md:text-xl">Signals arrive daily</h3>
              <span className="text-[11px] text-[#4F46E5] font-medium">INFLOW</span>
            </div>
            <p className="mt-1 text-sm text-[#475569]">The market tells you everything.</p>
            <ul className="mt-5 space-y-2">
              {SIGNALS.map((s) => {
                const active = hoverRow === s.id;
                return (
                  <li
                    key={s.id}
                    onMouseEnter={() => setHoverRow(s.id)}
                    onMouseLeave={() => setHoverRow(null)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all cursor-default ${
                      active
                        ? "border-[#A78BFA] bg-[#F5F3FF]"
                        : "border-transparent hover:border-[rgba(15,23,42,0.06)] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-md bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] flex items-center justify-center text-[#4F46E5]">
                        <s.Icon size={14} />
                      </span>
                      <span className="text-sm text-[#0B123F] font-medium">{s.label}</span>
                    </div>
                    <ChevronRight size={14} className="text-[#94A3B8]" />
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Actions card */}
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 md:p-7 shadow-[0_8px_30px_-20px_rgba(79,70,229,0.3)]">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display font-semibold text-[#0B123F] text-lg md:text-xl">Action still moves in cycles</h3>
              <span className="text-[11px] text-[#EA580C] font-medium">LATENCY</span>
            </div>
            <p className="mt-1 text-sm text-[#475569]">Traditional workflows can't keep up.</p>
            <ul className="mt-5 space-y-2">
              {ACTIONS.map((a) => {
                const active = hoverRow === a.id;
                return (
                  <li
                    key={a.id}
                    onMouseEnter={() => setHoverRow(a.id)}
                    onMouseLeave={() => setHoverRow(null)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all cursor-default ${
                      active
                        ? "border-[#FDBA74] bg-[#FFF7ED]"
                        : "border-transparent hover:border-[rgba(15,23,42,0.06)] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                        <a.Icon size={14} />
                      </span>
                      <span className="text-sm text-[#0B123F] font-medium">{a.label}</span>
                    </div>
                    <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#FB923C] to-[#EA580C]" />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Result callout */}
        <div className="mt-6 md:mt-8 rounded-2xl border border-[#E0E7FF] bg-white p-5 md:p-6 shadow-[0_8px_30px_-20px_rgba(79,70,229,0.25)] flex items-center gap-4 md:gap-5">
          <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#8B5CF6] flex items-center justify-center text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.5)]">
            <AlertCircle size={22} />
          </div>
          <p className="text-sm md:text-[15px] leading-relaxed text-[#334155]">
            <span className="font-semibold text-[#0B123F]">The result:</span> brands keep spending against{" "}
            <span className="font-semibold bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
              yesterday's learnings
            </span>{" "}
            while the next opportunity window closes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSectionV2;
