import { CreateAdState } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Tag, Rocket, Heart, LayoutGrid, Users, Package, Layers, Percent } from "lucide-react";
import { STEP_CONTAINER, STEP_HEADING, STEP_SUBTITLE, CTA_SHAPE } from "./_shared";

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

const SummaryCard = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border-2 border-border/80 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
    </div>
    <div className="text-sm text-foreground">{children}</div>
  </div>
);

export const ReviewStep = ({ state, onBack, onGenerate }: ReviewStepProps) => {
  const goalInfo = state.goal ? GOAL_LABELS[state.goal] : null;
  const GoalIcon = goalInfo?.icon ?? Sparkles;

  return (
    <div className={STEP_CONTAINER}>
      <h2 className={STEP_HEADING}>Review & Generate</h2>
      <p className={STEP_SUBTITLE}>
        Here's a summary of your creative brief. Hit generate when you're ready.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {state.icpName && (
          <SummaryCard label="Audience" icon={Users}>
            <p className="font-medium">{state.icpName}</p>
          </SummaryCard>
        )}

        <SummaryCard label="Goal" icon={GoalIcon}>
          <p className="font-medium">
            {goalInfo?.label}
            {state.promoScope === "brand-wide" && " · Brand-wide"}
            {state.promoScope === "product-specific" && " · Product-specific"}
          </p>
        </SummaryCard>

        {state.productInputMethod && (
          <SummaryCard label="Product" icon={Package}>
            <p className="font-medium truncate">
              {state.productInputMethod === "url" ? state.productUrl : "Uploaded image"}
            </p>
          </SummaryCard>
        )}

        <SummaryCard label="Formats" icon={Layers}>
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {state.aspectRatios.map((r) => (
              <span
                key={r}
                className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {r}
              </span>
            ))}
          </div>
        </SummaryCard>

        {state.promoDetails.offerType && (
          <SummaryCard label="Promotion" icon={Percent}>
            <p className="font-medium">
              {formatOffer(state.promoDetails)}
              {state.promoDetails.promoCode && ` · Code: ${state.promoDetails.promoCode}`}
            </p>
            {(state.promoDetails.startDate || state.promoDetails.endDate) && (
              <p className="text-xs text-muted-foreground mt-1">
                {state.promoDetails.startDate && new Date(state.promoDetails.startDate).toLocaleDateString()}
                {state.promoDetails.startDate && state.promoDetails.endDate && " – "}
                {state.promoDetails.endDate && new Date(state.promoDetails.endDate).toLocaleDateString()}
              </p>
            )}
          </SummaryCard>
        )}
      </div>

      <div className="mt-10 flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className={CTA_SHAPE}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="lg" onClick={onGenerate} className={CTA_SHAPE}>
          <Sparkles className="w-4 h-4" /> Create New Ad
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground/60 mt-4">
        AI combines your top performers, competitor insights, and industry trends — instantly.
      </p>
    </div>
  );
};
