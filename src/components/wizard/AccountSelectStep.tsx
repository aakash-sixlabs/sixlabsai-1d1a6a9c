import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";
import { useState } from "react";

const MOCK_ACCOUNTS = [
  { id: "act_123", name: "Brand Store – US", spend: "$42,350", ads: 214 },
  { id: "act_456", name: "Brand Store – EU", spend: "$18,720", ads: 89 },
  { id: "act_789", name: "DTC Summer Campaign", spend: "$8,150", ads: 43 },
];

const DATE_RANGES = [
  { value: "90", label: "Last 90 days" },
  { value: "180", label: "Last 180 days" },
  { value: "custom", label: "Custom range" },
];

export const AccountSelectStep = () => {
  const { setStep, updateState } = useWizard();
  const [selected, setSelected] = useState<string | null>(null);
  const [range, setRange] = useState("90");

  return (
    <div className="container max-w-2xl py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Select Ad Account & Date Range
        </h2>
        <p className="text-muted-foreground mb-8">
          Choose the account and time window to analyze.
        </p>

        <div className="space-y-3 mb-8">
          {MOCK_ACCOUNTS.map((acc) => (
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
                  <div className="font-semibold text-foreground">{acc.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {acc.ads} ads · {acc.spend} spend
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

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

        <Button
          size="lg"
          className="gap-2"
          disabled={!selected}
          onClick={() => {
            updateState({ selectedAccount: selected, dateRange: range });
            setStep("data-sync");
          }}
        >
          Start Analysis <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
};
