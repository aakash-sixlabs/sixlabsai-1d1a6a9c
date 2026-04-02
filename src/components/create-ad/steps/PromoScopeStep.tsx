import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Globe, Package } from "lucide-react";

export type PromoScope = "brand-wide" | "product-specific";

interface PromoScopeStepProps {
  selected: PromoScope | null;
  onSelect: (scope: PromoScope) => void;
  onNext: () => void;
  onBack: () => void;
}

const OPTIONS: { value: PromoScope; label: string; description: string; icon: React.ElementType; example: string }[] = [
  {
    value: "brand-wide",
    label: "Brand-wide / Sitewide",
    description: "A promotion that applies across your store",
    icon: Globe,
    example: 'e.g. "40% off sitewide this weekend"',
  },
  {
    value: "product-specific",
    label: "Specific Product",
    description: "A promotion for a particular product or SKU",
    icon: Package,
    example: 'e.g. "40% off XYZ running shoes"',
  },
];

export const PromoScopeStep = ({ selected, onSelect, onNext, onBack }: PromoScopeStepProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">What's the promotion for?</h2>
      <p className="text-muted-foreground mb-8">
        Is this a store-wide offer or tied to a specific product?
      </p>

      <div className="space-y-3">
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          const isSelected = selected === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onSelect(o.value)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 group ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 p-2 rounded-md ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{o.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{o.description}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 italic">{o.example}</p>
                </div>
                {isSelected && (
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={!selected} className="gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
