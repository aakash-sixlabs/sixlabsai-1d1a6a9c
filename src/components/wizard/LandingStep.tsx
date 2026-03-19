import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  Link,
  BarChart3,
  ShoppingBag,
  Wand2,
  TrendingUp,
  FileText,
  Rocket,
} from "lucide-react";

const steps = [
  { num: 1, label: "Connect Meta", icon: Link, desc: "Link your ad account" },
  { num: 2, label: "Analyze Performance", icon: BarChart3, desc: "Discover winning patterns" },
  { num: 3, label: "Add Product", icon: ShoppingBag, desc: "Paste a Shopify URL" },
  { num: 4, label: "Generate Creatives", icon: Wand2, desc: "Get data-informed ads" },
];

const valuePills = [
  { icon: TrendingUp, label: "Data-driven creatives" },
  { icon: ShoppingBag, label: "Shopify product extraction" },
  { icon: FileText, label: "Copy + rationale included" },
];

export const LandingStep = () => {
  const { setStep } = useWizard();

  return (
    <div className="container max-w-3xl py-16 lg:py-24 flex flex-col items-center text-center">
      {/* Welcome heading */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <div className="inline-flex items-center gap-2 text-primary mb-4">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-semibold tracking-wide uppercase">
            Welcome to CreativeGen
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground leading-tight mb-3">
          Generate Meta ad creatives informed by{" "}
          <span className="text-gradient">your actual performance data</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Connect your Meta Ads account, analyze what worked, add a product, and
          get creatives grounded in real results.
        </p>
      </motion.div>

      {/* Primary CTA card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full mb-14"
      >
        <Card className="border-primary/20 bg-primary/5 shadow-lg">
          <CardContent className="flex flex-col items-center py-10 px-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Let's create your first ad
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              We'll guide you through connecting your Meta account, analyzing
              performance, and generating creatives — it only takes a few
              minutes.
            </p>
            <Button
              size="lg"
              onClick={() => setStep("meta-connect")}
              className="gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* How it works stepper */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full mb-12"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-6">
          Here's how it works
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center rounded-lg border bg-card p-5"
            >
              <span className="absolute -top-3 left-4 text-xs font-bold bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                {s.num}
              </span>
              <s.icon className="w-5 h-5 text-primary mb-2" />
              <span className="font-semibold text-sm text-foreground">
                {s.label}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {s.desc}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Value prop pills */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-wrap justify-center gap-3"
      >
        {valuePills.map((v, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground"
          >
            <v.icon className="w-4 h-4 text-primary" />
            {v.label}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
