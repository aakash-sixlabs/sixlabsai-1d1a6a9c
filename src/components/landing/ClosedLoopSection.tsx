import { Section } from "./Section";
import { useInView } from "./useInView";

const loopSteps = ["Generate", "Launch", "Learn", "Improve"];

export const ClosedLoopSection = () => {
  const { ref, visible } = useInView(0.15);
  return (
    <Section id="loop" className="px-6 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs font-mono text-primary/60 tracking-wider uppercase mb-3">Closed Loop Intelligence</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
          A system that gets smarter with every ad
        </h2>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto font-body">
          Creative is no longer guesswork. It's a compounding system.
        </p>

        {/* Loop diagram */}
        <div ref={ref} className="mt-14 flex items-center justify-center">
          <div className="relative w-72 h-72 md:w-80 md:h-80">
            {/* Circular track */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
              <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(220 80% 52% / 0.1)" strokeWidth="2" />
              {/* Animated arc */}
              <circle
                cx="100" cy="100" r="80"
                fill="none"
                stroke="hsl(220 80% 52% / 0.5)"
                strokeWidth="2.5"
                strokeDasharray="502"
                strokeDashoffset={visible ? "0" : "502"}
                strokeLinecap="round"
                className="transition-all duration-[2s] ease-out"
                style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
              />
            </svg>

            {/* Step labels at cardinal points */}
            {loopSteps.map((step, i) => {
              const angle = (i * 90 - 90) * (Math.PI / 180);
              const x = 50 + 42 * Math.cos(angle);
              const y = 50 + 42 * Math.sin(angle);
              return (
                <div
                  key={step}
                  className={`absolute flex flex-col items-center gap-1 transition-all duration-700 delay-${i * 200} ${visible ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                  style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-xs font-display font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <span className="text-xs font-display font-semibold text-foreground mt-1">{step}</span>
                </div>
              );
            })}

            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-2 h-2 rounded-full bg-accent mx-auto mb-2 animate-pulse" />
                <span className="text-[11px] font-mono text-muted-foreground">Always<br />learning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bullets */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-left">
          {[
            { title: "Auto-ingested", desc: "Performance data flows back without lifting a finger." },
            { title: "Continuously retrained", desc: "The model learns from every campaign you run." },
            { title: "Compounds over time", desc: "Creative quality improves with every iteration." },
          ].map((b) => (
            <div key={b.title} className="p-4 rounded-xl border border-border bg-card">
              <h4 className="font-display font-semibold text-sm text-foreground mb-1">{b.title}</h4>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};
