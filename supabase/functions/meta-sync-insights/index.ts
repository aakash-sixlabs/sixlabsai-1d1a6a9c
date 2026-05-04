// Phase 3: meta-sync-insights
// Pulls day-by-day insights, writes to ad_performance_daily (new schema with
// user_id, reach, cpc, cpm, purchases, revenue, roas).
// Self-chains via sync_jobs.cursor_date when approaching wall limit.
// On final day → REFRESH MATERIALIZED VIEW campaign_ad_data, mark complete.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SOFT_TIME_BUDGET_MS = 100_000;
const PER_DAY_DELAY_MS = 1500;

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
        throw new Error(
          `Meta rate limit hit after ${attempt} retries: ${err?.message || res.status}`,
        );
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

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let syncId: string | null = null;
  try {
    const body = await req.json();
    syncId = body.syncId;
    const { adAccountId, userId, brandId, accountId } = body;
    if (!syncId || !adAccountId || !userId || !accountId) {
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
          status: "failed",
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
        const metaActIdRaw: string = adAccount.account_id_meta;
        const actId = metaActIdRaw.startsWith("act_") ? metaActIdRaw : `act_${metaActIdRaw}`;

        // Map Meta ad_id → internal ads.id (new schema: meta_ad_id)
        const { data: allStoredAds } = await admin
          .from("ads")
          .select("id, meta_ad_id")
          .eq("account_id", accountId);
        const adMap = new Map<string, string>(
          (allStoredAds || []).map((a: any) => [a.meta_ad_id as string, a.id as string]),
        );

        const msPerDay = 86400000;
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

          const perfRows: any[] = [];
          for (const insight of dayInsights) {
            const internalAdId = adMap.get(insight.ad_id);
            if (!internalAdId) continue;

            const purchases = parseInt(
              insight.actions?.find(
                (a: any) =>
                  a.action_type === "purchase" ||
                  a.action_type === "offsite_conversion.fb_pixel_purchase" ||
                  a.action_type === "offsite_conversion",
              )?.value || "0",
            );
            const revenue = parseFloat(
              insight.action_values?.find(
                (a: any) =>
                  a.action_type === "purchase" ||
                  a.action_type === "offsite_conversion.fb_pixel_purchase" ||
                  a.action_type === "offsite_conversion",
              )?.value || "0",
            );

            const spend = parseFloat(insight.spend || "0");
            const impressions = parseInt(insight.impressions || "0");
            const clicks = parseInt(insight.clicks || "0");
            const ctr = parseFloat(insight.ctr || "0");
            const cpc = parseFloat(insight.cpc || "0");
            const cpm = parseFloat(insight.cpm || "0");
            const frequency = parseFloat(insight.frequency || "0");
            const reach = parseInt(insight.reach || "0");
            const roas = spend > 0 ? revenue / spend : 0;
            const costPerPurchase = purchases > 0 ? spend / purchases : 0;

            perfRows.push({
              user_id: userId,
              ad_id: internalAdId,
              date: insight.date_start,
              impressions,
              clicks,
              spend,
              reach,
              ctr,
              cpc,
              cpm,
              frequency,
              purchases,
              revenue,
              roas,
              cost_per_purchase: costPerPurchase,
              platform: "facebook",
            });
          }

          if (perfRows.length > 0) {
            await admin.from("ad_performance_daily").upsert(perfRows, {
              onConflict: "user_id,ad_id,date",
            });
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

        // Refresh the materialized view so dashboard sees fresh data
        try {
          await admin.rpc("refresh_campaign_ad_data");
        } catch (refreshErr) {
          console.warn("MV refresh failed (non-fatal):", refreshErr);
        }

        await admin.from("sync_jobs").update({
          status: "complete",
          current_step: "Complete",
          phase: "done",
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
