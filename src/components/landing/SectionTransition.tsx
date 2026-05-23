import { useEffect, useRef, useState } from "react";

/**
 * SectionTransition — modular visual divider between page sections.
 *
 * Drop between any two <section>s. Pick a variant that matches the
 * tonal jump between the previous and next section.
 *
 * Variants:
 *  - "dark-to-light"  Dark section above, light section below.
 *  - "light-to-dark"  Light section above, dark section below.
 *  - "light-to-light" Two light sections — adds a subtle brand hairline.
 *  - "dark-to-dark"   Two dark sections — adds a soft indigo glow line.
 *
 * Colors use the project brand palette (indigo #4F46E5 → violet #8B5CF6).
 * Dark surface assumed to be #050816 / bg-midnight.
 * Light surface assumed to be ~#F7F7FA.
 */

const INDIGO = "#4F46E5";
const VIOLET = "#8B5CF6";
const DARK = "#050816";
const LIGHT = "#F7F7FA";

type Variant =
  | "dark-to-light"
  | "light-to-dark"
  | "light-to-light"
  | "dark-to-dark";

interface SectionTransitionProps {
  variant: Variant;
  /** Height of the transition strip. Defaults are tuned per variant. */
  height?: number;
  /** Extra classes for the wrapper. */
  className?: string;
  /** Disable the scroll-triggered shimmer animation. */
  staticOnly?: boolean;
}

function useInViewport<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  variant,
  height,
  className = "",
  staticOnly = false,
}) => {
  const { ref, visible } = useInViewport<HTMLDivElement>(0.3);
  const h = height ?? defaultHeight(variant);

  const animate = !staticOnly && visible;

  return (
    <div
      ref={ref}
      aria-hidden
      className={`relative w-full overflow-hidden pointer-events-none ${className}`}
      style={{ height: h, background: backgroundFor(variant) }}
    >
      {/* Brand-gradient hairline + traveling shimmer */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[min(720px,72%)] h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${INDIGO}, ${VIOLET}, transparent)`,
          opacity: variant.includes("dark") ? 0.6 : 0.7,
        }}
      />
      {animate && (
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[2px] w-24 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${VIOLET}, transparent)`,
            filter: "blur(0.5px)",
            animation: "section-shimmer 3.6s ease-in-out infinite",
          }}
        />
      )}

      {/* Center pulse dot */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`,
          boxShadow: `0 0 18px ${VIOLET}AA`,
        }}
      />
      {animate && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{
            background: `${VIOLET}`,
            animation: "section-pulse 2.2s ease-out infinite",
          }}
        />
      )}

      {/* Soft halo behind the dot */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          width: h * 2.4,
          height: h * 2.4,
          background: `radial-gradient(circle, ${VIOLET}33, transparent 60%)`,
        }}
      />

      <style>{`
        @keyframes section-shimmer {
          0%   { transform: translate(-260%, -50%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translate(260%, -50%); opacity: 0; }
        }
        @keyframes section-pulse {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(4.5); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-section-transition] * { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

function defaultHeight(v: Variant) {
  switch (v) {
    case "dark-to-light":
    case "light-to-dark":
      return 140;
    case "light-to-light":
    case "dark-to-dark":
    default:
      return 96;
  }
}

function backgroundFor(v: Variant) {
  switch (v) {
    case "dark-to-light":
      return `linear-gradient(to bottom, ${DARK} 0%, ${DARK} 30%, ${LIGHT} 100%)`;
    case "light-to-dark":
      return `linear-gradient(to bottom, ${LIGHT} 0%, ${DARK} 70%, ${DARK} 100%)`;
    case "light-to-light":
      return LIGHT;
    case "dark-to-dark":
      return DARK;
  }
}

/* ---------------------------------------------------------------------------
 * SectionReveal — modular scroll-triggered fade/slide-in wrapper.
 * Pair with <SectionTransition /> for a polished scroll experience.
 * ------------------------------------------------------------------------- */

interface SectionRevealProps {
  children: React.ReactNode;
  /** Translate-Y distance in px before reveal. */
  offset?: number;
  /** Delay in ms. */
  delay?: number;
  /** Duration in ms. */
  duration?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const SectionReveal: React.FC<SectionRevealProps> = ({
  children,
  offset = 24,
  delay = 0,
  duration = 700,
  className = "",
  as: Tag = "div",
}) => {
  const { ref, visible } = useInViewport<HTMLDivElement>(0.12);
  const Component = Tag as any;
  return (
    <Component
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${offset}px)`,
        transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Component>
  );
};

export default SectionTransition;
