import { useEffect, useRef, useState } from "react";

const METRICS = [
  { value: 30, suffix: "%", prefix: "", label: "reduction in customer acquisition cost" },
  { value: 11, suffix: "x", prefix: "", label: "more creative throughput vs. the average agency" },
  { value: 85, suffix: "%", prefix: "", label: "time saved so brands can focus on what they do best" },
] as const;

const HEADLINE = "Performance proof, not promises.";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function useCountUp(target: number, play: boolean, duration = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!play) return;
    if (prefersReducedMotion()) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setN(Math.round(target * ease(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, play, duration]);
  return n;
}

const MetricCard = ({
  prefix,
  value,
  suffix,
  label,
  play,
}: {
  prefix: string;
  value: number;
  suffix: string;
  label: string;
  play: boolean;
}) => {
  const n = useCountUp(value, play);
  return (
    <div
      className="group relative flex-shrink-0 md:flex-1 w-[260px] md:w-auto rounded-[20px] bg-white border border-[rgba(15,23,42,0.08)] px-6 md:px-10 py-7 md:py-9 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[hsl(var(--signal)/0.45)] hover:shadow-[0_10px_30px_-12px_hsl(var(--signal)/0.35)] snap-start"
    >
      <div className="font-display font-bold tracking-tight text-foreground text-[44px] md:text-[64px] leading-none">
        {prefix}
        <span className="tabular-nums">{n}</span>
        {suffix}
      </div>
      <p className="mt-3 md:mt-4 text-[15px] md:text-[19px] leading-snug text-muted-foreground font-body">
        {label}
      </p>
      <span className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--lilac)/0.6)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
};

export const ProofStrip = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPlay(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-label="Performance proof"
      className="bg-[#F8FAFC] px-6 py-12 md:py-16"
    >
      <div className="mx-auto max-w-[1240px]">
        <h2 className="text-center font-display font-semibold tracking-tight text-foreground text-[26px] md:text-[36px] leading-tight">
          {HEADLINE}
        </h2>

        <div className="mt-8 md:mt-10 -mx-6 md:mx-0 px-6 md:px-0 flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none scrollbar-hide">
          {METRICS.map((m) => (
            <MetricCard key={m.label} {...m} play={play} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProofStrip;
