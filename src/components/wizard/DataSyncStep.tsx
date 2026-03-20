import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { useEffect, useState } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const SYNC_STEPS = [
  "Connecting to Meta",
  "Pulling campaigns and ad sets",
  "Pulling ads and creatives",
  "Pulling ad performance",
  "Filtering supported formats",
  "Preparing insights",
];

export const DataSyncStep = () => {
  const { state, setStep, updateState } = useWizard();
  const [currentStep, setCurrentStep] = useState("Connecting to Meta");
  const [error, setError] = useState<string | null>(null);
  const [syncStarted, setSyncStarted] = useState(false);

  const currentIdx = SYNC_STEPS.indexOf(currentStep);

  useEffect(() => {
    if (syncStarted) return;
    setSyncStarted(true);

    const startSync = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "meta-sync",
          {
            body: {
              adAccountId: state.selectedAccount,
              dateRangeDays: state.dateRange,
            },
          }
        );

        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);

        // Sync complete
        updateState({ syncComplete: true });
        setCurrentStep("Preparing insights");
        setTimeout(() => setStep("data-review"), 1000);
      } catch (err: any) {
        console.error("Sync error:", err);
        setError(err.message || "Sync failed");
      }
    };

    // Also subscribe to realtime updates for progress
    const channel = supabase
      .channel("sync-progress")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sync_jobs",
        },
        (payload) => {
          const job = payload.new as any;
          if (job.current_step) {
            setCurrentStep(job.current_step);
          }
          if (job.status === "complete") {
            updateState({ syncComplete: true });
            setTimeout(() => setStep("insights"), 1000);
          }
          if (job.status === "error") {
            setError(job.error_message || "Sync failed");
          }
        }
      )
      .subscribe();

    startSync();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const effectiveIdx = currentIdx >= 0 ? currentIdx : 0;

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
          {error ? "An error occurred during sync." : "Analyzing your ad account performance…"}
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Sync Error</span>
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setError(null);
                setSyncStarted(false);
              }}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="space-y-4 text-left max-w-sm mx-auto">
          {SYNC_STEPS.map((step, i) => {
            const done = i < effectiveIdx || (currentStep === "Complete");
            const active = i === effectiveIdx && !error && currentStep !== "Complete";
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

        {!error && (
          <div className="mt-10">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden max-w-sm mx-auto">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${((effectiveIdx + 1) / SYNC_STEPS.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(((effectiveIdx + 1) / SYNC_STEPS.length) * 100)}% complete
            </p>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="mt-4 text-xs text-muted-foreground"
          onClick={() => {
            updateState({ syncComplete: true });
            setStep("insights");
          }}
        >
          Skip (Dev Mode)
        </Button>
      </motion.div>
    </div>
  );
};
