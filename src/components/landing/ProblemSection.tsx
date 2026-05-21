import { useState, useEffect, useRef } from "react";
import {
  Activity,
  RefreshCw,
  FlaskConical,
  Target,
  Users,
  ArrowLeftRight,
  Layers,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ---------- Editable copy ---------- */
const COPY = {
  eyebrow: "THE PROBLEM",
  headlineA: "Paid media moves in real time.",
  headlineB: "Agencies don't.",
  sub: "Campaigns generate signals every day — fatigue, CAC drift, winning hooks, competitor moves. But most agency workflows still take weeks to turn those signals into new creative and media decisions.",
  left: {
    pill: "CAMPAIGNS NEED",
    title: "Always-on speed and scale",
    desc: "Real-time signal detection across every campaign.",
  },
  right: {
    pill: "AGENCIES DELIVER",
    title: "Manual workflows and slow handoffs",
    desc: "Built around headcount, hours, and meetings — not real-time learning loops.",
  },
  callout:
    "Brands pay more for slower decisions, while the window to act on campaign learnings closes.",
  calloutMobile:
    "Brands pay more for slower decisions while campaign learnings expire.",
};

type Pair = {
  id: string;
  gap: string;
  consequence: string;
  campaign: { Icon: any; title: string; sub: string };
  agency: { Icon: any; title: string; sub: string };
};

const PAIRS: Pair[] = [
  {
    id: "speed",
    gap: "Speed gap",
    consequence: "Signals age before teams act.",
    campaign: {
      Icon: Activity,
      title: "Always-on analysis",
      sub: "Real-time signal detection across every campaign",
    },
    agency: {
      Icon: Users,
      title: "Briefs and meetings",
      sub: "Time lost in alignment and approvals",
    },
  },
  {
    id: "production",
    gap: "Production gap",
    consequence: "Creative fatigue compounds while production waits.",
    campaign: {
      Icon: RefreshCw,
      title: "Creative refreshes",
      sub: "Frequent iteration to stay ahead of fatigue",
    },
    agency: {
      Icon: Layers,
      title: "Batch production",
      sub: "Creatives produced in weekly or monthly batches",
    },
  },
  {
    id: "testing",
    gap: "Testing gap",
    consequence: "Testing velocity slows down.",
    campaign: {
      Icon: FlaskConical,
      title: "Continuous testing",
      sub: "Test more angles, hooks, offers, and audiences",
    },
    agency: {
      Icon: ArrowLeftRight,
      title: "Manual handoffs",
      sub: "Slow execution across multiple teams",
    },
  },
  {
    id: "learning",
    gap: "Learning gap",
    consequence: "Optimization arrives after the window closes.",
    campaign: {
      Icon: Target,
      title: "Live optimization",
      sub: "Adjust media and creative based on live performance",
    },
    agency: {
      Icon: Clock,
      title: "Delayed learning cycles",
      sub: "Insights are outdated by the time they are actioned",
    },
  },
];

/* ---------- Hooks ---------- */
const useInView = <T extends HTMLElement>(threshold = 0.15) => {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
};

/* ---------- Row ---------- */
const Row = ({
  Icon,
  title,
  sub,
  side,
  active,
  delay,
  visible,
  onEnter,
  onLeave,
}: {
  Icon: any;
  title: string;
  sub: string;
  side: "blue" | "lilac";
  active: boolean;
  delay: number;
  visible: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) => {
  const isBlue = side === "blue";
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`group flex items-start gap-3.5 rounded-2xl border bg-white/70 backdrop-blur-sm px-4 py-3.5 transition-all duration-300 cursor-default ${
        active
          ? isBlue
            ? "border-[#2563EB]/50 shadow-[0_10px_30px_-12px_rgba(37,99,235,0.35)] -translate-y-0.5 bg-white"
            : "border-[#A78BFA]/55 shadow-[0_10px_30px_-12px_rgba(167,139,250,0.4)] -translate-y-0.5 bg-white"
          : "border-[#E5E7EB] hover:-translate-y-0.5"
      }`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? active
            ? "translateY(-2px)"
            : "translateY(0)"
          : "translateY(12px)",
        transitionProperty: "opacity, transform, border-color, box-shadow, background-color",
        transitionDuration: "500ms",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
          isBlue
            ? "bg-[#EFF4FF] border border-[#2563EB]/15"
            : "bg-[#F3EEFF] border border-[#A78BFA]/20"
        } ${active ? (isBlue ? "shadow-[0_0_18px_-2px_rgba(37,99,235,0.55)]" : "shadow-[0_0_18px_-2px_rgba(167,139,250,0.6)]") : ""}`}
      >
        <Icon
          className={`w-5 h-5 ${isBlue ? "text-[#2563EB]" : "text-[#7C5DE8]"}`}
          strokeWidth={2}
        />
      </div>
      <div className="min-w-0">
        <div className="text-[15px] font-display font-semibold text-[#020617] leading-tight">
          {title}
        </div>
        <div className="text-[13px] text-[#475569] mt-0.5 leading-snug">{sub}</div>
      </div>
    </div>
  );
};

/* ---------- VS ---------- */
const VsCircle = ({ activeGap }: { activeGap: string | null }) => (
  <div className="relative flex flex-col items-center justify-center">
    <div
      className={`w-16 h-16 rounded-full bg-white border flex items-center justify-center font-display font-bold text-[15px] text-[#020617] transition-all duration-300 ${
        activeGap
          ? "border-transparent shadow-[0_0_30px_-2px_rgba(167,139,250,0.55)] [background:linear-gradient(white,white)_padding-box,linear-gradient(135deg,#2563EB,#A78BFA)_border-box] border-2"
          : "border-[#E5E7EB] shadow-sm"
      }`}
    >
      VS
    </div>
    <div
      className={`mt-3 text-[12px] font-display font-semibold tracking-wide transition-all duration-300 ${
        activeGap ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
      }`}
      style={{
        backgroundImage: "linear-gradient(90deg,#2563EB,#A78BFA)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {activeGap ?? "—"}
    </div>
  </div>
);

/* ---------- Card shell ---------- */
const CardShell = ({
  children,
  emphasized,
  glowColor,
  visible,
  delay = 0,
}: {
  children: React.ReactNode;
  emphasized: boolean;
  glowColor: "blue" | "lilac";
  visible: boolean;
  delay?: number;
}) => (
  <div
    className={`relative rounded-[28px] border bg-white/82 backdrop-blur-sm p-6 md:p-7 transition-all duration-500 ${
      emphasized
        ? glowColor === "blue"
          ? "border-[#2563EB]/40 shadow-[0_30px_70px_-30px_rgba(37,99,235,0.35)] -translate-y-1"
          : "border-[#A78BFA]/40 shadow-[0_30px_70px_-30px_rgba(167,139,250,0.4)] -translate-y-1"
        : "border-[#E5E7EB] shadow-[0_20px_50px_-30px_rgba(15,23,42,0.18)]"
    }`}
    style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transitionProperty: "opacity, transform, border-color, box-shadow",
      transitionDelay: `${delay}ms`,
    }}
  >
    {children}
  </div>
);

const Pill = ({ children, variant }: { children: React.ReactNode; variant: "blue" | "lilac" }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-[10.5px] font-display font-bold tracking-[0.12em] text-white ${
      variant === "blue"
        ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6]"
        : "bg-gradient-to-r from-[#A78BFA] to-[#7C5DE8]"
    } shadow-[0_8px_20px_-8px_rgba(99,102,241,0.5)]`}
  >
    {children}
  </span>
);

/* ---------- Background waves ---------- */
const Waves = () => (
  <svg
    aria-hidden
    className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.5]"
    viewBox="0 0 1440 900"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id="pwave" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    {Array.from({ length: 9 }).map((_, i) => (
      <path
        key={`l-${i}`}
        d={`M -50 ${120 + i * 22} C 200 ${80 + i * 18}, 360 ${260 + i * 14}, 560 ${200 + i * 18}`}
        stroke="url(#pwave)"
        strokeWidth="1"
        fill="none"
      />
    ))}
    {Array.from({ length: 9 }).map((_, i) => (
      <path
        key={`r-${i}`}
        d={`M 1490 ${680 + i * 22} C 1240 ${720 + i * 18}, 1080 ${540 + i * 14}, 880 ${600 + i * 18}`}
        stroke="url(#pwave)"
        strokeWidth="1"
        fill="none"
      />
    ))}
  </svg>
);

/* ---------- Gradient text helper ---------- */
const GradientSpan = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      backgroundImage: "linear-gradient(90deg,#2563EB,#A78BFA)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    }}
    className="font-semibold"
  >
    {children}
  </span>
);

/* ---------- Mobile compare carousel ---------- */
const CompareCarousel = () => {
  const [idx, setIdx] = useState(0);
  const pair = PAIRS[idx];
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-display font-bold tracking-[0.14em] text-[#475569]">
          COMPARE · {idx + 1}/{PAIRS.length}
        </span>
        <div className="flex gap-1.5">
          <button
            aria-label="Previous"
            onClick={() => setIdx((i) => (i - 1 + PAIRS.length) % PAIRS.length)}
            className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#475569] hover:text-[#020617] hover:border-[#A78BFA]/50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            aria-label="Next"
            onClick={() => setIdx((i) => (i + 1) % PAIRS.length)}
            className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#475569] hover:text-[#020617] hover:border-[#A78BFA]/50 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.2)]">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9.5px] font-display font-bold tracking-[0.12em] text-[#2563EB] mb-1.5">
              CAMPAIGNS NEED
            </div>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EFF4FF] border border-[#2563EB]/15 flex items-center justify-center shrink-0">
                <pair.campaign.Icon className="w-4 h-4 text-[#2563EB]" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[13px] font-display font-semibold text-[#020617] leading-tight">
                  {pair.campaign.title}
                </div>
                <div className="text-[11px] text-[#475569] mt-0.5 leading-snug">
                  {pair.campaign.sub}
                </div>
              </div>
            </div>
          </div>
          <div className="relative pl-3 border-l border-dashed border-[#E5E7EB]">
            <div className="text-[9.5px] font-display font-bold tracking-[0.12em] text-[#7C5DE8] mb-1.5">
              AGENCIES DELIVER
            </div>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F3EEFF] border border-[#A78BFA]/20 flex items-center justify-center shrink-0">
                <pair.agency.Icon className="w-4 h-4 text-[#7C5DE8]" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[13px] font-display font-semibold text-[#020617] leading-tight">
                  {pair.agency.title}
                </div>
                <div className="text-[11px] text-[#475569] mt-0.5 leading-snug">
                  {pair.agency.sub}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#E5E7EB] text-[12.5px] text-[#020617]">
          <GradientSpan>{pair.gap}:</GradientSpan>{" "}
          <span className="text-[#475569]">{pair.consequence}</span>
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {PAIRS.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to ${i + 1}`}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-6 bg-gradient-to-r from-[#2563EB] to-[#A78BFA]" : "w-1.5 bg-[#E5E7EB]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ---------- Main ---------- */
export const ProblemSection = () => {
  const [activePair, setActivePair] = useState<string | null>(null);
  const [emphasis, setEmphasis] = useState<"campaign" | "agency" | null>(null);
  const [mobileTab, setMobileTab] = useState<"campaign" | "agency">("campaign");
  const { ref: headRef, visible: headVis } = useInView<HTMLDivElement>(0.2);
  const { ref: cardsRef, visible: cardsVis } = useInView<HTMLDivElement>(0.12);
  const { ref: calloutRef, visible: calloutVis } = useInView<HTMLDivElement>(0.2);

  const activeGap = PAIRS.find((p) => p.id === activePair)?.gap ?? null;

  return (
    <section
      id="problem"
      className="relative bg-[#F8FAFC] text-[#020617] py-20 md:py-28 px-5 md:px-8 overflow-hidden"
    >
      <Waves />

      <div className="relative max-w-[1240px] mx-auto">
        {/* Header */}
        <div
          ref={headRef}
          className="text-center max-w-3xl mx-auto"
          style={{
            opacity: headVis ? 1 : 0,
            transform: headVis ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 700ms ease, transform 700ms ease",
          }}
        >
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#EEF0FF] border border-[#A78BFA]/25 text-[#4F46E5] text-[10.5px] font-display font-bold tracking-[0.16em]">
            {COPY.eyebrow}
          </span>
          <h2 className="mt-5 font-display font-bold tracking-tight text-[#020617] leading-[1.05]"
              style={{ fontSize: "clamp(36px, 6vw, 60px)" }}>
            {COPY.headlineA}
            <br />
            <GradientSpan>{COPY.headlineB}</GradientSpan>
          </h2>
          <p className="mt-5 text-[#475569] text-[16px] md:text-[17px] leading-relaxed max-w-[680px] mx-auto">
            {COPY.sub}
          </p>
        </div>

        {/* ===== Desktop / Tablet ===== */}
        <div className="hidden md:block mt-12">
          {/* Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 rounded-full bg-white border border-[#E5E7EB] shadow-sm">
              {([
                { k: "campaign", label: "Campaign Reality" },
                { k: "agency", label: "Agency Bottleneck" },
              ] as const).map((t) => {
                const on = emphasis === t.k;
                return (
                  <button
                    key={t.k}
                    onClick={() => setEmphasis(on ? null : t.k)}
                    className={`px-4 py-1.5 rounded-full text-[12.5px] font-display font-semibold transition ${
                      on
                        ? t.k === "campaign"
                          ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow"
                          : "bg-gradient-to-r from-[#A78BFA] to-[#7C5DE8] text-white shadow"
                        : "text-[#475569] hover:text-[#020617]"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            ref={cardsRef}
            className="grid grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-stretch"
          >
            {/* Left card */}
            <CardShell
              emphasized={emphasis === "campaign" || activePair !== null}
              glowColor="blue"
              visible={cardsVis}
              delay={100}
            >
              <Pill variant="blue">{COPY.left.pill}</Pill>
              <h3 className="mt-4 font-display font-bold text-[#020617] text-[22px] md:text-[24px] leading-tight">
                {COPY.left.title}
              </h3>
              <p className="mt-1.5 text-[#475569] text-[14px] leading-snug">{COPY.left.desc}</p>
              <div className="mt-5 space-y-2.5">
                {PAIRS.map((p, i) => (
                  <Row
                    key={p.id}
                    Icon={p.campaign.Icon}
                    title={p.campaign.title}
                    sub={p.campaign.sub}
                    side="blue"
                    active={activePair === p.id}
                    delay={200 + i * 90}
                    visible={cardsVis}
                    onEnter={() => setActivePair(p.id)}
                    onLeave={() => setActivePair(null)}
                  />
                ))}
              </div>
            </CardShell>

            {/* VS */}
            <div className="flex items-center justify-center px-1">
              <VsCircle activeGap={activeGap} />
            </div>

            {/* Right card */}
            <CardShell
              emphasized={emphasis === "agency" || activePair !== null}
              glowColor="lilac"
              visible={cardsVis}
              delay={180}
            >
              <Pill variant="lilac">{COPY.right.pill}</Pill>
              <h3 className="mt-4 font-display font-bold text-[#020617] text-[22px] md:text-[24px] leading-tight">
                {COPY.right.title}
              </h3>
              <p className="mt-1.5 text-[#475569] text-[14px] leading-snug">{COPY.right.desc}</p>
              <div className="mt-5 space-y-2.5">
                {PAIRS.map((p, i) => (
                  <Row
                    key={p.id}
                    Icon={p.agency.Icon}
                    title={p.agency.title}
                    sub={p.agency.sub}
                    side="lilac"
                    active={activePair === p.id}
                    delay={260 + i * 90}
                    visible={cardsVis}
                    onEnter={() => setActivePair(p.id)}
                    onLeave={() => setActivePair(null)}
                  />
                ))}
              </div>
            </CardShell>
          </div>
        </div>

        {/* ===== Mobile ===== */}
        <div className="md:hidden mt-10">
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Compare campaigns and agencies"
            className="inline-flex w-full p-1 rounded-full bg-white border border-[#E5E7EB] shadow-sm"
          >
            {([
              { k: "campaign", label: "Campaigns need", variant: "blue" as const },
              { k: "agency", label: "Agencies deliver", variant: "lilac" as const },
            ] as const).map((t) => {
              const on = mobileTab === t.k;
              return (
                <button
                  key={t.k}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setMobileTab(t.k)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                      setMobileTab(mobileTab === "campaign" ? "agency" : "campaign");
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-full text-[13px] font-display font-semibold transition ${
                    on
                      ? t.variant === "blue"
                        ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white"
                        : "bg-gradient-to-r from-[#A78BFA] to-[#7C5DE8] text-white"
                      : "text-[#475569]"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Active card */}
          {mobileTab === "campaign" ? (
            <div className="mt-5 rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.2)]">
              <Pill variant="blue">{COPY.left.pill}</Pill>
              <h3 className="mt-3 font-display font-bold text-[#020617] text-[20px] leading-tight">
                {COPY.left.title}
              </h3>
              <p className="mt-1 text-[#475569] text-[13.5px] leading-snug">{COPY.left.desc}</p>
              <div className="mt-4 space-y-2">
                {PAIRS.map((p) => (
                  <Row
                    key={p.id}
                    Icon={p.campaign.Icon}
                    title={p.campaign.title}
                    sub={p.campaign.sub}
                    side="blue"
                    active={false}
                    delay={0}
                    visible
                    onEnter={() => {}}
                    onLeave={() => {}}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.2)]">
              <Pill variant="lilac">{COPY.right.pill}</Pill>
              <h3 className="mt-3 font-display font-bold text-[#020617] text-[20px] leading-tight">
                {COPY.right.title}
              </h3>
              <p className="mt-1 text-[#475569] text-[13.5px] leading-snug">{COPY.right.desc}</p>
              <div className="mt-4 space-y-2">
                {PAIRS.map((p) => (
                  <Row
                    key={p.id}
                    Icon={p.agency.Icon}
                    title={p.agency.title}
                    sub={p.agency.sub}
                    side="lilac"
                    active={false}
                    delay={0}
                    visible
                    onEnter={() => {}}
                    onLeave={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          <CompareCarousel />
        </div>

        {/* Callout */}
        <div
          ref={calloutRef}
          className="mt-10 md:mt-14"
          style={{
            opacity: calloutVis ? 1 : 0,
            transform: calloutVis ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 700ms ease 200ms, transform 700ms ease 200ms",
          }}
        >
          <div className="relative rounded-[24px] border border-[#A78BFA]/30 bg-gradient-to-br from-[#F5F3FF] to-white p-5 md:p-6 flex items-start gap-4 shadow-[0_20px_50px_-30px_rgba(167,139,250,0.5)]">
            <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-white border border-[#A78BFA]/30 flex items-center justify-center shadow-[0_0_24px_-4px_rgba(167,139,250,0.55)]">
              <AlertTriangle className="w-6 h-6 text-[#7C5DE8]" strokeWidth={2} />
            </div>
            <p className="text-[15px] md:text-[18px] leading-snug text-[#020617]">
              <GradientSpan>The result:</GradientSpan>{" "}
              <span className="hidden md:inline">
                Brands pay more for <GradientSpan>slower decisions</GradientSpan>, while the{" "}
                <GradientSpan>window to act</GradientSpan> on{" "}
                <GradientSpan>campaign learnings closes</GradientSpan>.
              </span>
              <span className="md:hidden">
                Brands pay more for <GradientSpan>slower decisions</GradientSpan> while{" "}
                <GradientSpan>campaign learnings expire</GradientSpan>.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
