import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Building2, ArrowRight, Loader2, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWizard } from "@/context/WizardContext";

/* ─── Profile completion overlay ─── */

export const ProfileOverlay = ({ open, onComplete }: { open: boolean; onComplete: () => void }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
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
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.user_metadata?.full_name && !fullName) {
        setFullName(data.user.user_metadata.full_name);
      }
    });
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
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
          <DialogDescription>We've pulled your details from Meta. Confirm everything looks right.</DialogDescription>
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
          <Button className="w-full gap-2" size="lg" onClick={handleSave} disabled={saving || !fullName.trim() || !email.trim()}>
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
  account_id: string;
  account_name: string;
  currency: string;
  timezone: string | null;
}

const DATE_RANGES = [
  { value: "90", label: "Last 90 days" },
  { value: "180", label: "Last 180 days" },
  { value: "365", label: "Last year" },
];

export const AccountSelectOverlay = ({ open, onStartSync }: { open: boolean; onStartSync: () => void }) => {
  const { updateState } = useWizard();
  const [selected, setSelected] = useState<string | null>(null);
  const [range, setRange] = useState("90");
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const handleStartAnalysis = () => {
    if (!selected) return;
    const account = accounts.find((a) => a.id === selected);
    if (!account) return;
    updateState({
      selectedAccount: account.id,
      selectedAccountName: account.account_name,
      selectedMetaAccountId: account.account_id,
      dateRange: range,
    });
    onStartSync();
  };

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-lg [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            Select Ad Account
          </DialogTitle>
          <DialogDescription>Choose which account and time window to analyze.</DialogDescription>
        </DialogHeader>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No ad accounts found.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {accounts.map((acc) => (
                <button key={acc.id} onClick={() => setSelected(acc.id)} className={`w-full p-3 rounded-lg border text-left transition-all ${selected === acc.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><Building2 className="w-4 h-4 text-muted-foreground" /></div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{acc.account_name}</div>
                      <div className="text-xs text-muted-foreground">{acc.account_id} · {acc.currency}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
            <div className="flex gap-2">
              {DATE_RANGES.map((dr) => (
                <button key={dr.value} onClick={() => setRange(dr.value)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${range === dr.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{dr.label}</button>
              ))}
            </div>
          </div>
          <Button className="w-full gap-2" size="lg" disabled={!selected} onClick={handleStartAnalysis}>
            Start Analysis <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
