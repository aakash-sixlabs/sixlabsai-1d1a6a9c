// Phase 1: meta-sync-accounts
// Fetches campaigns + adsets + ads (skeleton) under the new schema:
//   campaigns(meta_campaign_id, name, ...) → ad_sets(meta_adset_id, ...) → ads(meta_ad_id, meta_creative_id)
// Chains to meta-sync-creatives.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function fetchAllPages(url: string) {
  const results: any[] = [];
  let nextUrl: string | null = url;
  while (nextUrl) {
    let attempt = 0;
    let data: any;
    while (true) {
      const res = await fetch(nextUrl);
      data = await res.json().catch(() => ({}));
      const err = data?.error;
      const isRateLimited =
        res.status === 429 ||
        [4, 17, 32, 613].includes(err?.code) ||
        err?.code_subcode === 2446079 ||
        err?.error_subcode === 2446079 ||
        /rate limit|too many calls|user request limit/i.test(err?.message || "");
      if (!isRateLimited) break;
      if (attempt >= 5) {
        throw new Error(`Meta rate limit hit after ${attempt} retries: ${err?.message || res.status}`);
      }
      const waitMs = 10_000 * Math.pow(2, attempt);
      console.warn(`Rate limited by Meta (attempt ${attempt + 1}), waiting ${waitMs}ms`);
      await new Promise((r) => setTimeout(r, waitMs));
      attempt++;
    }
    if (data?.error) throw new Error(data.error.message);
    results.push(...(data.data || []));
    nextUrl = data.paging?.next || null;
    if (results.length > 5000) break;
    if (nextUrl) await new Promise((r) => setTimeout(r, 250));
  }
  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    const userId = userData.user.id;

    const { adAccountId, dateRangeDays } = await req.json();

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: adAccount } = await admin
      .from("ad_accounts")
      .select("*, meta_connections(*)")
      .eq("id", adAccountId)
      .eq("user_id", userId)
      .single();

    if (!adAccount) {
      return new Response(
        JSON.stringify({ error: "Ad account not found" }),
        { status: 404, headers: corsHeaders },
      );
    }

    const accessToken = adAccount.meta_connections.access_token;
    const actId = adAccount.account_id.startsWith("act_")
      ? adAccount.account_id
      : `act_${adAccount.account_id}`;

    // Upsert brand (still used for analytics view)
    const { data: existingBrand } = await admin
      .from("brands")
      .select("id")
      .eq("user_id", userId)
      .eq("meta_account_id", adAccount.account_id)
      .maybeSingle();

    let brandId: number;
    if (existingBrand) {
      brandId = existingBrand.id;
      await admin.from("brands").update({
        name: adAccount.account_name,
        account_currency: adAccount.currency || "USD",
        account_timezone: adAccount.timezone || null,
      }).eq("id", brandId);
    } else {
      const { data: newBrand } = await admin.from("brands").insert({
        user_id: userId,
        name: adAccount.account_name,
        meta_account_id: adAccount.account_id,
        account_currency: adAccount.currency || "USD",
        account_timezone: adAccount.timezone || null,
      }).select("id").single();
      brandId = newBrand!.id;
    }

    const dateEnd = new Date();
    const dateStart = new Date();
    dateStart.setDate(dateEnd.getDate() - (parseInt(dateRangeDays) || 30));

    const { data: syncJob } = await admin
      .from("sync_jobs")
      .insert({
        user_id: userId,
        ad_account_id: adAccountId,
        status: "syncing",
        phase: "accounts",
        current_step: "Pulling campaigns and ad sets",
        date_range_start: dateStart.toISOString().split("T")[0],
        date_range_end: dateEnd.toISOString().split("T")[0],
      })
      .select()
      .single();

    const syncId = syncJob!.id;

    const updateStep = async (step: string, patch: Record<string, unknown> = {}) => {
      await admin
        .from("sync_jobs")
        .update({ current_step: step, updated_at: new Date().toISOString(), ...patch })
        .eq("id", syncId);
    };
    const failJob = async (message: string) => {
      await admin
        .from("sync_jobs")
        .update({
          status: "error",
          error_message: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", syncId);
    };

    // TEST MODE: cap each entity to keep Meta API calls minimal during debugging.
    const TEST_MODE_LIMIT = 10;

    const runPhase = async () => {
      try {
        // 1. Campaigns
        await updateStep("Pulling campaigns");
        const allCampaigns = await fetchAllPages(
          `https://graph.facebook.com/v21.0/${actId}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,start_time,stop_time&limit=500&access_token=${accessToken}`,
        );
        const campaigns = allCampaigns.slice(0, TEST_MODE_LIMIT);
        console.log(`TEST MODE: ${allCampaigns.length} campaigns → using ${campaigns.length}`);

        const campaignRecords = campaigns.map((c: any) => ({
          ad_account_id: adAccountId,
          user_id: userId,
          meta_campaign_id: c.id,
          name: c.name,
          status: c.status,
          effective_status: c.effective_status,
          objective: c.objective,
          daily_budget: c.daily_budget ? parseFloat(c.daily_budget) : null,
          lifetime_budget: c.lifetime_budget ? parseFloat(c.lifetime_budget) : null,
          start_time: c.start_time || null,
          stop_time: c.stop_time || null,
        }));
        if (campaignRecords.length > 0) {
          await admin.from("campaigns").upsert(campaignRecords, {
            onConflict: "user_id,meta_campaign_id",
          });
        }

        const { data: storedCampaigns } = await admin
          .from("campaigns")
          .select("id, meta_campaign_id")
          .eq("ad_account_id", adAccountId);
        const campaignMap = new Map(
          (storedCampaigns || []).map((c: any) => [c.meta_campaign_id, c.id]),
        );

        // 2. Adsets
        await updateStep("Pulling ad sets", { total_campaigns: campaigns.length });
        const allAdsets = await fetchAllPages(
          `https://graph.facebook.com/v21.0/${actId}/adsets?fields=id,name,status,effective_status,campaign_id,daily_budget,lifetime_budget,optimization_goal,billing_event,targeting,start_time,end_time&limit=500&access_token=${accessToken}`,
        );
        const adsets = allAdsets
          .filter((as: any) => campaignMap.has(as.campaign_id))
          .slice(0, TEST_MODE_LIMIT);
        console.log(`TEST MODE: ${allAdsets.length} adsets → using ${adsets.length}`);

        const adsetRecords = adsets.map((as: any) => ({
          campaign_id: campaignMap.get(as.campaign_id),
          user_id: userId,
          meta_adset_id: as.id,
          name: as.name,
          status: as.status,
          effective_status: as.effective_status,
          daily_budget: as.daily_budget ? parseFloat(as.daily_budget) : null,
          lifetime_budget: as.lifetime_budget ? parseFloat(as.lifetime_budget) : null,
          optimization_goal: as.optimization_goal || null,
          billing_event: as.billing_event || null,
          targeting: as.targeting || null,
          start_time: as.start_time || null,
          end_time: as.end_time || null,
        }));
        if (adsetRecords.length > 0) {
          await admin.from("ad_sets").upsert(adsetRecords, {
            onConflict: "user_id,meta_adset_id",
          });
        }

        const { data: storedAdsets } = await admin
          .from("ad_sets")
          .select("id, meta_adset_id")
          .eq("user_id", userId);
        const adsetMap = new Map(
          (storedAdsets || []).map((a: any) => [a.meta_adset_id, a.id]),
        );

        // 3. Ads (lightweight skeleton) — id, name, status, adset_id, creative.id only
        await updateStep("Pulling ads", { total_adsets: adsets.length });
        const allRawAds = await fetchAllPages(
          `https://graph.facebook.com/v21.0/${actId}/ads?fields=id,name,status,effective_status,adset_id,creative{id}&limit=100&access_token=${accessToken}`,
        );
        const rawAds = allRawAds
          .filter((ad: any) => adsetMap.has(ad.adset_id))
          .slice(0, TEST_MODE_LIMIT);
        console.log(`TEST MODE: ${allRawAds.length} ads → using ${rawAds.length}`);

        const adRecords = rawAds.map((ad: any) => ({
          ad_set_id: adsetMap.get(ad.adset_id),
          user_id: userId,
          meta_ad_id: ad.id,
          name: ad.name || "",
          status: ad.status,
          effective_status: ad.effective_status,
          meta_creative_id: ad.creative?.id || null,
        }));
        if (adRecords.length > 0) {
          await admin.from("ads").upsert(adRecords, {
            onConflict: "user_id,meta_ad_id",
          });
        }

        await updateStep("Pulling creatives", {
          phase: "creatives",
          total_ads: adRecords.length,
        });

        // Chain to phase 2
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        await fetch(`${supabaseUrl}/functions/v1/meta-sync-creatives`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ syncId, adAccountId, userId, brandId }),
        });
      } catch (err: any) {
        console.error("meta-sync-accounts error:", err);
        await failJob(err?.message || "Accounts phase failed");
      }
    };

    // @ts-ignore
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(runPhase());
    } else {
      runPhase();
    }

    return new Response(
      JSON.stringify({ success: true, syncJobId: syncId, started: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("meta-sync-accounts error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
