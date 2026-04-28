import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar = ({ scrollY }: { scrollY: number }) => {
  const navigate = useNavigate();
  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrollY > 40 ? "bg-white/80 backdrop-blur-xl border-b border-border/60 shadow-sm" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-[17px] tracking-tight text-foreground">SixLabs</span>
          <span className="text-[10px] font-mono text-primary bg-primary/8 rounded px-1.5 py-0.5 ml-1">AI</span>
        </div>
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
