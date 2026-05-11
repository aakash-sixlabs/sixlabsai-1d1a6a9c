import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeedbackLoopSection } from "@/components/landing/FeedbackLoopSection";
import { PilotMetricsSection } from "@/components/landing/PilotMetricsSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";

export default function SixLabsLanding() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar scrollY={scrollY} />
      <HeroSection />
      <HowItWorksSection />
      <FeedbackLoopSection />
      <PilotMetricsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
