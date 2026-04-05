import { useNavigate } from "react-router-dom";
import { OutputStep } from "@/components/wizard/OutputStep";
import { AppShell } from "@/components/layout/AppShell";

const PHASES = ["Goal", "Details", "Review"];
const activePhase = 2;

const Output = () => {
  const navigate = useNavigate();

  const progressIndicator = (
    <div className="flex items-center gap-3">
      {PHASES.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= activePhase ? "bg-primary" : "bg-white/20"
            }`}
          />
          <span
            className={`text-xs hidden sm:inline transition-colors ${
              i === activePhase
                ? "text-white font-medium"
                : i < activePhase
                ? "text-white/60"
                : "text-white/30"
            }`}
          >
            {label}
          </span>
          {i < PHASES.length - 1 && (
            <div className={`w-6 h-px ${i < activePhase ? "bg-primary/40" : "bg-white/15"}`} />
          )}
        </div>
      ))}
    </div>
  );

  const backButton = (
    <button
      onClick={() => navigate("/home")}
      className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
    >
      ← Back
    </button>
  );

  return (
    <AppShell headerLeft={backButton} headerRight={progressIndicator}>
      <div className="flex-1">
        <OutputStep />
      </div>
    </AppShell>
  );
};

export default Output;
