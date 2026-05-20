import { Logo } from "@/components/Logo";
import { smoothScrollTo } from "@/lib/smoothScroll";

export const Navbar = ({ scrollY }: { scrollY: number }) => {
  const handleContact = () =>
    smoothScrollTo("#contact", { duration: 1100, offset: -64 });

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrolled = scrollY > 24;

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[hsl(229_64%_5%/0.75)] backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-between h-16 md:h-[72px] px-5 md:px-8">
        {/* Left: logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center"
          aria-label="SixLabs home"
        >
          <Logo variant="light" heightClass="h-9 md:h-10" />
        </button>

        {/* Center: nav */}
        <div className="hidden md:flex items-center gap-9 text-[14px] text-white/70">
          <button
            onClick={() => scrollToSection("pipeline")}
            className="hover:text-white transition-colors font-display"
          >
            Platform
          </button>
          <button
            onClick={() => scrollToSection("pipeline")}
            className="hover:text-white transition-colors font-display"
          >
            Solutions
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="hover:text-white transition-colors font-display"
          >
            Resources
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="hover:text-white transition-colors font-display"
          >
            Company
          </button>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={handleContact}
            className="hidden sm:inline text-[14px] text-white/80 hover:text-white transition-colors font-display"
          >
            Log in
          </button>
          <button
            onClick={handleContact}
            className="text-[14px] font-display font-semibold text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl border border-lilac/70 hover:bg-lilac/10 transition-colors"
          >
            Book a demo
          </button>
        </div>
      </div>
    </nav>
  );
};
