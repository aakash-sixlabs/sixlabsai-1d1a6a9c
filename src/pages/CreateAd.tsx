import { WizardShell } from "@/components/wizard/WizardShell";
import { CreateAdFlow } from "@/components/create-ad/CreateAdFlow";

const CreateAd = () => (
  <WizardShell currentStep="pdp-input">
    <CreateAdFlow />
  </WizardShell>
);

export default CreateAd;
