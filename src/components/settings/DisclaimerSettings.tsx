import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { DisclaimerEditDialog, type DisclaimerDraft } from "./DisclaimerEditDialog";

interface Disclaimer {
  id: string;
  label: string;
  text: string;
  created_at: string;
}

interface Props {
  adAccountId: string;
}

export const DisclaimerSettings = ({ adAccountId }: Props) => {
  const [items, setItems] = useState<Disclaimer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DisclaimerDraft | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("disclaimers")
      .select("*")
      .eq("ad_account_id", adAccountId)
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load disclaimers");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (adAccountId) load();
  }, [adAccountId]);

  const handleSave = async (draft: DisclaimerDraft) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (draft.id) {
      const { error } = await supabase
        .from("disclaimers")
        .update({ label: draft.label, text: draft.text })
        .eq("id", draft.id);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Disclaimer updated");
    } else {
      const { error } = await supabase.from("disclaimers").insert({
        user_id: user.id,
        ad_account_id: adAccountId,
        label: draft.label,
        text: draft.text,
      });
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Disclaimer added");
    }
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this disclaimer?")) return;
    const { error } = await supabase.from("disclaimers").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Disclaimers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Reusable legal and promo disclaimers you can attach to any ad creative.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4" />
          New disclaimer
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center">
          <FileWarning className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No disclaimers yet. Add one to make it available in the ad creation flow.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((d) => (
            <Card key={d.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1">{d.label}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{d.text}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditing({ id: d.id, label: d.label, text: d.text });
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(d.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DisclaimerEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={handleSave}
      />
    </div>
  );
};
