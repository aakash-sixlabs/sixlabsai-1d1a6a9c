// Phase 2: meta-sync-creatives
// Fetches creative details in batches, downloads & rehosts images,
// writes to ad_creatives (new schema with meta_creative_id, image_hash,
// stored_image_url(s), raw_asset_feed_spec, raw_object_story_spec).
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
      `&fields=id,name,image_url,image_hash,thumbnail_url,title,body,call_to_action_type,object_story_spec,asset_feed_spec` +
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
    await new Promise((r) => setTimeout(r, 500));
  }
  return results;
}

function classifyCreative(creative: any): string {
  const objStorySpec = creative.object_story_spec;
  const afs = creative.asset_feed_spec;

  // Detect video assets FIRST (covers standard video and video DCO).
  // Otherwise an asset_feed_spec containing only videos would be misclassified
  // as "dco" and produce ad_creatives rows with null image_hash.
  const hasVideoAssets = Array.isArray(afs?.videos) && afs.videos.length > 0;
  const hasVideoId =
    !!creative.video_id ||
    !!objStorySpec?.video_data ||
    !!objStorySpec?.video_data?.video_id;
  if (hasVideoAssets || hasVideoId) return "video";

  if (afs) return "dco";
  if (!objStorySpec) return "unknown";
  if (objStorySpec.link_data) {
    const linkData = objStorySpec.link_data;
    if (linkData.child_attachments && linkData.child_attachments.length > 0) {
      const hasVideo = linkData.child_attachments.some((c: any) => c.video_id);
      return hasVideo ? "video" : "static_carousel";
    }
    if (linkData.image_hash || linkData.picture) return "static_single";
  }
  if (objStorySpec.photo_data) return "static_single";
  return "unknown";
}

// Extract all image hashes + CDN URLs we can find from a creative payload
function extractImages(creative: any): { hashes: string[]; urls: string[] } {
  const hashes: string[] = [];
  const urls: string[] = [];

  if (creative.image_hash) hashes.push(creative.image_hash);
  if (creative.image_url) urls.push(creative.image_url);

  const oss = creative.object_story_spec || {};
  const linkData = oss.link_data || {};
  if (linkData.image_hash) hashes.push(linkData.image_hash);
  if (linkData.picture) urls.push(linkData.picture);
  if (linkData.image_url) urls.push(linkData.image_url);
  if (Array.isArray(linkData.child_attachments)) {
    for (const child of linkData.child_attachments) {
      if (child.image_hash) hashes.push(child.image_hash);
      if (child.picture) urls.push(child.picture);
      if (child.image_url) urls.push(child.image_url);
    }
  }
  if (oss.photo_data?.image_hash) hashes.push(oss.photo_data.image_hash);
  if (oss.photo_data?.url) urls.push(oss.photo_data.url);

  // DCO asset_feed_spec
  const afs = creative.asset_feed_spec;
  if (afs?.images && Array.isArray(afs.images)) {
    for (const img of afs.images) {
      if (img.hash) hashes.push(img.hash);
      if (img.url) urls.push(img.url);
    }
  }

  return {
    hashes: [...new Set(hashes)],
    urls: [...new Set(urls)],
  };
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

        // Load all stored ads for this user (new schema: meta_ad_id, meta_creative_id)
        const { data: storedAds } = await admin
          .from("ads")
          .select("id, meta_ad_id, meta_creative_id")
          .eq("user_id", userId);

        const creativeIds = [
          ...new Set(
            (storedAds || [])
              .map((a: any) => a.meta_creative_id)
              .filter(Boolean) as string[],
          ),
        ];

        await updateStep(`Fetching ${creativeIds.length} creatives`, {
          total_creatives: creativeIds.length,
        });
        const creativeMap = await fetchCreativesInBatches(creativeIds, accessToken);

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        let processed = 0;
        let imagesDownloaded = 0;
        let videosSkipped = 0;
        let creativesStored = 0;
        const typeCounts: Record<string, number> = {};
        const total = (storedAds || []).length;

        for (const storedAd of storedAds || []) {
          processed++;
          if (processed % 25 === 0) {
            await updateStep(`Processing creatives (${processed}/${total})`, {
              images_downloaded: imagesDownloaded,
            });
          }

          const creative = storedAd.meta_creative_id
            ? creativeMap[storedAd.meta_creative_id] || {}
            : {};
          const creativeType = classifyCreative(creative);
          typeCounts[creativeType] = (typeCounts[creativeType] || 0) + 1;

          // Videos: tag the ads row but skip ad_creatives entirely (matches test-creatives)
          if (creativeType === "video") {
            await admin
              .from("ads")
              .update({ media_type: "video" })
              .eq("id", storedAd.id);
            videosSkipped++;
            continue;
          }

          const oss = creative.object_story_spec || {};
          const linkData = oss.link_data || {};

          const { hashes, urls } = extractImages(creative);

          // Download + rehost each image to Supabase Storage
          const storedImageUrls: string[] = [];
          for (let imgIdx = 0; imgIdx < urls.length; imgIdx++) {
            try {
              const imgRes = await fetch(urls[imgIdx]);
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
                imagesDownloaded++;
              }
            } catch (imgErr) {
              console.error(`Image ${imgIdx} failed for ad ${storedAd.meta_ad_id}:`, imgErr);
            }
          }

          const primaryHash = hashes[0] || null;
          const primaryFbUrl = urls[0] || null;
          const primaryStoredUrl = storedImageUrls[0] || null;

          // Upsert into new ad_creatives schema
          await admin.from("ad_creatives").upsert(
            {
              user_id: userId,
              ad_id: storedAd.id,
              meta_creative_id: creative.id || storedAd.meta_creative_id || storedAd.meta_ad_id,
              creative_type: creativeType,
              headline: linkData.title || linkData.name || creative.title || null,
              primary_text:
                linkData.message ||
                oss.photo_data?.message ||
                creative.body ||
                null,
              description: linkData.description || null,
              cta_type:
                linkData.call_to_action?.type ||
                creative.call_to_action_type ||
                null,
              destination_url: linkData.link || null,
              image_hash: primaryHash,
              image_url: primaryFbUrl,
              stored_image_url: primaryStoredUrl,
              image_hashes: hashes,
              stored_image_urls: storedImageUrls,
              raw_asset_feed_spec: creative.asset_feed_spec || null,
              raw_object_story_spec: oss && Object.keys(oss).length ? oss : null,
              raw_data: creative,
            },
            { onConflict: "user_id,meta_creative_id" },
          );

          // Keep ads.media_type consistent with creative_type
          await admin
            .from("ads")
            .update({ media_type: creativeType })
            .eq("id", storedAd.id);

          creativesStored++;
        }

        console.log(
          `Creatives processed: ${processed} total | stored: ${creativesStored} | videos skipped: ${videosSkipped} | by type:`,
          typeCounts,
        );

        await updateStep("Pulling performance data", {
          phase: "insights",
          images_downloaded: imagesDownloaded,
        });

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
