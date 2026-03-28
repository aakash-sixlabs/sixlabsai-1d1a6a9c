import { WizardShell } from "@/components/wizard/WizardShell";
import { DataReviewStep } from "@/components/wizard/DataReviewStep";

const DataReview = () => (
  <WizardShell currentStep="data-review">
    <DataReviewStep />
  </WizardShell>
);

export default DataReview;
