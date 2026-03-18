import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

const SYNC_STEPS = [
  "Connecting to Meta",
  "Pulling campaigns and ad sets",
  "Pulling ads and creatives",
  "Pulling ad performance",
  "Filtering supported formats",
  "Preparing insights",
];

export const DataSyncStep = () => {
  const { setStep, updateState } = useWizard();
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => {
        if (prev >= SYNC_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            updateState({ syncComplete: true });
            setStep("insights");
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container max-w-lg py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Syncing Historical Data
        </h2>
        <p className="text-muted-foreground mb-10">
          Analyzing your ad account performance…
        </p>

        <div className="space-y-4 text-left max-w-sm mx-auto">
          {SYNC_STEPS.map((step, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    done
                      ? "bg-success text-success-foreground"
                      : active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : active ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span className="text-xs">{i + 1}</span>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    done
                      ? "text-foreground"
                      : active
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden max-w-sm mx-auto">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: `${((currentIdx + 1) / SYNC_STEPS.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(((currentIdx + 1) / SYNC_STEPS.length) * 100)}% complete
          </p>
        </div>
      </motion.div>
    </div>
  );
};
