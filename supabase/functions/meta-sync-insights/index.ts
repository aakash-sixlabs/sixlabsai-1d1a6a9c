// Phase 3: meta-sync-insights
// Pulls day-by-day insights, self-chaining via sync_jobs.cursor_date when a run
// approaches the edge function wall limit. Writes ad_performance_daily,
// campaign_ad_data, and aggregated ad_insights. On final day → status=complete.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Soft time budget per invocation. Insights HTTP + writes can be slow,
// so we re-invoke ourselves well before the 150s wall limit.
const SOFT_TIME_BUDGET_MS = 100_000;

async function fetchAllPages(url: string) {
  const results: any[] = [];
  let nextUrl: string | null = url;
  while (nextUrl) {
    let attempt = 0;
    let data: any;
    // Retry loop for rate limits (HTTP 429 or Meta error codes 4/17/32/613, subcode 2446079)
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
        throw new Error(
          `Meta rate limit hit after ${attempt} retries: ${err?.message || res.status}`,
        );
      }
      // Exponential backoff: 10s, 20s, 40s, 80s, 160s
      const waitMs = 10_000 * Math.pow(2, attempt);
      console.warn(`Rate limited by Meta (attempt ${attempt + 1}), waiting ${waitMs}ms`);
      await new Promise((r) => setTimeout(r, waitMs));
      attempt++;
    }

    if (data?.error) throw new Error(data.error.message);
    results.push(...(data.data || []));
    nextUrl = data.paging?.next || null;
    if (results.length > 5000) break;
    // Small inter-page delay to be polite
    if (nextUrl) await new Promise((r) => setTimeout(r, 250));
  }
  return results;
}

// Gentle delay between per-day insights requests to stay under Meta's ads rate limit.
const PER_DAY_DELAY_MS = 1500;


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let syncId: string | null = null;
  try {
    const body = await req.json();
    syncId = body.syncId;
    const { adAccountId, userId, brandId } = body;
    if (!syncId || !adAccountId || !userId || !brandId) {
      return new Response(JSON.stringify({ error: "Missing params" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

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
      const started = Date.now();
      try {
        const { data: job } = await admin
          .from("sync_jobs")
          .select("date_range_start, date_range_end, cursor_date")
          .eq("id", syncId!)
          .single();
        if (!job) throw new Error("Sync job not found");

        const dateStart = new Date(job.date_range_start);
        const dateEnd = new Date(job.date_range_end);
        const cursor = job.cursor_date
          ? new Date(job.cursor_date)
          : new Date(dateStart);

        const { data: adAccount } = await admin
          .from("ad_accounts")
          .select("*, meta_connections(*)")
          .eq("id", adAccountId)
          .single();
        if (!adAccount) throw new Error("Ad account not found");
        const accessToken = adAccount.meta_connections.access_token;
        const actId = adAccount.account_id.startsWith("act_")
          ? adAccount.account_id
          : `act_${adAccount.account_id}`;

        // Preload lookups (lightweight)
        const { data: allStoredAds } = await admin
          .from("ads")
          .select("id, ad_id, ad_name, status, adset_id")
          .eq("user_id", userId);
        const adMap = new Map(
          (allStoredAds || []).map((a: any) => [a.ad_id, a.id]),
        );
        const adInfoByMetaId = new Map(
          (allStoredAds || []).map((a: any) => [a.ad_id, a]),
        );

        const { data: allProdAds } = await admin
          .from("prod_ads")
          .select("id, meta_ad_id")
          .eq("brand_id", brandId);
        const prodAdIdMap = new Map<string, number>(
          (allProdAds || []).map((a: any) => [a.meta_ad_id as string, a.id as number]),
        );

        const msPerDay = 86400000;
        const totalDays = Math.max(
          1,
          Math.ceil((dateEnd.getTime() - dateStart.getTime()) / msPerDay) + 1,
        );

        let current = new Date(cursor);
        let daysThisRun = 0;

        while (current.getTime() <= dateEnd.getTime()) {
          // Time budget check — chain before wall limit
          if (Date.now() - started > SOFT_TIME_BUDGET_MS) {
            const cursorIso = current.toISOString().split("T")[0];
            await admin.from("sync_jobs").update({
              cursor_date: cursorIso,
              current_step: `Pulling performance (${cursorIso})`,
              updated_at: new Date().toISOString(),
            }).eq("id", syncId!);

            // Self-chain
            const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
            const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
            await fetch(`${supabaseUrl}/functions/v1/meta-sync-insights`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceKey}`,
              },
              body: JSON.stringify({ syncId, adAccountId, userId, brandId }),
            });
            return;
          }

          const day = current.toISOString().split("T")[0];
          const dayRange = `{"since":"${day}","until":"${day}"}`;

          let dayInsights: any[] = [];
          try {
            dayInsights = await fetchAllPages(
              `https://graph.facebook.com/v21.0/${actId}/insights?fields=ad_id,spend,impressions,clicks,ctr,cpc,cpm,actions,action_values,frequency,reach&level=ad&time_range=${encodeURIComponent(dayRange)}&limit=500&access_token=${accessToken}`,
            );
          } catch (dayErr: any) {
            console.error(`Insights fetch failed for ${day}:`, dayErr?.message || dayErr);
          }

          for (const insight of dayInsights) {
            const storedAdId = adMap.get(insight.ad_id);
            const prodAdId = prodAdIdMap.get(insight.ad_id);

            const purchases = insight.actions?.find(
              (a: any) => a.action_type === "offsite_conversion" || a.action_type === "purchase",
            )?.value || 0;
            const convValue = insight.action_values?.find(
              (a: any) => a.action_type === "offsite_conversion" || a.action_type === "purchase",
            )?.value || 0;

            const spend = parseFloat(insight.spend || "0");
            const impressions = parseInt(insight.impressions || "0");
            const clicks = parseInt(insight.clicks || "0");
            const ctr = parseFloat(insight.ctr || "0");
            const cpc = parseFloat(insight.cpc || "0");
            const cpm = parseFloat(insight.cpm || "0");
            const frequency = parseFloat(insight.frequency || "0");
            const reach = parseInt(insight.reach || "0");
            const roas = spend > 0 ? parseFloat(convValue) / spend : 0;
            const insightDate = insight.date_start;

            if (prodAdId) {
              const { data: existingPerf } = await admin
                .from("ad_performance_daily")
                .select("id")
                .eq("ad_id", prodAdId)
                .eq("date", insightDate)
                .maybeSingle();

              if (existingPerf) {
                await admin.from("ad_performance_daily").update({
                  impressions, clicks, spend, ctr, frequency, roas,
                  platform: "facebook",
                }).eq("id", existingPerf.id);
              } else {
                await admin.from("ad_performance_daily").insert({
                  ad_id: prodAdId,
                  date: insightDate,
                  impressions, clicks, spend, ctr, frequency, roas,
                  platform: "facebook",
                });
              }

              const storedAdInfo = adInfoByMetaId.get(insight.ad_id);

              const { data: existingCad } = await admin
                .from("campaign_ad_data")
                .select("id")
                .eq("brand_id", brandId)
                .eq("ad_id", insight.ad_id)
                .eq("date", insightDate)
                .maybeSingle();

              const cadRow = {
                brand_id: brandId,
                ad_id: insight.ad_id,
                ad_name: storedAdInfo?.ad_name || null,
                ad_status: storedAdInfo?.status || null,
                date: insightDate,
                impressions, clicks, spend, reach, ctr, cpc, cpm, frequency, roas,
                purchases: parseInt(purchases),
                platform: "facebook",
              };

              if (existingCad) {
                await admin.from("campaign_ad_data").update(cadRow).eq("id", existingCad.id);
              } else {
                await admin.from("campaign_ad_data").insert(cadRow);
              }
            }

            // Legacy aggregate (one row per ad over full range)
            if (storedAdId) {
              const { data: existingAgg } = await admin
                .from("ad_insights")
                .select("id, spend, impressions, clicks, conversions, conversion_value")
                .eq("ad_id", storedAdId)
                .maybeSingle();

              const nextSpend = (existingAgg?.spend || 0) + spend;
              const nextImpressions = (existingAgg?.impressions || 0) + impressions;
              const nextClicks = (existingAgg?.clicks || 0) + clicks;
              const nextConversions = (existingAgg?.conversions || 0) + parseInt(purchases);
              const nextConvValue = (existingAgg?.conversion_value || 0) + parseFloat(convValue);

              const aggCtr = nextImpressions > 0 ? (nextClicks / nextImpressions) * 100 : 0;
              const aggCpc = nextClicks > 0 ? nextSpend / nextClicks : 0;
              const aggCpm = nextImpressions > 0 ? (nextSpend / nextImpressions) * 1000 : 0;
              const aggRoas = nextSpend > 0 ? nextConvValue / nextSpend : 0;

              await admin.from("ad_insights").upsert(
                {
                  ad_id: storedAdId,
                  user_id: userId,
                  date_start: job.date_range_start,
                  date_stop: job.date_range_end,
                  spend: nextSpend,
                  impressions: nextImpressions,
                  clicks: nextClicks,
                  ctr: aggCtr, cpc: aggCpc, cpm: aggCpm, roas: aggRoas,
                  conversions: nextConversions,
                  conversion_value: nextConvValue,
                },
                { onConflict: "ad_id", ignoreDuplicates: false },
              );
            }
          }

          daysThisRun++;
          if (daysThisRun % 5 === 0) {
            await updateStep(`Pulling performance (${day})`);
          }

          current = new Date(current.getTime() + msPerDay);
          if (current.getTime() <= dateEnd.getTime()) {
            await new Promise((r) => setTimeout(r, PER_DAY_DELAY_MS));
          }
        }

        // Done
        await admin.from("sync_jobs").update({
          status: "complete",
          current_step: "Complete",
          phase: "complete",
          cursor_date: null,
          updated_at: new Date().toISOString(),
        }).eq("id", syncId!);
      } catch (err: any) {
        console.error("meta-sync-insights error:", err);
        await failJob(err?.message || "Insights phase failed");
      }
    };

    // @ts-ignore
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(runPhase());
    } else {
      runPhase();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("meta-sync-insights fatal:", err);
    if (syncId) {
      await admin.from("sync_jobs").update({
        status: "error",
        error_message: err?.message || "Insights phase failed",
        updated_at: new Date().toISOString(),
      }).eq("id", syncId);
    }
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
