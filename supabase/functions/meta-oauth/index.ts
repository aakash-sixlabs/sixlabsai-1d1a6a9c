import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const META_APP_ID = "916100447718452";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Step 1: Generate OAuth URL
    if (action === "get-auth-url") {
      const { redirectUri } = await req.json();
      const state = crypto.randomUUID();
      const authUrl =
        `https://www.facebook.com/v21.0/dialog/oauth?` +
        `client_id=${META_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${state}` +
        `&scope=ads_read,business_management` +
        `&response_type=code`;

      return new Response(JSON.stringify({ authUrl, state }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Exchange code for token
    if (action === "exchange-token") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: corsHeaders,
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: corsHeaders,
        });
      }
      const userId = userData.user.id;

      const { code, redirectUri } = await req.json();
      const META_APP_SECRET = Deno.env.get("META_APP_SECRET")!;

      // Exchange code for short-lived token
      const tokenRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?` +
          `client_id=${META_APP_ID}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&client_secret=${META_APP_SECRET}` +
          `&code=${code}`
      );
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        return new Response(
          JSON.stringify({ error: tokenData.error.message }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Exchange for long-lived token
      const longTokenRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?` +
          `grant_type=fb_exchange_token` +
          `&client_id=${META_APP_ID}` +
          `&client_secret=${META_APP_SECRET}` +
          `&fb_exchange_token=${tokenData.access_token}`
      );
      const longTokenData = await longTokenRes.json();
      const accessToken = longTokenData.access_token || tokenData.access_token;
      const expiresIn = longTokenData.expires_in || 3600;

      // Get user info
      const meRes = await fetch(
        `https://graph.facebook.com/v21.0/me?access_token=${accessToken}`
      );
      const meData = await meRes.json();

      // Store connection using service role
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: connection, error: insertError } = await adminClient
        .from("meta_connections")
        .upsert(
          {
            user_id: userId,
            access_token: accessToken,
            token_expires_at: new Date(
              Date.now() + expiresIn * 1000
            ).toISOString(),
            meta_user_id: meData.id,
            meta_user_name: meData.name,
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }

      // Fetch ad accounts
      const accountsRes = await fetch(
        `https://graph.facebook.com/v21.0/me/adaccounts?fields=name,account_id,currency,timezone_name,amount_spent&access_token=${accessToken}`
      );
      const accountsData = await accountsRes.json();

      const accounts = (accountsData.data || []).map((acc: any) => ({
        connection_id: connection.id,
        user_id: userId,
        account_id: acc.account_id || acc.id,
        account_name: acc.name || `Account ${acc.account_id}`,
        currency: acc.currency || "USD",
        timezone: acc.timezone_name,
      }));

      if (accounts.length > 0) {
        await adminClient.from("ad_accounts").upsert(accounts, {
          onConflict: "account_id",
          ignoreDuplicates: true,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          connectionId: connection.id,
          userName: meData.name,
          accounts: accountsData.data || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
