import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Clock,
  TrendingUp,
  DollarSign,
  Flame,
  Users,
  Target,
  Tag,
  MoreHorizontal,
  FileText,
  Pencil,
  UsersRound,
  Send,
  Hourglass,
  AlertCircle,
  Bookmark,
} from "lucide-react";

const EYEBROW = "THE PROBLEM";
const SUBHEAD =
  "Campaigns generate signals every day. Fatigue, CAC drift, Winning hooks, Competitor moves. But most agency workflows still take weeks to turn those signals into new creative and media decisions.";

type LucideIcon = typeof Activity;

interface Signal {
  id: string;
  day: string;
  label: string;
  Icon: LucideIcon;
  pairId: string; // workflow id this pairs with for cross-highlight
}

interface WorkflowStep {
  id: string;
  label: string;
  time: string;
  Icon: LucideIcon;
  tooltip: string;
  isExpired?: boolean;
  subtext?: string;
}

const CAMPAIGN_SIGNALS: Signal[] = [
  { id: "s1", day: "DAY 1", label: "Creative fatigue detected", Icon: TrendingUp, pairId: "w2" },
  { id: "s2", day: "DAY 2", label: "CAC starts drifting", Icon: DollarSign, pairId: "w1" },
  { id: "s3", day: "DAY 3", label: "Winning hook emerges", Icon: Flame, pairId: "w3" },
  { id: "s4", day: "DAY 4", label: "Audience behavior shifts", Icon: Users, pairId: "w4" },
  { id: "s5", day: "DAY 5", label: "Competitor launches new angle", Icon: Target, pairId: "w4" },
  { id: "s6", day: "DAY 6", label: "Offer response drops", Icon: Tag, pairId: "w5" },
  { id: "s7", day: "DAY 7", label: "And more signals emerge", Icon: MoreHorizontal, pairId: "w5" },
];

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "w1",
    label: "Report pulled",
    time: "0 days",
    Icon: FileText,
    tooltip: "Signal enters the workflow after performance has already shifted.",
  },
  { id: "w2", label: "Brief written", time: "4 days", Icon: Pencil, tooltip: "Learning becomes a request." },
  { id: "w3", label: "Creative reviewed", time: "6 days", Icon: UsersRound, tooltip: "Execution waits on approvals." },
  {
    id: "w4",
    label: "Campaign updated",
    time: "10+ days",
    Icon: Send,
    tooltip: "Action arrives after the market has moved.",
  },
  {
    id: "w5",
    label: "Signal expired",
    time: "",
    Icon: Hourglass,
    tooltip: "The original opportunity has already changed.",
    isExpired: true,
    subtext: "The opportunity has moved on.",
  },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, []);
  return reduced;
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

/* ---------- Legend ---------- */
function Legend() {
  return (
    <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-4 py-2.5 shadow-[0_4px_18px_-12px_rgba(15,23,42,0.2)]">
      <div className="flex items-center gap-2.5">
        <span className="relative flex items-center">
          <span className="block w-7 h-[2px] bg-[#4F46E5] rounded-full" />
          <span className="absolute -left-0.5 w-2 h-2 rounded-full bg-[#4F46E5]" />
          <span className="absolute -right-0.5 w-2 h-2 rounded-full bg-[#4F46E5]" />
        </span>
        <div className="leading-tight">
          <div className="text-[12px] font-semibold text-[#0B123F]">Campaign reality</div>
          <div className="text-[10.5px] text-[#64748B]">Changes daily</div>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="relative flex items-center">
          <span className="block w-7 h-[2px] bg-[#E11D48] rounded-full" />
          <span className="absolute -left-0.5 w-2 h-2 rounded-full bg-[#E11D48]" />
          <span className="absolute -right-0.5 w-2 h-2 rounded-full bg-[#E11D48]" />
        </span>
        <div className="leading-tight">
          <div className="text-[12px] font-semibold text-[#0B123F]">Workflow reality</div>
          <div className="text-[10.5px] text-[#64748B]">Moves slowly</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Campaign timeline (desktop) ---------- */
function CampaignTimeline({
  hoveredSignal,
  hoveredPair,
  onHover,
  inView,
  reduced,
}: {
  hoveredSignal: string | null;
  hoveredPair: string | null;
  onHover: (id: string | null) => void;
  inView: boolean;
  reduced: boolean;
}) {
  const cols = CAMPAIGN_SIGNALS.length;
  // Single gentle sine wave across full width; dots align under each card center
  const points = useMemo(() => {
    const arr: { x: number; y: number }[] = [];
    for (let i = 0; i < cols; i++) {
      const x = (i + 0.5) * (100 / cols);
      const y = 30 + Math.sin((i / (cols - 1)) * Math.PI * 2) * 9;
      arr.push({ x, y });
    }
    return arr;
  }, [cols]);

  // Smooth wave path built from cubic beziers with horizontal control handles
  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const dx = (curr.x - prev.x) * 0.5;
      d += ` C ${prev.x + dx} ${prev.y}, ${curr.x - dx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [points]);

  return (
    <div className="relative">
      {/* Day headers */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {CAMPAIGN_SIGNALS.map((s, i) => (
          <div key={s.id} className="text-center">
            <span
              className={`inline-block text-[10.5px] font-bold tracking-[0.16em] px-2 py-0.5 rounded-full transition-colors ${
                i === 0 ? "bg-[#4F46E5] text-white" : "text-[#64748B]"
              }`}
            >
              {s.day}
            </span>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="mt-3 grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {CAMPAIGN_SIGNALS.map((s, i) => {
          const isActive = hoveredSignal === s.id || hoveredPair === s.id;
          return (
            <button
              key={s.id}
              type="button"
              aria-label={`${s.day}: ${s.label}`}
              onMouseEnter={() => onHover(s.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(s.id)}
              onBlur={() => onHover(null)}
              className={`group relative rounded-2xl border bg-white p-3 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 min-h-[112px] ${
                isActive
                  ? "border-[#4F46E5] shadow-[0_10px_30px_-12px_rgba(79,70,229,0.5)] -translate-y-0.5"
                  : "border-[rgba(15,23,42,0.08)] shadow-[0_2px_8px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:border-[#A5B4FC] hover:shadow-[0_10px_24px_-12px_rgba(79,70,229,0.4)]"
              }`}
              style={{
                opacity: inView || reduced ? 1 : 0,
                transform: inView || reduced ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 500ms ease ${i * 70}ms, transform 500ms ease ${i * 70}ms, box-shadow 200ms, border-color 200ms`,
              }}
            >
              <div className="flex justify-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#EEF2FF] text-[#4F46E5] transition-shadow ${
                    isActive ? "shadow-[0_0_0_4px_rgba(167,139,250,0.25)]" : ""
                  }`}
                >
                  <s.Icon size={15} />
                </span>
              </div>
              <div className="mt-2 text-[11.5px] leading-snug font-semibold text-[#0B123F]">{s.label}</div>
            </button>
          );
        })}
      </div>

      {/* Single smooth wave line with dots aligned under each card */}
      <div className="relative mt-5 h-12">
        <svg
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id="camp-line" x1="0" x2="1">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <path
            d={pathD}
            stroke="url(#camp-line)"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={
              reduced
                ? undefined
                : {
                    strokeDasharray: 400,
                    strokeDashoffset: inView ? 0 : 400,
                    transition: "stroke-dashoffset 1400ms ease 200ms",
                  }
            }
          />
          {points.map((p, i) => {
            const sId = CAMPAIGN_SIGNALS[i].id;
            const active = hoveredSignal === sId || hoveredPair === sId;
            return (
              <g key={i}>
                {active && <circle cx={p.x} cy={p.y} r={3} fill="#6366F1" opacity={0.25} />}
                <circle cx={p.x} cy={p.y} r={active ? 1.8 : 1.3} fill="#4F46E5" />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ---------- Workflow timeline (desktop) ---------- */
function WorkflowTimeline({
  hoveredWorkflow,
  hoveredPair,
  onHover,
  inView,
  reduced,
}: {
  hoveredWorkflow: string | null;
  hoveredPair: string | null;
  onHover: (id: string | null) => void;
  inView: boolean;
  reduced: boolean;
}) {
  return (
    <div className="relative">
      {/* Cards row with arrows */}
      <div className="flex items-stretch gap-2">
        {WORKFLOW_STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1 last:flex-[1.3]">
            <button
              type="button"
              aria-label={step.label}
              onMouseEnter={() => onHover(step.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(step.id)}
              onBlur={() => onHover(null)}
              className={`group relative flex-1 rounded-2xl border p-3 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/40 min-h-[120px] ${
                step.isExpired
                  ? `bg-[#FFF1F2] ${
                      hoveredWorkflow === step.id || hoveredPair === step.id
                        ? "border-[#E11D48] shadow-[0_10px_30px_-12px_rgba(225,29,72,0.5)] -translate-y-0.5"
                        : "border-[#FECDD3] hover:-translate-y-0.5 hover:border-[#FB7185]"
                    }`
                  : `bg-white ${
                      hoveredWorkflow === step.id || hoveredPair === step.id
                        ? "border-[#E11D48] shadow-[0_10px_30px_-12px_rgba(225,29,72,0.4)] -translate-y-0.5"
                        : "border-[rgba(15,23,42,0.08)] shadow-[0_2px_8px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:border-[#FDA4AF]"
                    }`
              }`}
              style={{
                opacity: inView || reduced ? 1 : 0,
                transform: inView || reduced ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 500ms ease ${i * 110 + 500}ms, transform 500ms ease ${i * 110 + 500}ms, box-shadow 200ms, border-color 200ms`,
              }}
            >
              <div className="flex justify-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#FFF1F2] text-[#E11D48] transition-shadow ${
                    hoveredWorkflow === step.id ? "shadow-[0_0_0_4px_rgba(251,113,133,0.25)]" : ""
                  }`}
                >
                  <step.Icon size={15} />
                </span>
              </div>
              <div className="mt-2 text-[11.5px] leading-snug font-semibold text-[#0B123F]">{step.label}</div>
              {step.subtext && <div className="mt-1 text-[10.5px] leading-snug text-[#64748B]">{step.subtext}</div>}

              {/* Tooltip */}
              {hoveredWorkflow === step.id && (
                <div
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full z-20 w-[180px] rounded-lg bg-[#0B123F] text-white text-[11px] leading-snug px-3 py-2 shadow-xl"
                >
                  {step.tooltip}
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-[#0B123F] rotate-45" />
                </div>
              )}
            </button>

            {i < WORKFLOW_STEPS.length - 1 && (
              <svg width="28" height="10" viewBox="0 0 28 10" className="mx-1 text-[#FB7185] shrink-0" aria-hidden>
                <line x1="0" y1="5" x2="20" y2="5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
                <path
                  d="M 20 1 L 26 5 L 20 9"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Timeline line + time labels */}
      <div className="relative mt-4">
        <div className="relative h-3">
          <div className="absolute left-[6%] right-[16%] top-1/2 -translate-y-1/2 h-[2px] bg-[#FB7185] rounded-full" />
          <div className="absolute left-[84%] right-[6%] top-1/2 -translate-y-1/2 h-[2px] border-t-2 border-dashed border-[#FB7185]" />
          {[6, 27, 48, 69].map((left, i) => (
            <span
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 w-2.5 h-2.5 rounded-full bg-[#E11D48]"
              style={{ left: `${left}%` }}
            />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-5 text-[10.5px] text-[#64748B]">
          <div className="text-center">0 days</div>
          <div className="text-center">4 days</div>
          <div className="text-center">6 days</div>
          <div className="text-center">10+ days</div>
          <div className="text-center" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Gap annotation (right side) ---------- */
function GapAnnotation() {
  return (
    <div className="relative h-full flex items-center justify-center py-4">
      <div className="relative flex flex-col items-center h-full w-full min-h-[260px]">
        {/* Top arrow */}
        <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden className="text-[#8B5CF6]">
          <path
            d="M 7 1 L 7 9 M 2 5 L 7 1 L 12 5"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Dashed line above label */}
        <div
          className="flex-1 w-px"
          style={{
            backgroundImage: "linear-gradient(to bottom, #8B5CF6 0, #8B5CF6 4px, transparent 4px, transparent 8px)",
            backgroundSize: "1px 8px",
            backgroundRepeat: "repeat-y",
          }}
          aria-hidden
        />

        {/* Centered label */}
        <div className="my-2 text-center">
          <div className="text-[12px] leading-[1.25] font-semibold text-[#0B123F]">
            The gap
            <br />
            gets wider
            <br />
            every day
          </div>
        </div>

        {/* Dashed line below label */}
        <div
          className="flex-1 w-px"
          style={{
            backgroundImage: "linear-gradient(to bottom, #8B5CF6 0, #8B5CF6 4px, transparent 4px, transparent 8px)",
            backgroundSize: "1px 8px",
            backgroundRepeat: "repeat-y",
          }}
          aria-hidden
        />

        {/* Bottom arrow */}
        <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden className="text-[#8B5CF6]">
          <path
            d="M 7 9 L 7 1 M 2 5 L 7 9 L 12 5"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

/* ---------- Result callout ---------- */
function ResultCallout({ inView, reduced }: { inView: boolean; reduced: boolean }) {
  return (
    <div
      className="mt-6 md:mt-8 group rounded-2xl border border-[#E0E7FF] bg-white p-5 md:p-6 shadow-[0_10px_40px_-24px_rgba(79,70,229,0.3)] flex items-center gap-4 md:gap-5 transition-shadow hover:shadow-[0_14px_44px_-22px_rgba(139,92,246,0.45)] hover:border-[#C7D2FE]"
      style={{
        opacity: inView || reduced ? 1 : 0,
        transform: inView || reduced ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 600ms ease 1200ms, transform 600ms ease 1200ms, box-shadow 200ms, border-color 200ms",
      }}
    >
      <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#8B5CF6] flex items-center justify-center text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.55)]">
        <AlertCircle size={22} />
      </div>
      <p className="text-[14px] md:text-[17px] leading-relaxed text-[#334155]">
        <span className="text-[#0B123F]">The result: teams act on </span>
        <span className="font-semibold bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent group-hover:brightness-110 transition">
          yesterday's learnings
        </span>
        <span className="text-[#0B123F]"> while today's opportunities </span>
        <span className="font-semibold bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent group-hover:brightness-110 transition">
          move on
        </span>
        <span className="text-[#0B123F]">.</span>
      </p>
    </div>
  );
}

/* ---------- Mobile layout (no horizontal scroll) ---------- */
const PAIR_EXPLAIN: Record<string, string> = {
  s1: "Pairs with: Brief written — learning becomes a request.",
  s2: "Pairs with: Report pulled — signal enters after the shift.",
  s3: "Pairs with: Creative reviewed — execution waits on approvals.",
  s4: "Pairs with: Campaign updated — action arrives after the market moves.",
  s5: "Pairs with: Campaign updated — action arrives after the market moves.",
  s6: "Pairs with: Signal expired — the opportunity has moved on.",
  s7: "More signals keep emerging while workflows catch up.",
};

function MobileLayout({
  tappedSignal,
  setTappedSignal,
  expandedWorkflow,
  setExpandedWorkflow,
}: {
  tappedSignal: string | null;
  setTappedSignal: (id: string | null) => void;
  expandedWorkflow: string | null;
  setExpandedWorkflow: (id: string | null) => void;
}) {
  // First 6 signals in 2-col grid; 7th as full-width subtle card
  const gridSignals = CAMPAIGN_SIGNALS.slice(0, 6);
  const extraSignal = CAMPAIGN_SIGNALS[6];
  const activePairId = tappedSignal ? (CAMPAIGN_SIGNALS.find((s) => s.id === tappedSignal)?.pairId ?? null) : null;

  return (
    <div className="space-y-7">
      {/* SECTION 1: Campaign reality */}
      <div>
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
            <Activity size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-[#0B123F] text-[15px] leading-tight">Campaign reality</h3>
            <p className="text-[12.5px] text-[#64748B] mt-0.5">The market is changing every day.</p>
          </div>
          <span className="text-[10px] font-semibold tracking-[0.12em] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] shrink-0">
            FAST MOVING
          </span>
        </div>

        {/* 2-col grid (1-col if very narrow) */}
        <div className="mt-3 grid grid-cols-2 max-[339px]:grid-cols-1 gap-2.5">
          {gridSignals.map((s) => {
            const isActive = tappedSignal === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-label={`${s.day}: ${s.label}`}
                aria-pressed={isActive}
                onClick={() => setTappedSignal(isActive ? null : s.id)}
                className={`text-left rounded-2xl border bg-white p-3.5 min-h-[96px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 ${
                  isActive
                    ? "border-[#4F46E5] shadow-[0_10px_24px_-14px_rgba(79,70,229,0.45)]"
                    : "border-[rgba(15,23,42,0.08)] shadow-[0_2px_8px_-4px_rgba(15,23,42,0.08)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-bold tracking-[0.16em] text-[#4F46E5]">{s.day}</span>
                  <span className="w-7 h-7 rounded-full flex items-center justify-center bg-[#EEF2FF] text-[#4F46E5]">
                    <s.Icon size={13} />
                  </span>
                </div>
                <div className="mt-1.5 text-[12.5px] leading-snug font-semibold text-[#0B123F]">{s.label}</div>
                {isActive && (
                  <div className="mt-2 text-[11px] leading-snug text-[#64748B] border-t border-dashed border-[#E0E7FF] pt-2">
                    {PAIR_EXPLAIN[s.id]}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Day 7 subtle full-width card */}
        <button
          type="button"
          aria-label={extraSignal.label}
          aria-pressed={tappedSignal === extraSignal.id}
          onClick={() => setTappedSignal(tappedSignal === extraSignal.id ? null : extraSignal.id)}
          className={`mt-2.5 w-full flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 ${
            tappedSignal === extraSignal.id
              ? "bg-white border-[#4F46E5] shadow-[0_8px_20px_-14px_rgba(79,70,229,0.45)]"
              : "bg-[#F5F3FF]/60 border-[rgba(79,70,229,0.18)]"
          }`}
        >
          <span className="w-7 h-7 rounded-full flex items-center justify-center bg-[#EEF2FF] text-[#4F46E5] shrink-0">
            <MoreHorizontal size={13} />
          </span>
          <span className="text-[12.5px] font-semibold text-[#0B123F]">More signals emerge daily</span>
        </button>

        {/* Pulse indicator */}
        <div className="mt-3 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4F46E5]" />
          </span>
          <span className="flex-1 h-[2px] rounded-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-transparent" />
          <span className="text-[10.5px] font-semibold tracking-wide text-[#4F46E5]">Signals keep moving</span>
        </div>
      </div>

      {/* GAP CUE */}
      <div className="flex flex-col items-center gap-1.5 py-1">
        <svg width="14" height="48" viewBox="0 0 14 48" aria-hidden>
          <defs>
            <linearGradient id="mobile-gap-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
          </defs>
          <path
            d="M 3 5 L 7 1 L 11 5"
            stroke="#8B5CF6"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="7" y1="4" x2="7" y2="44" stroke="url(#mobile-gap-grad)" strokeWidth="1.3" strokeDasharray="3 3" />
          <path
            d="M 3 43 L 7 47 L 11 43"
            stroke="#FB7185"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-[11.5px] font-semibold text-[#0B123F]">The gap gets wider every day</div>
      </div>

      {/* SECTION 2: Workflow reality */}
      <div>
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-full bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
            <Clock size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-[#0B123F] text-[15px] leading-tight">Workflow reality</h3>
            <p className="text-[12.5px] text-[#64748B] mt-0.5">Traditional workflows move in sequence.</p>
          </div>
          <span className="text-[10px] font-semibold tracking-[0.12em] px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E11D48] shrink-0">
            SLOW MOVING
          </span>
        </div>

        {/* Vertical stepper */}
        <ol className="mt-4 relative">
          {/* Vertical line */}
          <span
            className="absolute left-[18px] top-2 bottom-2 w-px"
            style={{
              backgroundImage: "linear-gradient(to bottom, #FB7185 0, #FB7185 4px, transparent 4px, transparent 8px)",
              backgroundSize: "1px 8px",
              backgroundRepeat: "repeat-y",
            }}
            aria-hidden
          />
          {WORKFLOW_STEPS.map((step) => {
            const expanded = expandedWorkflow === step.id;
            const isPaired = activePairId === step.id;
            return (
              <li key={step.id} className="relative pl-11 mb-2.5 last:mb-0">
                {/* Marker */}
                <span
                  className={`absolute left-0 top-2 w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                    step.isExpired
                      ? "bg-[#FFF1F2] border-[#FB7185] text-[#E11D48]"
                      : "bg-white border-[#FB7185] text-[#E11D48]"
                  }`}
                >
                  <step.Icon size={14} />
                </span>
                <button
                  type="button"
                  aria-label={step.label}
                  aria-expanded={expanded}
                  onClick={() => setExpandedWorkflow(expanded ? null : step.id)}
                  className={`w-full text-left rounded-2xl border px-3.5 py-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/40 ${
                    step.isExpired
                      ? `bg-[#FFF1F2] ${
                          isPaired || expanded
                            ? "border-[#E11D48] shadow-[0_8px_20px_-14px_rgba(225,29,72,0.5)]"
                            : "border-[#FECDD3]"
                        }`
                      : `bg-white ${
                          isPaired || expanded
                            ? "border-[#E11D48] shadow-[0_8px_20px_-14px_rgba(225,29,72,0.45)]"
                            : "border-[rgba(15,23,42,0.08)] shadow-[0_2px_8px_-4px_rgba(15,23,42,0.08)]"
                        }`
                  } ${step.isExpired ? "min-h-[76px]" : "min-h-[64px]"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-[#0B123F] leading-tight">{step.label}</span>
                    {step.time && (
                      <span className="shrink-0 text-[10.5px] font-semibold tracking-wide text-[#E11D48] bg-[#FFF1F2] rounded-full px-2 py-0.5">
                        {step.time}
                      </span>
                    )}
                  </div>
                  {step.subtext && <div className="mt-1 text-[11.5px] text-[#9F1239]">{step.subtext}</div>}
                  {expanded && (
                    <div className="mt-2 text-[11.5px] leading-snug text-[#64748B] border-t border-dashed border-[#FECDD3] pt-2">
                      {step.tooltip}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ---------- Mobile section (standalone, per spec) ---------- */
const MOBILE_PAIR_EXPLAIN: Record<string, string> = {
  s1: "Pairs with: Brief written — learning becomes a request.",
  s2: "Pairs with: Report pulled — signal enters after the shift.",
  s3: "Pairs with: Creative reviewed — execution waits on approvals.",
  s4: "Pairs with: Campaign updated — action arrives after the market moves.",
  s5: "Pairs with: Campaign updated — action arrives after the market moves.",
  s6: "Pairs with: Signal expired — the opportunity has moved on.",
};

const MOBILE_WORKFLOW_EXPLAIN: Record<string, string> = {
  w1: "Signals enter the workflow after performance has already shifted.",
  w2: "Learning becomes a request.",
  w3: "Execution waits on approvals.",
  w4: "Action arrives after the market has moved.",
  w5: "The original opportunity has already changed.",
};

function ProblemSectionMobile() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();
  const [tappedSignal, setTappedSignal] = useState<string | null>(null);
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);

  const gridSignals = CAMPAIGN_SIGNALS.slice(0, 6);
  const activePairId = tappedSignal
    ? (CAMPAIGN_SIGNALS.find((s) => s.id === tappedSignal)?.pairId ?? null)
    : null;

  const fade = (delay = 0) => ({
    opacity: inView || reduced ? 1 : 0,
    transform: inView || reduced ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
  });

  return (
    <section
      ref={ref}
      aria-labelledby="problem-mobile-title"
      className="lg:hidden relative w-full bg-[#F8FAFC] overflow-hidden"
      style={{ paddingTop: 72, paddingBottom: 72 }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full opacity-[0.35]"
        style={{
          background:
            "radial-gradient(circle, rgba(167,139,250,0.18) 0%, rgba(99,102,241,0.08) 35%, rgba(248,250,252,0) 70%)",
        }}
      />

      <div className="relative px-6">
        {/* Header */}
        <div style={fade(0)}>
          <div className="text-[12px] font-bold tracking-[0.18em] text-[#4F46E5]">THE PROBLEM</div>
          <h2
            id="problem-mobile-title"
            className="mt-4 font-display font-bold text-[#0B123F]"
            style={{ fontSize: "clamp(40px, 10vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.01em" }}
          >
            Performance marketing moves daily. Most workflows{" "}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
              don't.
            </span>
          </h2>
          <p className="mt-[22px] text-[17px] leading-[1.55] text-[#334155]">
            Every campaign is already telling you what to change — fatigue, CAC drift, winning hooks, audience
            shifts, and offer performance. But between campaign reality and workflow reality,{" "}
            <span className="font-semibold bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
              the gap widens each day
            </span>{" "}
            as signals move faster than reports, briefs, reviews, and updates.
          </p>
        </div>

        {/* Main comparison card */}
        <div
          className="mt-10 rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.18)]"
          style={fade(120)}
        >
          {/* Top label */}
          <div className="pb-3.5 border-b border-[rgba(15,23,42,0.06)]">
            <div className="inline-flex items-center gap-2">
              <Bookmark size={15} className="text-[#4F46E5]" />
              <span className="relative text-[14px] font-semibold text-[#4F46E5] pb-1">
                See the gap
                <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6]" />
              </span>
            </div>
          </div>

          {/* B. Campaign reality */}
          <div className="mt-6">
            <div className="flex items-start gap-3">
              <span className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                <Activity size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold text-[#0B123F] text-[20px] leading-tight">
                  Campaign reality
                </h3>
                <p className="text-[15px] text-[#64748B] mt-0.5 leading-snug">
                  The market is changing every day.
                </p>
              </div>
              <span className="text-[10px] font-bold tracking-[0.14em] px-2 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] shrink-0">
                FAST MOVING
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {gridSignals.map((s, idx) => {
                const isActive = tappedSignal === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`${s.day}: ${s.label}`}
                    aria-pressed={isActive}
                    onClick={() => setTappedSignal(isActive ? null : s.id)}
                    className={`text-left rounded-2xl border bg-white p-3.5 min-h-[104px] flex flex-col transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 ${
                      isActive
                        ? "border-[#4F46E5] shadow-[0_10px_24px_-14px_rgba(79,70,229,0.5)]"
                        : "border-[rgba(15,23,42,0.08)] shadow-[0_2px_8px_-4px_rgba(15,23,42,0.08)]"
                    }`}
                    style={{
                      opacity: inView || reduced ? 1 : 0,
                      transform: inView || reduced ? "translateY(0)" : "translateY(8px)",
                      transition: `opacity 400ms ease ${250 + idx * 60}ms, transform 400ms ease ${250 + idx * 60}ms, box-shadow 200ms, border-color 200ms`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-[0.16em] text-[#4F46E5]">{s.day}</span>
                      <span className="w-6 h-6 rounded-full flex items-center justify-center bg-[#EEF2FF] text-[#4F46E5]">
                        <s.Icon size={12} />
                      </span>
                    </div>
                    <div className="mt-1.5 text-[14px] leading-[1.25] font-semibold text-[#0B123F]">
                      {s.label}
                    </div>
                  </button>
                );
              })}
            </div>

            {tappedSignal && MOBILE_PAIR_EXPLAIN[tappedSignal] && (
              <div className="mt-2.5 rounded-xl border border-[#E0E7FF] bg-[#F5F3FF]/60 px-3.5 py-2.5 text-[12.5px] leading-snug text-[#4338CA]">
                {MOBILE_PAIR_EXPLAIN[tappedSignal]}
              </div>
            )}

            <div className="mt-2.5 w-full flex items-center gap-2.5 rounded-2xl border border-[rgba(79,70,229,0.18)] bg-[#F5F3FF]/60 px-3.5 py-3">
              <span className="w-7 h-7 rounded-full flex items-center justify-center bg-[#EEF2FF] text-[#4F46E5] shrink-0">
                <MoreHorizontal size={13} />
              </span>
              <span className="text-[13px] font-semibold text-[#0B123F]">More signals emerge daily</span>
            </div>

            <div className="mt-3.5 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4F46E5]" />
              </span>
              <span className="flex-1 h-[2px] rounded-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-transparent" />
              <span className="text-[10.5px] font-semibold tracking-wide text-[#4F46E5]">Signals keep moving</span>
            </div>
          </div>

          {/* C. Latency gap bridge */}
          <div
            className="mt-6 mb-6 rounded-[22px] border flex items-center gap-3.5 p-[18px]"
            style={{
              background: "linear-gradient(135deg, rgba(245,243,255,0.9), rgba(238,242,255,0.7))",
              borderColor: "rgba(139,92,246,0.18)",
            }}
          >
            <svg width="14" height="62" viewBox="0 0 14 62" aria-hidden className="shrink-0">
              <circle cx="7" cy="6" r="4" fill="#6366F1" />
              <line
                x1="7"
                y1="12"
                x2="7"
                y2="50"
                stroke="#A78BFA"
                strokeWidth="1.5"
                strokeDasharray="2.5 3"
                strokeLinecap="round"
              />
              <circle cx="7" cy="56" r="4" fill="#FB7185" />
            </svg>
            <div className="min-w-0">
              <div className="text-[10px] font-bold tracking-[0.16em] text-[#6366F1]">LATENCY GAP</div>
              <div className="mt-1 text-[15px] font-bold text-[#0B123F] leading-snug">
                The gap widens each day.
              </div>
              <div className="mt-1 text-[13px] leading-snug text-[#64748B]">
                Campaign signals update in real time. Workflow action lands days later.
              </div>
            </div>
          </div>

          {/* D. Workflow reality */}
          <div>
            <div className="flex items-start gap-3">
              <span className="w-12 h-12 rounded-full bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
                <Clock size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold text-[#0B123F] text-[20px] leading-tight">
                  Workflow reality
                </h3>
                <p className="text-[15px] text-[#64748B] mt-0.5 leading-snug">
                  Traditional workflows move in sequence.
                </p>
              </div>
              <span className="text-[10px] font-bold tracking-[0.14em] px-2 py-1 rounded-full bg-[#FFF1F2] text-[#E11D48] shrink-0">
                SLOW MOVING
              </span>
            </div>

            <ol className="mt-4 relative">
              <span
                className="absolute left-[18px] top-3 bottom-3 w-px"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, #FB7185 0, #FB7185 4px, transparent 4px, transparent 8px)",
                  backgroundSize: "1px 8px",
                  backgroundRepeat: "repeat-y",
                }}
                aria-hidden
              />
              {WORKFLOW_STEPS.map((step) => {
                const expanded = expandedWorkflow === step.id;
                const isPaired = activePairId === step.id;
                const explain = MOBILE_WORKFLOW_EXPLAIN[step.id];
                return (
                  <li key={step.id} className="relative pl-12 mb-3 last:mb-0">
                    <span
                      className={`absolute left-0 top-3 w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                        step.isExpired
                          ? "bg-[#FFF1F2] border-[#FB7185] text-[#E11D48]"
                          : "bg-white border-[#FB7185] text-[#E11D48]"
                      }`}
                    >
                      <step.Icon size={15} />
                    </span>
                    <button
                      type="button"
                      aria-label={step.label}
                      aria-expanded={expanded}
                      onClick={() => setExpandedWorkflow(expanded ? null : step.id)}
                      className={`w-full text-left rounded-2xl border px-4 py-3.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/40 ${
                        step.isExpired
                          ? `bg-[#FFF1F2] ${
                              isPaired || expanded
                                ? "border-[#E11D48] shadow-[0_8px_20px_-14px_rgba(225,29,72,0.5)]"
                                : "border-[#FECDD3]"
                            }`
                          : `bg-white ${
                              isPaired || expanded
                                ? "border-[#E11D48] shadow-[0_8px_20px_-14px_rgba(225,29,72,0.45)]"
                                : "border-[rgba(15,23,42,0.08)] shadow-[0_2px_8px_-4px_rgba(15,23,42,0.08)]"
                            }`
                      }`}
                      style={{ minHeight: step.isExpired ? 76 : 64 }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[14px] font-semibold text-[#0B123F] leading-tight">
                          {step.label}
                        </span>
                        {step.time && (
                          <span className="shrink-0 text-[11px] font-semibold tracking-wide text-[#E11D48] bg-white border border-[#FECDD3] rounded-full px-2 py-0.5">
                            {step.time}
                          </span>
                        )}
                      </div>
                      {step.subtext && (
                        <div className="mt-1 text-[12.5px] text-[#9F1239]">{step.subtext}</div>
                      )}
                      {expanded && explain && (
                        <div className="mt-2 text-[12.5px] leading-snug text-[#64748B] border-t border-dashed border-[#FECDD3] pt-2">
                          {explain}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Bottom result callout */}
        <div
          className="mt-6 rounded-[24px] border border-[rgba(139,92,246,0.18)] bg-white p-[22px] shadow-[0_14px_40px_-22px_rgba(139,92,246,0.4)] flex items-start gap-4"
          style={fade(400)}
        >
          <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#8B5CF6] flex items-center justify-center text-white shadow-[0_8px_22px_-8px_rgba(139,92,246,0.55)]">
            <AlertCircle size={20} />
          </div>
          <p className="text-[20px] leading-[1.35] font-semibold text-[#0B123F]">
            The result: teams act on{" "}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
              yesterday's learnings
            </span>{" "}
            while today's opportunities{" "}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
              move on
            </span>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Main ---------- */
export const ProblemSectionV2 = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();

  const [hoveredSignal, setHoveredSignal] = useState<string | null>(null);
  const [hoveredWorkflow, setHoveredWorkflow] = useState<string | null>(null);

  const signalPairId = hoveredSignal ? (CAMPAIGN_SIGNALS.find((s) => s.id === hoveredSignal)?.pairId ?? null) : null;
  const workflowReverseSignalIds = hoveredWorkflow
    ? CAMPAIGN_SIGNALS.filter((s) => s.pairId === hoveredWorkflow).map((s) => s.id)
    : [];

  return (
    <>
      <ProblemSectionMobile />

      <section
        ref={ref}
        aria-labelledby="problem-v2-title"
        className="hidden lg:block relative w-full bg-[#F7F7FA] py-20 md:py-28"
      >
        <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 md:items-start">
            <div
              style={{
                opacity: inView || reduced ? 1 : 0,
                transform: inView || reduced ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 600ms ease, transform 600ms ease",
              }}
            >
              <div className="text-[11px] tracking-[0.22em] font-bold text-[#4F46E5]">{EYEBROW}</div>
              <h2
                id="problem-v2-title"
                className="mt-4 font-display text-[36px] sm:text-[46px] md:text-[56px] leading-[1.04] tracking-tight font-bold text-[#0B123F]"
              >
                Performance marketing moves daily.
                <br />
                Most workflows{" "}
                <span className="bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">don't.</span>
              </h2>
            </div>
            <div className="md:pl-8 md:border-l md:border-[rgba(15,23,42,0.08)]">
              <p
                className="text-[15px] md:text-base leading-relaxed text-[#334155] md:pt-4 max-w-[520px]"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 600ms ease 150ms, transform 600ms ease 150ms",
                }}
              >
                {SUBHEAD}
              </p>
            </div>
          </div>

          <div
            className="mt-10 md:mt-14 rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-6 md:p-10 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)]"
            style={{
              opacity: inView || reduced ? 1 : 0,
              transform: inView || reduced ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 700ms ease 250ms, transform 700ms ease 250ms",
            }}
          >
            {/* Container header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[rgba(15,23,42,0.06)]">
              <div className="inline-flex items-center gap-2">
                <Bookmark size={15} className="text-[#4F46E5]" />
                <span className="relative text-[14px] font-semibold text-[#4F46E5] pb-1">
                  See the gap
                  <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] rounded-full" />
                </span>
              </div>
              <Legend />
            </div>

            {/* TOP ZONE: Signals from the market */}
            <div className="pt-8">
              <div className="flex items-start gap-3 mb-5">
                <span className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                  <Activity size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-bold text-[#0B123F] text-[18px] leading-tight">
                    Signals from the market
                  </h3>
                  <p className="text-[12.5px] text-[#64748B] mt-0.5 leading-snug">What changes every day</p>
                </div>
                <span className="text-[10.5px] font-semibold tracking-[0.12em] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] shrink-0">
                  FAST MOVING
                </span>
              </div>
              <CampaignTimeline
                hoveredSignal={hoveredSignal}
                hoveredPair={
                  workflowReverseSignalIds.includes("__never__") ? null : (workflowReverseSignalIds[0] ?? null)
                }
                onHover={setHoveredSignal}
                inView={inView}
                reduced={reduced}
              />
            </div>

            {/* SEPARATOR: THE GAP */}
            <div className="relative my-10 flex items-center justify-center" aria-hidden>
              <div
                className="absolute inset-x-0 top-1/2 h-px"
                style={{
                  background:
                    "linear-gradient(to right, transparent 0%, rgba(139,92,246,0.35) 20%, rgba(139,92,246,0.55) 50%, rgba(139,92,246,0.35) 80%, transparent 100%)",
                }}
              />
              {/* Downward connector arrow above the pill */}
              <svg
                width="14"
                height="22"
                viewBox="0 0 14 22"
                className="absolute left-1/2 -translate-x-1/2 -top-5 text-[#8B5CF6]"
              >
                <line x1="7" y1="0" x2="7" y2="16" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3 3" />
                <path
                  d="M 2 14 L 7 20 L 12 14"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="relative inline-flex items-center gap-1.5 rounded-full border border-[rgba(139,92,246,0.25)] bg-white px-3 py-1 shadow-[0_4px_14px_-6px_rgba(139,92,246,0.35)]">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6]" />
                <span className="text-[10.5px] font-bold tracking-[0.18em] bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
                  THE GAP
                </span>
              </div>
            </div>

            {/* BOTTOM ZONE: How teams respond */}
            <div>
              <div className="flex items-start gap-3 mb-5">
                <span className="w-10 h-10 rounded-full bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-bold text-[#0B123F] text-[18px] leading-tight">
                    How teams respond
                  </h3>
                  <p className="text-[12.5px] text-[#64748B] mt-0.5 leading-snug">
                    What usually takes days or weeks
                  </p>
                </div>
                <span className="text-[10.5px] font-semibold tracking-[0.12em] px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E11D48] shrink-0">
                  SLOW MOVING
                </span>
              </div>
              <WorkflowTimeline
                hoveredWorkflow={hoveredWorkflow}
                hoveredPair={signalPairId}
                onHover={setHoveredWorkflow}
                inView={inView}
                reduced={reduced}
              />
            </div>

            {/* FOOTER: Result callout inside the same container */}
            <div
              className="mt-10 pt-6 border-t border-[rgba(15,23,42,0.06)] flex items-center gap-4"
              style={{
                opacity: inView || reduced ? 1 : 0,
                transform: inView || reduced ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 600ms ease 1200ms, transform 600ms ease 1200ms",
              }}
            >
              <div className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#8B5CF6] flex items-center justify-center text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.55)]">
                <AlertCircle size={20} />
              </div>
              <p className="text-[14px] md:text-[16px] leading-relaxed text-[#334155]">
                <span className="text-[#0B123F]">The result: teams act on </span>
                <span className="font-semibold bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
                  yesterday's learnings
                </span>
                <span className="text-[#0B123F]"> while today's opportunities </span>
                <span className="font-semibold bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
                  move on
                </span>
                <span className="text-[#0B123F]">.</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProblemSectionV2;
