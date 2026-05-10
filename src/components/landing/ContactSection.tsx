import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";

export const ContactSection = () => {
  return (
    <Section id="contact" className="px-6 py-24 scroll-mt-24">
      <div className="max-w-2xl mx-auto text-center">
        <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-primary/80 mb-4">
          Contact
        </span>
        <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground tracking-tight">
          Let's talk.
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
