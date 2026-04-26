import { useState, useEffect, useRef } from "react";
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
  AlertCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { CreateAdState } from "../CreateAdFlow";

interface GenerationStage {
  icon: React.ElementType;
  label: string;
  detail: string;
  duration: number;
}

const STAGES: GenerationStage[] = [
  { icon: BarChart3, label: "Analyzing performance data", detail: "Reviewing your top-performing creatives and engagement patterns…", duration: 2400 },
  { icon: Brain, label: "Building creative strategy", detail: "Identifying the strongest message angle and visual direction…", duration: 3000 },
  { icon: Type, label: "Crafting copy", detail: "Writing benefit-first headlines with proven review language…", duration: 2200 },
  { icon: Palette, label: "Designing visual composition", detail: "Selecting colors, layout, and styling based on historical winners…", duration: 2800 },
  { icon: ImageIcon, label: "Generating creatives", detail: "Rendering your ad in the selected formats…", duration: 3200 },
];

const TIPS = [
  "Benefit-led headlines outperform feature-led by 2.3× on average.",
  "Ads using customer review language see 40% higher CTR.",
  "Warm, natural lighting drives more engagement for skincare brands.",
  "Short copy (under 125 characters) wins in feed placements.",
  "Video ads under 15s have the highest completion rates.",
];

interface GeneratingStepProps {
  state: CreateAdState;
}

export const GeneratingStep = ({ state }: GeneratingStepProps) => {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const jobIdRef = useRef<string | null>(null);
  const requestStartedRef = useRef(false);

  // Kick off the generation request once on mount
  useEffect(() => {
    if (requestStartedRef.current) return;
    requestStartedRef.current = true;

    (async () => {
      const { data, error } = await supabase.functions.invoke("generate-creatives", {
        body: state,
      });
      if (error) {
        setError(error.message ?? "Failed to generate creatives.");
        return;
      }
      if (data?.jobId) {
        jobIdRef.current = data.jobId;
      } else {
        setError("Generation service returned no job id.");
      }
    })();
  }, [state]);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Drive stages forward
  useEffect(() => {
    if (error) return;

    if (activeStage >= STAGES.length) {
      // Wait until we have a jobId before redirecting
      if (jobIdRef.current) {
        setDone(true);
        const timeout = setTimeout(
          () => navigate(`/output?jobId=${jobIdRef.current}`),
          800,
        );
        return () => clearTimeout(timeout);
      }
      // Poll briefly for the jobId
      const poll = setInterval(() => {
        if (jobIdRef.current) {
          clearInterval(poll);
          setDone(true);
          setTimeout(() => navigate(`/output?jobId=${jobIdRef.current}`), 400);
        }
      }, 250);
      return () => clearInterval(poll);
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
  }, [activeStage, navigate, error]);

  const overallProgress = done
    ? 100
    : ((completedStages.length + stageProgress / 100) / STAGES.length) * 100;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Generation failed</h2>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate("/home")}>Back to home</Button>
            <Button onClick={() => window.location.reload()}>Try again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg text-center"
      >
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

        <div className="mb-8">
          <Progress value={overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(overallProgress)}% complete
          </p>
        </div>

        <div className="space-y-3 text-left mb-10">
          {STAGES.map((stage, i) => {
            const isCompleted = completedStages.includes(i);
            const isActive = i === activeStage && !done;
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
                    isCompleted ? "bg-primary/10" : isActive ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted || isActive ? "text-foreground" : "text-muted-foreground"}`}>
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
