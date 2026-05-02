import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Globe, Package } from "lucide-react";
import {
  STEP_CONTAINER,
  STEP_HEADING,
  STEP_SUBTITLE,
  CARD_BASE,
  CARD_SELECTED,
  CARD_IDLE,
  CTA_SHAPE,
} from "./_shared";

export type PromoScope = "brand-wide" | "product-specific";

interface PromoScopeStepProps {
  selected: PromoScope | null;
  onSelect: (scope: PromoScope) => void;
  onNext: () => void;
  onBack: () => void;
}

const OPTIONS: {
  value: PromoScope;
  label: string;
  description: string;
  icon: React.ElementType;
  example: string;
}[] = [
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
    <div className={STEP_CONTAINER}>
      <h2 className={STEP_HEADING}>What's the promotion for?</h2>
      <p className={STEP_SUBTITLE}>
        Is this a store-wide offer or tied to a specific product?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          const isSelected = selected === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onSelect(o.value)}
              className={`${CARD_BASE} p-5 ${isSelected ? CARD_SELECTED : CARD_IDLE}`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="font-semibold text-sm text-foreground pr-6">{o.label}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{o.description}</p>
              <p className="text-xs text-muted-foreground/70 mt-1.5 italic">{o.example}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className={CTA_SHAPE}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={!selected} className={CTA_SHAPE}>
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
