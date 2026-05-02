import { useEffect, useState } from "react";
import { Plus, Check, FileWarning, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWizard } from "@/context/WizardContext";
import { isDevSession } from "@/lib/devMode";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DisclaimerEditDialog,
  type DisclaimerDraft,
} from "@/components/settings/DisclaimerEditDialog";
import { getCurrentUserAndAccount } from "@/lib/accountContext";

export interface DisclaimerOption {
  id: string;
  label: string;
  text: string;
}

interface Props {
  selectedIds: string[];
  onChange: (selected: DisclaimerOption[]) => void;
}

const MOCK_DISCLAIMERS: DisclaimerOption[] = [
  { id: "mock-disc-1", label: "Standard promo terms", text: "*Offer valid through end of promo period. Cannot be combined with other offers. See site for full details." },
  { id: "mock-disc-2", label: "Free shipping terms", text: "Free standard shipping on orders over $50 within the contiguous US. Excludes oversized items." },
];

export const DisclaimerPicker = ({ selectedIds, onChange }: Props) => {
  const { state: wizardState } = useWizard();
  const [items, setItems] = useState<DisclaimerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (isDevSession()) {
        setItems(MOCK_DISCLAIMERS);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setItems([]); return; }

      let query = supabase
        .from("disclaimers")
        .select("id, label, text, ad_account_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (wizardState.selectedAccount) {
        query = query.eq("ad_account_id", wizardState.selectedAccount);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems((data ?? []).map(({ id, label, text }) => ({ id, label, text })));
    } catch (err: any) {
      console.error("Failed to load disclaimers:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (d: DisclaimerOption) => {
    const isSelected = selectedIds.includes(d.id);
    const nextIds = isSelected
      ? selectedIds.filter((i) => i !== d.id)
      : [...selectedIds, d.id];
    onChange(items.filter((i) => nextIds.includes(i.id)));
  };

  const handleAdd = async (draft: DisclaimerDraft) => {
    if (isDevSession()) {
      const newItem: DisclaimerOption = {
        id: `mock-disc-${Date.now()}`,
        label: draft.label,
        text: draft.text,
      };
      setItems((prev) => [newItem, ...prev]);
      onChange([...items.filter((i) => selectedIds.includes(i.id)), newItem]);
      toast.success("Disclaimer added");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Not authenticated"); return; }

    let adAccountId = wizardState.selectedAccount;
    if (!adAccountId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("default_ad_account_id")
        .eq("id", user.id)
        .maybeSingle();
      adAccountId = profile?.default_ad_account_id ?? null;
    }
    if (!adAccountId) {
      toast.error("No ad account found.");
      return;
    }

    const { accountId } = await getCurrentUserAndAccount();
    const { data, error } = await supabase
      .from("disclaimers")
      .insert({
        account_id: accountId,
        user_id: user.id,
        ad_account_id: adAccountId,
        label: draft.label,
        text: draft.text,
      })
      .select("id, label, text")
      .single();

    if (error) { toast.error(error.message); return; }
    if (data) {
      const newItem: DisclaimerOption = { id: data.id, label: data.label, text: data.text };
      setItems((prev) => [newItem, ...prev]);
      onChange([...items.filter((i) => selectedIds.includes(i.id)), newItem]);
      toast.success("Disclaimer added");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Disclaimers <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pick any legal or promo disclaimers to include in this creative.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 p-6 text-center">
          <FileWarning className="w-6 h-6 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            No disclaimers in your library yet.
          </p>
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add disclaimer
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((d) => {
              const isSelected = selectedIds.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggle(d)}
                  className={cn(
                    "w-full text-left rounded-lg border-2 p-3 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 bg-card"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground">{d.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{d.text}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add a new disclaimer
          </button>
        </>
      )}

      <DisclaimerEditDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initial={null}
        onSave={handleAdd}
      />
    </div>
  );
};
