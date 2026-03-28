import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Building2, ArrowRight, Loader2, Shield, CheckCircle2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWizard, WizardStep } from "@/context/WizardContext";

/* ─── Landing / Login overlay ─── */

export const LoginOverlay = ({ open }: { open: boolean }) => {
  const { updateState, setStep } = useWizard();
  const [connecting, setConnecting] = useState(false);

  const handleConnectMeta = async () => {
    setConnecting(true);
    try {
      const stored = sessionStorage.getItem("meta_connection");
      if (stored) {
        updateState({ metaConnected: true });
        setStep("account-select");
        return;
      }

      const redirectUri = `${window.location.origin}/meta-callback`;
      const { data, error } = await supabase.functions.invoke(
        "meta-oauth?action=get-auth-url",
        { body: { redirectUri } }
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      window.location.href = data.authUrl;
    } catch (err: any) {
      console.error("Meta connect error:", err);
      toast.error(err.message || "Failed to start Meta connection");
      setConnecting(false);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center items-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Welcome to CreativeGen!</DialogTitle>
          <DialogDescription className="text-sm">
            Get set up so CreativeGen can create data-driven ad creatives for your product.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2"
        >
          {/* Setup steps preview */}
          <div className="space-y-3 py-2">
            {[
              { num: 1, title: "Connect your Meta account", desc: "We'll pull in your ad accounts and creatives." },
              { num: 2, title: "Confirm your profile", desc: "Verify your name and email." },
              { num: 3, title: "Select an ad account", desc: "Choose which account to analyze." },
              { num: 4, title: "Sync & analyze", desc: "We'll fetch your ad data and generate insights." },
            ].map((step) => (
              <div key={step.num} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0 mt-0.5">
                  {step.num}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Meta login button */}
          <Button
            size="lg"
            onClick={handleConnectMeta}
            disabled={connecting}
            className="w-full gap-3 h-12 text-sm font-medium rounded-full"
          >
            {connecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            )}
            {connecting ? "Connecting…" : "Start setup with Meta"}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
            <Shield className="w-3.5 h-3.5" />
            Read-only access · Your data is encrypted
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

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
      if (data?.user) {
        if (!fullName && data.user.user_metadata?.full_name) {
          setFullName(data.user.user_metadata.full_name);
        }
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
        .upsert({
          id: user.id,
          full_name: fullName,
          email,
        }, { onConflict: "id" });

      if (error) throw error;

      toast.success("Profile saved!");
      onComplete();
    } catch (err: any) {
      console.error("Profile save error:", err);
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="sm:max-w-lg [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            We've pulled your details from Meta. Confirm everything looks right.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 pt-2"
        >
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-1.5 text-sm">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5 text-sm">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              type="email"
            />
          </div>

          {accounts.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                Connected Ad Accounts
              </Label>
              <div className="flex flex-wrap gap-2">
                {accounts.map((acc: any, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {acc.name || acc.account_name || acc.account_id}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleSave}
            disabled={saving || !fullName.trim() || !email.trim()}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
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

export const AccountSelectOverlay = ({ open }: { open: boolean }) => {
  const { setStep, updateState } = useWizard();
  const [selected, setSelected] = useState<string | null>(null);
  const [range, setRange] = useState("90");
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const fetchAccounts = async () => {
      try {
        const { data, error } = await supabase
          .from("ad_accounts")
          .select("*")
          .order("created_at", { ascending: false });
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
    setStep("data-sync");
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="sm:max-w-lg [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            Select Ad Account
          </DialogTitle>
          <DialogDescription>
            Choose which account and time window to analyze.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2"
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No ad accounts found. Make sure your Meta account has active ad accounts.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setSelected(acc.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selected === acc.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
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
                <button
                  key={dr.value}
                  onClick={() => setRange(dr.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    range === dr.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {dr.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full gap-2"
            size="lg"
            disabled={!selected}
            onClick={handleStartAnalysis}
          >
            Start Analysis <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
