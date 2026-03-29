import { WizardShell } from "@/components/wizard/WizardShell";
import { PdpInputStep } from "@/components/wizard/PdpInputStep";

const PdpInput = () => (
  <WizardShell currentStep="pdp-input">
    <PdpInputStep />
  </WizardShell>
);

export default PdpInput;
