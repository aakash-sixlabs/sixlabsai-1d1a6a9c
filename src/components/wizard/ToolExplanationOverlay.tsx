import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Eye, Lightbulb, TrendingUp, RefreshCw } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Analyze Past Creative Performance",
    description: "We pull your historical ad data and break down which creatives drove results — and which didn't.",
  },
  {
    icon: Eye,
    title: "Competitive Intelligence",
    description: "Discover what your top competitors are running, what's working for them, and where the gaps are.",
  },
  {
    icon: TrendingUp,
    title: "Industry Trend Analysis",
    description: "Stay ahead with real-time insights into emerging creative trends in your brand's target market.",
  },
  {
    icon: Lightbulb,
    title: "Actionable Creative Recommendations",
    description: "Get a clear view of what works and what doesn't. We suggest improvements and produce new market-informed winning creatives for your campaigns.",
  },
  {
    icon: RefreshCw,
    title: "Continuous Learning & Optimization",
    description: "Every new creative's performance feeds back into the system. Each ad makes the next one better as the AI learns more about what drives your results.",
  },
];

interface ToolExplanationOverlayProps {
  open: boolean;
  onContinue: () => void;
}

export const ToolExplanationOverlay = ({ open, onContinue }: ToolExplanationOverlayProps) => {
  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-lg [&>button]:hidden max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl">Here's what CreativeGen will do for you</DialogTitle>
          <DialogDescription>We're about to sync your ad data. Here's what happens next.</DialogDescription>
        </DialogHeader>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-3 p-3 rounded-lg bg-secondary/50"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{feature.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
          <Button className="w-full gap-2 mt-2" size="lg" onClick={onContinue}>
            Let's Go <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
