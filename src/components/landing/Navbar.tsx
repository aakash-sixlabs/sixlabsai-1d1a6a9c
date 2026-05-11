import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { smoothScrollTo } from "@/lib/smoothScroll";

export const Navbar = ({ scrollY }: { scrollY: number }) => {
  const handleContact = () => {
    smoothScrollTo("#contact", { duration: 1200, offset: -64 });
  };

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrollY > 40 ? "bg-white/80 backdrop-blur-xl border-b border-border/60 shadow-sm" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <Logo heightClass="h-16" />

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <button onClick={() => scrollToSection("how-it-works")} className="hover:text-foreground transition-colors">
            How it works
          </button>
          <button onClick={() => scrollToSection("signals")} className="hover:text-foreground transition-colors">
            Signals
          </button>
          <button onClick={() => scrollToSection("solution")} className="hover:text-foreground transition-colors">
            The Loop
          </button>
        </div>

        <Button
          size="sm"
          className="font-semibold text-sm rounded-lg shadow-md shadow-primary/25"
          onClick={handleContact}
        >
          Get Started
        </Button>
      </div>
    </nav>
  );
};
