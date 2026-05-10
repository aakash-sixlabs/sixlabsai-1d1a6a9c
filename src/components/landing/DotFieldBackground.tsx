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
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const interactive = !reduceMotion && !isTouch;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const SPACING = 12;
    const DOT_RADIUS = 1.1;
    const REPEL_RADIUS = 150;
    const REPEL_RADIUS_SQ = REPEL_RADIUS * REPEL_RADIUS;
    const MAX_REPEL = 12;
    const EASE = 0.12; // smoothing toward target offset

    let cols = 0;
    let rows = 0;

    // Per-dot current offset from base position (smoothed)
    let offsets: Float32Array = new Float32Array(0); // [x0,y0,x1,y1,...]

    // Mouse position in CSS pixels relative to canvas; -9999 = inactive
    const mouse = { x: -9999, y: -9999, active: false };

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
      offsets = new Float32Array(cols * rows * 2);
    };

    const render = (t: number) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      const time = reduceMotion ? 0 : t * 0.0006;
      const mx = mouse.x;
      const my = mouse.y;
      const mouseActive = interactive && mouse.active;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * SPACING;
          const baseY = j * SPACING;

          const wave =
            Math.sin(i * 0.18 + time * 1.6) *
              Math.cos(j * 0.16 - time * 1.2) +
            Math.sin((i + j) * 0.09 + time * 0.9) +
            Math.cos((i - j) * 0.11 - time * 0.7);

          const v = (wave + 3) / 6;
          if (v < 0.32) continue;

          const idx = (i * rows + j) * 2;

          // Compute target repel offset
          let targetX = 0;
          let targetY = 0;
          if (mouseActive) {
            const dx = baseX - mx;
            const dy = baseY - my;
            const distSq = dx * dx + dy * dy;
            if (distSq < REPEL_RADIUS_SQ && distSq > 0.0001) {
              const dist = Math.sqrt(distSq);
              const force = (1 - dist / REPEL_RADIUS) ** 2;
              const inv = 1 / dist;
              targetX = dx * inv * force * MAX_REPEL;
              targetY = dy * inv * force * MAX_REPEL;
            }
          }

          // Smooth toward target (eases back to 0 when no force)
          const ox = offsets[idx] + (targetX - offsets[idx]) * EASE;
          const oy = offsets[idx + 1] + (targetY - offsets[idx + 1]) * EASE;
          offsets[idx] = ox;
          offsets[idx + 1] = oy;

          const alpha = 0.06 + (v - 0.32) * 0.32;
          ctx.fillStyle = `rgba(15, 23, 42, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(baseX + ox, baseY + oy, DOT_RADIUS, 0, Math.PI * 2);
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

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    if (interactive) {
      const parent = canvas.parentElement ?? canvas;
      parent.addEventListener("mousemove", onMouseMove);
      parent.addEventListener("mouseleave", onMouseLeave);
      // Cleanup ref
      (canvas as any).__cleanupMouse = () => {
        parent.removeEventListener("mousemove", onMouseMove);
        parent.removeEventListener("mouseleave", onMouseLeave);
      };
    }

    if (reduceMotion) {
      render(0);
    } else {
      rafRef.current = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if ((canvas as any).__cleanupMouse) (canvas as any).__cleanupMouse();
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
