import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, CheckCircle2, Loader2, KeyRound } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/prod/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const MetaConnectStep = () => {
  const { setStep, updateState } = useWizard();
  const [connecting, setConnecting] = useState(false);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [submittingToken, setSubmittingToken] = useState(false);

  const handleTokenSubmit = async () => {
    const token = tokenInput.trim();
    if (!token) {
      toast.error("Please paste an access token");
      return;
    }
    setSubmittingToken(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "meta-token-connect",
        { body: { accessToken: token } }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      sessionStorage.setItem("meta_connection", JSON.stringify({
        connectionId: data.connectionId,
        userName: data.userName,
        accounts: data.accounts,
      }));
      updateState({ metaConnected: true });
      setTokenInput("");
      setTokenDialogOpen(false);
      toast.success(`Connected as ${data.userName}`);
      setStep("account-select");
    } catch (err: any) {
      console.error("Token connect error:", err);
      toast.error(err.message || "Failed to connect with token");
    } finally {
      setSubmittingToken(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Check if already connected via callback
      const stored = sessionStorage.getItem("meta_connection");
      if (stored) {
        const data = JSON.parse(stored);
        updateState({ metaConnected: true });
        setStep("account-select");
        return;
      }

      // Get the OAuth URL from edge function
      const redirectUri = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.functions.invoke(
        "meta-oauth?action=get-auth-url",
        { body: { redirectUri } }
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Redirect to Meta OAuth (same window so callback returns here)
      window.location.href = data.authUrl;
    } catch (err: any) {
      console.error("Meta connect error:", err);
      toast.error(err.message || "Failed to start Meta connection");
      setConnecting(false);
    }
  };

  // Note: returning from OAuth is handled by WizardRouter via ?meta=connected

  return (
    <div className="container max-w-lg py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Connect Your Meta Ads Account
        </h2>
        <p className="text-muted-foreground mb-8">
          We'll securely access your ad account to analyze historical creative
          performance. We only request read-only permissions.
        </p>

        <Button
          size="lg"
          className="gap-2 w-full max-w-xs"
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ExternalLink className="w-4 h-4" />
          )}
          {connecting ? "Connecting…" : "Connect with Meta"}
        </Button>

        <button
          type="button"
          onClick={() => setTokenDialogOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          <KeyRound className="w-3 h-3" />
          Have an access token? Paste it here
        </button>

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-xs text-muted-foreground"
          onClick={() => {
            sessionStorage.setItem("meta_connection", JSON.stringify({
              connectionId: "dev-mock",
              userName: "Dev User",
              accounts: [
                { id: "act_123456", account_id: "123456", name: "Mock Ad Account", currency: "USD" },
              ],
            }));
            updateState({ metaConnected: true });
            setStep("account-select");
          }}
        >
          Skip (Dev Mode)
        </Button>

        <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
          {[
            "Read-only access to ad creatives",
            "Historical performance metrics",
            "Secure OAuth authentication",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          Your data is encrypted and never shared
        </div>
      </motion.div>

      <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              Connect with Access Token
            </DialogTitle>
            <DialogDescription>
              Paste a Meta access token to connect without OAuth. We recommend a
              long-lived <strong>System User token</strong> from Business
              Settings with <code>ads_read</code> + <code>ads_management</code> scopes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="EAAB..."
              className="font-mono text-xs h-28 resize-none"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              Your token is stored securely under your account and used only to
              fetch your ad data.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setTokenInput("");
                setTokenDialogOpen(false);
              }}
              disabled={submittingToken}
            >
              Cancel
            </Button>
            <Button onClick={handleTokenSubmit} disabled={submittingToken}>
              {submittingToken && (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              )}
              {submittingToken ? "Validating…" : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
