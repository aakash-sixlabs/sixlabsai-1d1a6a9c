import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, RefreshCw, X, Pencil, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

/* ── Mock creatives ── */
const MOCK_CREATIVES = Array.from({ length: 12 }, (_, i) => ({
  id: `creative-${i + 1}`,
  label: `Variant ${i + 1}`,
  gradient: [
    "from-primary/20 via-accent/10 to-secondary",
    "from-accent/20 via-primary/10 to-muted",
    "from-warning/20 via-accent/10 to-card",
    "from-primary/30 via-muted to-accent/10",
    "from-secondary via-primary/5 to-accent/15",
    "from-accent/25 via-card to-primary/10",
  ][i % 6],
}));

export const OutputStep = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const selectedCreative = MOCK_CREATIVES.find((c) => c.id === selected);
  const selectedIndex = MOCK_CREATIVES.findIndex((c) => c.id === selected);

  const navigateCreative = (dir: 1 | -1) => {
    const next = selectedIndex + dir;
    if (next >= 0 && next < MOCK_CREATIVES.length) {
      setSelected(MOCK_CREATIVES[next].id);
      setEditingId(null);
      setEditText("");
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setEditText("");
  };

  const submitEdit = () => {
    if (!editText.trim()) return;
    toast.success("Edit submitted — regenerating creative…");
    setEditingId(null);
    setEditText("");
  };

  const downloadAll = () => toast.success("Downloading all creatives…");
  const regenerateAll = () => toast.success("Regenerating all creatives…");

  return (
    <div className="container max-w-6xl py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground font-display">Your Creatives</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {MOCK_CREATIVES.length} creatives generated. Click to enlarge, edit, or download.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={regenerateAll}>
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate All
            </Button>
            <Button size="sm" className="gap-1.5" onClick={downloadAll}>
              <Download className="w-3.5 h-3.5" /> Download All
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_CREATIVES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group relative rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:shadow-md transition-all"
              onClick={() => { setSelected(c.id); setEditingId(null); setEditText(""); }}
            >
              <div className={`aspect-square bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
                <span className="text-3xl font-bold text-foreground/20 font-display">{i + 1}</span>
              </div>
              <div className="px-3 py-2.5 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{c.label}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted"
                  onClick={(e) => { e.stopPropagation(); setSelected(c.id); handleEdit(c.id); }}
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back */}
        <div className="mt-8">
          <Button variant="outline" onClick={() => navigate("/create-ad")}>
            ← Create Another Ad
          </Button>
        </div>
      </motion.div>

      {/* ── Lightbox Dialog ── */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setEditingId(null); } }}>
        <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden bg-card border-border">
          {selectedCreative && (
            <div className="flex flex-col">
              {/* Image area */}
              <div className="relative">
                <div className={`aspect-[4/3] bg-gradient-to-br ${selectedCreative.gradient} flex items-center justify-center`}>
                  <span className="text-6xl font-bold text-foreground/15 font-display">{selectedIndex + 1}</span>
                </div>

                {/* Nav arrows */}
                {selectedIndex > 0 && (
                  <button
                    onClick={() => navigateCreative(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                )}
                {selectedIndex < MOCK_CREATIVES.length - 1 && (
                  <button
                    onClick={() => navigateCreative(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-foreground">{selectedCreative.label}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleEdit(selectedCreative.id)}>
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={() => toast.success("Downloading…")}>
                      <Download className="w-3.5 h-3.5" /> Download
                    </Button>
                  </div>
                </div>

                {/* Edit panel */}
                <AnimatePresence>
                  {editingId === selectedCreative.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
                        <p className="text-sm font-medium text-foreground">What would you like to change?</p>
                        <Textarea
                          placeholder="e.g. Make the background warmer, add a badge with '20% OFF', change the headline…"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="resize-none bg-card"
                          rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                            <X className="w-3.5 h-3.5 mr-1" /> Cancel
                          </Button>
                          <Button size="sm" onClick={submitEdit} disabled={!editText.trim()}>
                            <Check className="w-3.5 h-3.5 mr-1" /> Submit Edit
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
