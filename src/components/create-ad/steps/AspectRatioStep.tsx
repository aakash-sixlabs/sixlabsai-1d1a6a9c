import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

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
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">Choose your ad formats</h2>
      <p className="text-muted-foreground mb-8">
        Select one or more aspect ratios. We'll generate a creative for each format.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {RATIOS.map((r) => {
          const isSelected = selected.includes(r.value);
          return (
            <button
              key={r.value}
              onClick={() => toggle(r.value)}
              className={`relative p-5 rounded-lg border-2 text-center transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div
                className={`mx-auto mb-3 rounded border ${isSelected ? "border-primary/30 bg-primary/10" : "border-border bg-muted"}`}
                style={{ width: r.width, height: r.height }}
              />
              <p className="font-semibold text-foreground text-sm">{r.label}</p>
              <p className="text-xs text-muted-foreground">{r.value}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">{r.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={selected.length === 0} className="gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
