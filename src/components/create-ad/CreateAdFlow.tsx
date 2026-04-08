import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { GoalStep } from "./steps/GoalStep";
import { ProductInputStep } from "./steps/ProductInputStep";
import { AspectRatioStep } from "./steps/AspectRatioStep";
import { PromoDetailsStep } from "./steps/PromoDetailsStep";
import { PromoScopeStep, PromoScope } from "./steps/PromoScopeStep";
import { ReviewStep } from "./steps/ReviewStep";
import { GeneratingStep } from "./steps/GeneratingStep";

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
  startDate: string;
  endDate: string;
  additionalNotes: string;
}

export interface CreateAdState {
  goal: CreativeGoal | null;
  promoScope: PromoScope | null;
  productImage: string | null;
  productUrl: string;
  productInputMethod: "image" | "url" | null;
  aspectRatios: string[];
  promoDetails: PromoDetails;
}

const initialState: CreateAdState = {
  goal: null,
  promoScope: null,
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

// Which goals need a product input step
const GOAL_NEEDS_PRODUCT: CreativeGoal[] = ["product-highlight", "new-arrival"];

export const CreateAdFlow = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<CreateAdState>(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const update = (partial: Partial<CreateAdState>) =>
    setState((s) => ({ ...s, ...partial }));

  // Build dynamic internal step list based on goal
  const needsProduct =
    (state.goal && GOAL_NEEDS_PRODUCT.includes(state.goal)) ||
    (state.goal === "sale-promo" && state.promoScope === "product-specific");
  const needsPromo = state.goal === "sale-promo";
  const needsPromoScope = state.goal === "sale-promo";

  const steps: { key: string }[] = [{ key: "goal" }];
  if (needsPromoScope) steps.push({ key: "promo-scope" });
  if (needsProduct) steps.push({ key: "product" });
  if (needsPromo) steps.push({ key: "promo" });
  steps.push({ key: "aspect" });
  steps.push({ key: "review" });

  const totalSteps = steps.length;
  const stepKey = steps[currentStep]?.key;

  const next = () => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  const back = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleGoalSelect = (goal: CreativeGoal) => {
    // Reset downstream state when goal changes
    update({ goal, promoScope: null, productImage: null, productUrl: "", productInputMethod: null });
  };

  // Map internal step to progress phase: 0=Goal, 1=Details, 2=Review
  const getPhase = (): number => {
    if (stepKey === "goal") return 0;
    if (stepKey === "review") return 2;
    return 1; // everything in between is "Details"
  };

  const phase = getPhase();
  const PHASES = ["Goal", "Details", "Review"];

  if (isGenerating) {
    return <GeneratingStep />;
  }

  const progressIndicator = (
    <div className="flex items-center gap-3">
      {PHASES.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= phase ? "bg-primary" : "bg-white/20"
            }`}
          />
          <span
            className={`text-xs hidden sm:inline transition-colors ${
              i === phase
                ? "text-white font-medium"
                : i < phase
                ? "text-white/60"
                : "text-white/30"
            }`}
          >
            {label}
          </span>
          {i < PHASES.length - 1 && (
            <div className={`w-6 h-px ${i < phase ? "bg-primary/40" : "bg-white/15"}`} />
          )}
        </div>
      ))}
    </div>
  );

  const backButton = (
    <button
      onClick={() => navigate("/home")}
      className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
    >
      ← Back
    </button>
  );

  return (
    <AppShell headerLeft={backButton} headerRight={progressIndicator}>
      <div className="max-w-4xl mx-auto py-12 px-6">
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
            {stepKey === "promo-scope" && (
              <PromoScopeStep
                selected={state.promoScope}
                onSelect={(scope) => update({ promoScope: scope })}
                onNext={next}
                onBack={back}
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
            {stepKey === "promo" && (
              <PromoDetailsStep
                details={state.promoDetails}
                onUpdate={(d) => update({ promoDetails: d })}
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
            {stepKey === "review" && (
              <ReviewStep state={state} onBack={back} onGenerate={() => setIsGenerating(true)} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
};
