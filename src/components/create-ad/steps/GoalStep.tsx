import { CreativeGoal } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

/* ─── Brand-agnostic creative silhouettes ─── */
/* Each SVG represents a wireframe of the actual ad output layout */

const SalePromoSilhouette = ({ active }: { active: boolean }) => {
  const fg = active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)";
  const bg = active ? "hsl(var(--primary) / 0.06)" : "hsl(var(--muted) / 0.5)";
  const bgMid = active ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))";
  return (
    <svg viewBox="0 0 180 220" fill="none" className="w-full h-full">
      <rect x="0" y="0" width="180" height="220" rx="8" fill={bg} />
      {/* Dashed border frame */}
      <rect x="10" y="10" width="160" height="200" rx="4" stroke={fg} strokeWidth="1.2" strokeDasharray="4 3" fill="none" />
      {/* Large bold "SALE" silhouette letters */}
      <rect x="36" y="30" width="18" height="40" rx="2" fill={fg} opacity="0.7" />
      <rect x="60" y="30" width="22" height="40" rx="2" fill={fg} opacity="0.7" />
      <rect x="88" y="30" width="16" height="40" rx="2" fill={fg} opacity="0.7" />
      <rect x="110" y="30" width="22" height="40" rx="2" fill={fg} opacity="0.7" />
      {/* "30% OFF" offer badge */}
      <rect x="34" y="82" width="112" height="28" rx="4" fill={bgMid} stroke={fg} strokeWidth="1.2" />
      <text x="90" y="101" textAnchor="middle" fontSize="14" fontWeight="bold" fill={fg} opacity="0.7" fontFamily="system-ui">30% OFF</text>
      {/* Free shipping text lines */}
      <rect x="40" y="122" width="100" height="6" rx="2" fill={fg} opacity="0.25" />
      <rect x="50" y="134" width="80" height="6" rx="2" fill={fg} opacity="0.18" />
      {/* Website URL line */}
      <rect x="32" y="158" width="116" height="7" rx="2" fill={fg} opacity="0.3" />
      {/* End date badge */}
      <rect x="48" y="180" width="84" height="18" rx="4" fill={fg} opacity="0.12" />
      <text x="90" y="193" textAnchor="middle" fontSize="9" fontWeight="600" fill={fg} opacity="0.5" fontFamily="system-ui">END JULY 05</text>
    </svg>
  );
};

const ProductHighlightSilhouette = ({ active }: { active: boolean }) => {
  const fg = active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)";
  const bg = active ? "hsl(var(--primary) / 0.05)" : "hsl(var(--muted) / 0.4)";
  const accent = active ? "hsl(var(--primary) / 0.12)" : "hsl(var(--muted) / 0.7)";
  const callout = active ? "hsl(var(--primary) / 0.18)" : "hsl(var(--muted))";
  return (
    <svg viewBox="0 0 180 220" fill="none" className="w-full h-full">
      <rect x="0" y="0" width="180" height="220" rx="12" fill={bg} />
      {/* Product silhouette — bottle/object shape */}
      <rect x="72" y="44" width="36" height="10" rx="2" fill={fg} opacity="0.25" />
      <rect x="68" y="50" width="44" height="14" rx="3" fill={fg} opacity="0.35" />
      <rect x="60" y="64" width="60" height="60" rx="6" fill={accent} stroke={fg} strokeWidth="1" strokeOpacity="0.2" />
      {/* Callout — top right */}
      <line x1="120" y1="62" x2="148" y2="38" stroke={fg} strokeWidth="0.8" opacity="0.4" />
      <circle cx="148" cy="38" r="3" fill={fg} opacity="0.3" />
      <rect x="128" y="28" width="46" height="6" rx="2" fill={callout} />
      {/* Callout — left */}
      <line x1="60" y1="80" x2="28" y2="70" stroke={fg} strokeWidth="0.8" opacity="0.4" />
      <circle cx="28" cy="70" r="3" fill={fg} opacity="0.3" />
      <rect x="6" y="64" width="42" height="6" rx="2" fill={callout} />
      {/* Callout — bottom right */}
      <line x1="120" y1="100" x2="142" y2="110" stroke={fg} strokeWidth="0.8" opacity="0.4" />
      <circle cx="142" cy="110" r="3" fill={fg} opacity="0.3" />
      <rect x="122" y="104" width="52" height="6" rx="2" fill={callout} />
      {/* Title */}
      <rect x="30" y="144" width="100" height="10" rx="3" fill={fg} opacity="0.5" />
      {/* Description lines */}
      <rect x="24" y="164" width="132" height="5" rx="2" fill={fg} opacity="0.18" />
      <rect x="24" y="174" width="120" height="5" rx="2" fill={fg} opacity="0.14" />
      <rect x="24" y="184" width="100" height="5" rx="2" fill={fg} opacity="0.1" />
    </svg>
  );
};

const NewArrivalSilhouette = ({ active }: { active: boolean }) => {
  const fg = active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)";
  const bg = active ? "hsl(var(--primary) / 0.06)" : "hsl(var(--muted) / 0.5)";
  const accent = active ? "hsl(var(--primary) / 0.18)" : "hsl(var(--muted))";
  const highlight = active ? "hsl(var(--primary) / 0.25)" : "hsl(var(--muted-foreground) / 0.12)";
  return (
    <svg viewBox="0 0 180 220" fill="none" className="w-full h-full">
      <rect x="0" y="0" width="180" height="220" rx="8" fill={bg} />
      {/* Logo placeholder top-left */}
      <rect x="14" y="14" width="28" height="16" rx="3" fill={fg} opacity="0.2" />
      {/* Website text top-right */}
      <rect x="110" y="16" width="56" height="5" rx="2" fill={fg} opacity="0.2" />
      <rect x="118" y="24" width="48" height="4" rx="2" fill={fg} opacity="0.12" />
      {/* "NEW ARRIVALS" bold text */}
      <rect x="20" y="44" width="120" height="10" rx="2" fill={fg} opacity="0.4" />
      {/* Big product name */}
      <rect x="16" y="60" width="148" height="18" rx="3" fill={fg} opacity="0.65" />
      <rect x="28" y="82" width="108" height="12" rx="2" fill={fg} opacity="0.45" />
      {/* Down arrows decoration */}
      <path d="M18 56L22 62L26 56" stroke={fg} strokeWidth="1" opacity="0.2" />
      <path d="M18 64L22 70L26 64" stroke={fg} strokeWidth="1" opacity="0.15" />
      <path d="M154 56L158 62L162 56" stroke={fg} strokeWidth="1" opacity="0.2" />
      <path d="M154 64L158 70L162 64" stroke={fg} strokeWidth="1" opacity="0.15" />
      {/* Pedestal / platform */}
      <ellipse cx="90" cy="168" rx="52" ry="8" fill={fg} opacity="0.1" />
      <rect x="50" y="160" width="80" height="8" fill={fg} opacity="0.06" />
      {/* Product silhouette on pedestal */}
      <rect x="58" y="100" width="64" height="36" rx="6" fill={accent} />
      <rect x="54" y="136" width="72" height="24" rx="4" fill={highlight} />
      {/* Discount badge */}
      <rect x="16" y="140" width="36" height="20" rx="10" fill={fg} opacity="0.35" />
      <text x="34" y="154" textAnchor="middle" fontSize="7" fontWeight="bold" fill={bg} fontFamily="system-ui">10%</text>
      {/* Bottom CTA button */}
      <rect x="100" y="192" width="66" height="20" rx="10" fill={fg} opacity="0.4" />
      <text x="133" y="206" textAnchor="middle" fontSize="7" fontWeight="600" fill={bg} fontFamily="system-ui">ORDER NOW</text>
      {/* Phone number placeholder */}
      <rect x="14" y="196" width="60" height="6" rx="2" fill={fg} opacity="0.2" />
      <rect x="14" y="206" width="44" height="5" rx="2" fill={fg} opacity="0.15" />
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
