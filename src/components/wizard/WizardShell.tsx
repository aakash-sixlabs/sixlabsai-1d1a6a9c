import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const showStepper = currentStep !== "landing";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[hsl(222,47%,11%)]">
      {/* Dark top bar */}
      <header className="h-14 bg-[hsl(222,47%,11%)] flex items-center px-6 gap-4 shrink-0 z-50">
        <div
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
          onClick={() => navigate("/home")}
        >
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-[15px] text-white tracking-tight">
            CreativeGen
          </span>
        </div>
        <div className="flex-1" />
        {showStepper && <StepIndicator currentStep={currentStep} />}
      </header>
      {/* Content card */}
      <main className="flex-1 overflow-auto bg-card rounded-t-2xl">
        {children}
      </main>
    </div>
  );
};
