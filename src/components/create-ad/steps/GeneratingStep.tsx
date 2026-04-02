import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  BarChart3,
  Palette,
  Type,
  ImageIcon,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GenerationStage {
  icon: React.ElementType;
  label: string;
  detail: string;
  duration: number; // ms to spend on this stage
}

const STAGES: GenerationStage[] = [
  {
    icon: BarChart3,
    label: "Analyzing performance data",
    detail: "Reviewing your top-performing creatives and engagement patterns…",
    duration: 2400,
  },
  {
    icon: Brain,
    label: "Building creative strategy",
    detail: "Identifying the strongest message angle and visual direction…",
    duration: 3000,
  },
  {
    icon: Type,
    label: "Crafting copy",
    detail: "Writing benefit-first headlines with proven review language…",
    duration: 2200,
  },
  {
    icon: Palette,
    label: "Designing visual composition",
    detail: "Selecting colors, layout, and styling based on historical winners…",
    duration: 2800,
  },
  {
    icon: ImageIcon,
    label: "Generating creatives",
    detail: "Rendering your ad in the selected formats…",
    duration: 3200,
  },
];

const TIPS = [
  "Benefit-led headlines outperform feature-led by 2.3× on average.",
  "Ads using customer review language see 40% higher CTR.",
  "Warm, natural lighting drives more engagement for skincare brands.",
  "Short copy (under 125 characters) wins in feed placements.",
  "Video ads under 15s have the highest completion rates.",
];

export const GeneratingStep = () => {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [done, setDone] = useState(false);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Drive stages forward
  useEffect(() => {
    if (activeStage >= STAGES.length) {
      setDone(true);
      const timeout = setTimeout(() => navigate("/output"), 1200);
      return () => clearTimeout(timeout);
    }

    const stage = STAGES[activeStage];
    const tickInterval = 50;
    const totalTicks = stage.duration / tickInterval;
    let tick = 0;

    const interval = setInterval(() => {
      tick++;
      setStageProgress(Math.min((tick / totalTicks) * 100, 100));
      if (tick >= totalTicks) {
        clearInterval(interval);
        setCompletedStages((prev) => [...prev, activeStage]);
        setTimeout(() => {
          setStageProgress(0);
          setActiveStage((s) => s + 1);
        }, 400);
      }
    }, tickInterval);

    return () => clearInterval(interval);
  }, [activeStage, navigate]);

  const overallProgress = done
    ? 100
    : ((completedStages.length + stageProgress / 100) / STAGES.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg text-center"
      >
        {/* Animated icon */}
        <motion.div
          className="mx-auto mb-8 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
          animate={{ rotate: done ? 0 : [0, 5, -5, 0] }}
          transition={{ repeat: done ? 0 : Infinity, duration: 2, ease: "easeInOut" }}
        >
          {done ? (
            <CheckCircle2 className="w-8 h-8 text-primary" />
          ) : (
            <Sparkles className="w-8 h-8 text-primary" />
          )}
        </motion.div>

        <h2 className="text-2xl font-bold text-foreground mb-2">
          {done ? "Your creatives are ready!" : "Creating your ad…"}
        </h2>
        <p className="text-muted-foreground mb-8 text-sm">
          {done
            ? "Redirecting you to your new creatives."
            : "Sit back — this usually takes about 15 seconds."}
        </p>

        {/* Overall progress */}
        <div className="mb-8">
          <Progress value={overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(overallProgress)}% complete
          </p>
        </div>

        {/* Stage list */}
        <div className="space-y-3 text-left mb-10">
          {STAGES.map((stage, i) => {
            const isCompleted = completedStages.includes(i);
            const isActive = i === activeStage && !done;
            const isPending = i > activeStage;
            const Icon = stage.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/5 border border-primary/20"
                    : isCompleted
                    ? "bg-card border border-border"
                    : "opacity-40"
                }`}
              >
                <div
                  className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCompleted
                      ? "bg-primary/10"
                      : isActive
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted || isActive
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {stage.label}
                  </p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-muted-foreground mt-1"
                    >
                      {stage.detail}
                    </motion.p>
                  )}
                </div>
                {isCompleted && (
                  <span className="text-xs text-primary font-medium mt-1">Done</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Rotating tips */}
        {!done && (
          <div className="border-t border-border pt-6">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-2">
              Did you know?
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-muted-foreground italic"
              >
                {TIPS[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};
