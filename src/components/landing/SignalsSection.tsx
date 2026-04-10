import { Section } from "./Section";

const signals = [
  { label: "Hook Strength", value: 87, color: "bg-primary" },
  { label: "Product Clarity", value: 72, color: "bg-[hsl(260_70%_58%)]" },
  { label: "CTA Salience", value: 94, color: "bg-accent" },
  { label: "Visual Hierarchy", value: 68, color: "bg-warning" },
  { label: "Copy Persuasion", value: 81, color: "bg-primary" },
];

export const SignalsSection = () => (
  <Section id="signals" className="px-6 py-16">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-xs font-mono text-primary/60 tracking-wider uppercase mb-3">Performance Signals</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
          Creatives translated into measurable signals
        </h2>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto font-body">
          Every ad is scored across dimensions tied to real performance. These signals evolve as your campaigns run.
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-5">
        {signals.map((s) => (
          <div key={s.label} className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-body w-36 text-right">{s.label}</span>
            <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${s.color} transition-all duration-1000 ease-out`}
                style={{ width: `${s.value}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground w-10">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  </Section>
);
