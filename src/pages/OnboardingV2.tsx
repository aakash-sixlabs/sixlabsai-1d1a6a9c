import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useWizard } from "@/context/WizardContext";
import { DashboardBackground } from "@/components/wizard/DashboardBackground";
import { BrandKitStep } from "@/components/wizard/BrandKitStep";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
  PartyPopper,
} from "lucide-react";

/* ─── Types ─── */
interface AdAccount {
  id: string;
  account_id: string;
  account_name: string;
  currency: string;
  timezone: string | null;
}

type Phase = "loading" | "select-account" | "brand-kit" | "pulling" | "complete";

/* ─── Sync steps shown during data pull ─── */
const PULL_STEPS = [
  "Connecting to Meta",
  "Pulling campaigns",
  "Pulling ads & creatives",
  "Pulling performance data",
  "Processing results",
];

const OnboardingV2 = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateState } = useWizard();
  const isDevMode = searchParams.get("dev") === "true";

  const [phase, setPhase] = useState<Phase>("loading");
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(PULL_STEPS[0]);
  const [error, setError] = useState<string | null>(null);
  const [syncStarted, setSyncStarted] = useState(false);

  /* ── Init: auth check + fetch accounts ── */
  useEffect(() => {
    const init = async () => {
      if (isDevMode) {
        // Use mock accounts from sessionStorage
        const stored = sessionStorage.getItem("meta_connection");
        if (stored) {
          const data = JSON.parse(stored);
          const mock: AdAccount[] = (data.accounts || []).map((a: any) => ({
            id: a.account_id,
            account_id: a.account_id,
            account_name: a.name || a.account_name,
            currency: a.currency || "USD",
            timezone: null,
          }));
          setAccounts(mock);
        }
        setPhase("select-account");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/loginvcollect");
        return;
      }

      try {
        // Returning-user shortcut: if the user already has a default ad
        // account with a confirmed brand kit, skip onboarding entirely and
        // send them to /home. The /home page will trigger a non-blocking
        // 30-day resync on landing.
        const { data: profile } = await supabase
          .from("profiles")
          .select("default_ad_account_id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile?.default_ad_account_id) {
          const { data: aap } = await supabase
            .from("ad_account_profiles")
            .select("brand_kit_status")
            .eq("ad_account_id", profile.default_ad_account_id)
            .maybeSingle();

          if (aap?.brand_kit_status === "ready") {
            navigate("/home", { replace: true });
            return;
          }
        }

        const { data, error } = await supabase
          .from("ad_accounts")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setAccounts(data || []);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
      setPhase("select-account");
    };
    init();
  }, []);

  /* ── Step 1: account selected → save default + show brand kit ── */
  const handleAccountContinue = async () => {
    if (!selected) return;
    const account = accounts.find((a) => a.id === selected);
    if (!account) return;

    if (!isDevMode) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ default_ad_account_id: account.id })
            .eq("id", user.id);
        }
      } catch (err) {
        console.error("Failed to save default account:", err);
      }
    }

    updateState({
      selectedAccount: account.id,
      selectedAccountName: account.account_name,
      selectedMetaAccountId: account.account_id,
      dateRange: "90",
    });

    setPhase("brand-kit");
  };

  /* ── Step 2: brand kit confirmed → start data pull ── */
  const startPull = async () => {
    if (!selected) return;
    const account = accounts.find((a) => a.id === selected);
    if (!account) return;

    setPhase("pulling");
    setSyncStarted(true);
    setError(null);
    setCurrentStep(PULL_STEPS[0]);

    if (isDevMode) {
      // Simulate pull
      let i = 0;
      const interval = setInterval(() => {
        i++;
        if (i < PULL_STEPS.length) {
          setCurrentStep(PULL_STEPS[i]);
        } else {
          clearInterval(interval);
          updateState({ syncComplete: true });
          setPhase("complete");
        }
      }, 1200);
      return;
    }

    // Real sync
    const channel = supabase
      .channel("sync-progress-v2")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sync_jobs" },
        (payload) => {
          const job = payload.new as any;
          if (job.current_step) setCurrentStep(job.current_step);
          if (job.status === "complete") {
            updateState({ syncComplete: true });
            setPhase("complete");
          }
          if (job.status === "error")
            setError(job.error_message || "Sync failed");
        }
      )
      .subscribe();

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "meta-sync-accounts",
        {
          body: {
            adAccountId: account.id,
            dateRangeDays: "30",
          },
        }
      );
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
    } catch (err: any) {
      console.error("Sync error:", err);
      setError(err.message || "Sync failed");
    }

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRetry = () => {
    setError(null);
    setSyncStarted(false);
    startPull();
  };

  const selectedAccountName = accounts.find((a) => a.id === selected)?.account_name ?? "your account";

  const stepIdx = PULL_STEPS.indexOf(currentStep);
  const effectiveIdx = stepIdx >= 0 ? stepIdx : 0;

  return (
    <>
      <DashboardBackground />

      {/* Phase 1: Account Selection */}
      <Dialog open={phase === "select-account"} modal>
        <DialogContent
          className="sm:max-w-lg [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              Select Ad Account
            </DialogTitle>
            <DialogDescription>
              Choose the ad account you'd like us to pull data from.
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-2"
          >
            {accounts.length === 0 ? (
              <div className="flex justify-center py-8">
                <p className="text-sm text-muted-foreground">
                  No ad accounts found.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setSelected(acc.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selected === acc.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-foreground">
                          {acc.account_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {acc.account_id} · {acc.currency}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <Button
              className="w-full gap-2"
              size="lg"
              disabled={!selected}
              onClick={handleAccountContinue}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Phase 1.5: Brand Kit */}
      {phase === "brand-kit" && selected && (
        <BrandKitStep
          open
          adAccountId={selected}
          defaultBrandName={selectedAccountName}
          isDevMode={isDevMode}
          onComplete={startPull}
        />
      )}

      {/* Phase 2: Pulling Data */}
      <Dialog open={phase === "pulling"} modal>
        <DialogContent
          className="sm:max-w-md [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Loader2
                  className={`w-4 h-4 text-primary ${
                    !error ? "animate-spin" : ""
                  }`}
                />
              </div>
              Pulling Your Data
            </DialogTitle>
            <DialogDescription>
              {error
                ? "An error occurred while pulling data."
                : "We're importing your campaign, ad, and creative data from Meta."}
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {error && (
              <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    Pull Error
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5"
                  onClick={handleRetry}
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </Button>
              </div>
            )}
            <div className="space-y-3 text-left">
              {PULL_STEPS.map((step, i) => {
                const done = i < effectiveIdx || phase === "complete";
                const active = i === effectiveIdx && !error;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        done
                          ? "bg-emerald-500 text-white"
                          : active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? (
                        <Check className="w-3 h-3" />
                      ) : active ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <span className="text-[10px]">{i + 1}</span>
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
              <div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${
                        ((effectiveIdx + 1) / PULL_STEPS.length) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 text-center">
                  {Math.round(
                    ((effectiveIdx + 1) / PULL_STEPS.length) * 100
                  )}
                  % complete
                </p>
              </div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Phase 3: Complete */}
      <Dialog open={phase === "complete"} modal>
        <DialogContent
          className="sm:max-w-md [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-4 space-y-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </motion.div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                Thank you!
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Thank you for providing us access to{" "}
                <span className="font-semibold text-foreground">{selectedAccountName}</span>.
                The team will share the link for our review portal once the
                creatives are ready for your review.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => navigate("/")}
            >
              Go to Homepage <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Loading state */}
      {phase === "loading" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
    </>
  );
};

export default OnboardingV2;
