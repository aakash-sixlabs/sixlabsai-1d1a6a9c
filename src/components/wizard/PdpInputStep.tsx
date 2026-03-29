import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Link2 } from "lucide-react";
import { useState } from "react";

export const PdpInputStep = () => {
  const navigate = useNavigate();
  const { updateState, state } = useWizard();
  const [url, setUrl] = useState(state.pdpUrl);
  const [objective, setObjective] = useState(state.objective);
  const [format, setFormat] = useState(state.formatPreference);
  const [notes, setNotes] = useState(state.notes);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!url.trim()) { setError("Please enter a Shopify product URL"); return; }
    if (!url.includes("http")) { setError("Please enter a valid URL starting with https://"); return; }
    setError("");
    updateState({ pdpUrl: url, objective, formatPreference: format, notes });
    navigate("/pdp-scrape");
  };

  return (
    <div className="container max-w-xl py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-foreground mb-2">Enter Shopify Product URL</h2>
        <p className="text-muted-foreground mb-8">Paste the product page URL for the product you want to advertise.</p>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Shopify Product URL *</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input placeholder="https://yourstore.myshopify.com/products/..." value={url} onChange={(e) => setUrl(e.target.value)} className="pl-9" />
            </div>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Campaign Objective</label>
            <div className="flex gap-2">
              {["conversions", "traffic", "awareness"].map((o) => (
                <button key={o} onClick={() => setObjective(o)} className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${objective === o ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{o}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Creative Format</label>
            <div className="flex gap-2">
              {[{ v: "single", l: "Single Image" }, { v: "carousel", l: "Carousel" }, { v: "auto", l: "Let System Decide" }].map((o) => (
                <button key={o.v} onClick={() => setFormat(o.v)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${format === o.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{o.l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Optional Notes</label>
            <Textarea placeholder="e.g., focus on premium feel, highlight hydration benefit..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <Button size="lg" className="gap-2" onClick={handleSubmit}>Analyze Product <ArrowRight className="w-4 h-4" /></Button>
        </div>
      </motion.div>
    </div>
  );
};
