import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative pt-28 pb-24 px-6 overflow-hidden">
      {/* Gradient blob */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-primary/12 via-[hsl(260_70%_60%/0.08)] to-transparent rounded-full blur-[100px]" />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(220 30% 70%) 1px, transparent 1px), linear-gradient(90deg, hsl(220 30% 70%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground mb-8 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Self-improving creative intelligence for Meta ads
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground">
          Your ads don't just perform.{" "}
          <span className="bg-gradient-to-r from-primary to-[hsl(260_70%_58%)] bg-clip-text text-transparent">
            They evolve.
          </span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed font-body">
          Connect your Meta account. We decompose every creative into performance signals, generate new winners, and learn from every campaign you run.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="font-semibold rounded-xl px-8 h-12 text-[15px] gap-2 shadow-lg shadow-primary/30"
            onClick={() => navigate("/login")}
          >
            Connect Meta Account <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl px-8 h-12 text-[15px]"
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
          >
            See how it works
          </Button>
        </div>

        <div className="mt-16 flex flex-col items-center gap-2 text-muted-foreground/40">
          <span className="text-[11px] font-mono tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
};
