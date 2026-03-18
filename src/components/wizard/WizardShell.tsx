import { ReactNode } from "react";
import { StepIndicator } from "./StepIndicator";
import { WizardStep } from "@/context/WizardContext";
import { Zap } from "lucide-react";

export const WizardShell = ({
  currentStep,
  children,
}: {
  currentStep: WizardStep;
  children: ReactNode;
}) => {
  const showStepper = currentStep !== "landing";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              CreativeGen
            </span>
          </div>
          {showStepper && <StepIndicator currentStep={currentStep} />}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
};
