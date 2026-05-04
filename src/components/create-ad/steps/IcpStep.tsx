import { useEffect, useState } from "react";
import { ArrowRight, Check, Plus, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useWizard } from "@/context/WizardContext";
import { isDevSession } from "@/lib/devMode";
import { toast } from "sonner";
import { IcpEditDialog, IcpDraft } from "@/components/settings/IcpEditDialog";

export interface IcpOption {
  id: string;
  name: string;
  description: string;
}

interface Props {
  selectedIcpId: string | null;
  onSelect: (icp: IcpOption) => void;
  onNext: () => void;
}

const MOCK_ICPS: IcpOption[] = [
  { id: "mock-icp-1", name: "Busy working moms", description: "Time-pressed parents (30-45) juggling family + career. Value convenience, trust peer reviews, shop on mobile in evenings." },
  { id: "mock-icp-2", name: "Wellness-focused millennials", description: "Health-conscious 25-35 year olds. Care about clean ingredients, sustainability, and brand values. Active on Instagram." },
  { id: "mock-icp-3", name: "Budget-savvy Gen Z", description: "Price-sensitive 18-25 year olds. Discover via TikTok, respond to social proof and limited-time deals." },
];

export const IcpStep = ({ selectedIcpId, onSelect, onNext }: Props) => {
  const { state: wizardState } = useWizard();
  const [icps, setIcps] = useState<IcpOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const loadIcps = async () => {
    setLoading(true);
    try {
      if (isDevSession()) {
        setIcps(MOCK_ICPS);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIcps([]); return; }

      let query = supabase
        .from("icps")
        .select("id, name, description, ad_account_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (wizardState.selectedAccount) {
        query = query.eq("ad_account_id", wizardState.selectedAccount);
      }

      const { data, error } = await query;
      if (error) throw error;
      setIcps((data ?? []).map(({ id, name, description }) => ({ id, name, description })));
    } catch (err: any) {
      console.error("Failed to load ICPs:", err);
      toast.error(err.message || "Failed to load ICPs");
      setIcps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIcps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async (draft: IcpDraft) => {
    if (isDevSession()) {
      const newIcp: IcpOption = {
        id: `mock-icp-${Date.now()}`,
        name: draft.name,
        description: draft.description,
      };
      setIcps((prev) => [newIcp, ...prev]);
      onSelect(newIcp);
      toast.success("ICP added");
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
      toast.error("No ad account found. Set one up first.");
      return;
    }

    const { getCurrentAccountId } = await import("@/lib/accountContext");
    const accountId = await getCurrentAccountId();
    if (!accountId) { toast.error("No account context"); return; }

    const { data, error } = await supabase
      .from("icps")
      .insert({
        user_id: user.id,
        account_id: accountId,
        ad_account_id: adAccountId,
        name: draft.name,
        description: draft.description,
        source: "manual",
      })
      .select("id, name, description")
      .single();

    if (error) { toast.error(error.message); return; }
    if (data) {
      const newIcp: IcpOption = { id: data.id, name: data.name, description: data.description };
      setIcps((prev) => [newIcp, ...prev]);
      onSelect(newIcp);
      toast.success("ICP added");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-1">Who is this ad for?</h2>
      <p className="text-muted-foreground mb-10">
        Pick the audience you want to reach. We'll tailor the messaging and visuals to resonate with them.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {icps.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-10 text-center mb-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground mb-1">No ICPs yet</p>
              <p className="text-sm text-muted-foreground mb-5">
                Add your first ideal customer profile to get started.
              </p>
              <Button onClick={() => setAddOpen(true)} className="gap-2 rounded-xl">
                <Plus className="w-4 h-4" /> Add ICP
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {icps.map((icp) => {
                  const isSelected = selectedIcpId === icp.id;
                  return (
                    <button
                      key={icp.id}
                      onClick={() => onSelect(icp)}
                      className={`group relative text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/[0.03] shadow-md ring-1 ring-primary/20"
                          : "border-border/80 bg-card hover:border-primary/30 hover:shadow-sm"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <p className="font-semibold text-sm text-foreground pr-6">{icp.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                        {icp.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setAddOpen(true)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border hover:border-primary/30 hover:bg-muted/30"
              >
                <Plus className="w-3.5 h-3.5" /> Add a new ICP
              </button>
            </>
          )}
        </>
      )}

      <div className="mt-10 flex justify-end">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!selectedIcpId}
          className="gap-2 rounded-xl"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <IcpEditDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initial={null}
        onSave={handleAdd}
      />
    </div>
  );
};
