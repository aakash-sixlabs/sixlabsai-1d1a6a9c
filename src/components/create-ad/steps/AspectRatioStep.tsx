import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  STEP_CONTAINER,
  STEP_HEADING,
  STEP_SUBTITLE,
  CARD_BASE,
  CARD_SELECTED,
  CARD_IDLE,
  CTA_SHAPE,
} from "./_shared";

const RATIOS = [
  { value: "1:1", label: "Square", desc: "Feed posts", width: 40, height: 40 },
  { value: "4:5", label: "Portrait", desc: "Feed ads", width: 36, height: 45 },
  { value: "9:16", label: "Story / Reel", desc: "Full screen vertical", width: 28, height: 50 },
  { value: "16:9", label: "Landscape", desc: "In-stream video", width: 50, height: 28 },
  { value: "1.91:1", label: "Link Ad", desc: "Link click ads", width: 50, height: 26 },
];

interface AspectRatioStepProps {
  selected: string[];
  onUpdate: (ratios: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AspectRatioStep = ({ selected, onUpdate, onNext, onBack }: AspectRatioStepProps) => {
  const toggle = (val: string) => {
    onUpdate(
      selected.includes(val)
        ? selected.filter((s) => s !== val)
        : [...selected, val]
    );
  };

  return (
    <div className={STEP_CONTAINER}>
      <h2 className={STEP_HEADING}>Choose your ad formats</h2>
      <p className={STEP_SUBTITLE}>
        Select one or more aspect ratios. We'll generate a creative for each format.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {RATIOS.map((r) => {
          const isSelected = selected.includes(r.value);
          return (
            <button
              key={r.value}
              onClick={() => toggle(r.value)}
              className={`${CARD_BASE} p-5 text-center ${isSelected ? CARD_SELECTED : CARD_IDLE}`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div
                className={`mx-auto mb-3 rounded-md border ${isSelected ? "border-primary/30 bg-primary/10" : "border-border bg-muted"}`}
                style={{ width: r.width, height: r.height }}
              />
              <p className="font-semibold text-foreground text-sm">{r.label}</p>
              <p className="text-xs text-muted-foreground">{r.value}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">{r.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className={CTA_SHAPE}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={selected.length === 0} className={CTA_SHAPE}>
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
