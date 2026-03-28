import { WizardShell } from "@/components/wizard/WizardShell";
import { OutputStep } from "@/components/wizard/OutputStep";

const Output = () => (
  <WizardShell currentStep="output">
    <OutputStep />
  </WizardShell>
);

export default Output;
