import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/prod/client";
import { AdAccountProfileDialog } from "@/components/wizard/AdAccountProfileDialog";

interface AdAccount {
  id: string;
  account_id_meta: string;
  account_name: string;
  currency: string | null;
  timezone: string | null;
}

const DATE_RANGES = [
  { value: "90", label: "Last 90 days" },
  { value: "180", label: "Last 180 days" },
  { value: "365", label: "Last year" },
];

export const AccountSelectStep = () => {
  const { setStep, updateState } = useWizard();
  const [selected, setSelected] = useState<string | null>(null);
  const [range, setRange] = useState("90");
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAccountProfile, setShowAccountProfile] = useState(false);
  const [selectedAccountData, setSelectedAccountData] = useState<AdAccount | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data, error } = await supabase
          .from("ad_accounts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setAccounts(data || []);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleStartAnalysis = async () => {
    if (!selected) return;

    const account = accounts.find((a) => a.id === selected);
    if (!account) return;

    setSelectedAccountData(account);

    // Check if ad_account_profile exists for this account
    try {
      const { data: profile } = await supabase
        .from("ad_account_profiles")
        .select("*")
        .eq("ad_account_id", selected)
        .maybeSingle();

      if (!profile || !profile.confirmed) {
        // Show the account profile dialog
        setShowAccountProfile(true);
        return;
      }

      // Profile exists and confirmed — proceed to sync
      proceedToSync(account);
    } catch {
      // If check fails, show dialog anyway
      setShowAccountProfile(true);
    }
  };

  const proceedToSync = (account: AdAccount) => {
    updateState({
      selectedAccount: account.id,
      selectedAccountName: account.account_name,
      selectedMetaAccountId: account.account_id_meta,
      dateRange: range,
    });
    setStep("data-sync");
  };

  const handleAccountProfileComplete = () => {
    setShowAccountProfile(false);
    if (selectedAccountData) {
      proceedToSync(selectedAccountData);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-2xl py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className={showAccountProfile ? "opacity-30 pointer-events-none" : ""}>
        <div className="container max-w-2xl py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Select Ad Account & Date Range
            </h2>
            <p className="text-muted-foreground mb-8">
              Choose the account and time window to analyze.
            </p>

            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No ad accounts found. Make sure your Meta account has active ad accounts.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setSelected(acc.id)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      selected === acc.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{acc.account_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {acc.account_id_meta} · {acc.currency}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">
                Date Range
              </label>
              <div className="flex gap-2">
                {DATE_RANGES.map((dr) => (
                  <button
                    key={dr.value}
                    onClick={() => setRange(dr.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      range === dr.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {dr.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="lg"
                className="gap-2"
                disabled={!selected}
                onClick={handleStartAnalysis}
              >
                Start Analysis <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => {
                  updateState({
                    selectedAccount: "mock-account",
                    selectedAccountName: "Mock Account",
                    selectedMetaAccountId: "act_123456",
                    dateRange: range,
                  });
                  setStep("data-sync");
                }}
              >
                Skip (Dev Mode)
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {selectedAccountData && (
        <AdAccountProfileDialog
          open={showAccountProfile}
          accountId={selectedAccountData.id}
          accountName={selectedAccountData.account_name}
          metaAccountId={selectedAccountData.account_id_meta}
          onComplete={handleAccountProfileComplete}
          onCancel={() => setShowAccountProfile(false)}
        />
      )}
    </>
  );
};
