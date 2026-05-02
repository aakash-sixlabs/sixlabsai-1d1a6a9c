import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Users, Plus, Trash2, ArrowRight, Loader2, SkipForward } from "lucide-react";
import { supabase } from "@/integrations/prod/client";
import { getCurrentUserAndAccount } from "@/lib/accountContext";
import { toast } from "sonner";

interface IcpDraft {
  name: string;
  description: string;
}

interface Props {
  open: boolean;
  adAccountId: string;
  isDevMode?: boolean;
  onComplete: () => void;
}

export const IcpOnboardingStep = ({ open, adAccountId, isDevMode = false, onComplete }: Props) => {
  const [icps, setIcps] = useState<IcpDraft[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const canAdd = name.trim().length > 0 && description.trim().length > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    setIcps((prev) => [...prev, { name: name.trim(), description: description.trim() }]);
    setName("");
    setDescription("");
  };

  const handleRemove = (idx: number) => {
    setIcps((prev) => prev.filter((_, i) => i !== idx));
  };

  const persist = async (drafts: IcpDraft[]) => {
    if (drafts.length === 0 || isDevMode) return;
    const { userId, accountId } = await getCurrentUserAndAccount();
    const rows = drafts.map((d) => ({
      account_id: accountId,
      user_id: userId,
      ad_account_id: adAccountId,
      name: d.name,
      description: d.description,
      source: "manual",
    }));
    const { error } = await supabase.from("icps").insert(rows);
    if (error) throw error;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Include the in-progress entry if user filled it out but didn't click Add.
      const pending = canAdd ? [...icps, { name: name.trim(), description: description.trim() }] : icps;
      await persist(pending);
      if (pending.length > 0) {
        toast.success(`Saved ${pending.length} ICP${pending.length > 1 ? "s" : ""}`);
      }
      onComplete();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save ICPs");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="sm:max-w-xl [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            Add Your Ideal Customer Profiles
          </DialogTitle>
          <DialogDescription>
            Define the audiences your brand targets. These power the ad creation workflow. You can always add more later from Settings.
          </DialogDescription>
        </DialogHeader>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
          {icps.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {icps.map((icp, i) => (
                <Card key={i} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{icp.name}</h4>
                        <Badge variant="secondary" className="text-[10px] shrink-0">Added</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{icp.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleRemove(i)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
            <div className="space-y-2">
              <Label htmlFor="icp-name" className="text-sm">ICP Name</Label>
              <Input
                id="icp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Busy working moms"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icp-desc" className="text-sm">Description</Label>
              <Textarea
                id="icp-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Demographics, pains, goals, what they care about…"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleAdd}
              disabled={!canAdd}
            >
              <Plus className="w-3.5 h-3.5" /> Add another ICP
            </Button>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-1">
            <Button variant="ghost" onClick={handleSkip} disabled={saving} className="gap-1.5">
              <SkipForward className="w-4 h-4" /> Skip for now
            </Button>
            <Button
              onClick={handleFinish}
              disabled={saving || (icps.length === 0 && !canAdd)}
              className="gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {saving ? "Saving…" : "Finish"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
