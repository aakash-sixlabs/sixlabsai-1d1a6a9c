import { useNavigate } from "react-router-dom";
import { OutputStep } from "@/components/wizard/OutputStep";

const PHASES = ["Goal", "Details", "Review"];
const activePhase = 2; // Output is the final phase

const Output = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-2xl flex items-center justify-between h-12">
          <button
            onClick={() => navigate("/insights")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            {PHASES.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i <= activePhase ? "bg-primary" : "bg-muted"
                  }`}
                />
                <span
                  className={`text-xs hidden sm:inline transition-colors ${
                    i === activePhase
                      ? "text-foreground font-medium"
                      : i < activePhase
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {label}
                </span>
                {i < PHASES.length - 1 && (
                  <div className={`w-6 h-px ${i < activePhase ? "bg-primary/40" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <OutputStep />
      </main>
    </div>
  );
};

export default Output;
