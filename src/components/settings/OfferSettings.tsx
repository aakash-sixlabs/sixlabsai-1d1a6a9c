import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { OfferEditDialog, type OfferDraft, type OfferType } from "./OfferEditDialog";

interface Offer extends OfferDraft {
  id: string;
  created_at: string;
}

interface Props {
  adAccountId: string;
}

const summarize = (o: Offer): string => {
  switch (o.offer_type) {
    case "percentage": return `${o.discount_value}% off`;
    case "fixed": return `$${o.discount_value} off`;
    case "bogo": return `Buy ${o.buy_qty} Get ${o.get_qty} Free`;
    case "trial": return `Try for $${o.trial_price}`;
    case "freebie": return o.freebie_description ?? "";
    case "custom": return o.custom_offer_headline ?? "";
    default: return "";
  }
};

export const OfferSettings = ({ adAccountId }: Props) => {
  const [items, setItems] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OfferDraft | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .eq("ad_account_id", adAccountId)
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load offers");
    setItems((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { if (adAccountId) load(); }, [adAccountId]);

  const handleSave = async (draft: OfferDraft) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload: any = {
      name: draft.name,
      offer_type: draft.offer_type,
      discount_value: draft.discount_value ?? null,
      buy_qty: draft.buy_qty ?? null,
      get_qty: draft.get_qty ?? null,
      trial_price: draft.trial_price ?? null,
      freebie_description: draft.freebie_description ?? null,
      custom_offer_headline: draft.custom_offer_headline ?? null,
      promo_code: draft.promo_code ?? null,
      additional_notes: draft.additional_notes ?? null,
    };

    if (draft.id) {
      const { error } = await supabase.from("offers").update(payload).eq("id", draft.id);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Offer updated");
    } else {
      const { getCurrentAccountId } = await import("@/lib/accountContext");
      const accountId = await getCurrentAccountId();
      if (!accountId) { toast.error("No account context"); return; }
      const { error } = await supabase.from("offers").insert({
        ...payload,
        user_id: user.id,
        account_id: accountId,
        ad_account_id: adAccountId,
      });
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Offer added");
    }
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    const { error } = await supabase.from("offers").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Offers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Reusable promotional offers. Pick them in the ad creation flow without re-entering details.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4" /> New offer
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center">
          <Tag className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No offers yet. Create one to reuse it across ad generations.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-0.5">{o.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {summarize(o)}
                    {o.promo_code && ` · Code: ${o.promo_code}`}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => { setEditing(o); setDialogOpen(true); }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(o.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <OfferEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={handleSave}
      />
    </div>
  );
};
