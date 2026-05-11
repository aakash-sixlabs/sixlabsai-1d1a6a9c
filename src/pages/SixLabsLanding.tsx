import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ClosedLoopSection } from "@/components/landing/ClosedLoopSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";

export default function SixLabsLanding() {
  const [scrollY, setScrollY] = useState(0);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("easter_egg_access") === "true") {
      setAllowed(true);
    } else {
      navigate("/loginvcollect", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!allowed) return null;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar scrollY={scrollY} />
      <HeroSection />
      <HowItWorksSection />
      <ClosedLoopSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
