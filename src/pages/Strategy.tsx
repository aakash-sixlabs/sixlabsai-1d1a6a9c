import { WizardShell } from "@/components/wizard/WizardShell";
import { StrategyStep } from "@/components/wizard/StrategyStep";

const Strategy = () => (
  <WizardShell currentStep="strategy">
    <StrategyStep />
  </WizardShell>
);

export default Strategy;
