import { useEffect, useRef, useState } from "react";
import { Section } from "./Section";
import { useInView } from "./useInView";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ---------- single rolling digit ---------- */
const Digit = ({
  value,
  delay,
  duration,
  play,
}: {
  value: number;
  delay: number;
  duration: number;
  play: boolean;
}) => {
  const [reduced] = useState(prefersReducedMotion);
  const offset = play ? -value * 100 : 0;
  // Start position: show 0 (top of strip). Animate to value.
  // Use a strip 0..9, then repeat 0..value to give a roll feel.
  const digits = Array.from({ length: 10 }, (_, i) => i);

  if (reduced) {
    return (
      <span className="inline-block tabular-nums" aria-hidden>
        {value}
      </span>
    );
  }

  return (
    <span
      className="relative inline-block overflow-hidden align-baseline tabular-nums"
      style={{ height: "1em", lineHeight: 1, width: "0.62em" }}
      aria-hidden
    >
      <span
        className="absolute left-0 top-0 flex flex-col"
        style={{
          transform: `translateY(${offset}%)`,
          transition: play
            ? `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`
            : "none",
        }}
      >
        {digits.map((d) => (
          <span key={d} style={{ height: "1em", lineHeight: 1 }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
};

const RollingNumber = ({
  digits,
  play,
  baseDelay,
}: {
  digits: string; // e.g. "40", "11", "262"
  play: boolean;
  baseDelay: number;
}) => {
  const arr = digits.split("").map((c) => parseInt(c, 10));
  const duration = 1500;
  return (
    <span className="inline-flex">
      {arr.map((d, i) => (
        <Digit
          key={i}
          value={d}
          delay={baseDelay + i * 90}
          duration={duration}
          play={play}
        />
      ))}
    </span>
  );
};

/* ---------- tile ---------- */
type Tile = {
  prefix?: string;
  digits: string;
  suffix?: string;
  label: string;
  delay: number;
};

const tiles: Tile[] = [
  { prefix: "~", digits: "40", suffix: "%", label: "Reduction in customer acquisition cost on Meta", delay: 0 },
  { digits: "11", suffix: "x", label: "Faster creative generation", delay: 200 },
  { digits: "262", suffix: "+", label: "On-brand creatives launched and tested", delay: 400 },
];

const MetricTile = ({ tile, play }: { tile: Tile; play: boolean }) => (
  <div className="flex-1 rounded-2xl bg-white border border-border/60 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] px-8 py-12 md:py-14 text-center">
    <div className="font-display font-bold tracking-tight text-foreground text-6xl md:text-7xl lg:text-[88px] leading-none">
      {tile.prefix && <span className="text-primary">{tile.prefix}</span>}
      <RollingNumber digits={tile.digits} play={play} baseDelay={tile.delay} />
      {tile.suffix && <span className="text-primary">{tile.suffix}</span>}
    </div>
    <p className="mt-6 text-sm md:text-base text-muted-foreground font-body max-w-[260px] mx-auto leading-relaxed">
      {tile.label}
    </p>
  </div>
);

export const PilotMetricsSection = () => {
  const { ref, visible } = useInView(0.25);
  const [play, setPlay] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    if (visible && !played.current) {
      played.current = true;
      // small delay so the strip mounts at 0 first, then animates
      requestAnimationFrame(() => requestAnimationFrame(() => setPlay(true)));
    }
  }, [visible]);

  return (
    <Section className="bg-[hsl(220_20%_98%)] px-6 py-24 md:py-32">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-[60px] leading-[1.05] tracking-tight text-foreground">
            Our pilots have shown:
          </h2>
        </div>

        <div className="mt-14 md:mt-20 flex flex-col md:flex-row gap-6 md:gap-8">
          {tiles.map((t, i) => (
            <MetricTile key={i} tile={t} play={play} />
          ))}
        </div>

        <p className="mt-10 text-center text-xs md:text-sm text-muted-foreground font-body">
          Early pilot results from Meta creative testing workflows.
        </p>
      </div>
    </Section>
  );
};

export default PilotMetricsSection;
