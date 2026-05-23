import { lazy, Suspense, useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { SixLabsWorkflowVisual } from "@/components/landing/SixLabsWorkflowVisual";
//import { ProblemSection } from "@/components/landing/ProblemSection";
import { ProofStrip } from "@/components/landing/ProofStrip";
import { useInView } from "@/components/landing/useInView";
import { SectionTransition, SectionReveal } from "@/components/landing/SectionTransition";

const ProblemSectionV2 = lazy(() =>
  import("@/components/landing/ProblemSectionV2").then((module) => ({ default: module.ProblemSectionV2 })),
);
const ProductSection = lazy(() => import("@/components/landing/ProductSectionV2"));
const ContactSection = lazy(() =>
  import("@/components/landing/ContactSection").then((module) => ({ default: module.ContactSection })),
);
const Footer = lazy(() =>
  import("@/components/landing/Footer").then((module) => ({ default: module.Footer })),
);

export default function SixLabsLanding() {
  const [scrollY, setScrollY] = useState(0);
  const { ref: deferredRef, visible: showDeferredSections } = useInView(0.01);

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
      {/* <ProblemSection /> */}
      <div ref={deferredRef} className="min-h-px">
        {showDeferredSections && (
          <Suspense fallback={null}>
            <ProblemSectionV2 />
            <ProductSection />
            <ContactSection />
            <Footer />
          </Suspense>
        )}
      </div>
    </div>
  );
}
