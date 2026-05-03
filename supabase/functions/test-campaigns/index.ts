import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TEST_MAX_RECORDS = 200;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchAllPages(url: string, maxRecords = Number.MAX_SAFE_INTEGER): Promise<any[]> {
  const results: any[] = [];
  let nextUrl: string | null = url;

  while (nextUrl && results.length < maxRecords) {
    const response = await fetch(nextUrl);
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    if (data.data) results.push(...data.data);
    nextUrl = results.length < maxRecords ? (data.paging?.next ?? null) : null;
    await new Promise((r) => setTimeout(r, 300));
  }

  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const prodAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { adAccountId, accessToken, dateRangeDays = 90 } = await req.json();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dateRangeDays);
    const since = cutoffDate.toISOString().split("T")[0];
    const until = new Date().toISOString().split("T")[0];

    // Get user_id and meta account id
    const { data: adAccount, error: adAccountErr } = await prodAdmin
      .from("ad_accounts")
      .select("account_id, user_id, account_id_meta")
      .eq("id", adAccountId)
      .maybeSingle();

    if (adAccountErr || !adAccount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Ad account ${adAccountId} not found`,
          db_error: adAccountErr?.message ?? null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const metaAccountId = adAccount.account_id_meta.startsWith("act_")
      ? adAccount.account_id_meta
      : `act_${adAccount.account_id_meta}`;
    const userId = adAccount.user_id;
    const accountId = adAccount.account_id;

    // STEP 1 — Pull ALL ACTIVE campaigns
    const activeCampaigns = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${metaAccountId}/campaigns` +
        `?fields=id,name,status,effective_status,objective,` +
        `daily_budget,lifetime_budget,start_time,stop_time,updated_time` +
        `&effective_status=["ACTIVE"]` +
        `&limit=100` +
        `&access_token=${accessToken}`,
    );

    // STEP 2 — Pull campaign insights for last N days
    // to find which campaigns had impressions
    const insightRows = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${metaAccountId}/insights` +
        `?level=campaign` +
        `&fields=campaign_id,impressions` +
        `&time_range={"since":"${since}","until":"${until}"}` +
        `&limit=100` +
        `&access_token=${accessToken}`,
    );

    // Build set of campaign IDs with impressions
    const campaignsWithImpressions = new Set(insightRows.map((r: any) => r.campaign_id));

    // STEP 3 — Pull ALL PAUSED campaigns
    const pausedCampaigns = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${metaAccountId}/campaigns` +
        `?fields=id,name,status,effective_status,objective,` +
        `daily_budget,lifetime_budget,start_time,stop_time,updated_time` +
        `&effective_status=["PAUSED"]` +
        `&limit=100` +
        `&access_token=${accessToken}`,
    );

    // STEP 4 — Filter paused to only those with at least 1 impression
    const relevantPausedCampaigns = pausedCampaigns.filter((c: any) => campaignsWithImpressions.has(c.id));

    // STEP 5 — Merge and deduplicate
    const seen = new Set();
    const results = [...activeCampaigns, ...relevantPausedCampaigns].filter((c: any) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

    // STEP 6 — Build rows and upsert
    const rows = results.map((c: any) => ({
      account_id: accountId,
      user_id: userId,
      ad_account_id: adAccountId,
      meta_campaign_id: c.id,
      name: c.name,
      status: c.status ?? null,
      effective_status: c.effective_status ?? null,
      objective: c.objective ?? null,
      daily_budget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
      lifetime_budget: c.lifetime_budget ? parseFloat(c.lifetime_budget) / 100 : null,
      start_time: c.start_time ?? null,
      stop_time: c.stop_time ?? null,
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await admin.from("campaigns").upsert(rows, {
      onConflict: "meta_campaign_id",
      ignoreDuplicates: false,
    });

    // STEP 7 — Return response
    return new Response(
      JSON.stringify({
        success: !upsertError,
        date_range: `${since} to ${until}`,
        total_active_pulled: activeCampaigns.length,
        total_paused_pulled: pausedCampaigns.length,
        total_paused_with_impressions: relevantPausedCampaigns.length,
        total_paused_excluded: pausedCampaigns.length - relevantPausedCampaigns.length,
        total_merged: results.length,
        total_stored: upsertError ? 0 : rows.length,
        upsert_error: upsertError?.message ?? null,
        sample: results.slice(0, 3),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
