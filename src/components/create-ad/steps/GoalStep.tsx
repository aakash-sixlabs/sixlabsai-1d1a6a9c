import { CreativeGoal } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { ArrowRight, Tag, Package, Rocket, Repeat, Target } from "lucide-react";

const GOALS: { value: CreativeGoal; label: string; description: string; icon: React.ElementType; example: string }[] = [
  {
    value: "brand-promo",
    label: "Brand Promotion",
    description: "Run a sitewide or brand-level promotion",
    icon: Tag,
    example: 'e.g. "40% off sitewide this weekend"',
  },
  {
    value: "product-promo",
    label: "Product Promotion",
    description: "Promote a specific product with a deal",
    icon: Package,
    example: 'e.g. "40% off XYZ running shoes"',
  },
  {
    value: "new-launch",
    label: "New Product Launch",
    description: "Announce and drive awareness for a new product",
    icon: Rocket,
    example: 'e.g. "Introducing our new hydration serum"',
  },
  {
    value: "evergreen",
    label: "Evergreen Creative",
    description: "Always-on creative that represents your brand",
    icon: Repeat,
    example: 'e.g. "Shop our bestselling collection"',
  },
  {
    value: "retarget",
    label: "Retargeting Ad",
    description: "Re-engage visitors who viewed a product",
    icon: Target,
    example: 'e.g. "Still thinking about XYZ? It\'s selling fast"',
  },
];

interface GoalStepProps {
  selected: CreativeGoal | null;
  onSelect: (goal: CreativeGoal) => void;
  onNext: () => void;
}

export const GoalStep = ({ selected, onSelect, onNext }: GoalStepProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">What's the goal of this ad?</h2>
      <p className="text-muted-foreground mb-8">
        Choose the type of creative you'd like to generate. We'll tailor the output accordingly.
      </p>

      <div className="space-y-3">
        {GOALS.map((g) => {
          const Icon = g.icon;
          const isSelected = selected === g.value;
          return (
            <button
              key={g.value}
              onClick={() => onSelect(g.value)}
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
                  <p className="font-semibold text-foreground">{g.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{g.description}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 italic">{g.example}</p>
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

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={onNext} disabled={!selected} className="gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
