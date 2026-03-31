import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, RefreshCw, X } from "lucide-react";

interface SyncNotificationBarProps {
  status: "idle" | "syncing" | "complete" | "error";
  currentStep?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export const SyncNotificationBar = ({
  status,
  currentStep,
  onDismiss,
  onRetry,
}: SyncNotificationBarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === "syncing" || status === "complete" || status === "error") {
      setVisible(true);
    }
    if (status === "complete") {
      const timer = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!visible || status === "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium ${
          status === "complete"
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-b border-emerald-500/20"
            : status === "error"
            ? "bg-destructive/10 text-destructive border-b border-destructive/20"
            : "bg-primary/5 text-foreground border-b border-primary/10"
        }`}
      >
        {status === "syncing" && (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>
              Syncing latest data from Meta
              {currentStep ? ` — ${currentStep}` : "…"}
            </span>
          </>
        )}
        {status === "complete" && (
          <>
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span>All data synced and up to date</span>
            <button
              onClick={() => {
                setVisible(false);
                onDismiss?.();
              }}
              className="ml-2 p-0.5 rounded hover:bg-emerald-500/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <span>Sync failed — your data may be stale</span>
            <button
              onClick={onRetry}
              className="ml-1 inline-flex items-center gap-1 text-xs underline hover:no-underline"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
            <button
              onClick={() => {
                setVisible(false);
                onDismiss?.();
              }}
              className="ml-2 p-0.5 rounded hover:bg-destructive/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
