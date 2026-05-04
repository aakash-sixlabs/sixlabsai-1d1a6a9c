import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Swords, Globe } from "lucide-react";
import { toast } from "sonner";

interface Competitor {
  id: string;
  competitor_name: string | null;
  industry: string | null;
  website_url: string | null;
  logo_url: string | null;
  is_active: boolean;
}

interface Props {
  adAccountId: string;
}

interface Draft {
  id?: string;
  name: string;
  industry: string;
  website_url: string;
  logo_url: string;
}

const empty: Draft = { name: "", industry: "", website_url: "", logo_url: "" };

const Logo = ({ url, name }: { url?: string | null; name: string }) => {
  const [err, setErr] = useState(false);
  if (!url || err) {
    return (
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={name}
      onError={() => setErr(true)}
      className="w-10 h-10 rounded-lg object-contain bg-white border border-border shrink-0"
    />
  );
};

export const CompetitorSettings = ({ adAccountId }: Props) => {
  const [items, setItems] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("brand_competitors")
      .select("id, competitor_name, industry, website_url, logo_url, is_active")
      .eq("ad_account_id", adAccountId)
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load competitors");
    setItems((data as Competitor[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (adAccountId) load();
  }, [adAccountId]);

  const handleSave = async () => {
    if (!draft.name.trim()) { toast.error("Name is required"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (draft.id) {
      const { error } = await supabase
        .from("brand_competitors")
        .update({
          competitor_name: draft.name.trim(),
          industry: draft.industry.trim() || null,
          website_url: draft.website_url.trim() || null,
          logo_url: draft.logo_url.trim() || null,
        })
        .eq("id", draft.id);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Competitor updated");
    } else {
      const { getCurrentAccountId } = await import("@/lib/accountContext");
      const accountId = await getCurrentAccountId();
      if (!accountId) { toast.error("No account context"); return; }
      const { error } = await supabase.from("brand_competitors").insert({
        account_id: accountId,
        user_id: user.id,
        ad_account_id: adAccountId,
        competitor_name: draft.name.trim(),
        industry: draft.industry.trim() || null,
        website_url: draft.website_url.trim() || null,
        logo_url: draft.logo_url.trim() || null,
        is_active: true,
      });
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Competitor added");
    }
    setOpen(false);
    setDraft(empty);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this competitor?")) return;
    const { error } = await supabase.from("brand_competitors").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Competitors</h2>
          <p className="text-sm text-muted-foreground mt-1">
            The brands you compete with. We use these to surface competitive
            insights and creative inspiration.
          </p>
        </div>
        <Button onClick={() => { setDraft(empty); setOpen(true); }}>
          <Plus className="w-4 h-4" /> New competitor
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center">
          <Swords className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No competitors yet. Add one to start tracking.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-center gap-3">
                <Logo url={c.logo_url} name={c.competitor_name ?? "?"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-sm">{c.competitor_name}</h3>
                    {c.industry && (
                      <Badge variant="secondary" className="text-[10px]">
                        {c.industry}
                      </Badge>
                    )}
                  </div>
                  {c.website_url && (
                    <a
                      href={c.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mt-0.5"
                    >
                      <Globe className="w-3 h-3" />
                      {c.website_url.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setDraft({
                        id: c.id,
                        name: c.competitor_name ?? "",
                        industry: c.industry ?? "",
                        website_url: c.website_url ?? "",
                        logo_url: c.logo_url ?? "",
                      });
                      setOpen(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit competitor" : "New competitor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name *</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Industry</Label>
              <Input value={draft.industry} onChange={(e) => setDraft({ ...draft, industry: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Website</Label>
              <Input value={draft.website_url} onChange={(e) => setDraft({ ...draft, website_url: e.target.value })} placeholder="https://…" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Logo URL</Label>
              <Input value={draft.logo_url} onChange={(e) => setDraft({ ...draft, logo_url: e.target.value })} placeholder="https://…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{draft.id ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
