import { WizardShell } from "@/components/wizard/WizardShell";
import { InsightsStep } from "@/components/wizard/InsightsStep";

const Insights = () => (
  <WizardShell currentStep="insights">
    <InsightsStep />
  </WizardShell>
);

export default Insights;
