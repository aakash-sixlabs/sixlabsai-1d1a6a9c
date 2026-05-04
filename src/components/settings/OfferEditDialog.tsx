import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type OfferType = "percentage" | "fixed" | "bogo" | "trial" | "freebie" | "custom";

export interface OfferDraft {
  id?: string;
  name: string;
  offer_type: OfferType;
  discount_value?: string | null;
  buy_qty?: string | null;
  get_qty?: string | null;
  trial_price?: string | null;
  freebie_description?: string | null;
  custom_offer_headline?: string | null;
  promo_code?: string | null;
  additional_notes?: string | null;
}

const OFFER_TYPES: { value: OfferType; label: string }[] = [
  { value: "percentage", label: "Percentage Off" },
  { value: "fixed", label: "Fixed Amount Off" },
  { value: "bogo", label: "Buy X Get Y" },
  { value: "trial", label: "Trial / Intro Price" },
  { value: "freebie", label: "Free Gift / Bonus" },
  { value: "custom", label: "Other" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: OfferDraft | null;
  onSave: (draft: OfferDraft) => Promise<void> | void;
}

export const OfferEditDialog = ({ open, onOpenChange, initial, onSave }: Props) => {
  const [draft, setDraft] = useState<OfferDraft>({ name: "", offer_type: "percentage" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(initial ?? { name: "", offer_type: "percentage" });
    }
  }, [open, initial]);

  const set = (p: Partial<OfferDraft>) => setDraft((d) => ({ ...d, ...p }));

  const isValid = (() => {
    if (!draft.name.trim()) return false;
    switch (draft.offer_type) {
      case "percentage":
      case "fixed":
        return !!draft.discount_value?.trim();
      case "bogo":
        return !!draft.buy_qty?.toString().trim() && !!draft.get_qty?.toString().trim();
      case "trial":
        return !!draft.trial_price?.trim();
      case "freebie":
        return !!draft.freebie_description?.trim();
      case "custom":
        return !!draft.custom_offer_headline?.trim();
    }
  })();

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await onSave(draft);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit offer" : "New offer"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Summer 40% Off"
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Offer type</Label>
            <Select value={draft.offer_type} onValueChange={(v) => set({ offer_type: v as OfferType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OFFER_TYPES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(draft.offer_type === "percentage" || draft.offer_type === "fixed") && (
            <div className="space-y-2">
              <Label>{draft.offer_type === "percentage" ? "Discount %" : "Discount amount ($)"}</Label>
              <Input
                value={draft.discount_value ?? ""}
                onChange={(e) => set({ discount_value: e.target.value })}
                placeholder={draft.offer_type === "percentage" ? "40" : "20"}
              />
            </div>
          )}

          {draft.offer_type === "bogo" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Buy quantity</Label>
                <Input type="number" min="1" value={draft.buy_qty ?? ""} onChange={(e) => set({ buy_qty: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Get quantity (free)</Label>
                <Input type="number" min="1" value={draft.get_qty ?? ""} onChange={(e) => set({ get_qty: e.target.value })} />
              </div>
            </div>
          )}

          {draft.offer_type === "trial" && (
            <div className="space-y-2">
              <Label>Trial price ($)</Label>
              <Input value={draft.trial_price ?? ""} onChange={(e) => set({ trial_price: e.target.value })} placeholder="1" />
            </div>
          )}

          {draft.offer_type === "freebie" && (
            <div className="space-y-2">
              <Label>What's the freebie?</Label>
              <Input
                value={draft.freebie_description ?? ""}
                onChange={(e) => set({ freebie_description: e.target.value })}
                placeholder="Free shipping on all orders"
              />
            </div>
          )}

          {draft.offer_type === "custom" && (
            <div className="space-y-2">
              <Label>Offer headline</Label>
              <Input
                value={draft.custom_offer_headline ?? ""}
                onChange={(e) => set({ custom_offer_headline: e.target.value })}
                placeholder="Members-only early access"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Promo code <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input value={draft.promo_code ?? ""} onChange={(e) => set({ promo_code: e.target.value })} placeholder="SUMMER40" />
          </div>

          <div className="space-y-2">
            <Label>Additional notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              rows={3}
              value={draft.additional_notes ?? ""}
              onChange={(e) => set({ additional_notes: e.target.value })}
              placeholder="Minimum order, exclusions, terms..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !isValid}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
