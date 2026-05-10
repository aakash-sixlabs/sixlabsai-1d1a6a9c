import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DotFieldBackground } from "./DotFieldBackground";
import { smoothScrollTo } from "@/lib/smoothScroll";

export const HeroSection = () => {
  const handleContact = () => {
    smoothScrollTo("#contact", { duration: 1200, offset: -64 });
  };
  return (
    <section className="relative pt-20 pb-28 px-6 overflow-hidden min-h-[90vh] flex flex-col items-center justify-center bg-background">
      <DotFieldBackground />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="font-display font-extrabold md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight text-foreground text-6xl">
          Make the ads your team needs next.
        </h1>

        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-body">
          Turn creative learnings into on-brand Meta ads — faster than any agency workflow.
        </p>

        <div className="mt-10">
          <Button
            size="lg"
            className="font-semibold rounded-xl px-10 h-13 text-base gap-2 shadow-lg shadow-primary/25"
            onClick={handleContact}
          >
            Get In Touch <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scroll indicator pinned to bottom */}
      <div className="absolute z-10 bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/30">
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>
    </section>
  );
};
