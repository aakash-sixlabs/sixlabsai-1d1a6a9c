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

export interface IcpDraft {
  id?: string;
  name: string;
  description: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: IcpDraft | null;
  onSave: (draft: IcpDraft) => Promise<void> | void;
}

export const IcpEditDialog = ({ open, onOpenChange, initial, onSave }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
    }
  }, [open, initial]);

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) return;
    setSaving(true);
    try {
      await onSave({ id: initial?.id, name: name.trim(), description: description.trim() });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit ICP" : "New ICP"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="icp-name">Name</Label>
            <Input
              id="icp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Busy working moms"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icp-desc">Description</Label>
            <Textarea
              id="icp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Demographics, pains, goals, what they care about…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim() || !description.trim()}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
