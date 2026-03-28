import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
        setError("Meta connection was cancelled.");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received.");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/meta-callback`;
        const { data, error: fnError } = await supabase.functions.invoke(
          "meta-oauth?action=exchange-token",
          {
            body: { code, redirectUri },
          }
        );

        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);

        // Establish session via magic link OTP verification
        if (data.tokenHash && data.email) {
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash: data.tokenHash,
            type: "magiclink",
          });
          if (otpError) throw otpError;
        }

        // Store connection info in sessionStorage for the wizard
        sessionStorage.setItem("meta_connection", JSON.stringify({
          connectionId: data.connectionId,
          userName: data.userName,
          userEmail: data.userEmail,
          metaUserId: data.metaUserId,
          accounts: data.accounts,
          pages: data.pages || [],
        }));

        navigate("/?meta=connected");
      } catch (err: any) {
        console.error("Token exchange error:", err);
        setError(err.message || "Failed to connect Meta account.");
        setTimeout(() => navigate("/"), 5000);
      }
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
