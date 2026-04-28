import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative pt-32 pb-28 px-6 overflow-hidden min-h-[90vh] flex flex-col items-center justify-center">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `linear-gradient(hsl(220 20% 70%) 1px, transparent 1px), linear-gradient(90deg, hsl(220 20% 70%) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Very subtle top gradient wash */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/[0.03] to-transparent" />

      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="font-display font-extrabold text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight text-foreground">
          AI Agents for Ad
          <br />
          Creative Teams
        </h1>

        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-body">
          AI that analyzes what's working, learns from every campaign,
          and generates creatives that win — all autonomously.
        </p>

        <div className="mt-10">
          <Button
            size="lg"
            className="font-semibold rounded-xl px-10 h-13 text-base gap-2 shadow-lg shadow-primary/25"
            onClick={() => navigate("/loginvcollect")}
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scroll indicator pinned to bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/30">
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>
    </section>
  );
};
