import { Zap } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border mt-10 px-6 py-10 bg-card">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-[15px] text-foreground">
          SixLabs<span className="text-primary">.ai</span>
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} SixLabs AI. All rights reserved.
      </p>
    </div>
  </footer>
);
