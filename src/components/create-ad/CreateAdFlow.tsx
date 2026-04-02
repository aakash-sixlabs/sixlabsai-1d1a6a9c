import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoalStep } from "./steps/GoalStep";
import { ProductInputStep } from "./steps/ProductInputStep";
import { AspectRatioStep } from "./steps/AspectRatioStep";
import { PromoDetailsStep } from "./steps/PromoDetailsStep";
import { ReviewStep } from "./steps/ReviewStep";

export type CreativeGoal =
  | "sale-promo"
  | "product-highlight"
  | "new-arrival"
  | "brand-story"
  | "category-highlight";

export interface PromoDetails {
  discountType: "percentage" | "fixed";
  discountValue: string;
  promoCode: string;
  duration: string;
  additionalNotes: string;
}

export interface CreateAdState {
  goal: CreativeGoal | null;
  productImage: string | null;
  productUrl: string;
  productInputMethod: "image" | "url" | null;
  aspectRatios: string[];
  promoDetails: PromoDetails;
}

const initialState: CreateAdState = {
  goal: null,
  productImage: null,
  productUrl: "",
  productInputMethod: null,
  aspectRatios: [],
  promoDetails: {
    discountType: "percentage",
    discountValue: "",
    promoCode: "",
    duration: "",
    additionalNotes: "",
  },
};

const GOAL_NEEDS_PRODUCT: CreativeGoal[] = ["product-highlight", "new-arrival"];
const GOAL_NEEDS_PROMO: CreativeGoal[] = ["sale-promo"];

export const CreateAdFlow = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<CreateAdState>(initialState);
  const [currentStep, setCurrentStep] = useState(0);

  const update = (partial: Partial<CreateAdState>) =>
    setState((s) => ({ ...s, ...partial }));

  const needsProduct = state.goal && GOAL_NEEDS_PRODUCT.includes(state.goal);
  const needsPromo = state.goal && GOAL_NEEDS_PROMO.includes(state.goal);

  // Build dynamic step list
  const steps: { key: string; label: string }[] = [{ key: "goal", label: "Goal" }];
  if (needsProduct) steps.push({ key: "product", label: "Product" });
  steps.push({ key: "aspect", label: "Format" });
  if (needsPromo) steps.push({ key: "promo", label: "Promotion" });
  steps.push({ key: "review", label: "Review" });

  const totalSteps = steps.length;
  const stepKey = steps[currentStep]?.key;

  const next = () => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  const back = () => setCurrentStep((s) => Math.max(s - 1, 0));

  // When goal changes, reset to step 0 so dynamic steps recalculate
  const handleGoalSelect = (goal: CreativeGoal) => {
    update({ goal });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal top bar */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-2xl flex items-center justify-between h-12">
          <button
            onClick={() => navigate("/insights")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < currentStep
                      ? "bg-primary"
                      : i === currentStep
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
                <span
                  className={`text-xs hidden sm:inline transition-colors ${
                    i === currentStep
                      ? "text-foreground font-medium"
                      : i < currentStep
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`w-6 h-px ${i < currentStep ? "bg-primary/40" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 container max-w-2xl py-12">
        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepKey}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {stepKey === "goal" && (
              <GoalStep
                selected={state.goal}
                onSelect={handleGoalSelect}
                onNext={next}
              />
            )}
            {stepKey === "product" && (
              <ProductInputStep
                state={state}
                onUpdate={update}
                onNext={next}
                onBack={back}
              />
            )}
            {stepKey === "aspect" && (
              <AspectRatioStep
                selected={state.aspectRatios}
                onUpdate={(ratios) => update({ aspectRatios: ratios })}
                onNext={next}
                onBack={back}
              />
            )}
            {stepKey === "promo" && (
              <PromoDetailsStep
                details={state.promoDetails}
                onUpdate={(d) => update({ promoDetails: d })}
                onNext={next}
                onBack={back}
              />
            )}
            {stepKey === "review" && (
              <ReviewStep state={state} onBack={back} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
