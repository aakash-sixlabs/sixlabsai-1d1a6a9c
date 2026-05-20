/**
 * Decorative wave + ambient glow background for the dark hero.
 * Mirrors the topographic / line-art waves on left & right of the reference.
 */
export const BrandWaveBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    {/* Ambient radial glows */}
    <div
      className="absolute -top-40 left-1/2 -translate-x-1/2 w-[80rem] h-[40rem] rounded-full opacity-40 blur-3xl"
      style={{
        background:
          "radial-gradient(closest-side, hsl(var(--signal) / 0.45), transparent 70%)",
      }}
    />
    <div
      className="absolute top-1/2 -left-40 w-[36rem] h-[36rem] rounded-full opacity-30 blur-3xl"
      style={{
        background:
          "radial-gradient(closest-side, hsl(var(--lilac) / 0.55), transparent 70%)",
      }}
    />
    <div
      className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full opacity-30 blur-3xl"
      style={{
        background:
          "radial-gradient(closest-side, hsl(var(--lilac) / 0.5), transparent 70%)",
      }}
    />

    {/* Topographic wave lines — left */}
    <svg
      className="absolute left-0 top-0 h-full w-[40%] opacity-60"
      viewBox="0 0 600 900"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id="waveLeft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--signal))" stopOpacity="0.55" />
          <stop offset="100%" stopColor="hsl(var(--signal))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 28 }).map((_, i) => (
        <path
          key={i}
          d={`M -50 ${120 + i * 26} Q 150 ${60 + i * 26}, 350 ${180 + i * 26} T 700 ${140 + i * 26}`}
          stroke="url(#waveLeft)"
          strokeWidth="1"
        />
      ))}
    </svg>

    {/* Topographic wave lines — right */}
    <svg
      className="absolute right-0 top-0 h-full w-[40%] opacity-60"
      viewBox="0 0 600 900"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id="waveRight" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="hsl(var(--lilac))" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(var(--lilac))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 28 }).map((_, i) => (
        <path
          key={i}
          d={`M 650 ${120 + i * 26} Q 450 ${60 + i * 26}, 250 ${180 + i * 26} T -100 ${140 + i * 26}`}
          stroke="url(#waveRight)"
          strokeWidth="1"
        />
      ))}
    </svg>
  </div>
);

export default BrandWaveBackground;
