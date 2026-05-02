import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Building2, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/prod/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ProfileDialogProps {
  open: boolean;
  onComplete: () => void;
}

export const ProfileDialog = ({ open, onComplete }: ProfileDialogProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Pre-fill from sessionStorage (meta connection data)
    const stored = sessionStorage.getItem("meta_connection");
    if (stored) {
      const data = JSON.parse(stored);
      setFullName(data.userName || "");
      setEmail(data.userEmail || "");
      setAccounts(data.accounts || []);
    }

    // Also try name from Supabase session metadata (but NOT email,
    // since the auth record uses a placeholder email)
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
