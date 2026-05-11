import { Button } from "@/components/ui/button";
import { Section } from "./Section";

export const ContactSection = () => {
  return (
    <Section id="contact" className="px-6 py-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl px-6 py-20 md:py-28 shadow-2xl shadow-primary/20">
          {/* Base gradient — brand blue into deep purple */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, hsl(220 80% 52%) 0%, hsl(245 75% 50%) 45%, hsl(265 70% 45%) 100%)",
            }}
            aria-hidden
          />

          {/* Soft radial glows for depth */}
          <div
            className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(circle, hsl(220 90% 70% / 0.55), transparent 60%)" }}
            aria-hidden
          />
          <div
            className="absolute -bottom-40 -right-20 h-[32rem] w-[32rem] rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(circle, hsl(280 85% 65% / 0.55), transparent 60%)" }}
            aria-hidden
          />

          {/* Subtle dot grid texture */}
          <div
            className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
            style={{
              backgroundImage: "radial-gradient(hsl(0 0% 100% / 0.6) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
            aria-hidden
          />

          {/* Top highlight sheen */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.5), transparent)" }}
            aria-hidden
          />

          <div className="relative max-w-2xl mx-auto text-center">
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight whitespace-nowrap">
              Stop guessing.{" "}
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Start compounding.
              </span>
            </h2>
            <p className="mt-5 text-white/80 max-w-md mx-auto font-body leading-relaxed">
              Ship smarter ads, test faster, and turn creative performance into your next growth advantage.
            </p>

            <div className="mt-10">
              <Button
                asChild
                className="h-14 px-10 text-base font-semibold rounded-xl bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/20"
              >
                <a href="mailto:badri@sixlabs.ai?subject=SixLabs%20Pilot%20Request">Start a pilot</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
