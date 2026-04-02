import { CreativeGoal } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { ArrowRight, Tag, Sparkles, Rocket, Heart, LayoutGrid } from "lucide-react";

const GOALS: { value: CreativeGoal; label: string; description: string; icon: React.ElementType; example: string }[] = [
  {
    value: "sale-promo",
    label: "Sale / Promotion",
    description: "Run a sale, discount, or limited-time offer",
    icon: Tag,
    example: 'e.g. "40% off sitewide this weekend"',
  },
  {
    value: "product-highlight",
    label: "Product Highlight",
    description: "Showcase a product's value without a discount",
    icon: Sparkles,
    example: 'e.g. "Meet the shoe built for marathon day"',
  },
  {
    value: "new-arrival",
    label: "New Arrival",
    description: "Introduce a new product to your audience",
    icon: Rocket,
    example: 'e.g. "Just dropped: our lightweight summer jacket"',
  },
  {
    value: "brand-story",
    label: "Brand Story",
    description: "Always-on creative that tells your brand's story",
    icon: Heart,
    example: 'e.g. "Designed for athletes, by athletes"',
  },
  {
    value: "category-highlight",
    label: "Category Highlight",
    description: "Spotlight an entire product category or collection",
    icon: LayoutGrid,
    example: 'e.g. "Shop our bestselling skincare line"',
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
      <h2 className="text-2xl font-bold text-foreground mb-1">What kind of ad do you want to create?</h2>
      <p className="text-muted-foreground mb-8">
        Pick the creative type — we'll tailor the flow and output to match.
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
