import { Logo } from "@/components/Logo";

export const Footer = () => (
  <footer className="border-t border-white/10 mt-10 px-6 py-10 bg-midnight">
    <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <Logo variant="light" heightClass="h-10" />
      <p className="text-xs text-white/50 font-body">
        © {new Date().getFullYear()} SixLabs AI. All rights reserved.
      </p>
    </div>
  </footer>
);
