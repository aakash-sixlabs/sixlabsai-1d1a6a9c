import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getUserAccountId } from "../_shared/account.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v21.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: identify the calling user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const accessToken: string | undefined = body?.accessToken?.trim();
    const adAccountIdRaw: string | undefined = body?.adAccountId?.trim();
    if (!accessToken || accessToken.length < 20) {
      return json({ error: "Invalid access token" }, 400);
    }

    // Normalize: accept "act_123" or "123"
    const adAccountId = adAccountIdRaw
      ? adAccountIdRaw.startsWith("act_")
        ? adAccountIdRaw
        : `act_${adAccountIdRaw}`
      : undefined;

    // 1. Validate token via /me
    const meRes = await fetch(
      `${GRAPH}/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`
    );
    const me = await meRes.json();
    if (!meRes.ok || me.error) {
      return json(
        { error: me?.error?.message || "Token validation failed" },
        400
      );
    }

    // 2. Fetch ad accounts — either the specific one, or all accessible
    let accounts: Array<{
      id: string;
      account_id: string;
      name: string;
      currency?: string;
      timezone_name?: string;
    }> = [];

    if (adAccountId) {
      const oneRes = await fetch(
        `${GRAPH}/${adAccountId}?fields=id,account_id,name,currency,timezone_name&access_token=${encodeURIComponent(accessToken)}`
      );
      const oneJson = await oneRes.json();
      if (!oneRes.ok || oneJson.error) {
        return json(
          {
            error:
              oneJson?.error?.message ||
              `Cannot access ad account ${adAccountId}`,
          },
          400
        );
      }
      accounts = [oneJson];
    } else {
      const acctRes = await fetch(
        `${GRAPH}/me/adaccounts?fields=id,account_id,name,currency,timezone_name&limit=200&access_token=${encodeURIComponent(accessToken)}`
      );
      const acctJson = await acctRes.json();
      if (!acctRes.ok || acctJson.error) {
        return json(
          { error: acctJson?.error?.message || "Failed to list ad accounts" },
          400
        );
      }
      accounts = acctJson.data || [];
    }

    // 3. Upsert via service role (bypasses RLS for write but scoped to this user)
    const admin = createClient(supabaseUrl, serviceKey);

    // Resolve the Lovable tenant account_id for this user
    const tenantAccountId = await getUserAccountId(admin, user.id);

    // Reuse existing connection row for this user if present, else insert
    const { data: existingConn } = await admin
      .from("meta_connections")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let connectionId: string;
    if (existingConn?.id) {
      const { error: updErr } = await admin
        .from("meta_connections")
        .update({
          access_token: accessToken,
          meta_user_id: me.id,
          meta_user_name: me.name,
          token_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConn.id);
      if (updErr) throw updErr;
      connectionId = existingConn.id;
    } else {
      const { data: ins, error: insErr } = await admin
        .from("meta_connections")
        .insert({
          user_id: user.id,
          account_id: tenantAccountId,
          access_token: accessToken,
          meta_user_id: me.id,
          meta_user_name: me.name,
          token_expires_at: null,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      connectionId = ins.id;
    }

    // 4. Upsert ad accounts
    const upsertedAccounts: Array<{
      id: string;
      account_id: string;
      account_name: string;
      currency: string;
      timezone: string | null;
    }> = [];

    for (const a of accounts) {
      const { data: existing } = await admin
        .from("ad_accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("account_id_meta", a.account_id)
        .maybeSingle();

      const payload = {
        user_id: user.id,
        account_id: tenantAccountId,
        connection_id: connectionId,
        account_id_meta: a.account_id,
        account_name: a.name,
        currency: a.currency || "USD",
        timezone: a.timezone_name || null,
        connection_status: "connected",
      };

      if (existing?.id) {
        await admin.from("ad_accounts").update(payload).eq("id", existing.id);
        upsertedAccounts.push({
          id: existing.id,
          account_id: a.account_id,
          account_name: a.name,
          currency: a.currency || "USD",
          timezone: a.timezone_name || null,
        });
      } else {
        const { data: newAcc } = await admin
          .from("ad_accounts")
          .insert(payload)
          .select("id")
          .single();
        if (newAcc) {
          upsertedAccounts.push({
            id: newAcc.id,
            account_id: a.account_id,
            account_name: a.name,
            currency: a.currency || "USD",
            timezone: a.timezone_name || null,
          });
        }
      }
    }

    // Return shape compatible with existing wizard sessionStorage consumer
    return json({
      connectionId,
      userName: me.name,
      accounts: upsertedAccounts.map((a) => ({
        id: a.id,
        account_id: a.account_id,
        name: a.account_name,
        currency: a.currency,
      })),
    });
  } catch (err: any) {
    console.error("[meta-token-connect] error", err);
    return json({ error: err?.message || "Internal error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
