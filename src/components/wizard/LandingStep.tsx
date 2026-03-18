import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ShoppingBag, Sparkles, Target } from "lucide-react";
import heroVisual from "@/assets/hero-visual.jpg";

const features = [
  {
    icon: BarChart3,
    title: "Analyze Historical Performance",
    desc: "Connect your Meta Ads account and discover what creative patterns drove results.",
  },
  {
    icon: ShoppingBag,
    title: "Understand Your Product",
    desc: "Paste a Shopify product URL — we extract everything needed for a great ad.",
  },
  {
    icon: Sparkles,
    title: "Generate Informed Creatives",
    desc: "Get static ad creatives and copy grounded in your own performance data.",
  },
  {
    icon: Target,
    title: "Know Why It Works",
    desc: "Every output comes with rationale tied to your historical winners.",
  },
];

export const LandingStep = () => {
  const { setStep } = useWizard();

  return (
    <div className="container py-16 lg:py-24">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm font-semibold text-primary mb-3 tracking-wide uppercase">
            Performance-Informed Creative Generation
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground leading-tight mb-6">
            Generate better Meta ad creatives using{" "}
            <span className="text-gradient">your own past performance</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg">
            Connect your Meta Ads account, learn what creative patterns
            historically worked for your brand, paste a Shopify product URL,
            and generate new static ad creatives informed by real data.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => setStep("meta-connect")}
              className="gap-2"
            >
              Connect Meta <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              See How It Works
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              ✓ Static single-image & carousel ads
            </span>
            <span className="flex items-center gap-1.5">
              ✓ Shopify product pages
            </span>
            <span className="flex items-center gap-1.5">
              ✓ Copy + rationale included
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <img
            src={heroVisual}
            alt="Performance-informed creative generation visualization"
            className="rounded-lg shadow-2xl border"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((f, i) => (
          <div
            key={i}
            className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">
              {f.title}
            </h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
