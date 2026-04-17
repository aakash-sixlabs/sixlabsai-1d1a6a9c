// Phase 2: meta-sync-creatives
// Fetches creative details in batches, downloads & rehosts images, writes
// ad_creatives + creatives, updates prod_ads.creative_url.
// Chains to meta-sync-insights.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function fetchCreativesInBatches(
  creativeIds: string[],
  accessToken: string,
): Promise<Record<string, any>> {
  const BATCH_SIZE = 50;
  const results: Record<string, any> = {};

  for (let i = 0; i < creativeIds.length; i += BATCH_SIZE) {
    const batch = creativeIds.slice(i, i + BATCH_SIZE);
    const ids = batch.join(",");
    const url =
      `https://graph.facebook.com/v21.0/` +
      `?ids=${ids}` +
      `&fields=id,name,image_url,image_hash,thumbnail_url,title,body,object_story_spec` +
      `&access_token=${accessToken}`;

    let attempt = 0;
    while (true) {
      try {
        const response = await fetch(url);
        const data = await response.json().catch(() => ({}));
        const err = data?.error;
        const isRateLimited =
          response.status === 429 ||
          [4, 17, 32, 613].includes(err?.code) ||
          err?.code_subcode === 2446079 ||
          err?.error_subcode === 2446079 ||
          /rate limit|too many calls|user request limit/i.test(err?.message || "");
        if (isRateLimited && attempt < 5) {
          const waitMs = 10_000 * Math.pow(2, attempt);
          console.warn(`Creative batch rate limited (attempt ${attempt + 1}), waiting ${waitMs}ms`);
          await new Promise((r) => setTimeout(r, waitMs));
          attempt++;
          continue;
        }
        if (err) {
          console.error(`Creative batch ${Math.floor(i / BATCH_SIZE)} failed:`, err);
          break;
        }
        Object.assign(results, data);
        break;
      } catch (fetchErr) {
        console.error(`Creative batch ${Math.floor(i / BATCH_SIZE)} threw:`, fetchErr);
        break;
      }
    }
    // Polite gap between batches
    await new Promise((r) => setTimeout(r, 500));
  }
  return results;
}

function classifyCreative(creative: any): string {
  const objStorySpec = creative.object_story_spec;
  if (!objStorySpec) return "excluded_other";
  if (objStorySpec.video_data || creative.video_id) return "excluded_video";
  if (creative.asset_feed_spec) return "excluded_dynamic";
  if (objStorySpec.link_data) {
    const linkData = objStorySpec.link_data;
    if (linkData.child_attachments && linkData.child_attachments.length > 0) {
      const hasVideo = linkData.child_attachments.some((c: any) => c.video_id);
      return hasVideo ? "excluded_other" : "static_carousel";
    }
    if (linkData.image_hash || linkData.picture) return "static_single";
  }
  if (objStorySpec.photo_data) return "static_single";
  return "excluded_other";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // This function is invoked server-to-server with service role; no user JWT check.
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
      try {
        const { data: adAccount } = await admin
          .from("ad_accounts")
          .select("*, meta_connections(*)")
          .eq("id", adAccountId)
          .single();
        if (!adAccount) throw new Error("Ad account not found");
        const accessToken = adAccount.meta_connections.access_token;

        // Load all stored ads for this user in this brand
        const { data: storedAds } = await admin
          .from("ads")
          .select("id, ad_id, creative_id")
          .eq("user_id", userId);

        const creativeIds = [
          ...new Set(
            (storedAds || [])
              .map((a: any) => a.creative_id)
              .filter(Boolean) as string[],
          ),
        ];

        await updateStep(`Fetching ${creativeIds.length} creatives`);
        const creativeMap = await fetchCreativesInBatches(creativeIds, accessToken);

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        let processed = 0;
        const total = (storedAds || []).length;

        for (const storedAd of storedAds || []) {
          processed++;
          if (processed % 25 === 0) {
            await updateStep(`Processing creatives (${processed}/${total})`);
          }

          const creative = storedAd.creative_id
            ? creativeMap[storedAd.creative_id] || {}
            : {};
          const creativeType = classifyCreative(creative);

          const objStory = creative.object_story_spec || {};
          const linkData = objStory.link_data || {};
          const fbImageUrls: string[] = [];
          if (linkData.picture) fbImageUrls.push(linkData.picture);
          if (linkData.image_url) fbImageUrls.push(linkData.image_url);
          if (creative.image_url) fbImageUrls.push(creative.image_url);
          if (linkData.child_attachments) {
            for (const child of linkData.child_attachments) {
              if (child.picture) fbImageUrls.push(child.picture);
              if (child.image_url) fbImageUrls.push(child.image_url);
            }
          }

          const uniqueFbUrls = [...new Set(fbImageUrls)];
          const storedImageUrls: string[] = [];
          for (let imgIdx = 0; imgIdx < uniqueFbUrls.length; imgIdx++) {
            try {
              const imgRes = await fetch(uniqueFbUrls[imgIdx]);
              if (!imgRes.ok) continue;
              const contentType = imgRes.headers.get("content-type") || "image/jpeg";
              const imgBuffer = await imgRes.arrayBuffer();
              const ext = contentType.includes("png")
                ? "png"
                : contentType.includes("webp")
                ? "webp"
                : "jpg";
              const storagePath = `${userId}/${storedAd.id}_${imgIdx}.${ext}`;
              const { error: uploadError } = await admin.storage
                .from("ad-creatives")
                .upload(storagePath, imgBuffer, { contentType, upsert: true });
              if (!uploadError) {
                storedImageUrls.push(
                  `${supabaseUrl}/storage/v1/object/public/ad-creatives/${storagePath}`,
                );
              }
            } catch (imgErr) {
              console.error(`Image ${imgIdx} failed for ad ${storedAd.ad_id}:`, imgErr);
            }
          }

          // ad_creatives
          await admin.from("ad_creatives").upsert(
            {
              ad_id: storedAd.id,
              user_id: userId,
              creative_id: creative.id || storedAd.ad_id,
              creative_type: creativeType,
              image_urls: storedImageUrls,
              headline: linkData.title || linkData.name || null,
              primary_text: linkData.message || objStory.photo_data?.message || null,
              description: linkData.description || null,
              destination_url: linkData.link || null,
              call_to_action: linkData.call_to_action?.type || null,
              raw_data: creative,
            },
            { onConflict: "creative_id", ignoreDuplicates: false },
          );

          const primaryImageUrl = storedImageUrls[0] || null;

          // prod_ads.creative_url
          await admin
            .from("prod_ads")
            .update({ creative_url: primaryImageUrl })
            .eq("meta_ad_id", storedAd.ad_id)
            .eq("brand_id", brandId);

          // creatives (production)
          const creativeLookupQuery = admin
            .from("creatives")
            .select("id")
            .eq("brand_id", brandId);
          const { data: existingCreative } = primaryImageUrl
            ? await creativeLookupQuery.eq("image_url", primaryImageUrl).maybeSingle()
            : await creativeLookupQuery.limit(1).maybeSingle();

          const payload = {
            brand_id: brandId,
            image_url: primaryImageUrl,
            copy_headline: linkData.title || linkData.name || null,
            copy_body: linkData.message || objStory.photo_data?.message || null,
            copy_cta: linkData.call_to_action?.type || null,
            source: "meta",
            platform: "facebook",
          };

          if (existingCreative) {
            await admin.from("creatives").update(payload).eq("id", existingCreative.id);
          } else {
            await admin.from("creatives").insert(payload);
          }
        }

        await updateStep("Pulling performance data", { phase: "insights" });

        // Chain to phase 3
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        await fetch(`${supabaseUrl}/functions/v1/meta-sync-insights`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ syncId, adAccountId, userId, brandId }),
        });
      } catch (err: any) {
        console.error("meta-sync-creatives error:", err);
        await failJob(err?.message || "Creatives phase failed");
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
    console.error("meta-sync-creatives fatal:", err);
    if (syncId) {
      await admin.from("sync_jobs").update({
        status: "error",
        error_message: err?.message || "Creatives phase failed",
        updated_at: new Date().toISOString(),
      }).eq("id", syncId);
    }
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
