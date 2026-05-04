import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Check,
  X,
  Plus,
  ArrowRight,
  Loader2,
  Sparkles,
  Pencil,
  Trash2,
  Globe,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { inferCompetitorsMock, type InferredCompetitor } from "@/lib/mockCompetitors";

type Decision = "pending" | "approved" | "rejected";

interface CompetitorRow extends InferredCompetitor {
  id: string;
  decision: Decision;
}

interface Props {
  open: boolean;
  adAccountId: string;
  brandHint?: string;
  isDevMode?: boolean;
  onComplete: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const LogoBox = ({ url, name }: { url?: string; name: string }) => {
  const [errored, setErrored] = useState(false);
  if (!url || errored) {
    return (
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={`${name} logo`}
      onError={() => setErrored(true)}
      className="w-12 h-12 rounded-lg object-contain bg-white border border-border shrink-0"
    />
  );
};

export const CompetitorOnboardingStep = ({
  open,
  adAccountId,
  brandHint,
  isDevMode = false,
  onComplete,
}: Props) => {
  const [phase, setPhase] = useState<"inferring" | "review">("inferring");
  const [rows, setRows] = useState<CompetitorRow[]>([]);
  const [saving, setSaving] = useState(false);

  // Add-new form
  const [newName, setNewName] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newLogo, setNewLogo] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPhase("inferring");
    setRows([]);
    inferCompetitorsMock(brandHint).then((found) => {
      if (cancelled) return;
      setRows(found.map((c) => ({ ...c, id: uid(), decision: "pending" })));
      setPhase("review");
    });
    return () => {
      cancelled = true;
    };
  }, [open, brandHint]);

  const setDecision = (id: string, decision: Decision) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, decision } : r)));

  const removeRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const canAdd = newName.trim().length > 0 && newWebsite.trim().length > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    setRows((prev) => [
      ...prev,
      {
        id: uid(),
        name: newName.trim(),
        industry: newIndustry.trim(),
        website_url: newWebsite.trim(),
        logo_url: newLogo.trim(),
        decision: "approved",
      },
    ]);
    setNewName("");
    setNewIndustry("");
    setNewWebsite("");
    setNewLogo("");
    setShowAdd(false);
  };

  const approvedCount = rows.filter((r) => r.decision === "approved").length;

  const handleFinish = async () => {
    const approved = rows.filter((r) => r.decision === "approved");
    if (approved.length === 0) {
      onComplete();
      return;
    }
    setSaving(true);
    try {
      if (!isDevMode) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { getCurrentAccountId } = await import("@/lib/accountContext");
        const accountId = await getCurrentAccountId();
        if (!accountId) throw new Error("No account found");
        const inserts = approved.map((c) => ({
          account_id: accountId,
          user_id: user.id,
          ad_account_id: adAccountId,
          competitor_name: c.name,
          industry: c.industry || null,
          website_url: c.website_url || null,
          logo_url: c.logo_url || null,
          is_active: true,
        }));
        const { error } = await supabase.from("brand_competitors").insert(inserts);
        if (error) throw error;
      }
      toast.success(
        `Saved ${approved.length} competitor${approved.length > 1 ? "s" : ""}`,
      );
      onComplete();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save competitors");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="sm:max-w-2xl [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Swords className="w-4 h-4 text-primary" />
            </div>
            Confirm your competitors
          </DialogTitle>
          <DialogDescription>
            We inferred these from your Meta ad profile. Approve the ones that
            match, reject the rest, or add your own. You can always edit your
            competitor set later from Settings.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {phase === "inferring" ? (
            <motion.div
              key="inferring"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center gap-3 text-center"
            >
              <div className="relative">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-medium">
                Analyzing your Meta ads profile…
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Looking at your category, audience overlap, and ad library
                signals to identify your top competitors.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-1"
            >
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {rows.map((c) => (
                  <Card
                    key={c.id}
                    className={`p-3 transition-colors ${
                      c.decision === "approved"
                        ? "border-primary/40 bg-primary/5"
                        : c.decision === "rejected"
                          ? "border-border opacity-50"
                          : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LogoBox url={c.logo_url} name={c.name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm">{c.name}</h4>
                          {c.industry && (
                            <Badge variant="secondary" className="text-[10px]">
                              {c.industry}
                            </Badge>
                          )}
                          {c.decision === "approved" && (
                            <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                              Approved
                            </Badge>
                          )}
                          {c.decision === "rejected" && (
                            <Badge variant="outline" className="text-[10px]">
                              Rejected
                            </Badge>
                          )}
                        </div>
                        {c.website_url && (
                          <a
                            href={c.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mt-0.5 truncate"
                          >
                            <Globe className="w-3 h-3" />
                            {c.website_url.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant={c.decision === "approved" ? "default" : "outline"}
                          className="h-8 w-8"
                          onClick={() => setDecision(c.id, "approved")}
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant={c.decision === "rejected" ? "secondary" : "outline"}
                          className="h-8 w-8"
                          onClick={() => setDecision(c.id, "rejected")}
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeRow(c.id)}
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {showAdd ? (
                <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Name *</Label>
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Competitor name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Industry</Label>
                      <Input
                        value={newIndustry}
                        onChange={(e) => setNewIndustry(e.target.value)}
                        placeholder="e.g. Hydration & Wellness"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Website *</Label>
                      <Input
                        value={newWebsite}
                        onChange={(e) => setNewWebsite(e.target.value)}
                        placeholder="https://…"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Logo URL</Label>
                      <Input
                        value={newLogo}
                        onChange={(e) => setNewLogo(e.target.value)}
                        placeholder="https://… (optional)"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAdd} disabled={!canAdd}>
                      Add competitor
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setShowAdd(true)}
                >
                  <Plus className="w-3.5 h-3.5" /> Add a competitor
                </Button>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {approvedCount} approved · You can edit this list anytime in
                  Settings → Competitors.
                </p>
                <Button
                  onClick={handleFinish}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  {saving ? "Saving…" : "Continue"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
