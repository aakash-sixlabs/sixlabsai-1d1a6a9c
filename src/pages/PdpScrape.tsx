import { WizardShell } from "@/components/wizard/WizardShell";
import { PdpScrapeStep } from "@/components/wizard/PdpScrapeStep";

const PdpScrape = () => (
  <WizardShell currentStep="pdp-scrape">
    <PdpScrapeStep />
  </WizardShell>
);

export default PdpScrape;
