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

  if (reduced) {
    return <span className="tabular-nums">{value}</span>;
  }

  const digits = Array.from({ length: 10 }, (_, i) => i);
  const offset = play ? -value * 100 : 0;

  return (
    <span
      className="relative inline-block overflow-hidden tabular-nums align-top"
      style={{ height: "1em", width: "0.6em", lineHeight: 1 }}
      aria-hidden
    >
      <span
        className="absolute left-0 top-0 right-0"
        style={{
          transform: `translateY(${offset}%)`,
          transition: play
            ? `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`
            : "none",
        }}
      >
        {digits.map((d) => (
          <span
            key={d}
            className="block text-center"
            style={{ height: "1em", lineHeight: 1 }}
          >
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
  digits: string;
  play: boolean;
  baseDelay: number;
}) => {
  const arr = digits.split("").map((c) => parseInt(c, 10));
  const duration = 1500;
  return (
    <span className="inline-flex items-baseline">
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
  <div className="flex-1 rounded-2xl bg-white border border-border/60 px-8 py-10 text-center shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
    <div className="font-display font-bold tracking-tight text-primary text-4xl md:text-5xl leading-none flex items-baseline justify-center">
      {tile.prefix && <span>{tile.prefix}</span>}
      <RollingNumber digits={tile.digits} play={play} baseDelay={tile.delay} />
      {tile.suffix && <span>{tile.suffix}</span>}
    </div>
    <p className="mt-4 text-sm text-muted-foreground font-body max-w-[260px] mx-auto leading-relaxed">
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
      requestAnimationFrame(() => requestAnimationFrame(() => setPlay(true)));
    }
  }, [visible]);

  return (
    <Section className="bg-white px-6 py-20 md:py-28">
      <div ref={ref} className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight tracking-tight text-foreground">
            Our pilots have shown
          </h2>
        </div>

        <div className="mt-10 md:mt-14 flex flex-col md:flex-row gap-5">
          {tiles.map((t, i) => (
            <MetricTile key={i} tile={t} play={play} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground font-body">
          Early pilot results from Meta creative testing workflows.
        </p>
      </div>
    </Section>
  );
};

export default PilotMetricsSection;
