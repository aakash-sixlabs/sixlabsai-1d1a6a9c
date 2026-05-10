import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";

export const ContactSection = () => {
  return (
    <Section id="contact" className="px-6 py-24 scroll-mt-24">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground tracking-tight">
          Stop guessing.{" "}
          <span className="bg-gradient-to-r from-primary to-[hsl(260_70%_58%)] bg-clip-text text-transparent">
            Start compounding.
          </span>
        </h2>
        <p className="mt-5 text-muted-foreground max-w-md mx-auto font-body leading-relaxed">
          Tell us about your brand and the ads you want to ship next. We'll get
          back within one business day.
        </p>

        <div className="mt-10">
          <Button
            asChild
            size="lg"
            className="font-semibold rounded-xl px-8 h-12 text-[15px] gap-2 shadow-lg shadow-primary/25"
          >
            <a href="mailto:hello@sixlabs.ai">
              <Mail className="w-4 h-4" />
              hello@sixlabs.ai
            </a>
          </Button>
        </div>
      </div>
    </Section>
  );
};
