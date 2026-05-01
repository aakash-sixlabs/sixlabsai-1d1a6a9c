import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface DisclaimerDraft {
  id?: string;
  label: string;
  text: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: DisclaimerDraft | null;
  onSave: (draft: DisclaimerDraft) => Promise<void> | void;
}

export const DisclaimerEditDialog = ({ open, onOpenChange, initial, onSave }: Props) => {
  const [label, setLabel] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLabel(initial?.label ?? "");
      setText(initial?.text ?? "");
    }
  }, [open, initial]);

  const handleSave = async () => {
    if (!label.trim() || !text.trim()) return;
    setSaving(true);
    try {
      await onSave({ id: initial?.id, label: label.trim(), text: text.trim() });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit disclaimer" : "New disclaimer"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disc-label">Label</Label>
            <Input
              id="disc-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Standard promo terms"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disc-text">Disclaimer text</Label>
            <Textarea
              id="disc-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="e.g. *Offer valid through 12/31. Cannot be combined with other promotions. See site for details."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !label.trim() || !text.trim()}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
