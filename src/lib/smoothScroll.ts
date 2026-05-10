// Premium, eased smooth-scroll to an element. Falls back gracefully when
// reduced motion is preferred.
export function smoothScrollTo(
  target: string | HTMLElement,
  { duration = 1100, offset = 0 }: { duration?: number; offset?: number } = {},
) {
  const el =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : target;
  if (!el) return;

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const destination =
    el.getBoundingClientRect().top + window.scrollY + offset;

  if (reduce) {
    window.scrollTo({ top: destination, behavior: "auto" });
    return;
  }

  const start = window.scrollY;
  const distance = destination - start;
  const startTime = performance.now();

  // easeInOutCubic — calm, premium feel
  const ease = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const step = (now: number) => {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    window.scrollTo(0, start + distance * ease(t));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
