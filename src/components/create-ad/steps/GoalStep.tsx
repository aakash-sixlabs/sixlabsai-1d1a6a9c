import { CreativeGoal } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const SalePromoIllustration = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 120 90" fill="none" className="w-full h-full">
    {/* Burst shape */}
    <path d="M60 10L68 25L85 18L78 35L95 38L80 48L92 62L75 58L72 75L60 63L48 75L45 58L28 62L40 48L25 38L42 35L35 18L52 25Z" 
      fill={active ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))"} 
      stroke={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"} 
      strokeWidth="1.5" />
    {/* Percent symbol */}
    <circle cx="52" cy="38" r="5" fill={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.4)"} />
    <circle cx="68" cy="52" r="5" fill={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.4)"} />
    <line x1="70" y1="34" x2="50" y2="56" stroke={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.4)"} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const ProductHighlightIllustration = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 120 90" fill="none" className="w-full h-full">
    {/* Spotlight rays */}
    <path d="M60 5L45 25H75Z" fill={active ? "hsl(var(--primary) / 0.1)" : "hsl(var(--muted) / 0.5)"} />
    <path d="M60 5L30 30L40 25Z" fill={active ? "hsl(var(--primary) / 0.07)" : "hsl(var(--muted) / 0.3)"} />
    <path d="M60 5L90 30L80 25Z" fill={active ? "hsl(var(--primary) / 0.07)" : "hsl(var(--muted) / 0.3)"} />
    {/* Product card */}
    <rect x="35" y="22" width="50" height="58" rx="6" 
      fill={active ? "hsl(var(--primary) / 0.08)" : "hsl(var(--muted))"} 
      stroke={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"} 
      strokeWidth="1.5" />
    {/* Image placeholder */}
    <rect x="42" y="29" width="36" height="28" rx="3" fill={active ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted-foreground) / 0.1)"} />
    {/* Text lines */}
    <rect x="42" y="63" width="28" height="3" rx="1.5" fill={active ? "hsl(var(--primary) / 0.4)" : "hsl(var(--muted-foreground) / 0.2)"} />
    <rect x="42" y="70" width="18" height="3" rx="1.5" fill={active ? "hsl(var(--primary) / 0.25)" : "hsl(var(--muted-foreground) / 0.12)"} />
  </svg>
);

const NewArrivalIllustration = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 120 90" fill="none" className="w-full h-full">
    {/* Box */}
    <rect x="30" y="30" width="60" height="45" rx="4" 
      fill={active ? "hsl(var(--primary) / 0.08)" : "hsl(var(--muted))"} 
      stroke={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"} 
      strokeWidth="1.5" />
    {/* Box flaps */}
    <path d="M30 30L40 18H80L90 30" 
      fill={active ? "hsl(var(--primary) / 0.12)" : "hsl(var(--muted))"} 
      stroke={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"} 
      strokeWidth="1.5" />
    <line x1="60" y1="18" x2="60" y2="30" stroke={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"} strokeWidth="1.5" />
    {/* Star / sparkle coming out */}
    <path d="M60 12L62 8L64 12L68 10L64 14L66 18L62 15L60 18L58 15L54 18L56 14L52 10L56 12L58 8Z" 
      fill={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"} />
    {/* NEW badge */}
    <rect x="68" y="22" width="24" height="14" rx="3" fill={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)"} />
    <text x="80" y="32" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">NEW</text>
  </svg>
);

const BrandStoryIllustration = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 120 90" fill="none" className="w-full h-full">
    {/* Overlapping frames - collage style */}
    <rect x="22" y="18" width="38" height="30" rx="4" 
      fill={active ? "hsl(var(--primary) / 0.1)" : "hsl(var(--muted))"} 
      stroke={active ? "hsl(var(--primary) / 0.5)" : "hsl(var(--muted-foreground) / 0.2)"} 
      strokeWidth="1.5" transform="rotate(-5 41 33)" />
    <rect x="55" y="15" width="42" height="32" rx="4" 
      fill={active ? "hsl(var(--primary) / 0.08)" : "hsl(var(--muted))"} 
      stroke={active ? "hsl(var(--primary) / 0.4)" : "hsl(var(--muted-foreground) / 0.2)"} 
      strokeWidth="1.5" transform="rotate(3 76 31)" />
    <rect x="30" y="42" width="55" height="35" rx="4" 
      fill={active ? "hsl(var(--primary) / 0.12)" : "hsl(var(--muted))"} 
      stroke={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"} 
      strokeWidth="1.5" />
    {/* Heart icon in center frame */}
    <path d="M57.5 52C57.5 52 53 54 53 57.5C53 60 55 62 57.5 64C60 62 62 60 62 57.5C62 54 57.5 52 57.5 52Z" 
      fill={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"} />
  </svg>
);

const CategoryHighlightIllustration = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 120 90" fill="none" className="w-full h-full">
    {/* 2x2 grid of product thumbnails */}
    {[
      { x: 24, y: 14 },
      { x: 64, y: 14 },
      { x: 24, y: 50 },
      { x: 64, y: 50 },
    ].map((pos, i) => (
      <g key={i}>
        <rect x={pos.x} y={pos.y} width="32" height="28" rx="4"
          fill={active ? "hsl(var(--primary) / 0.08)" : "hsl(var(--muted))"}
          stroke={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"}
          strokeWidth="1.5" />
        <rect x={pos.x + 5} y={pos.y + 4} width="22" height="12" rx="2"
          fill={active ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted-foreground) / 0.1)"} />
        <rect x={pos.x + 5} y={pos.y + 20} width="16" height="2.5" rx="1.25"
          fill={active ? "hsl(var(--primary) / 0.3)" : "hsl(var(--muted-foreground) / 0.15)"} />
      </g>
    ))}
  </svg>
);

const GOALS: { value: CreativeGoal; label: string; description: string; Illustration: React.FC<{ active: boolean }> }[] = [
  { value: "sale-promo", label: "Sale / Promotion", description: "Discount or limited-time offer", Illustration: SalePromoIllustration },
  { value: "product-highlight", label: "Product Highlight", description: "Showcase a product's value", Illustration: ProductHighlightIllustration },
  { value: "new-arrival", label: "New Arrival", description: "Introduce a new product", Illustration: NewArrivalIllustration },
  { value: "brand-story", label: "Brand Story", description: "Tell your brand's story", Illustration: BrandStoryIllustration },
  { value: "category-highlight", label: "Category Highlight", description: "Spotlight a collection", Illustration: CategoryHighlightIllustration },
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {GOALS.map((g) => {
          const isSelected = selected === g.value;
          return (
            <button
              key={g.value}
              onClick={() => onSelect(g.value)}
              className={`relative text-left p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className="w-full aspect-[4/3] mb-3">
                <g.Illustration active={isSelected} />
              </div>
              <p className="font-semibold text-sm text-foreground text-center">{g.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 text-center">{g.description}</p>
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
