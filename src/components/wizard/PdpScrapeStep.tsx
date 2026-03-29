import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWizard } from "@/context/WizardContext";
import { useEffect, useState } from "react";
import { Check, Loader2, Globe } from "lucide-react";

const SCRAPE_STEPS = [
  "Validating URL",
  "Loading product page",
  "Extracting product details",
  "Extracting images",
  "Extracting reviews",
  "Building product brief",
];

export const PdpScrapeStep = () => {
  const navigate = useNavigate();
  const { updateState } = useWizard();
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => {
        if (prev >= SCRAPE_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => { updateState({ scrapeComplete: true }); navigate("/strategy"); }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container max-w-lg py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"><Globe className="w-8 h-8 text-primary" /></div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing Product</h2>
        <p className="text-muted-foreground mb-10">Scraping and understanding your product…</p>
        <div className="space-y-4 text-left max-w-sm mx-auto">
          {SCRAPE_STEPS.map((step, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${done ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : active ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <span className={`text-sm ${done || active ? "text-foreground" : "text-muted-foreground"} ${active ? "font-medium" : ""}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
