import { CreateAdState } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Tag, Rocket, Heart, LayoutGrid } from "lucide-react";

const GOAL_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  "sale-promo": { label: "Sale / Promotion", icon: Tag },
  "product-highlight": { label: "Product Highlight", icon: Sparkles },
  "new-arrival": { label: "New Arrival", icon: Rocket },
  "brand-story": { label: "Brand Story", icon: Heart },
  "category-highlight": { label: "Category Highlight", icon: LayoutGrid },
};

const formatOffer = (d: CreateAdState["promoDetails"]): string => {
  switch (d.offerType) {
    case "percentage":
      return `${d.discountValue}% off`;
    case "fixed":
      return `$${d.discountValue} off`;
    case "bogo":
      return `Buy ${d.buyQty} Get ${d.getQty} Free`;
    case "trial":
      return `Try for $${d.trialPrice}`;
    case "freebie":
      return d.freebieDescription;
    case "custom":
      return d.customOfferHeadline;
    default:
      return "";
  }
};

interface ReviewStepProps {
  state: CreateAdState;
  onBack: () => void;
  onGenerate: () => void;
}

export const ReviewStep = ({ state, onBack, onGenerate }: ReviewStepProps) => {
  const goalInfo = state.goal ? GOAL_LABELS[state.goal] : null;
  const GoalIcon = goalInfo?.icon;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">Review & Generate</h2>
      <p className="text-muted-foreground mb-8">
        Here's a summary of your creative brief. Hit generate when you're ready.
      </p>

      <div className="space-y-4">
        {/* Goal */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Goal</p>
          <div className="flex items-center gap-2">
            {GoalIcon && <GoalIcon className="w-4 h-4 text-primary" />}
            <p className="font-medium text-foreground">
              {goalInfo?.label}
              {state.promoScope === "brand-wide" && " · Brand-wide"}
              {state.promoScope === "product-specific" && " · Product-specific"}
            </p>
          </div>
        </div>

        {/* Product */}
        {state.productInputMethod && (
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Product</p>
            <p className="font-medium text-foreground">
              {state.productInputMethod === "url" ? state.productUrl : "Uploaded image"}
            </p>
          </div>
        )}

        {/* Aspect Ratios */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Formats</p>
          <div className="flex flex-wrap gap-2">
            {state.aspectRatios.map((r) => (
              <span key={r} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Promo Details */}
        {state.promoDetails.offerType && (
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Promotion</p>
            <p className="font-medium text-foreground">
              {formatOffer(state.promoDetails)}
              {state.promoDetails.promoCode && ` · Code: ${state.promoDetails.promoCode}`}
            </p>
            {(state.promoDetails.startDate || state.promoDetails.endDate) && (
              <p className="text-sm text-muted-foreground mt-1">
                {state.promoDetails.startDate && new Date(state.promoDetails.startDate).toLocaleDateString()}
                {state.promoDetails.startDate && state.promoDetails.endDate && " – "}
                {state.promoDetails.endDate && new Date(state.promoDetails.endDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="lg" onClick={onGenerate} className="gap-2">
          <Sparkles className="w-4 h-4" /> Create New Ad
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground/60 mt-4">
        AI combines your top performers, competitor insights, and industry trends — instantly.
      </p>
    </div>
  );
};
