import { Section } from "./Section";

const stats = [
  { value: "3×", label: "CTR improvement" },
  { value: "60%", label: "Faster creative cycles" },
  { value: "↓40%", label: "Testing waste reduced" },
];

export const SocialProofSection = () => (
  <Section className="px-6 py-16">
    <div className="max-w-4xl mx-auto">
      <div className="grid sm:grid-cols-3 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.label} className="p-6 rounded-2xl border border-border bg-card">
            <span className="font-display font-extrabold text-4xl bg-gradient-to-r from-primary to-[hsl(260_70%_58%)] bg-clip-text text-transparent">
              {s.value}
            </span>
            <p className="mt-2 text-sm text-muted-foreground font-body">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </Section>
);
