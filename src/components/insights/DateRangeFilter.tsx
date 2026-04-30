import { Calendar } from "lucide-react";

export type DateRangeKey = "7" | "14" | "30" | "90" | "all";

const OPTIONS: { key: DateRangeKey; label: string }[] = [
  { key: "7", label: "7d" },
  { key: "14", label: "14d" },
  { key: "30", label: "30d" },
  { key: "90", label: "90d" },
  { key: "all", label: "All time" },
];

interface DateRangeFilterProps {
  value: DateRangeKey;
  onChange: (v: DateRangeKey) => void;
}

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-card p-1 shadow-sm">
      <Calendar className="w-3.5 h-3.5 text-muted-foreground ml-2" />
      {OPTIONS.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
