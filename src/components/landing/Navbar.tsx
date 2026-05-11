import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Navbar = ({ scrollY }: { scrollY: number }) => {
  const navigate = useNavigate();
  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrollY > 40 ? "bg-white/80 backdrop-blur-xl border-b border-border/60 shadow-sm" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <Logo heightClass="h-16" />
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#signals" className="hover:text-foreground transition-colors">Signals</a>
          <a href="#loop" className="hover:text-foreground transition-colors">The Loop</a>
        </div>
        <Button
          size="sm"
          className="font-semibold text-sm rounded-lg shadow-md shadow-primary/25"
          onClick={() => navigate("/loginvcollect")}
        >
          Get Started
        </Button>
      </div>
    </nav>
  );
};
