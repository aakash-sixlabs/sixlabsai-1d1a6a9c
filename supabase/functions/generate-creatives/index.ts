import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PromoDetails {
  offerType?: string | null;
  discountValue?: string;
  buyQty?: string;
  getQty?: string;
  bogoDiscount?: string;
  trialPrice?: string;
  freebieDescription?: string;
  customOfferHeadline?: string;
  promoCode?: string;
  startDate?: string;
  endDate?: string;
  additionalNotes?: string;
  disclaimerIds?: string[];
  disclaimers?: { id: string; label: string; text: string }[];
}

interface CreateAdState {
  goal: string | null;
  promoScope?: string | null;
  productImage?: string | null;
  productUrl?: string;
  productInputMethod?: "image" | "url" | null;
  aspectRatios: string[];
  promoDetails: PromoDetails;
  adAccountId?: string | null;
  icpId?: string | null;
  icpName?: string | null;
  icpDescription?: string | null;
}

interface BrandKit {
  brand_name?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  accent_color?: string | null;
  font_family?: string | null;
  tone_of_voice?: string | null;
  tagline?: string | null;
  logo_url?: string | null;
  product_categories?: string[] | null;
}

// ---- Stub generation service ----
// Returns N placeholder creatives per aspect ratio. Swap with real fetch() call later.
function stubGenerate(payload: CreateAdState, brandKit: BrandKit | null) {
  const ratios = payload.aspectRatios?.length ? payload.aspectRatios : ["1:1"];
  const variantsPerRatio = 3;

  const dimsFor = (ratio: string): { w: number; h: number } => {
    switch (ratio) {
      case "9:16":
        return { w: 720, h: 1280 };
      case "16:9":
        return { w: 1280, h: 720 };
      case "4:5":
        return { w: 1080, h: 1350 };
      case "1:1":
      default:
        return { w: 1080, h: 1080 };
    }
  };

  const brandLabel = brandKit?.brand_name ? `${brandKit.brand_name} · ` : "";
  const tone = brandKit?.tone_of_voice ? ` (${brandKit.tone_of_voice})` : "";

  const creatives: Array<{
    variant_index: number;
    aspect_ratio: string;
    image_url: string;
    thumbnail_url: string;
    headline: string;
    primary_text: string;
    description: string;
    metadata: Record<string, unknown>;
  }> = [];

  let idx = 0;
  for (const ratio of ratios) {
    const { w, h } = dimsFor(ratio);
    for (let v = 0; v < variantsPerRatio; v++) {
      const seed = `${Date.now()}-${idx}`;
      creatives.push({
        variant_index: idx,
        aspect_ratio: ratio,
        image_url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
        thumbnail_url: `https://picsum.photos/seed/${seed}/${Math.round(w / 4)}/${Math.round(h / 4)}`,
        headline: `${brandLabel}Headline variant ${idx + 1}`,
        primary_text: `Generated copy for ${payload.goal ?? "your ad"} (${ratio})${tone}.`,
        description: "Stubbed generation result.",
        metadata: { stub: true, ratio, brandApplied: !!brandKit },
      });
      idx++;
    }
  }

  return { creatives };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = (await req.json()) as CreateAdState;

    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Array.isArray(body.aspectRatios) || body.aspectRatios.length === 0) {
      return new Response(JSON.stringify({ error: "aspectRatios required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1a. Load brand kit for the selected ad account (if any)
    let brandKit: BrandKit | null = null;
    if (body.adAccountId) {
      const { data: profile } = await supabase
        .from("ad_account_profiles")
        .select(
          "brand_name, primary_color, secondary_color, accent_color, font_family, tone_of_voice, tagline, logo_url, product_categories, brand_kit_status",
        )
        .eq("ad_account_id", body.adAccountId)
        .eq("user_id", userId)
        .maybeSingle();
      if (profile && profile.brand_kit_status === "ready") {
        brandKit = profile as BrandKit;
      }
    }

    // 1. Insert job row (status = generating)
    const { data: job, error: jobErr } = await supabase
      .from("generation_jobs")
      .insert({
        user_id: userId,
        ad_account_id: body.adAccountId ?? null,
        goal: body.goal ?? null,
        promo_scope: body.promoScope ?? null,
        product_input_method: body.productInputMethod ?? null,
        product_url: body.productUrl || null,
        product_image_url: body.productImage || null,
        aspect_ratios: body.aspectRatios,
        promo_details: body.promoDetails ?? {},
        service_request_payload: { ...body, brand_kit: brandKit },
        status: "generating",
      })
      .select()
      .single();

    if (jobErr || !job) {
      return new Response(JSON.stringify({ error: jobErr?.message ?? "Failed to create job" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Call (stubbed) generation service
    let serviceResponse: { creatives: ReturnType<typeof stubGenerate>["creatives"] };
    try {
      serviceResponse = stubGenerate(body, brandKit);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await supabase
        .from("generation_jobs")
        .update({ status: "failed", error_message: msg })
        .eq("id", job.id);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Bulk insert creatives
    const rows = serviceResponse.creatives.map((c) => ({
      job_id: job.id,
      user_id: userId,
      variant_index: c.variant_index,
      aspect_ratio: c.aspect_ratio,
      image_url: c.image_url,
      thumbnail_url: c.thumbnail_url,
      headline: c.headline,
      primary_text: c.primary_text,
      description: c.description,
      metadata: c.metadata,
    }));

    const { error: insertErr } = await supabase.from("generated_creatives").insert(rows);
    if (insertErr) {
      await supabase
        .from("generation_jobs")
        .update({ status: "failed", error_message: insertErr.message, service_response_payload: serviceResponse })
        .eq("id", job.id);
      return new Response(JSON.stringify({ error: insertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Mark job completed
    await supabase
      .from("generation_jobs")
      .update({ status: "completed", service_response_payload: serviceResponse })
      .eq("id", job.id);

    return new Response(
      JSON.stringify({ jobId: job.id, count: rows.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
