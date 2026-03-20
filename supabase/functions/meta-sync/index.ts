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
    // Safety limit
    if (results.length > 5000) break;
  }
  return results;
}

function classifyCreative(creative: any): string {
  const objStorySpec = creative.object_story_spec;
  if (!objStorySpec) return "excluded_other";

  // Video
  if (objStorySpec.video_data || creative.video_id) return "excluded_video";

  // Dynamic creative
  if (creative.asset_feed_spec) return "excluded_dynamic";

  // Link ad with image
  if (objStorySpec.link_data) {
    const linkData = objStorySpec.link_data;
    // Carousel
    if (linkData.child_attachments && linkData.child_attachments.length > 0) {
      const hasVideo = linkData.child_attachments.some(
        (c: any) => c.video_id
      );
      return hasVideo ? "excluded_other" : "static_carousel";
    }
    // Single image
    if (linkData.image_hash || linkData.picture) return "static_single";
  }

  // Photo post
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

    // Fetch stored campaigns to get UUIDs
    const { data: storedCampaigns } = await admin
      .from("campaigns")
      .select("id, campaign_id")
      .eq("ad_account_id", adAccountId);
    const campaignMap = new Map(
      (storedCampaigns || []).map((c: any) => [c.campaign_id, c.id])
    );

    // 2. Fetch ad sets
    const adsets = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${actId}/adsets?fields=id,name,status,campaign_id,targeting&limit=500&access_token=${accessToken}`
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
      (storedAdsets || []).map((a: any) => [a.adset_id, a.id])
    );

    // 3. Fetch ads with creatives
    await updateStep("Pulling ads and creatives");
    const ads = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${actId}/ads?fields=id,name,status,adset_id,creative{id,name,object_story_spec,asset_feed_spec,image_url,image_hash,video_id,thumbnail_url}&limit=500&access_token=${accessToken}`
    );

    let totalAds = 0;
    let supportedAds = 0;
    let unsupportedAds = 0;

    for (const ad of ads) {
      if (!adsetMap.has(ad.adset_id)) continue;
      totalAds++;

      // Insert ad
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

      // Classify and store creative
      const creative = ad.creative || {};
      const creativeType = classifyCreative(creative);

      if (
        creativeType === "static_single" ||
        creativeType === "static_carousel"
      ) {
        supportedAds++;
      } else {
        unsupportedAds++;
      }

      const objStory = creative.object_story_spec || {};
      const linkData = objStory.link_data || {};
      const imageUrls: string[] = [];

      if (linkData.picture) imageUrls.push(linkData.picture);
      if (linkData.image_url) imageUrls.push(linkData.image_url);
      if (creative.image_url) imageUrls.push(creative.image_url);
      if (linkData.child_attachments) {
        for (const child of linkData.child_attachments) {
          if (child.picture) imageUrls.push(child.picture);
          if (child.image_url) imageUrls.push(child.image_url);
        }
      }

      await admin.from("ad_creatives").upsert(
        {
          ad_id: storedAd.id,
          user_id: userId,
          creative_id: creative.id || ad.id,
          creative_type: creativeType,
          image_urls: imageUrls,
          headline: linkData.title || linkData.name || null,
          primary_text: linkData.message || objStory.photo_data?.message || null,
          description: linkData.description || null,
          destination_url: linkData.link || null,
          call_to_action: linkData.call_to_action?.type || null,
          raw_data: creative,
        },
        { onConflict: "creative_id", ignoreDuplicates: false }
      );
    }

    // 4. Fetch insights
    await updateStep("Pulling ad performance");
    const timeRange = `{"since":"${dateStart.toISOString().split("T")[0]}","until":"${dateEnd.toISOString().split("T")[0]}"}`;
    const insights = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${actId}/insights?fields=ad_id,spend,impressions,clicks,ctr,cpc,cpm,actions,action_values&level=ad&time_range=${encodeURIComponent(timeRange)}&limit=500&access_token=${accessToken}`
    );

    // Get stored ads map
    const { data: allStoredAds } = await admin
      .from("ads")
      .select("id, ad_id")
      .eq("user_id", userId);
    const adMap = new Map(
      (allStoredAds || []).map((a: any) => [a.ad_id, a.id])
    );

    await updateStep("Filtering supported formats");

    for (const insight of insights) {
      const storedAdId = adMap.get(insight.ad_id);
      if (!storedAdId) continue;

      const conversions =
        insight.actions?.find(
          (a: any) =>
            a.action_type === "offsite_conversion" ||
            a.action_type === "purchase"
        )?.value || 0;
      const convValue =
        insight.action_values?.find(
          (a: any) =>
            a.action_type === "offsite_conversion" ||
            a.action_type === "purchase"
        )?.value || 0;

      const spend = parseFloat(insight.spend || "0");
      const roas = spend > 0 ? parseFloat(convValue) / spend : 0;

      await admin.from("ad_insights").upsert(
        {
          ad_id: storedAdId,
          user_id: userId,
          date_start: dateStart.toISOString().split("T")[0],
          date_stop: dateEnd.toISOString().split("T")[0],
          spend,
          impressions: parseInt(insight.impressions || "0"),
          clicks: parseInt(insight.clicks || "0"),
          ctr: parseFloat(insight.ctr || "0"),
          cpc: parseFloat(insight.cpc || "0"),
          cpm: parseFloat(insight.cpm || "0"),
          conversions: parseInt(conversions),
          conversion_value: parseFloat(convValue),
          roas,
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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
