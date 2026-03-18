import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown, Lightbulb, BarChart3 } from "lucide-react";

const MOCK_STATS = {
  total: 214,
  supported: 176,
  winners: 35,
  losers: 35,
};

const WINNING = [
  { pattern: "Lifestyle imagery with product in use", pct: "68% of winners vs 29% of losers" },
  { pattern: "Short benefit-led headlines (< 8 words)", pct: "74% of top performers" },
  { pattern: "Bright, warm color backgrounds", pct: "Correlates with 1.8x higher CTR" },
  { pattern: "Single hero product focus", pct: "61% of winners use clean composition" },
];

const LOSING = [
  { pattern: "Product-only packshots on white", pct: "54% of losers" },
  { pattern: "Dense text overlays with promo badges", pct: "Correlates with 0.6x CTR" },
  { pattern: "Long descriptive headlines (12+ words)", pct: "Found in 48% of underperformers" },
  { pattern: "Heavy discount-led messaging", pct: "Underperforms benefit-led by 40%" },
];

const RECS = [
  "Lead with lifestyle product usage, not isolated product shots",
  "Keep headlines concise and benefit-first",
  "Use bright, contextual backgrounds over plain white",
  "Avoid cluttered overlays when possible",
];

export const InsightsStep = () => {
  const { setStep } = useWizard();

  return (
    <div className="container max-w-4xl py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Historical Insights</h2>
        </div>
        <p className="text-muted-foreground mb-8">
          Here's what we learned from {MOCK_STATS.supported} supported creatives in your account.
        </p>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Ads", value: MOCK_STATS.total, color: "text-foreground" },
            { label: "Supported", value: MOCK_STATS.supported, color: "text-primary" },
            { label: "Winners (Top 20%)", value: MOCK_STATS.winners, color: "text-success" },
            { label: "Losers (Bottom 20%)", value: MOCK_STATS.losers, color: "text-destructive" },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-lg border bg-card text-center">
              <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Winning */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-success" />
              <h3 className="font-display font-semibold text-foreground">Winning Patterns</h3>
            </div>
            <div className="space-y-4">
              {WINNING.map((w, i) => (
                <div key={i} className="border-l-2 border-success pl-3">
                  <div className="text-sm font-medium text-foreground">{w.pattern}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{w.pct}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Losing */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <h3 className="font-display font-semibold text-foreground">Losing Patterns</h3>
            </div>
            <div className="space-y-4">
              {LOSING.map((l, i) => (
                <div key={i} className="border-l-2 border-destructive pl-3">
                  <div className="text-sm font-medium text-foreground">{l.pattern}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{l.pct}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-lg border bg-card p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-warning" />
            <h3 className="font-display font-semibold text-foreground">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {RECS.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary mt-0.5">→</span> {r}
              </li>
            ))}
          </ul>
        </div>

        <Button size="lg" className="gap-2" onClick={() => setStep("pdp-input")}>
          Generate a Creative for a Product <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
};
