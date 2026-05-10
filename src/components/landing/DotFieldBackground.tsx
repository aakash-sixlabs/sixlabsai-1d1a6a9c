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

    type Dot = {
      x: number;
      y: number;
      baseAlpha: number;
      phase: number;
      speed: number;
      driftX: number;
      driftY: number;
    };
    let dots: Dot[] = [];

    const SPACING = 28; // grid spacing in CSS px

    const buildDots = () => {
      dots = [];
      const cols = Math.ceil(width / SPACING) + 2;
      const rows = Math.ceil(height / SPACING) + 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * SPACING;
          const y = j * SPACING;
          // density modulation via sin/cos noise
          const n =
            Math.sin(x * 0.012) * Math.cos(y * 0.014) +
            Math.sin((x + y) * 0.006);
          const density = (n + 2) / 4; // 0..1
          if (Math.random() > density * 0.85 + 0.05) continue;
          dots.push({
            x,
            y,
            baseAlpha: 0.08 + density * 0.17, // 0.08..0.25
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.6,
            driftX: 0,
            driftY: 0,
          });
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
    };

    const drawGrid = () => {
      ctx.strokeStyle = "rgba(15, 23, 42, 0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= width; x += SPACING * 2) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
      }
      for (let y = 0; y <= height; y += SPACING * 2) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
      }
      ctx.stroke();
    };

    const drawBackground = () => {
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(1, "#f6f7f9");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    };

    const render = (t: number) => {
      drawBackground();
      drawGrid();

      const time = t * 0.001;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const pulse = (Math.sin(time * d.speed + d.phase) + 1) / 2; // 0..1
        const alpha = d.baseAlpha * (0.55 + pulse * 0.7);
        const dx = reduceMotion ? 0 : Math.sin(time * 0.6 + d.phase) * 1.2;
        const dy = reduceMotion ? 0 : Math.cos(time * 0.5 + d.phase * 1.3) * 1.2;
        ctx.fillStyle = `rgba(15, 23, 42, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(d.x + dx, d.y + dy, 1.2, 0, Math.PI * 2);
        ctx.fill();
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
