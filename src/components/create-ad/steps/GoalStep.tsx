import { CreativeGoal } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

/* ─── Brand-agnostic creative silhouettes ─── */
/* Each SVG represents a wireframe of the actual ad output layout */

const SalePromoSilhouette = ({ active }: { active: boolean }) => {
  const fg = active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)";
  const bg = active ? "hsl(var(--primary) / 0.08)" : "hsl(var(--muted) / 0.6)";
  const bgMid = active ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))";
  return (
    <svg viewBox="0 0 180 220" fill="none" className="w-full h-full">
      {/* Full-bleed image area */}
      <rect x="0" y="0" width="180" height="220" rx="8" fill={bg} />
      {/* Dashed border frame like reference */}
      <rect x="10" y="10" width="160" height="200" rx="4" stroke={fg} strokeWidth="1.2" strokeDasharray="4 3" fill="none" />
      {/* Large "SALE" text block */}
      <rect x="28" y="36" width="60" height="48" rx="2" fill={fg} opacity="0.8" />
      <rect x="92" y="44" width="56" height="32" rx="2" fill={fg} opacity="0.5" />
      {/* Offer badge bar */}
      <rect x="36" y="100" width="108" height="22" rx="4" fill={bgMid} stroke={fg} strokeWidth="1" />
      <rect x="50" y="107" width="80" height="8" rx="2" fill={fg} opacity="0.4" />
      {/* Sub-text lines */}
      <rect x="48" y="134" width="84" height="6" rx="2" fill={fg} opacity="0.25" />
      <rect x="56" y="146" width="68" height="6" rx="2" fill={fg} opacity="0.2" />
      {/* URL / bottom text */}
      <rect x="40" y="172" width="100" height="7" rx="2" fill={fg} opacity="0.3" />
      {/* Deadline badge */}
      <rect x="56" y="190" width="68" height="14" rx="3" fill={fg} opacity="0.15" />
      <rect x="68" y="194" width="44" height="6" rx="2" fill={fg} opacity="0.35" />
    </svg>
  );
};

const ProductHighlightSilhouette = ({ active }: { active: boolean }) => {
  const fg = active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)";
  const bg = active ? "hsl(var(--primary) / 0.06)" : "hsl(var(--muted) / 0.5)";
  const accent = active ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted))";
  return (
    <svg viewBox="0 0 180 220" fill="none" className="w-full h-full">
      <rect x="0" y="0" width="180" height="220" rx="8" fill={bg} />
      {/* Product image — large centered silhouette */}
      <ellipse cx="90" cy="90" rx="48" ry="52" fill={accent} />
      <rect x="66" y="58" width="48" height="64" rx="6" fill={fg} opacity="0.12" />
      {/* Spotlight rays */}
      <line x1="90" y1="20" x2="90" y2="34" stroke={fg} strokeWidth="1" opacity="0.2" />
      <line x1="55" y1="35" x2="62" y2="46" stroke={fg} strokeWidth="1" opacity="0.15" />
      <line x1="125" y1="35" x2="118" y2="46" stroke={fg} strokeWidth="1" opacity="0.15" />
      {/* Product name */}
      <rect x="44" y="156" width="92" height="8" rx="3" fill={fg} opacity="0.5" />
      {/* Description line */}
      <rect x="52" y="172" width="76" height="5" rx="2" fill={fg} opacity="0.2" />
      {/* Price tag */}
      <rect x="64" y="188" width="52" height="16" rx="4" fill={fg} opacity="0.35" />
      <rect x="72" y="193" width="36" height="6" rx="2" fill={bg} />
    </svg>
  );
};

const NewArrivalSilhouette = ({ active }: { active: boolean }) => {
  const fg = active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)";
  const bg = active ? "hsl(var(--primary) / 0.06)" : "hsl(var(--muted) / 0.5)";
  const accent = active ? "hsl(var(--primary) / 0.18)" : "hsl(var(--muted))";
  return (
    <svg viewBox="0 0 180 220" fill="none" className="w-full h-full">
      <rect x="0" y="0" width="180" height="220" rx="8" fill={bg} />
      {/* "NEW" ribbon at top */}
      <rect x="0" y="0" width="180" height="36" rx="8" fill={fg} opacity="0.12" />
      <rect x="60" y="10" width="60" height="16" rx="8" fill={fg} opacity="0.5" />
      {/* Product card centered */}
      <rect x="30" y="48" width="120" height="110" rx="8" fill={accent} />
      {/* Image placeholder inside card */}
      <rect x="42" y="56" width="96" height="68" rx="4" fill={fg} opacity="0.1" />
      {/* Sparkle accents */}
      <circle cx="136" y="52" r="3" fill={fg} opacity="0.3" />
      <circle cx="148" y="44" r="2" fill={fg} opacity="0.2" />
      <circle cx="40" y="52" r="2.5" fill={fg} opacity="0.25" />
      {/* Text inside card */}
      <rect x="48" y="132" width="84" height="7" rx="2" fill={fg} opacity="0.35" />
      <rect x="56" y="144" width="68" height="5" rx="2" fill={fg} opacity="0.2" />
      {/* CTA button */}
      <rect x="50" y="174" width="80" height="24" rx="12" fill={fg} opacity="0.4" />
      <rect x="66" y="182" width="48" height="8" rx="3" fill={bg} />
    </svg>
  );
};

const BrandStorySilhouette = ({ active }: { active: boolean }) => {
  const fg = active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)";
  const bg = active ? "hsl(var(--primary) / 0.06)" : "hsl(var(--muted) / 0.5)";
  const accent = active ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))";
  return (
    <svg viewBox="0 0 180 220" fill="none" className="w-full h-full">
      <rect x="0" y="0" width="180" height="220" rx="8" fill={bg} />
      {/* Cinematic top image band */}
      <rect x="0" y="0" width="180" height="100" rx="8" fill={accent} />
      {/* Overlapping photo frames — collage feel */}
      <rect x="14" y="16" width="70" height="50" rx="4" fill={fg} fillOpacity="0.1" stroke={fg} strokeWidth="0.8" strokeOpacity="0.2" />
      <rect x="96" y="24" width="66" height="56" rx="4" fill={fg} fillOpacity="0.08" stroke={fg} strokeWidth="0.8" strokeOpacity="0.15" />
      {/* Quote / story text area */}
      <rect x="24" y="114" width="6" height="50" rx="3" fill={fg} opacity="0.2" />
      <rect x="40" y="116" width="110" height="6" rx="2" fill={fg} opacity="0.35" />
      <rect x="40" y="128" width="100" height="5" rx="2" fill={fg} opacity="0.25" />
      <rect x="40" y="140" width="88" height="5" rx="2" fill={fg} opacity="0.2" />
      <rect x="40" y="152" width="72" height="5" rx="2" fill={fg} opacity="0.15" />
      {/* Logo placeholder */}
      <circle cx="90" cy="188" r="14" fill={fg} fillOpacity="0.12" stroke={fg} strokeWidth="1" strokeOpacity="0.25" />
      <rect x="76" y="184" width="28" height="8" rx="2" fill={fg} opacity="0.2" />
    </svg>
  );
};

const CategoryHighlightSilhouette = ({ active }: { active: boolean }) => {
  const fg = active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)";
  const bg = active ? "hsl(var(--primary) / 0.06)" : "hsl(var(--muted) / 0.5)";
  const accent = active ? "hsl(var(--primary) / 0.14)" : "hsl(var(--muted))";
  return (
    <svg viewBox="0 0 180 220" fill="none" className="w-full h-full">
      <rect x="0" y="0" width="180" height="220" rx="8" fill={bg} />
      {/* Category title bar */}
      <rect x="28" y="16" width="124" height="10" rx="3" fill={fg} opacity="0.4" />
      <rect x="48" y="32" width="84" height="6" rx="2" fill={fg} opacity="0.15" />
      {/* 2x2 product grid */}
      {[
        { x: 16, y: 52 },
        { x: 96, y: 52 },
        { x: 16, y: 130 },
        { x: 96, y: 130 },
      ].map((pos, i) => (
        <g key={i}>
          <rect x={pos.x} y={pos.y} width="68" height="64" rx="6" fill={accent} />
          <rect x={pos.x + 10} y={pos.y + 8} width="48" height="32" rx="3" fill={fg} opacity="0.1" />
          <rect x={pos.x + 14} y={pos.y + 46} width="40" height="5" rx="2" fill={fg} opacity="0.25" />
          <rect x={pos.x + 18} y={pos.y + 54} width="32" height="4" rx="2" fill={fg} opacity="0.15" />
        </g>
      ))}
      {/* "Shop All" CTA */}
      <rect x="56" y="204" width="68" height="10" rx="5" fill={fg} opacity="0.2" />
    </svg>
  );
};

const GOALS: {
  value: CreativeGoal;
  label: string;
  description: string;
  Illustration: React.FC<{ active: boolean }>;
}[] = [
  { value: "sale-promo", label: "Sale / Promotion", description: "Discount or limited-time offer with bold visuals", Illustration: SalePromoSilhouette },
  { value: "product-highlight", label: "Product Highlight", description: "Showcase a hero product front and center", Illustration: ProductHighlightSilhouette },
  { value: "new-arrival", label: "New Arrival", description: "Announce a new product with impact", Illustration: NewArrivalSilhouette },
  { value: "brand-story", label: "Brand Story", description: "Tell your brand's narrative with imagery", Illustration: BrandStorySilhouette },
  { value: "category-highlight", label: "Category Highlight", description: "Spotlight a product collection or category", Illustration: CategoryHighlightSilhouette },
];

interface GoalStepProps {
  selected: CreativeGoal | null;
  onSelect: (goal: CreativeGoal) => void;
  onNext: () => void;
}

export const GoalStep = ({ selected, onSelect, onNext }: GoalStepProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-1">What kind of ad do you want to create?</h2>
      <p className="text-muted-foreground mb-10">
        Pick the creative type — we'll tailor the flow and output to match.
      </p>

      {/* Top row: 3 cards */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        {GOALS.slice(0, 3).map((g) => {
          const isSelected = selected === g.value;
          return (
            <button
              key={g.value}
              onClick={() => onSelect(g.value)}
              className={`group relative text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                isSelected
                  ? "border-primary bg-primary/[0.03] shadow-md ring-1 ring-primary/20"
                  : "border-border/80 bg-card hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className="px-4 pt-4 pb-2">
                <div className="w-full aspect-[9/11] mb-3 flex items-center justify-center">
                  <g.Illustration active={isSelected} />
                </div>
              </div>
              <div className="px-5 pb-5">
                <p className="font-semibold text-sm text-foreground">{g.label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{g.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom row: 2 cards, centered */}
      <div className="grid grid-cols-3 gap-5">
        <div /> {/* spacer */}
        {GOALS.slice(3).map((g) => {
          const isSelected = selected === g.value;
          return (
            <button
              key={g.value}
              onClick={() => onSelect(g.value)}
              className={`group relative text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                isSelected
                  ? "border-primary bg-primary/[0.03] shadow-md ring-1 ring-primary/20"
                  : "border-border/80 bg-card hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className="px-4 pt-4 pb-2">
                <div className="w-full aspect-[9/11] mb-3 flex items-center justify-center">
                  <g.Illustration active={isSelected} />
                </div>
              </div>
              <div className="px-5 pb-5">
                <p className="font-semibold text-sm text-foreground">{g.label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{g.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex justify-end">
        <Button size="lg" onClick={onNext} disabled={!selected} className="gap-2 rounded-xl">
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
