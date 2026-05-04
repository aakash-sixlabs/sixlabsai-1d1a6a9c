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
  isDemoMode = false,
}: {
  asOverlay?: boolean;
  onComplete?: () => void;
  isDevMode?: boolean;
  isDemoMode?: boolean;
}) => {
  const { state, updateState } = useWizard();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState("Connecting to Meta");
  const [error, setError] = useState<string | null>(null);
  const [syncStarted, setSyncStarted] = useState(false);
  const [simulatedIdx, setSimulatedIdx] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Map dynamic backend step labels (e.g. "Processing creatives (12/380)",
  // "Pulling performance (2026-03-09)") to one of our 6 visible UI steps.
  const mapBackendStep = (raw: string): number => {
    const s = (raw || "").toLowerCase();
    if (s.includes("complete")) return SYNC_STEPS.length - 1;
    if (s.includes("performance") || s.includes("insights")) return 3; // Pulling ad performance
    if (s.includes("creative")) return 2; // Pulling ads and creatives
    if (s.includes("ad set") || s.includes("adset") || s.includes("pulling ads")) return 2;
    if (s.includes("campaign")) return 1; // Pulling campaigns and ad sets
    if (s.includes("connect")) return 0;
    const exact = SYNC_STEPS.indexOf(raw);
    return exact;
  };
  const realIdx = mapBackendStep(currentStep);
  // Use whichever is further along: real backend progress or simulated progress.
  // Cap simulated at step 3 (performance) so it can't claim "Filtering / Preparing"
  // before the backend actually reaches those phases.
  const cappedSimulated = Math.min(simulatedIdx, realIdx >= 0 ? Math.max(realIdx, 3) : 3);
  const currentIdx = isComplete ? SYNC_STEPS.length - 1 : Math.max(realIdx, cappedSimulated);

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate("/home");
    }
  };

  // Smoothly advance simulated progress through steps so the UI doesn't sit still.
  // Stops one step before the end — only real completion fills the final tick.
  useEffect(() => {
    if (error || isComplete) return;
    if (simulatedIdx >= SYNC_STEPS.length - 1) return;
    const timeout = setTimeout(() => {
      setSimulatedIdx((i) => Math.min(i + 1, SYNC_STEPS.length - 1));
    }, 1400);
    return () => clearTimeout(timeout);
  }, [simulatedIdx, error, isComplete]);

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
          setIsComplete(true);
          updateState({ syncComplete: true });
          setTimeout(() => handleComplete(), 500);
        }
      }, 800);
      return () => clearInterval(interval);
    }

    const startSync = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("meta-sync-accounts", {
          body: { adAccountId: state.selectedAccount, dateRangeDays: state.dateRange },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        // Sync runs in the background — realtime updates on sync_jobs will
        // drive currentStep and the final complete/error state.
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
          setIsComplete(true);
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
          <p className="text-xs text-muted-foreground mt-1.5 text-center">
            {Math.round(((effectiveIdx + 1) / SYNC_STEPS.length) * 100)}% complete
            {currentStep && SYNC_STEPS.indexOf(currentStep) === -1 && currentStep !== "Complete" && (
              <span className="ml-1.5 opacity-70">· {currentStep}</span>
            )}
          </p>
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
            <DialogDescription>{error ? "An error occurred during sync." : "Analyzing your ad account performance… the process might take time to complete."}</DialogDescription>
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
        <p className="text-muted-foreground mb-10">{error ? "An error occurred during sync." : "Analyzing your ad account performance… the process might take time to complete."}</p>
        {content}
      </div>
    </div>
  );
};
