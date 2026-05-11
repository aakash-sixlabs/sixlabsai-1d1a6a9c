import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";

export const ContactSection = () => {
  return (
    <Section id="contact" className="px-6 py-24 scroll-mt-24">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground tracking-tight whitespace-nowrap">
          Stop guessing.{" "}
          <span className="bg-gradient-to-r from-primary to-[hsl(260_70%_58%)] bg-clip-text text-transparent">
            Start compounding.
          </span>
        </h2>
        <p className="mt-5 text-muted-foreground max-w-md mx-auto font-body leading-relaxed">
          Ship smarter ads, test faster, and turn creative performance into your next growth advantage.
        </p>

        <div className="mt-10">
          <Button
            asChild
            size="sm"
            className="font-semibold text-sm rounded-lg shadow-md shadow-primary/25"
          >
            <a href="mailto:badri@sixlabs.ai?subject=SixLabs%20Pilot%20Request">
              Start a pilot
            </a>
          </Button>
        </div>
      </div>
    </Section>
  );
};
