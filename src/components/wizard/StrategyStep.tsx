import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, MessageSquare, Palette, ImageIcon } from "lucide-react";

const MOCK_PRODUCT = {
  title: "Hydra-Glow Vitamin C Serum",
  type: "Skincare — Face Serum",
  benefits: ["Deep hydration", "Brightening glow", "Reduces dark spots", "Lightweight formula"],
  differentiators: ["20% Vitamin C concentration", "Vegan & cruelty-free", "Dermatologist tested"],
  reviewThemes: ["Noticeable glow within 2 weeks", "Non-greasy texture", "Great for sensitive skin"],
};

const STRATEGY = {
  angle: "Lead with hydration + glow benefit — strongest review theme and aligns with historical winners using benefit-led messaging.",
  visual: "Lifestyle composition: product in a bright, warm bathroom setting with natural light. Clean composition matches your account's top-performing visual style.",
  copy: "Short, benefit-first headline. Use customer review language ('noticeable glow') as social proof. Conversational, premium tone.",
  assets: "Use the hero product image with warm background. Avoid packshot-only composition per historical losers pattern.",
};

export const StrategyStep = () => {
  const { setStep } = useWizard();

  return (
    <div className="container max-w-4xl py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-foreground mb-2">Creative Strategy</h2>
        <p className="text-muted-foreground mb-8">
          Based on your historical performance patterns and product analysis.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Product Brief */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Product Brief</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Product</div>
                <div className="text-sm font-medium text-foreground">{MOCK_PRODUCT.title}</div>
                <div className="text-xs text-muted-foreground">{MOCK_PRODUCT.type}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Core Benefits</div>
                <div className="flex flex-wrap gap-1.5">
                  {MOCK_PRODUCT.benefits.map((b, i) => (
                    <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md">{b}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Differentiators</div>
                <div className="flex flex-wrap gap-1.5">
                  {MOCK_PRODUCT.differentiators.map((d, i) => (
                    <span key={i} className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-md">{d}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Top Review Themes</div>
                <ul className="space-y-1">
                  {MOCK_PRODUCT.reviewThemes.map((r, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-1.5">
                      <span className="text-warning">★</span> "{r}"
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Strategy */}
          <div className="space-y-4">
            {[
              { icon: MessageSquare, title: "Message Angle", text: STRATEGY.angle },
              { icon: Palette, title: "Visual Direction", text: STRATEGY.visual },
              { icon: MessageSquare, title: "Copy Direction", text: STRATEGY.copy },
              { icon: ImageIcon, title: "Asset Selection", text: STRATEGY.assets },
            ].map((s, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        <Button size="lg" className="gap-2" onClick={() => setStep("output")}>
          Generate Creative <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
};
