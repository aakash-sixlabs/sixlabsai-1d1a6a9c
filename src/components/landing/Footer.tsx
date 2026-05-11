import { Logo } from "@/components/Logo";

export const Footer = () => (
  <footer className="border-t border-border mt-10 px-6 py-10 bg-background">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <Logo heightClass="h-14" />
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} SixLabs AI. All rights reserved.
      </p>
    </div>
  </footer>
);
