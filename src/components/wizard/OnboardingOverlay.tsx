import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Building2, ArrowRight, Loader2, Star, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/prod/client";
import { toast } from "sonner";
import { useWizard } from "@/context/WizardContext";

/* ─── Profile completion overlay ─── */

export const ProfileOverlay = ({ open, onComplete, isDevMode = false }: { open: boolean; onComplete: () => void; isDevMode?: boolean }) => {
  const { updateState } = useWizard();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [brandWebsite, setBrandWebsite] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const stored = sessionStorage.getItem("meta_connection");
    if (stored) {
      const data = JSON.parse(stored);
      setFullName(data.userName || "");
      setEmail(data.userEmail || "");
      setAccounts(data.accounts || []);
    }
    if (!isDevMode) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.user_metadata?.full_name && !fullName) {
          setFullName(data.user.user_metadata.full_name);
        }
      });
    }
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Persist website into wizard state so the Brand Kit step can auto-extract from it.
      updateState({ brandWebsite: brandWebsite.trim() });

      if (isDevMode) {
        await new Promise((r) => setTimeout(r, 500));
        toast.success("Profile saved!");
        onComplete();
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, full_name: fullName, email }, { onConflict: "id" });
      if (error) throw error;
      toast.success("Profile saved!");
      onComplete();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-lg [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>We've pulled your details from Meta. Confirm everything looks right and add your brand website.</DialogDescription>
        </DialogHeader>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-1.5 text-sm"><User className="w-3.5 h-3.5 text-muted-foreground" />Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5 text-sm"><Mail className="w-3.5 h-3.5 text-muted-foreground" />Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandWebsite" className="flex items-center gap-1.5 text-sm"><Globe className="w-3.5 h-3.5 text-muted-foreground" />Brand Website</Label>
            <Input id="brandWebsite" value={brandWebsite} onChange={(e) => setBrandWebsite(e.target.value)} placeholder="yourbrand.com" />
            <p className="text-xs text-muted-foreground">We'll use this to build your brand kit (logo, colors, fonts).</p>
          </div>
          {accounts.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm"><Building2 className="w-3.5 h-3.5 text-muted-foreground" />Connected Ad Accounts</Label>
              <div className="flex flex-wrap gap-2">
                {accounts.map((acc: any, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">{acc.name || acc.account_name || acc.account_id}</Badge>
                ))}
              </div>
            </div>
          )}
          <Button className="w-full gap-2" size="lg" onClick={handleSave} disabled={saving || !fullName.trim() || !email.trim() || !brandWebsite.trim()}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {saving ? "Saving…" : "Continue"}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Account Select overlay ─── */

interface AdAccount {
  id: string;
  account_id_meta: string;
  account_name: string;
  currency: string | null;
  timezone: string | null;
}

interface MockAdAccount {
  account_id: string;
  name: string;
  currency: string;
}

export const AccountSelectOverlay = ({
  open,
  onStartSync,
  onReturningAccountSelected,
  isDevMode = false,
  saveAsDefault = false,
  skipCompletedAccountSetup = false,
}: {
  open: boolean;
  onStartSync: () => void;
  onReturningAccountSelected?: () => void;
  isDevMode?: boolean;
  saveAsDefault?: boolean;
  skipCompletedAccountSetup?: boolean;
}) => {
  const { updateState } = useWizard();
  const [selected, setSelected] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [mockAccounts, setMockAccounts] = useState<MockAdAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    if (isDevMode) {
      // Use mock accounts from sessionStorage
      const stored = sessionStorage.getItem("meta_connection");
      if (stored) {
        const data = JSON.parse(stored);
        setMockAccounts(data.accounts || []);
      }
      setLoading(false);
      return;
    }

    const fetchAccounts = async () => {
      try {
        const { data, error } = await supabase.from("ad_accounts").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setAccounts(data || []);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [open, isDevMode]);

  const handleStartAnalysis = async () => {
    if (!selected) return;

    if (isDevMode) {
      const acc = mockAccounts.find((a) => a.account_id === selected);
      if (!acc) return;
      updateState({
        selectedAccount: selected,
        selectedAccountName: acc.name,
        selectedMetaAccountId: acc.account_id,
        dateRange: "90",
      });
      onStartSync();
      return;
    }

    const account = accounts.find((a) => a.id === selected);
    if (!account) return;

    let previousDefaultAccountId: string | null = null;

    if (saveAsDefault) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("default_ad_account_id")
            .eq("id", user.id)
            .maybeSingle();
          previousDefaultAccountId = profile?.default_ad_account_id ?? null;

          await supabase
            .from("profiles")
            .update({ default_ad_account_id: account.id })
            .eq("id", user.id);
        }
      } catch (err) {
        console.error("Failed to save default account:", err);
      }
    }

    updateState({
      selectedAccount: account.id,
      selectedAccountName: account.account_name,
      selectedMetaAccountId: account.account_id_meta,
      dateRange: "90",
    });

    if (skipCompletedAccountSetup && onReturningAccountSelected) {
      const { data: accountProfile } = await supabase
        .from("ad_account_profiles")
        .select("brand_kit_status, confirmed")
        .eq("ad_account_id", account.id)
        .maybeSingle();

      if (
        previousDefaultAccountId === account.id ||
        accountProfile?.brand_kit_status === "completed" ||
        accountProfile?.confirmed
      ) {
        onReturningAccountSelected();
        return;
      }
    }

    onStartSync();
  };

  const displayAccounts = isDevMode
    ? mockAccounts.map((a) => ({ id: a.account_id, account_id_meta: a.account_id, account_name: a.name, currency: a.currency, timezone: null }))
    : accounts;

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-lg [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            Select Your Default Ad Account
          </DialogTitle>
          <DialogDescription>Choose the primary account you'd like to analyze. You can change this later.</DialogDescription>
        </DialogHeader>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : displayAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No ad accounts found.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {displayAccounts.map((acc) => (
                <button key={acc.id} onClick={() => setSelected(acc.id)} className={`w-full p-3 rounded-lg border text-left transition-all ${selected === acc.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><Building2 className="w-4 h-4 text-muted-foreground" /></div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-foreground">{acc.account_name}</div>
                      <div className="text-xs text-muted-foreground">{acc.account_id_meta} · {acc.currency}</div>
                    </div>
                    {selected === acc.id && (
                      <Badge variant="default" className="text-[10px]">Default</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          <Button className="w-full gap-2" size="lg" disabled={!selected} onClick={handleStartAnalysis}>
            Set as Default & Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
