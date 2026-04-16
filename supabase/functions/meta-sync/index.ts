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
    const res = await fetch(nextUrl);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    results.push(...(data.data || []));
    nextUrl = data.paging?.next || null;
    if (results.length > 5000) break;
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

    const { adAccountId, dateRangeDays } = await req.json();

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get ad account
    const { data: adAccount } = await admin
      .from("ad_accounts")
      .select("*, meta_connections(*)")
      .eq("id", adAccountId)
      .eq("user_id", userId)
      .single();

    if (!adAccount) {
      return new Response(
        JSON.stringify({ error: "Ad account not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    const accessToken = adAccount.meta_connections.access_token;
    const actId = adAccount.account_id.startsWith("act_")
      ? adAccount.account_id
      : `act_${adAccount.account_id}`;

    // ── Production: Upsert brand ──
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
        meta_access_token: accessToken,
        account_currency: adAccount.currency || "USD",
        account_timezone: adAccount.timezone || null,
      }).eq("id", brandId);
    } else {
      const { data: newBrand } = await admin.from("brands").insert({
        user_id: userId,
        name: adAccount.account_name,
        meta_account_id: adAccount.account_id,
        meta_access_token: accessToken,
        account_currency: adAccount.currency || "USD",
        account_timezone: adAccount.timezone || null,
      }).select("id").single();
      brandId = newBrand!.id;
    }

    // Create sync job
    const dateEnd = new Date();
    const dateStart = new Date();
    dateStart.setDate(dateEnd.getDate() - (parseInt(dateRangeDays) || 90));

    const { data: syncJob } = await admin
      .from("sync_jobs")
      .insert({
        user_id: userId,
        ad_account_id: adAccountId,
        status: "syncing",
        current_step: "Connecting to Meta",
        date_range_start: dateStart.toISOString().split("T")[0],
        date_range_end: dateEnd.toISOString().split("T")[0],
      })
      .select()
      .single();

    const syncId = syncJob!.id;
    const updateStep = async (step: string) => {
      await admin
        .from("sync_jobs")
        .update({ current_step: step, updated_at: new Date().toISOString() })
        .eq("id", syncId);
    };

    // 1. Fetch campaigns
    await updateStep("Pulling campaigns and ad sets");
    const campaigns = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${actId}/campaigns?fields=id,name,status,objective&limit=500&access_token=${accessToken}`
    );

    // Legacy write
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

    // Build campaign lookup (Meta ID → name/status/objective)
    const campaignLookup = new Map<string, any>();
    campaigns.forEach((c: any) => campaignLookup.set(c.id, c));

    const { data: storedCampaigns } = await admin
      .from("campaigns")
      .select("id, campaign_id")
      .eq("ad_account_id", adAccountId);
    const campaignMap = new Map(
      (storedCampaigns || []).map((c: any) => [c.campaign_id, c.id])
    );

    // 2. Fetch ad sets
    const adsets = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${actId}/adsets?fields=id,name,status,campaign_id,targeting,daily_budget,lifetime_budget&limit=500&access_token=${accessToken}`
    );

    // Legacy write
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

    // Build adset lookup (Meta ID → adset data)
    const adsetLookup = new Map<string, any>();
    adsets.forEach((as: any) => adsetLookup.set(as.id, as));

    const { data: storedAdsets } = await admin
      .from("ad_sets")
      .select("id, adset_id")
      .eq("user_id", userId);
    const adsetMap = new Map(
      (storedAdsets || []).map((a: any) => [a.adset_id, a.id])
    );

    // 3. Fetch ads with creatives
    await updateStep("Pulling ads, creatives & downloading images");
    const ads = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${actId}/ads?fields=id,name,status,adset_id,creative{id,name,object_story_spec,asset_feed_spec,image_url,image_hash,video_id,thumbnail_url}&limit=500&access_token=${accessToken}`
    );

    let totalAds = 0;
    let supportedAds = 0;
    let unsupportedAds = 0;

    // Map from Meta ad ID → prod_ads.id
    const prodAdIdMap = new Map<string, number>();

    for (const ad of ads) {
      if (!adsetMap.has(ad.adset_id)) continue;
      totalAds++;

      // Legacy: insert ad
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
          { onConflict: "ad_id", ignoreDuplicates: false }
        )
        .select()
        .single();

      if (!storedAd) continue;

      // Production: insert into prod_ads
      const { data: existingProdAd } = await admin
        .from("prod_ads")
        .select("id")
        .eq("meta_ad_id", ad.id)
        .eq("brand_id", brandId)
        .maybeSingle();

      let prodAdId: number;
      const creativeType = classifyCreative(ad.creative || {});
      if (existingProdAd) {
        prodAdId = existingProdAd.id;
        await admin.from("prod_ads").update({
          name: ad.name || "",
          status: ad.status,
          adset_id: ad.adset_id,
          creative_url: ad.creative?.image_url || ad.creative?.thumbnail_url || null,
          parent_ad_id: null,
        }).eq("id", prodAdId);
      } else {
        const { data: newProdAd } = await admin.from("prod_ads").insert({
          brand_id: brandId,
          meta_ad_id: ad.id,
          adset_id: ad.adset_id,
          name: ad.name || "",
          status: ad.status,
          creative_url: ad.creative?.image_url || ad.creative?.thumbnail_url || null,
          parent_ad_id: null,
        }).select("id").single();
        prodAdId = newProdAd!.id;
      }
      prodAdIdMap.set(ad.id, prodAdId);

      // Classify and store creative
      const creative = ad.creative || {};

      if (creativeType === "static_single" || creativeType === "static_carousel") {
        supportedAds++;
      } else {
        unsupportedAds++;
      }

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
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

      for (let imgIdx = 0; imgIdx < uniqueFbUrls.length; imgIdx++) {
        try {
          const imgRes = await fetch(uniqueFbUrls[imgIdx]);
          if (!imgRes.ok) continue;
          const contentType = imgRes.headers.get("content-type") || "image/jpeg";
          const imgBuffer = await imgRes.arrayBuffer();
          const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
          const storagePath = `${userId}/${storedAd.id}_${imgIdx}.${ext}`;
          const { error: uploadError } = await admin.storage
            .from("ad-creatives")
            .upload(storagePath, imgBuffer, { contentType, upsert: true });
          if (!uploadError) {
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/ad-creatives/${storagePath}`;
            storedImageUrls.push(publicUrl);
          }
        } catch (imgErr) {
          console.error(`Failed to download image ${imgIdx} for ad ${ad.id}:`, imgErr);
        }
      }

      // Legacy: ad_creatives
      await admin.from("ad_creatives").upsert(
        {
          ad_id: storedAd.id,
          user_id: userId,
          creative_id: creative.id || ad.id,
          creative_type: creativeType,
          image_urls: storedImageUrls,
          headline: linkData.title || linkData.name || null,
          primary_text: linkData.message || objStory.photo_data?.message || null,
          description: linkData.description || null,
          destination_url: linkData.link || null,
          call_to_action: linkData.call_to_action?.type || null,
          raw_data: creative,
        },
        { onConflict: "creative_id", ignoreDuplicates: false }
      );

      // Use first stored image URL for image_url
      const primaryImageUrl = storedImageUrls.length > 0 ? storedImageUrls[0] : null;

      // Production: creatives table
      const creativeLookupQuery = admin
        .from("creatives")
        .select("id")
        .eq("brand_id", brandId);

      const { data: existingCreative } = primaryImageUrl
        ? await creativeLookupQuery.eq("image_url", primaryImageUrl).maybeSingle()
        : await creativeLookupQuery.limit(1).maybeSingle();

      if (existingCreative) {
        await admin.from("creatives").update({
          image_url: primaryImageUrl,
          copy_headline: linkData.title || linkData.name || null,
          copy_body: linkData.message || objStory.photo_data?.message || null,
          copy_cta: linkData.call_to_action?.type || null,
          source: "meta",
          platform: "facebook",
        }).eq("id", existingCreative.id);
      } else {
        await admin.from("creatives").insert({
          brand_id: brandId,
          image_url: primaryImageUrl,
          copy_headline: linkData.title || linkData.name || null,
          copy_body: linkData.message || objStory.photo_data?.message || null,
          copy_cta: linkData.call_to_action?.type || null,
          source: "meta",
          platform: "facebook",
        });
      }
    }

    // 4. Fetch insights — daily granularity
    await updateStep("Pulling ad performance");
    const timeRange = `{"since":"${dateStart.toISOString().split("T")[0]}","until":"${dateEnd.toISOString().split("T")[0]}"}`;
    const insights = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${actId}/insights?fields=ad_id,spend,impressions,clicks,ctr,cpc,cpm,actions,action_values,frequency,reach&level=ad&time_increment=1&time_range=${encodeURIComponent(timeRange)}&limit=500&access_token=${accessToken}`
    );

    // Legacy: get stored ads map
    const { data: allStoredAds } = await admin
      .from("ads")
      .select("id, ad_id")
      .eq("user_id", userId);
    const adMap = new Map(
      (allStoredAds || []).map((a: any) => [a.ad_id, a.id])
    );

    await updateStep("Filtering supported formats");

    // Aggregate legacy insights (sum across days for the old table)
    const legacyAgg = new Map<string, any>();

    for (const insight of insights) {
      const storedAdId = adMap.get(insight.ad_id);
      const prodAdId = prodAdIdMap.get(insight.ad_id);

      const purchases = insight.actions?.find(
        (a: any) => a.action_type === "offsite_conversion" || a.action_type === "purchase"
      )?.value || 0;
      const convValue = insight.action_values?.find(
        (a: any) => a.action_type === "offsite_conversion" || a.action_type === "purchase"
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

      // Production: ad_performance_daily (one row per ad per day)
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

        // Production: campaign_ad_data (flattened row per ad per day)
        const origAd = ads.find((a: any) => a.id === insight.ad_id);
        const origAdset = origAd ? adsetLookup.get(origAd.adset_id) : undefined;
        const origCampaign = origAdset ? campaignLookup.get(origAdset.campaign_id) : undefined;

        // Get creative info
        const creative = origAd?.creative || {};
        const objStory = creative.object_story_spec || {};
        const linkData = objStory.link_data || {};

        const { data: existingCad } = await admin
          .from("campaign_ad_data")
          .select("id")
          .eq("brand_id", brandId)
          .eq("ad_id", insight.ad_id)
          .eq("date", insightDate)
          .maybeSingle();

        const cadRow = {
          brand_id: brandId,
          campaign_id: origCampaign?.id || null,
          campaign_name: origCampaign?.name || null,
          campaign_status: origCampaign?.status || null,
          adset_id: origAdset?.id || null,
          adset_name: origAdset?.name || null,
          adset_status: origAdset?.status || null,
          ad_id: insight.ad_id,
          ad_name: origAd?.name || null,
          ad_status: origAd?.status || null,
          creative_id: creative.id || null,
          creative_title: linkData.title || linkData.name || null,
          creative_body: linkData.message || objStory.photo_data?.message || null,
          creative_image_url: creative.image_url || creative.thumbnail_url || null,
          creative_thumbnail_url: creative.thumbnail_url || null,
          call_to_action: linkData.call_to_action?.type || null,
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

      // Legacy: aggregate for ad_insights (single row per ad)
      if (storedAdId) {
        if (!legacyAgg.has(storedAdId)) {
          legacyAgg.set(storedAdId, { spend: 0, impressions: 0, clicks: 0, conversions: 0, convValue: 0 });
        }
        const agg = legacyAgg.get(storedAdId)!;
        agg.spend += spend;
        agg.impressions += impressions;
        agg.clicks += clicks;
        agg.conversions += parseInt(purchases);
        agg.convValue += parseFloat(convValue);
      }
    }

    // Legacy: write aggregated ad_insights
    for (const [storedAdId, agg] of legacyAgg) {
      const ctr = agg.impressions > 0 ? (agg.clicks / agg.impressions) * 100 : 0;
      const cpc = agg.clicks > 0 ? agg.spend / agg.clicks : 0;
      const cpm = agg.impressions > 0 ? (agg.spend / agg.impressions) * 1000 : 0;
      const roas = agg.spend > 0 ? agg.convValue / agg.spend : 0;

      await admin.from("ad_insights").upsert(
        {
          ad_id: storedAdId,
          user_id: userId,
          date_start: dateStart.toISOString().split("T")[0],
          date_stop: dateEnd.toISOString().split("T")[0],
          spend: agg.spend,
          impressions: agg.impressions,
          clicks: agg.clicks,
          ctr, cpc, cpm, roas,
          conversions: agg.conversions,
          conversion_value: agg.convValue,
        },
        { onConflict: "ad_id", ignoreDuplicates: false }
      );
    }

    // 5. Complete
    await updateStep("Preparing insights");
    await admin
      .from("sync_jobs")
      .update({
        status: "complete",
        current_step: "Complete",
        total_ads: totalAds,
        supported_ads: supportedAds,
        unsupported_ads: unsupportedAds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", syncId);

    return new Response(
      JSON.stringify({
        success: true,
        syncJobId: syncId,
        totalAds,
        supportedAds,
        unsupportedAds,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("meta-sync error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
