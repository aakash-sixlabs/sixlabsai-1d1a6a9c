import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { SignalsSection } from "@/components/landing/SignalsSection";
import { ClosedLoopSection } from "@/components/landing/ClosedLoopSection";
import { DifferentiatorSection } from "@/components/landing/DifferentiatorSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { ConnectorBlock } from "@/components/landing/Connector";

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
      <ConnectorBlock />
      <HowItWorksSection />
      <ConnectorBlock />
      <SignalsSection />
      <ConnectorBlock />
      <ClosedLoopSection />
      <ConnectorBlock />
      <DifferentiatorSection />
      <ConnectorBlock />
      <SocialProofSection />
      <ConnectorBlock />
      <CTASection />
      <Footer />
    </div>
  );
}
