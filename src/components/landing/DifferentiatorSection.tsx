import { X, Check } from "lucide-react";
import { Section } from "./Section";

export const DifferentiatorSection = () => (
  <Section className="px-6 py-16">
    <div className="max-w-3xl mx-auto text-center">
      <p className="text-xs font-mono text-primary/60 tracking-wider uppercase mb-3">Why this is different</p>
      <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">Not another template tool</h2>

      <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
        {/* What we're NOT */}
        <div className="space-y-3">
          {["Templates & stock imagery", "Static AI image generation", "Manual A/B testing loops"].map((item) => (
            <div key={item} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/5 border border-destructive/10">
              <X className="w-4 h-4 text-destructive shrink-0" />
              <span className="text-sm text-muted-foreground font-body">{item}</span>
            </div>
          ))}
        </div>
        {/* What we ARE */}
        <div className="space-y-3">
          {["Learning system", "Performance-driven generation", "Self-improving creative engine"].map((item) => (
            <div key={item} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/5 border border-accent/15">
              <Check className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm text-foreground font-body font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Section>
);
