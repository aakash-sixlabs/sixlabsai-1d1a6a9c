import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/prod/client";
import { Loader2 } from "lucide-react";

const MetaCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const exchangeToken = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        handleError("Meta connection was cancelled.");
        return;
      }
      if (!code) {
        handleError("No authorization code received.");
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/auth/callback`;
        const { data, error: fnError } = await supabase.functions.invoke("meta-oauth?action=exchange-token", { body: { code, redirectUri } });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);

        if (!data?.tokenHash) throw new Error("Failed to establish authenticated session.");
        const { error: otpError } = await supabase.auth.verifyOtp({ token_hash: data.tokenHash, type: "magiclink" });
        if (otpError) throw otpError;

        const connectionData = {
          connectionId: data.connectionId,
          userName: data.userName,
          userEmail: data.userEmail,
          metaUserId: data.metaUserId,
          accounts: data.accounts,
          pages: data.pages || [],
          isNewUser: data.isNewUser ?? true,
          defaultAdAccountId: data.defaultAdAccountId || null,
          defaultAdAccountName: data.defaultAdAccountName || null,
          defaultMetaAccountId: data.defaultMetaAccountId || null,
        };

        // If opened as popup, send message back to opener
        if (window.opener) {
          window.opener.postMessage({ type: "META_AUTH_COMPLETE", connectionData }, window.location.origin);
          window.close();
          return;
        }

        // Fallback: direct navigation (if popup was blocked).
        // Honor the auth flow version set by the originating login page.
        sessionStorage.setItem("meta_connection", JSON.stringify(connectionData));
        const flowVersion = sessionStorage.getItem("auth_flow_version");
        const dest =
          flowVersion === "v1"
            ? "/onboarding?meta=connected"
            : flowVersion === "v2new"
            ? "/loginv2?meta=connected"
            : "/onboarding-v2?meta=connected";
        navigate(dest);
      } catch (err: any) {
        console.error("Token exchange error:", err);
        handleError(err.message || "Failed to connect Meta account.");
      }
    };

    const handleError = (msg: string) => {
      if (window.opener) {
        window.opener.postMessage({ type: "META_AUTH_ERROR", error: msg }, window.location.origin);
        window.close();
        return;
      }
      setError(msg);
      setTimeout(() => navigate("/"), 5000);
    };

    exchangeToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-destructive font-medium mb-2">{error}</p>
            <p className="text-sm text-muted-foreground">Redirecting back…</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-foreground font-medium">Connecting your Meta account…</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait while we finish setup.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default MetaCallback;
