import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { Copy, Download, RefreshCw, Sparkles, TrendingUp, MessageSquare, ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MOCK_COPY = {
  headline: "Your glow-up starts here",
  primaryText:
    "Real results in just 2 weeks. Our 20% Vitamin C Serum delivers deep hydration and a noticeable glow — no greasy formula, no fuss. Join thousands who've already made the switch.",
  cta: "Shop Now",
};

const RATIONALE = [
  "This creative uses a lifestyle composition because your historical winners frequently performed better with real-world product presentation than plain packshots.",
  "The headline is short and benefit-led because concise headlines correlated with 1.8x stronger engagement in your account.",
  "The copy highlights hydration and glow because those were the most common positive review themes on the PDP.",
  "We avoided text overlays and promo badges because that pattern appeared in 54% of your historical losers.",
];

const SOURCES = [
  { label: "Historical Winners", icon: TrendingUp },
  { label: "Review Language", icon: MessageSquare },
  { label: "PDP Image Selection", icon: ImageIcon },
];

export const OutputStep = () => {
  const { setStep } = useWizard();
  const [activeVariant, setActiveVariant] = useState(0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="container max-w-5xl py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Generated Creative</h2>
            <p className="text-muted-foreground">Your performance-informed ad creative is ready.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setStep("output")}>
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </Button>
            <Button size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" /> Download
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Creative Preview */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border bg-card overflow-hidden">
              {/* Variant tabs */}
              <div className="flex border-b">
                {["Primary Creative", "Variant B"].map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveVariant(i)}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                      activeVariant === i
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {/* Mock creative */}
              <div className="aspect-square bg-gradient-to-br from-primary/5 via-card to-accent/5 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <Sparkles className="w-12 h-12 text-primary mx-auto" />
                  <div className="font-display text-2xl font-bold text-foreground">
                    {MOCK_COPY.headline}
                  </div>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    [Generated static ad creative would appear here — lifestyle product image with warm lighting, clean composition]
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Copy & Rationale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generated Copy */}
            <div className="rounded-lg border bg-card p-5">
              <h3 className="font-display font-semibold text-foreground mb-4">Ad Copy</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Headline</span>
                    <button onClick={() => copyToClipboard(MOCK_COPY.headline)} className="text-muted-foreground hover:text-foreground">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-foreground">{MOCK_COPY.headline}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Primary Text</span>
                    <button onClick={() => copyToClipboard(MOCK_COPY.primaryText)} className="text-muted-foreground hover:text-foreground">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-foreground">{MOCK_COPY.primaryText}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">CTA</span>
                  <p className="text-sm font-medium text-primary mt-1">{MOCK_COPY.cta}</p>
                </div>
              </div>
            </div>

            {/* Rationale */}
            <div className="rounded-lg border bg-card p-5">
              <h3 className="font-display font-semibold text-foreground mb-3">Why This Was Generated</h3>
              <ul className="space-y-2.5">
                {RATIONALE.map((r, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5 shrink-0">→</span> {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sources */}
            <div className="flex flex-wrap gap-2">
              {SOURCES.map((s, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  <s.icon className="w-3 h-3" /> {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" onClick={() => setStep("pdp-input")}>
            Try Another Product
          </Button>
          <Button variant="outline" onClick={() => setStep("insights")}>
            Back to Insights
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
