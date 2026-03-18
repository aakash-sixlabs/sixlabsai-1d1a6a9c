import { Check } from "lucide-react";
import { WizardStep } from "@/context/WizardContext";

const STEPS: { key: WizardStep; label: string }[] = [
  { key: "meta-connect", label: "Connect" },
  { key: "account-select", label: "Account" },
  { key: "data-sync", label: "Sync" },
  { key: "insights", label: "Insights" },
  { key: "pdp-input", label: "Product" },
  { key: "pdp-scrape", label: "Analyze" },
  { key: "strategy", label: "Strategy" },
  { key: "output", label: "Output" },
];

const stepIndex = (step: WizardStep) => {
  const idx = STEPS.findIndex((s) => s.key === step);
  return idx === -1 ? -1 : idx;
};

export const StepIndicator = ({ currentStep }: { currentStep: WizardStep }) => {
  const current = stepIndex(currentStep);
  if (current < 0) return null;

  return (
    <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto">
      {STEPS.map((s, i) => {
        const isComplete = i < current;
        const isCurrent = i === current;
        return (
          <div key={s.key} className="flex items-center gap-1">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium shrink-0 transition-colors ${
                isComplete
                  ? "bg-success text-success-foreground"
                  : isCurrent
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isComplete ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className={`text-xs whitespace-nowrap hidden sm:inline ${
                isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`w-6 h-px shrink-0 ${
                  isComplete ? "bg-success" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
