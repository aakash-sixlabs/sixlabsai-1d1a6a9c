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
  "Every campaign is already telling you what to change — fatigue, CAC drift, winning hooks, audience shifts, and offer performance. But those signals still move through reports, briefs, reviews, and updates before anything changes.";

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
  { id: "w1", label: "Report pulled", time: "0 days", Icon: FileText, tooltip: "Signal enters the workflow after performance has already shifted." },
  { id: "w2", label: "Brief written", time: "4 days", Icon: Pencil, tooltip: "Learning becomes a request." },
  { id: "w3", label: "Creative reviewed", time: "6 days", Icon: UsersRound, tooltip: "Execution waits on approvals." },
  { id: "w4", label: "Campaign updated", time: "10+ days", Icon: Send, tooltip: "Action arrives after the market has moved." },
  { id: "w5", label: "Signal expired", time: "", Icon: Hourglass, tooltip: "The original opportunity has already changed.", isExpired: true, subtext: "The opportunity has moved on." },
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
      { threshold: 0.12 }
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
  // 7 columns
  const cols = CAMPAIGN_SIGNALS.length;
  const points = useMemo(() => {
    const arr: { x: number; y: number }[] = [];
    for (let i = 0; i < cols; i++) {
      const x = (i + 0.5) * (100 / cols);
      const y = 50 + Math.sin(i * 1.1) * 18;
      arr.push({ x, y });
    }
    return arr;
  }, [cols]);

  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` Q ${cx} ${prev.y}, ${cx} ${(prev.y + curr.y) / 2} T ${curr.x} ${curr.y}`;
    }
    return d;
  }, [points]);

  return (
    <div className="relative">
      {/* Day headers */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {CAMPAIGN_SIGNALS.map((s, i) => (
          <div key={s.id} className="text-center">
            <span
              className={`inline-block text-[10.5px] font-bold tracking-[0.16em] px-2 py-0.5 rounded-full transition-colors ${
                i === 0
                  ? "bg-[#4F46E5] text-white"
                  : "text-[#64748B]"
              }`}
            >
              {s.day}
            </span>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div
        className="mt-3 grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
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
              <div className="mt-2 text-[11.5px] leading-snug font-semibold text-[#0B123F]">
                {s.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Timeline line + dots */}
      <div className="relative mt-4 h-10">
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden>
          <defs>
            <linearGradient id="camp-line" x1="0" x2="1">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <path
            d={pathD}
            stroke="url(#camp-line)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
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
        </svg>
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {points.map((p, i) => {
            const sId = CAMPAIGN_SIGNALS[i].id;
            const active = hoveredSignal === sId || hoveredPair === sId;
            return (
              <div key={i} className="relative">
                <span
                  className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#4F46E5] transition-all ${
                    active ? "scale-125 shadow-[0_0_0_5px_rgba(99,102,241,0.25)]" : ""
                  }`}
                  style={{ top: `${p.y - 5}%` }}
                />
              </div>
            );
          })}
        </div>
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
              <div className="mt-2 text-[11.5px] leading-snug font-semibold text-[#0B123F]">
                {step.label}
              </div>
              {step.subtext && (
                <div className="mt-1 text-[10.5px] leading-snug text-[#64748B]">{step.subtext}</div>
              )}

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
                <path d="M 20 1 L 26 5 L 20 9" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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

/* ---------- Gap annotation (right side bracket) ---------- */
function GapAnnotation() {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="relative h-full flex items-center justify-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <svg viewBox="0 0 40 200" className="h-full w-10" aria-hidden>
        <defs>
          <linearGradient id="gap-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <path
          d="M 8 8 L 20 8 L 20 192 L 8 192"
          stroke="url(#gap-grad)"
          strokeWidth="1.2"
          fill="none"
          strokeDasharray="3 3"
          className={hover ? "animate-pulse" : ""}
        />
        <path d="M 14 4 L 20 8 L 26 4" stroke="url(#gap-grad)" strokeWidth="1.2" fill="none" />
        <path d="M 14 196 L 20 192 L 26 196" stroke="url(#gap-grad)" strokeWidth="1.2" fill="none" />
      </svg>
      <div className="absolute -right-2 translate-x-full text-left max-w-[100px]">
        <div className="text-[11px] leading-tight font-semibold text-[#4F46E5]">
          The gap gets wider every day
        </div>
      </div>
      {hover && (
        <div
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[200px] rounded-lg bg-[#0B123F] text-white text-[11px] leading-snug px-3 py-2 shadow-xl z-20"
        >
          Campaigns update daily. Workflow action lands days later.
        </div>
      )}
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

/* ---------- Mobile timeline (horizontal scroll) ---------- */
function MobileTimeline({
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
  return (
    <div className="space-y-6">
      {/* Campaign reality */}
      <div>
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
            <Activity size={18} />
          </span>
          <div>
            <h3 className="font-display font-bold text-[#0B123F] text-[15px] leading-tight">Campaign reality</h3>
            <p className="text-[12px] text-[#64748B] mt-0.5">The market is changing every day.</p>
            <span className="inline-block mt-1.5 text-[10.5px] font-semibold tracking-[0.12em] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5]">
              FAST MOVING
            </span>
          </div>
        </div>
        <div className="mt-3 -mx-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2.5 px-1 pb-3 snap-x snap-mandatory">
            {CAMPAIGN_SIGNALS.map((s) => {
              const isActive = tappedSignal === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`${s.day}: ${s.label}`}
                  onClick={() => setTappedSignal(isActive ? null : s.id)}
                  className={`snap-start shrink-0 w-[140px] min-h-[120px] rounded-2xl border bg-white p-3 text-center transition-all ${
                    isActive
                      ? "border-[#4F46E5] shadow-[0_8px_24px_-12px_rgba(79,70,229,0.5)]"
                      : "border-[rgba(15,23,42,0.08)] shadow-sm"
                  }`}
                >
                  <div className="text-[10px] font-bold tracking-[0.16em] text-[#4F46E5]">{s.day}</div>
                  <div className="mt-1.5 flex justify-center">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#EEF2FF] text-[#4F46E5]">
                      <s.Icon size={14} />
                    </span>
                  </div>
                  <div className="mt-1.5 text-[11px] leading-snug font-semibold text-[#0B123F]">{s.label}</div>
                </button>
              );
            })}
          </div>
          <div className="h-[2px] mx-3 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]" />
        </div>
      </div>

      {/* Gap cue */}
      <div className="flex flex-col items-center gap-1.5 py-1">
        <svg width="14" height="28" viewBox="0 0 14 28" aria-hidden>
          <line x1="7" y1="2" x2="7" y2="26" stroke="#8B5CF6" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M 3 6 L 7 2 L 11 6" stroke="#8B5CF6" strokeWidth="1.2" fill="none" />
          <path d="M 3 22 L 7 26 L 11 22" stroke="#8B5CF6" strokeWidth="1.2" fill="none" />
        </svg>
        <div className="text-[11px] font-semibold text-[#4F46E5]">The gap gets wider every day</div>
      </div>

      {/* Workflow reality */}
      <div>
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-full bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
            <Clock size={18} />
          </span>
          <div>
            <h3 className="font-display font-bold text-[#0B123F] text-[15px] leading-tight">Workflow reality</h3>
            <p className="text-[12px] text-[#64748B] mt-0.5">Traditional workflows move in sequence.</p>
            <span className="inline-block mt-1.5 text-[10.5px] font-semibold tracking-[0.12em] px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E11D48]">
              SLOW MOVING
            </span>
          </div>
        </div>
        <div className="mt-3 -mx-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2.5 px-1 pb-3 snap-x snap-mandatory">
            {WORKFLOW_STEPS.map((step) => {
              const expanded = expandedWorkflow === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  aria-label={step.label}
                  onClick={() => setExpandedWorkflow(expanded ? null : step.id)}
                  className={`snap-start shrink-0 ${
                    step.isExpired ? "w-[170px]" : "w-[140px]"
                  } min-h-[120px] rounded-2xl border p-3 text-center transition-all ${
                    step.isExpired
                      ? "bg-[#FFF1F2] border-[#FECDD3]"
                      : "bg-white border-[rgba(15,23,42,0.08)] shadow-sm"
                  } ${expanded ? "ring-2 ring-[#E11D48]/30" : ""}`}
                >
                  <div className="flex justify-center">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFF1F2] text-[#E11D48]">
                      <step.Icon size={14} />
                    </span>
                  </div>
                  <div className="mt-1.5 text-[11px] leading-snug font-semibold text-[#0B123F]">{step.label}</div>
                  {step.time && <div className="text-[10px] text-[#64748B] mt-0.5">{step.time}</div>}
                  {step.subtext && <div className="text-[10px] text-[#64748B] mt-0.5">{step.subtext}</div>}
                  {expanded && (
                    <div className="mt-2 text-[10.5px] leading-snug text-[#64748B] border-t border-dashed border-[#FECDD3] pt-2">
                      {step.tooltip}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="h-[2px] mx-3 rounded-full bg-gradient-to-r from-[#FB7185] to-[#E11D48]" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Main ---------- */
export const ProblemSectionV2 = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();

  const [hoveredSignal, setHoveredSignal] = useState<string | null>(null);
  const [hoveredWorkflow, setHoveredWorkflow] = useState<string | null>(null);

  // Cross-highlight pairing
  const signalPairId = hoveredSignal
    ? CAMPAIGN_SIGNALS.find((s) => s.id === hoveredSignal)?.pairId ?? null
    : null;
  const workflowReverseSignalIds = hoveredWorkflow
    ? CAMPAIGN_SIGNALS.filter((s) => s.pairId === hoveredWorkflow).map((s) => s.id)
    : [];

  const [tappedSignal, setTappedSignal] = useState<string | null>(null);
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);

  return (
    <section
      ref={ref}
      aria-labelledby="problem-v2-title"
      className="relative w-full bg-[#F7F7FA] py-20 md:py-28"
    >
      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8">
        {/* Header */}
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
              <span className="bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
                don't.
              </span>
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

        {/* Timeline card */}
        <div
          className="mt-10 md:mt-14 rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-6 md:p-10 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)]"
          style={{
            opacity: inView || reduced ? 1 : 0,
            transform: inView || reduced ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 700ms ease 250ms, transform 700ms ease 250ms",
          }}
        >
          {/* Top bar: See the gap + legend */}
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

          {/* Desktop layout */}
          <div className="hidden lg:grid mt-8 grid-cols-[220px_1fr_60px] gap-6">
            {/* Campaign rail */}
            <div className="flex flex-col gap-12 pt-4">
              <div>
                <span className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
                  <Activity size={18} />
                </span>
                <h3 className="mt-3 font-display font-bold text-[#0B123F] text-base leading-tight">
                  Campaign reality
                </h3>
                <p className="text-[12.5px] text-[#64748B] mt-1 leading-snug">
                  The market is changing every day.
                </p>
                <span className="inline-block mt-2 text-[10.5px] font-semibold tracking-[0.12em] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5]">
                  FAST MOVING
                </span>
              </div>
              <div className="pt-6 border-t border-dashed border-[rgba(15,23,42,0.08)]">
                <span className="w-10 h-10 rounded-full bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center">
                  <Clock size={18} />
                </span>
                <h3 className="mt-3 font-display font-bold text-[#0B123F] text-base leading-tight">
                  Workflow reality
                </h3>
                <p className="text-[12.5px] text-[#64748B] mt-1 leading-snug">
                  Traditional workflows move in sequence.
                </p>
                <span className="inline-block mt-2 text-[10.5px] font-semibold tracking-[0.12em] px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E11D48]">
                  SLOW MOVING
                </span>
              </div>
            </div>

            {/* Timelines */}
            <div className="flex flex-col gap-10 min-w-0">
              <CampaignTimeline
                hoveredSignal={hoveredSignal}
                hoveredPair={workflowReverseSignalIds.includes("__never__") ? null : (workflowReverseSignalIds[0] ?? null)}
                onHover={setHoveredSignal}
                inView={inView}
                reduced={reduced}
              />
              <div className="pt-6 border-t border-dashed border-[rgba(15,23,42,0.08)]">
                <WorkflowTimeline
                  hoveredWorkflow={hoveredWorkflow}
                  hoveredPair={signalPairId}
                  onHover={setHoveredWorkflow}
                  inView={inView}
                  reduced={reduced}
                />
              </div>
            </div>

            {/* Gap annotation */}
            <GapAnnotation />
          </div>

          {/* Mobile / tablet layout */}
          <div className="lg:hidden mt-6">
            <MobileTimeline
              tappedSignal={tappedSignal}
              setTappedSignal={setTappedSignal}
              expandedWorkflow={expandedWorkflow}
              setExpandedWorkflow={setExpandedWorkflow}
            />
          </div>
        </div>

        {/* Result callout */}
        <ResultCallout inView={inView} reduced={reduced} />
      </div>
    </section>
  );
};

export default ProblemSectionV2;
