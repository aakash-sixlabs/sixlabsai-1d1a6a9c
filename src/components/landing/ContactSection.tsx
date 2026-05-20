import { Button } from "@/components/ui/button";

export const ContactSection = () => {
  return (
    <section id="contact" className="relative px-6 py-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl px-6 py-20 md:py-28 border border-white/10">
          {/* Base gradient using brand colors */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--signal)) 0%, hsl(252 70% 35%) 55%, hsl(var(--midnight)) 100%)",
            }}
            aria-hidden
          />

          {/* Soft radial glows for depth */}
          <div
            className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--signal) / 0.6), transparent 60%)",
            }}
            aria-hidden
          />
          <div
            className="absolute -bottom-40 -right-20 h-[32rem] w-[32rem] rounded-full opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--lilac) / 0.65), transparent 60%)",
            }}
            aria-hidden
          />

          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(hsl(0 0% 100% / 0.6) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
            aria-hidden
          />

          <div className="relative max-w-2xl mx-auto text-center">
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight">
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
                className="h-14 px-10 text-base font-display font-semibold rounded-xl bg-white text-midnight hover:bg-white/90 shadow-lg shadow-black/30"
              >
                <a href="mailto:badri@sixlabs.ai?subject=SixLabs%20Pilot%20Request">
                  Book a demo
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
