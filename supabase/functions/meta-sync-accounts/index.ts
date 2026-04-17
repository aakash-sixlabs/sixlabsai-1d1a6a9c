// Phase 1: meta-sync-accounts
// Fetches campaigns + adsets + ads (skeleton), writes to campaigns/ad_sets/ads/prod_ads.
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

    // Upsert brand
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

    // Create sync job
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

    const runPhase = async () => {
      try {
        // 1. Campaigns
        await updateStep("Pulling campaigns");
        const campaigns = await fetchAllPages(
          `https://graph.facebook.com/v21.0/${actId}/campaigns?fields=id,name,status,objective&limit=500&access_token=${accessToken}`,
        );

        const campaignRecords = campaigns.map((c: any) => ({
          ad_account_id: adAccountId,
          user_id: userId,
          campaign_id: c.id,
          campaign_name: c.name,
          status: c.status,
          objective: c.objective,
        }));
        if (campaignRecords.length > 0) {
          await admin.from("campaigns").upsert(campaignRecords, {
            onConflict: "campaign_id",
            ignoreDuplicates: true,
          });
        }

        const { data: storedCampaigns } = await admin
          .from("campaigns")
          .select("id, campaign_id")
          .eq("ad_account_id", adAccountId);
        const campaignMap = new Map(
          (storedCampaigns || []).map((c: any) => [c.campaign_id, c.id]),
        );

        // 2. Adsets
        await updateStep("Pulling ad sets");
        const adsets = await fetchAllPages(
          `https://graph.facebook.com/v21.0/${actId}/adsets?fields=id,name,status,campaign_id,targeting&limit=500&access_token=${accessToken}`,
        );

        const adsetRecords = adsets
          .filter((as: any) => campaignMap.has(as.campaign_id))
          .map((as: any) => ({
            campaign_id: campaignMap.get(as.campaign_id),
            user_id: userId,
            adset_id: as.id,
            adset_name: as.name,
            status: as.status,
            targeting: as.targeting || null,
          }));
        if (adsetRecords.length > 0) {
          await admin.from("ad_sets").upsert(adsetRecords, {
            onConflict: "adset_id",
            ignoreDuplicates: true,
          });
        }

        const { data: storedAdsets } = await admin
          .from("ad_sets")
          .select("id, adset_id")
          .eq("user_id", userId);
        const adsetMap = new Map(
          (storedAdsets || []).map((a: any) => [a.adset_id, a.id]),
        );

        // 3. Ads (lightweight skeleton)
        await updateStep("Pulling ads");
        const rawAds = await fetchAllPages(
          `https://graph.facebook.com/v21.0/${actId}/ads?fields=id,name,status,adset_id,creative{id}&limit=100&access_token=${accessToken}`,
        );

        let totalAds = 0;
        for (const ad of rawAds) {
          if (!adsetMap.has(ad.adset_id)) continue;
          totalAds++;

          const { data: storedAd } = await admin
            .from("ads")
            .upsert(
              {
                adset_id: adsetMap.get(ad.adset_id),
                user_id: userId,
                ad_id: ad.id,
                ad_name: ad.name || "",
                status: ad.status,
                creative_id: ad.creative?.id || null,
              },
              { onConflict: "ad_id", ignoreDuplicates: false },
            )
            .select()
            .single();

          if (!storedAd) continue;

          // prod_ads (skeleton without creative_url yet)
          const { data: existingProdAd } = await admin
            .from("prod_ads")
            .select("id")
            .eq("meta_ad_id", ad.id)
            .eq("brand_id", brandId)
            .maybeSingle();

          if (existingProdAd) {
            await admin.from("prod_ads").update({
              name: ad.name || "",
              status: ad.status,
              adset_id: ad.adset_id,
              parent_ad_id: null,
            }).eq("id", existingProdAd.id);
          } else {
            await admin.from("prod_ads").insert({
              brand_id: brandId,
              meta_ad_id: ad.id,
              adset_id: ad.adset_id,
              name: ad.name || "",
              status: ad.status,
              parent_ad_id: null,
            });
          }
        }

        await updateStep("Pulling creatives", {
          phase: "creatives",
          total_ads: totalAds,
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
