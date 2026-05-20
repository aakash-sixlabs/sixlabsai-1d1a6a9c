import {
  AlertTriangle,
  TrendingUp,
  Trophy,
  ChevronRight,
  PieChart,
  RefreshCw,
  Play,
} from "lucide-react";
import { useInView } from "./useInView";
import adFuel from "@/assets/ad-fuel.png";
import adClean from "@/assets/ad-clean.png";
import adFocus from "@/assets/ad-focus.png";
import hydrateAd from "@/assets/hydrate-ad.png";
import adCalm from "@/assets/ad-calm.png";
import adTrain from "@/assets/ad-train.png";

/* ---------- shared row primitives ---------- */

const Row = ({
  icon,
  title,
  meta,
  rightSlot,
}: {
  icon: React.ReactNode;
  title: string;
  meta?: string;
  rightSlot?: React.ReactNode;
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors px-3.5 py-3">
    <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[14px] font-display font-semibold text-white leading-tight truncate">
        {title}
      </div>
      {meta && (
        <div className="text-[12px] text-white/55 leading-tight mt-0.5 truncate">
          {meta}
        </div>
      )}
    </div>
    {rightSlot ?? <ChevronRight className="w-4 h-4 text-white/35" />}
  </div>
);

const StageCard = ({
  num,
  title,
  numColor,
  children,
  className = "",
}: {
  num: string;
  title: string;
  numColor: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative rounded-[22px] border border-white/10 bg-[hsl(229_55%_8%/0.85)] backdrop-blur-sm p-5 md:p-6 shadow-[0_30px_80px_-40px_rgba(37,99,235,0.45)] ${className}`}
  >
    <div className="text-center mb-4">
      <h3 className="font-display font-semibold text-[20px] md:text-[22px] tracking-tight">
        <span className={`mr-2 font-bold ${numColor}`}>{num}</span>
        <span className="text-white">{title}</span>
      </h3>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

/* ---------- 01 Detect ---------- */

const DetectCard = () => (
  <StageCard num="01" title="Detect" numColor="text-signal">
    <Row
      icon={<AlertTriangle className="w-4 h-4 text-lilac" strokeWidth={2.2} />}
      title="Fatigue detected"
      meta="CTR ↓ 28% in 3 days"
    />
    <Row
      icon={<TrendingUp className="w-4 h-4 text-signal" strokeWidth={2.2} />}
      title="CAC drift"
      meta="↑ 18% vs 7-day avg"
    />
    <Row
      icon={<Trophy className="w-4 h-4 text-lilac" strokeWidth={2.2} />}
      title="Winning hooks"
      meta="3 hooks outperforming"
    />
  </StageCard>
);

/* ---------- 02 Generate ---------- */

const Thumb = ({
  src,
  duration,
  alt,
}: {
  src: string;
  duration?: string;
  alt: string;
}) => (
  <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-white/5 border border-white/10">
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
      draggable={false}
    />
    {duration && (
      <>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center">
          <Play className="w-3 h-3 text-white fill-white" />
        </div>
        <div className="absolute bottom-1.5 right-1.5 text-[10px] text-white font-mono bg-black/55 backdrop-blur-sm px-1.5 rounded">
          {duration}
        </div>
      </>
    )}
  </div>
);

const GenerateCard = () => {
  const tabs = ["Dashboard", "Ads Library", "Top Performers", "Needs attention", "Reports"];
  return (
    <StageCard num="02" title="Generate" numColor="text-signal" className="md:col-span-2">
      {/* Tabs row */}
      <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <span className="shrink-0 text-[11px] font-display font-semibold px-2.5 py-1 rounded-md bg-signal text-white">
          {tabs[0]}
        </span>
        {tabs.slice(1).map((t) => (
          <span
            key={t}
            className="shrink-0 text-[11px] font-display text-white/55 px-2.5 py-1 rounded-md hover:text-white/80 transition-colors"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Two rows of 3 thumbnails */}
      <div className="grid grid-cols-3 gap-2">
        <Thumb src={hydrateAd} duration="0:06" alt="Hydration ad" />
        <Thumb src={adFocus} duration="0:07" alt="Focus ad" />
        <Thumb src={adTrain} duration="0:06" alt="Train ad" />
        <Thumb src={adFuel} alt="Bundle & save" />
        <Thumb src={adClean} alt="20% off" />
        <Thumb src={adCalm} alt="New flavor drop" />
      </div>
    </StageCard>
  );
};

/* ---------- 03 Deploy ---------- */

const Live = () => (
  <span className="flex items-center gap-1 text-[11px] font-display font-semibold text-emerald-400">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
    Live
  </span>
);

const PlatformIcon = ({ kind }: { kind: "meta" | "tiktok" | "google" | "youtube" | "pinterest" }) => {
  const common = "w-5 h-5";
  switch (kind) {
    case "meta":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none">
          <path
            d="M3 12c0-4 2-7 5-7 2.2 0 3.6 1.6 5 4 1.4-2.4 2.8-4 5-4 3 0 5 3 5 7s-2 7-5 7c-1.6 0-2.7-.8-4-3M3 12c0 4 2 7 5 7 2.2 0 3.6-1.6 5-4"
            stroke="#0a7cff"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="white">
          <path d="M19.6 7.8a5.4 5.4 0 0 1-4-1.8v8.6a5 5 0 1 1-5-5v2.4a2.6 2.6 0 1 0 2.6 2.6V2h2.6c.2 1.6 1 3 2.3 4 .6.4 1.4.7 2.2.8v2.4l-.7-.4Z" />
        </svg>
      );
    case "google":
      return (
        <svg viewBox="0 0 24 24" className={common}>
          <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" />
          <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1A6 6 0 0 1 6.3 14H3v2.6A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.3 14a6 6 0 0 1 0-3.9V7.5H3a10 10 0 0 0 0 9L6.3 14Z" />
          <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2A10 10 0 0 0 3 7.5l3.3 2.6A6 6 0 0 1 12 6Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className={common}>
          <rect x="2" y="5" width="20" height="14" rx="4" fill="#FF0000" />
          <path d="M10 9v6l5-3-5-3Z" fill="white" />
        </svg>
      );
    case "pinterest":
      return (
        <svg viewBox="0 0 24 24" className={common}>
          <circle cx="12" cy="12" r="10" fill="#E60023" />
          <path d="M11 7c2.5-.4 4.7 1 4.7 3.4 0 2.2-1.4 3.7-3.2 3.7-.9 0-1.7-.5-2-.5-.2 1-.3 1.5-.6 2.7-.2.9-.8 2-1.3 2.7-.1.1-.3 0-.3-.1-.1-.6-.2-1.7 0-2.5l1.2-5s-.3-.6-.3-1.4c0-1.3.8-2.3 1.7-2.3.8 0 1.2.6 1.2 1.3 0 .8-.5 2-.8 3.1-.2.9.5 1.6 1.4 1.6 1.7 0 2.8-2.1 2.8-4.6 0-1.9-1.3-3.3-3.6-3.3-2.6 0-4.3 2-4.3 4.1 0 .8.2 1.3.6 1.8.1.2.2.2.1.4 0 .1-.1.5-.2.6 0 .2-.2.3-.4.2-1-.4-1.5-1.6-1.5-2.9C5.2 9.5 7 7.4 11 7Z" fill="white" />
        </svg>
      );
  }
};

const DeployCard = () => (
  <StageCard num="03" title="Deploy" numColor="text-signal">
    <Row icon={<PlatformIcon kind="meta" />} title="Meta Ads" rightSlot={<Live />} />
    <Row icon={<PlatformIcon kind="tiktok" />} title="TikTok Ads" rightSlot={<Live />} />
    <Row icon={<PlatformIcon kind="google" />} title="Google Ads" rightSlot={<Live />} />
    <Row icon={<PlatformIcon kind="youtube" />} title="YouTube Ads" rightSlot={<Live />} />
    <Row icon={<PlatformIcon kind="pinterest" />} title="Pinterest Ads" rightSlot={<Live />} />
  </StageCard>
);

/* ---------- 04 Learn ---------- */

const LearnCard = () => (
  <StageCard num="04" title="Learn" numColor="text-lilac">
    <Row
      icon={
        <svg viewBox="0 0 24 24" className="w-4 h-4">
          <circle cx="12" cy="12" r="9" fill="none" stroke="hsl(var(--signal))" strokeWidth="2" />
          <path d="M12 3 A9 9 0 0 1 21 12 L12 12 Z" fill="hsl(var(--lilac))" opacity="0.9" />
        </svg>
      }
      title="Budget shift"
      meta="+24% to top performers"
    />
    <Row
      icon={<TrendingUp className="w-4 h-4 text-signal" strokeWidth={2.2} />}
      title="ROAS improving"
      meta="3.2x → 4.7x"
    />
    <Row
      icon={<RefreshCw className="w-4 h-4 text-lilac" strokeWidth={2.2} />}
      title="Learning loop"
      meta="Model updated 12 min ago"
    />
  </StageCard>
);

/* ---------- the section ---------- */

export const PipelineSection = () => {
  const { ref, visible } = useInView(0.05);
  return (
    <section
      ref={ref}
      id="pipeline"
      className={`relative px-4 md:px-8 pb-20 md:pb-32 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* ============= DESKTOP: 4-across ============= */}
        <div className="hidden lg:grid grid-cols-[1fr_1.6fr_1fr_1fr] gap-4 xl:gap-5 items-start">
          <DetectCard />
          <GenerateCard />
          <DeployCard />
          <LearnCard />
        </div>

        {/* Continuous learning loop badge (desktop) */}
        <div className="hidden lg:flex justify-center mt-10 relative">
          <svg
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-px"
            viewBox="0 0 1200 2"
            preserveAspectRatio="none"
            aria-hidden
          >
            <line
              x1="0"
              y1="1"
              x2="1200"
              y2="1"
              stroke="hsl(var(--lilac))"
              strokeOpacity="0.5"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              style={{ animation: "loopDash 1.4s linear infinite" }}
            />
          </svg>
          <div className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-[hsl(229_55%_8%)] pl-4 pr-5 py-2.5 shadow-[0_10px_40px_-10px_rgba(167,139,250,0.5)]">
            <span className="relative flex items-center justify-center w-5 h-5">
              <span className="absolute inset-0 rounded-full border border-lilac/60" />
              <span className="absolute inset-0 rounded-full border border-lilac/30 animate-ping" />
            </span>
            <span className="text-[13px] font-display font-medium text-white">Continuous learning loop</span>
          </div>
        </div>

        {/* ============= MOBILE: 2×2 with central loop ============= */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            <DetectCard />
            <GenerateCard />
            <LearnCard />
            <DeployCard />
          </div>
          <div className="flex justify-center mt-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[hsl(229_55%_8%)] pl-4 pr-5 py-2.5">
              <RefreshCw className="w-4 h-4 text-lilac" />
              <span className="text-[13px] font-display font-medium text-white">
                Continuous learning loop
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PipelineSection;
