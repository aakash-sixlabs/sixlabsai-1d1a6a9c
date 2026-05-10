import { useEffect, useRef } from "react";

interface DotFieldBackgroundProps {
  className?: string;
}

export const DotFieldBackground = ({ className = "" }: DotFieldBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const SPACING = 12; // tight halftone grid
    const DOT_RADIUS = 1.1;

    let cols = 0;
    let rows = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / SPACING) + 2;
      rows = Math.ceil(height / SPACING) + 2;
    };

    const render = (t: number) => {
      // background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      const time = reduceMotion ? 0 : t * 0.0006;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * SPACING;
          const y = j * SPACING;

          // Flowing wave field — multiple sine layers create drifting halftone density
          const wave =
            Math.sin(i * 0.18 + time * 1.6) *
              Math.cos(j * 0.16 - time * 1.2) +
            Math.sin((i + j) * 0.09 + time * 0.9) +
            Math.cos((i - j) * 0.11 - time * 0.7);

          // Normalize to 0..1
          const v = (wave + 3) / 6;

          // Threshold so we get sparse zones (halftone feel)
          if (v < 0.32) continue;

          const alpha = 0.06 + (v - 0.32) * 0.32; // 0.06 .. ~0.28
          ctx.fillStyle = `rgba(15, 23, 42, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!reduceMotion) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    if (reduceMotion) {
      render(0);
    } else {
      rafRef.current = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};

export default DotFieldBackground;
