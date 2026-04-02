import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoalStep } from "./steps/GoalStep";
import { ProductInputStep } from "./steps/ProductInputStep";
import { AspectRatioStep } from "./steps/AspectRatioStep";
import { PromoDetailsStep } from "./steps/PromoDetailsStep";
import { ReviewStep } from "./steps/ReviewStep";

export type CreativeGoal =
  | "brand-promo"
  | "product-promo"
  | "new-launch"
  | "evergreen"
  | "retarget";

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

const GOAL_NEEDS_PRODUCT: CreativeGoal[] = ["product-promo", "new-launch", "retarget"];
const GOAL_NEEDS_PROMO: CreativeGoal[] = ["brand-promo", "product-promo"];

export const CreateAdFlow = () => {
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
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container max-w-2xl py-12">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </p>
            <p className="text-sm font-medium text-foreground">{steps[currentStep]?.label}</p>
          </div>
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

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
