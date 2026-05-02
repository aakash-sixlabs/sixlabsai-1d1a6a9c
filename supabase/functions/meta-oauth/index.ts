import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getUserAccountId } from "../_shared/account.ts";
import { getProdSupabaseUrl } from "../_shared/supabase-url.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const META_APP_ID = "1447202220484619";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Step 1: Generate OAuth URL (public — no auth needed)
    if (action === "get-auth-url") {
      const { redirectUri } = await req.json();
      console.log("[meta-oauth] get-auth-url redirectUri:", redirectUri);
      const state = crypto.randomUUID();
      const authUrl =
        `https://www.facebook.com/v21.0/dialog/oauth?` +
        `client_id=${META_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${state}` +
        `&scope=ads_read,business_management,email` +
        `&response_type=code`;

      return new Response(JSON.stringify({ authUrl, state }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Exchange code for token + create/find user + return session token
    if (action === "exchange-token") {
      const { code, redirectUri } = await req.json();
      console.log("[meta-oauth] exchange-token redirectUri:", redirectUri);
      const META_APP_SECRET = Deno.env.get("META_APP_SECRET")!;

      const adminClient = createClient(
        getProdSupabaseUrl(),
        Deno.env.get("PROD_SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Exchange code for short-lived token
      const tokenUrl =
        `https://graph.facebook.com/v21.0/oauth/access_token?` +
        `client_id=${META_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&client_secret=${META_APP_SECRET}` +
        `&code=${code}`;
      console.log("[meta-oauth] token exchange URL (sans secret):", tokenUrl.replace(META_APP_SECRET, "***"));

      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();
      console.log("[meta-oauth] token exchange response:", JSON.stringify(tokenData).substring(0, 200));

      if (tokenData.error) {
        console.error("[meta-oauth] token exchange error:", tokenData.error);
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
      console.log("[meta-oauth] long-lived token response status:", longTokenRes.status);
      const accessToken = longTokenData.access_token || tokenData.access_token;
      const expiresIn = longTokenData.expires_in || 3600;

      // Get user info including email
      const meRes = await fetch(
        `https://graph.facebook.com/v21.0/me?fields=id,name,email&access_token=${accessToken}`
      );
      const meData = await meRes.json();
      console.log("[meta-oauth] me data:", JSON.stringify({ id: meData.id, name: meData.name, email: meData.email }));

      // Use Meta User ID as the primary identity
      const placeholderEmail = `meta_${meData.id}@users.noreply`;

      // Create or find Supabase auth user
      let userId: string;

      const { data: listData } = await adminClient.auth.admin.listUsers();
      const existingUser = listData?.users?.find(
        (u: any) => u.user_metadata?.meta_user_id === meData.id
      );

      if (existingUser) {
        userId = existingUser.id;
        console.log("[meta-oauth] found existing user:", userId);
      } else {
        const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
          email: placeholderEmail,
          email_confirm: true,
          user_metadata: {
            full_name: meData.name,
            meta_user_id: meData.id,
          },
        });

        if (createError) {
          console.error("[meta-oauth] create user error:", createError);
          return new Response(
            JSON.stringify({ error: "Failed to create user account." }),
            { status: 500, headers: corsHeaders }
          );
        }
        userId = createData.user.id;
        console.log("[meta-oauth] created new user:", userId);
      }

      // Generate magic link token for session
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: placeholderEmail,
      });

      if (linkError || !linkData) {
        console.error("[meta-oauth] generate link error:", linkError);
        return new Response(
          JSON.stringify({ error: "Failed to generate session link." }),
          { status: 500, headers: corsHeaders }
        );
      }

      const tokenHash = linkData.properties?.hashed_token;

      // Resolve Lovable tenant account_id (created by handle_new_user trigger)
      const tenantAccountId = await getUserAccountId(adminClient, userId);

      // Store Meta connection
      const { data: connection, error: insertError } = await adminClient
        .from("meta_connections")
        .upsert(
          {
            user_id: userId,
            account_id: tenantAccountId,
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
        console.error("[meta-oauth] insert connection error:", insertError);
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }

      // Update profile
      await adminClient
        .from("profiles")
        .upsert({
          id: userId,
          email: meData.email || null,
          full_name: meData.name,
          meta_user_id: meData.id,
        }, { onConflict: "id" });

      // Fetch ad accounts
      const accountsRes = await fetch(
        `https://graph.facebook.com/v21.0/me/adaccounts?fields=name,account_id,currency,timezone_name,amount_spent&access_token=${accessToken}`
      );
      const accountsData = await accountsRes.json();
      console.log("[meta-oauth] ad accounts count:", (accountsData.data || []).length);

      const accounts = (accountsData.data || []).map((acc: any) => ({
        connection_id: connection.id,
        user_id: userId,
        account_id: tenantAccountId,
        account_id_meta: acc.account_id || acc.id,
        account_name: acc.name || `Account ${acc.account_id}`,
        currency: acc.currency || "USD",
        timezone: acc.timezone_name,
        connection_status: "connected",
      }));

      if (accounts.length > 0) {
        // Preserve existing account row IDs so saved defaults, brand kits, and
        // synced data tied to those accounts are not lost on every re-login.
        await adminClient.from("ad_accounts").upsert(accounts, {
          onConflict: "user_id,account_id_meta",
        });
      }

      // Fetch Facebook pages
      const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,category&access_token=${accessToken}`
      );
      const pagesData = await pagesRes.json();

      const isNewUser = !existingUser;

      let defaultAdAccountId = null;
      let defaultAdAccountName = null;
      let defaultMetaAccountId = null;
      if (!isNewUser) {
        const { data: profile } = await adminClient
          .from("profiles")
          .select("default_ad_account_id")
          .eq("id", userId)
          .single();
        if (profile?.default_ad_account_id) {
          const { data: defaultAcc } = await adminClient
            .from("ad_accounts")
            .select("id, account_id_meta, account_name")
            .eq("id", profile.default_ad_account_id)
            .single();
          if (defaultAcc) {
            defaultAdAccountId = defaultAcc.id;
            defaultAdAccountName = defaultAcc.account_name;
            defaultMetaAccountId = defaultAcc.account_id_meta;
          }
        }
      }

      console.log("[meta-oauth] exchange-token complete, isNewUser:", isNewUser);

      return new Response(
        JSON.stringify({
          success: true,
          tokenHash,
          email: meData.email,
          connectionId: connection.id,
          userName: meData.name,
          userEmail: meData.email || null,
          metaUserId: meData.id,
          accounts: accountsData.data || [],
          pages: pagesData.data || [],
          isNewUser,
          defaultAdAccountId,
          defaultAdAccountName,
          defaultMetaAccountId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("[meta-oauth] unhandled error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
