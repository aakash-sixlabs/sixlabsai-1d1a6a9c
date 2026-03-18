import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, CheckCircle2 } from "lucide-react";

export const MetaConnectStep = () => {
  const { setStep, updateState } = useWizard();

  const handleConnect = () => {
    // Simulate Meta OAuth
    setTimeout(() => {
      updateState({ metaConnected: true });
      setStep("account-select");
    }, 1500);
  };

  return (
    <div className="container max-w-lg py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Connect Your Meta Ads Account
        </h2>
        <p className="text-muted-foreground mb-8">
          We'll securely access your ad account to analyze historical creative
          performance. We only request read-only permissions.
        </p>

        <Button size="lg" className="gap-2 w-full max-w-xs" onClick={handleConnect}>
          <ExternalLink className="w-4 h-4" /> Connect with Meta
        </Button>

        <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
          {[
            "Read-only access to ad creatives",
            "Historical performance metrics",
            "Secure OAuth authentication",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          Your data is encrypted and never shared
        </div>
      </motion.div>
    </div>
  );
};
