import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Check, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const SYNC_STEPS = [
  "Connecting to Meta",
  "Pulling campaigns and ad sets",
  "Pulling ads and creatives",
  "Pulling ad performance",
  "Filtering supported formats",
  "Preparing insights",
];

export const DataSyncStep = ({
  asOverlay = false,
  onComplete,
  isDevMode = false,
}: {
  asOverlay?: boolean;
  onComplete?: () => void;
  isDevMode?: boolean;
}) => {
  const { state, updateState } = useWizard();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState("Connecting to Meta");
  const [error, setError] = useState<string | null>(null);
  const [syncStarted, setSyncStarted] = useState(false);

  const currentIdx = SYNC_STEPS.indexOf(currentStep);

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate("/insights");
    }
  };

  useEffect(() => {
    if (syncStarted) return;
    setSyncStarted(true);

    // Dev mode: simulate sync with delays
    if (isDevMode) {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        if (i < SYNC_STEPS.length) {
          setCurrentStep(SYNC_STEPS[i]);
        } else {
          clearInterval(interval);
          updateState({ syncComplete: true });
          setTimeout(() => handleComplete(), 500);
        }
      }, 800);
      return () => clearInterval(interval);
    }

    const startSync = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("meta-sync", {
          body: { adAccountId: state.selectedAccount, dateRangeDays: state.dateRange },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        updateState({ syncComplete: true });
        setCurrentStep("Preparing insights");
        setTimeout(() => handleComplete(), 1000);
      } catch (err: any) {
        console.error("Sync error:", err);
        setError(err.message || "Sync failed");
      }
    };

    const channel = supabase
      .channel("sync-progress")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "sync_jobs" }, (payload) => {
        const job = payload.new as any;
        if (job.current_step) setCurrentStep(job.current_step);
        if (job.status === "complete") {
          updateState({ syncComplete: true });
          setTimeout(() => handleComplete(), 1000);
        }
        if (job.status === "error") setError(job.error_message || "Sync failed");
      })
      .subscribe();

    startSync();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const effectiveIdx = currentIdx >= 0 ? currentIdx : 0;

  const content = (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-left">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Sync Error</span>
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => { setError(null); setSyncStarted(false); }}>
            <RefreshCw className="w-3 h-3" /> Retry
          </Button>
        </div>
      )}
      <div className="space-y-3 text-left">
        {SYNC_STEPS.map((step, i) => {
          const done = i < effectiveIdx || currentStep === "Complete";
          const active = i === effectiveIdx && !error && currentStep !== "Complete";
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${done ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {done ? <Check className="w-3 h-3" /> : active ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="text-[10px]">{i + 1}</span>}
              </div>
              <span className={`text-sm ${done ? "text-foreground" : active ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step}</span>
            </motion.div>
          );
        })}
      </div>
      {!error && (
        <div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" initial={{ width: "0%" }} animate={{ width: `${((effectiveIdx + 1) / SYNC_STEPS.length) * 100}%` }} transition={{ duration: 0.5 }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 text-center">{Math.round(((effectiveIdx + 1) / SYNC_STEPS.length) * 100)}% complete</p>
        </div>
      )}
    </motion.div>
  );

  if (asOverlay) {
    return (
      <Dialog open modal>
        <DialogContent className="sm:max-w-md [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Loader2 className={`w-4 h-4 text-primary ${!error ? 'animate-spin' : ''}`} />
              </div>
              Syncing Historical Data
            </DialogTitle>
            <DialogDescription>{error ? "An error occurred during sync." : "Analyzing your ad account performance…"}</DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="container max-w-lg py-16">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Syncing Historical Data</h2>
        <p className="text-muted-foreground mb-10">{error ? "An error occurred during sync." : "Analyzing your ad account performance…"}</p>
        {content}
      </div>
    </div>
  );
};
