import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { SixLabsWorkflowVisual } from "@/components/landing/SixLabsWorkflowVisual";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ProofStrip } from "@/components/landing/ProofStrip";
import { ProductSection } from "@/components/landing/ProductSection";
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
    <div className="min-h-screen bg-midnight text-white overflow-x-hidden font-body">
      <Navbar scrollY={scrollY} />
      <HeroSection />
      <SixLabsWorkflowVisual />
      <ProofStrip />
      <ProblemSection />
      <ProductSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
