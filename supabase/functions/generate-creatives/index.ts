import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getUserAccountId } from "../_shared/account.ts";

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

// ---- Stub generation (dev only, when GEN_USE_STUB === 'true') ----
function stubGenerate(payload: CreateAdState, brandKit: BrandKit | null) {
  const ratios = payload.aspectRatios?.length ? payload.aspectRatios : ["1:1"];
  const variantsPerRatio = 3;

  const dimsFor = (ratio: string): { w: number; h: number } => {
    switch (ratio) {
      case "9:16": return { w: 720, h: 1280 };
      case "16:9": return { w: 1280, h: 720 };
      case "4:5": return { w: 1080, h: 1350 };
      case "1:1":
      default: return { w: 1080, h: 1080 };
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
      Deno.env.get("PROD_SUPABASE_URL")!,
      Deno.env.get("PROD_SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // Service-role client for status updates that should bypass RLS
    const admin = createClient(
      Deno.env.get("PROD_SUPABASE_URL")!,
      Deno.env.get("PROD_SUPABASE_SERVICE_ROLE_KEY")!,
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

    // Resolve Lovable tenant account_id (RLS requires it)
    const tenantAccountId = await getUserAccountId(admin, userId);

    // Load brand kit for the selected ad account (if any)
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
      if (profile && profile.brand_kit_status === "completed") {
        brandKit = profile as BrandKit;
      }
    }

    // Insert job row (status = processing)
    const icpSnapshot = body.icpId
      ? { name: body.icpName ?? null, description: body.icpDescription ?? null }
      : null;

    const { data: job, error: jobErr } = await supabase
      .from("generation_jobs")
      .insert({
        user_id: userId,
        account_id: tenantAccountId,
        ad_account_id: body.adAccountId ?? null,
        goal: body.goal ?? null,
        promo_scope: body.promoScope ?? null,
        product_input_method: body.productInputMethod ?? null,
        product_url: body.productUrl || null,
        product_image_url: body.productImage || null,
        aspect_ratios: body.aspectRatios,
        promo_details: body.promoDetails ?? {},
        offer_type: body.promoDetails?.offerType ?? null,
        icp_id: body.icpId ?? null,
        icp_snapshot: icpSnapshot,
        disclaimer_ids: body.promoDetails?.disclaimerIds ?? [],
        service_request_payload: { ...body, brand_kit: brandKit },
        status: "processing",
      })
      .select()
      .single();

    if (jobErr || !job) {
      return new Response(JSON.stringify({ error: jobErr?.message ?? "Failed to create job" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jobId = job.id as string;
    const useStub = Deno.env.get("GEN_USE_STUB") === "true";

    if (useStub) {
      // ── STUB MODE ──────────────────────────────────────────
      let serviceResponse: { creatives: ReturnType<typeof stubGenerate>["creatives"] };
      try {
        serviceResponse = stubGenerate(body, brandKit);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await admin
          .from("generation_jobs")
          .update({ status: "failed", error_message: msg })
          .eq("id", jobId);
        return new Response(JSON.stringify({ error: msg }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Stub creatives are already on a public CDN; mark them as stored so
      // the UI doesn't show "Saving…" badges and stored_image_url is set.
      const rows = serviceResponse.creatives.map((c) => ({
        job_id: jobId,
        user_id: userId,
        account_id: tenantAccountId,
        variant_index: c.variant_index,
        aspect_ratio: c.aspect_ratio,
        image_url: c.image_url,
        thumbnail_url: c.thumbnail_url,
        stored_image_url: c.image_url,
        stored_thumbnail_url: c.thumbnail_url,
        storage_status: "stored",
        headline: c.headline,
        primary_text: c.primary_text,
        description: c.description,
        metadata: c.metadata,
      }));

      const { error: insertErr } = await admin.from("generated_creatives").insert(rows);
      if (insertErr) {
        await admin
          .from("generation_jobs")
          .update({
            status: "failed",
            error_message: insertErr.message,
            service_response_payload: serviceResponse,
          })
          .eq("id", jobId);
        return new Response(JSON.stringify({ error: insertErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await admin
        .from("generation_jobs")
        .update({
          status: "completed",
          service_response_payload: serviceResponse,
          callback_received_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    } else {
      // ── PRODUCTION MODE ────────────────────────────────────
      const supabaseUrl = Deno.env.get("PROD_SUPABASE_URL")!;
      const callbackUrl = `${supabaseUrl}/functions/v1/generation-callback`;
      const genServiceUrl = Deno.env.get("GEN_SERVICE_URL");
      const genServiceKey = Deno.env.get("GEN_SERVICE_API_KEY");
      const callbackSecret = Deno.env.get("GEN_CALLBACK_SECRET");

      if (!genServiceUrl || !genServiceKey || !callbackSecret) {
        const msg = "Generation service not configured";
        await admin
          .from("generation_jobs")
          .update({ status: "failed", error_message: msg })
          .eq("id", jobId);
        return new Response(JSON.stringify({ error: msg }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // POST to generation service. Tolerate secret values that omit the scheme
      // (e.g. "adsopti-production.up.railway.app") by defaulting to https.
      const normalizedBase = /^https?:\/\//i.test(genServiceUrl)
        ? genServiceUrl.replace(/\/$/, "")
        : `https://${genServiceUrl.replace(/\/$/, "")}`;

      // DEBUG: log key fingerprint (length + first/last 4 chars) — never the full value
      const keyFingerprint = `len=${genServiceKey.length} first4=${genServiceKey.slice(0, 4)} last4=${genServiceKey.slice(-4)}`;
      console.log(`[generate-creatives] GEN_SERVICE_API_KEY fingerprint: ${keyFingerprint}`);
      console.log(`[generate-creatives] POSTing to: ${normalizedBase}/v1/generations`);

      let serviceResponse: Response;
      try {
        serviceResponse = await fetch(`${normalizedBase}/v1/generations`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${genServiceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_id: jobId,
            callback_url: callbackUrl,
            callback_secret: callbackSecret,
          }),
        });
        console.log(`[generate-creatives] Railway responded: status=${serviceResponse.status}`);
      } catch (fetchError) {
        const msg = fetchError instanceof Error ? fetchError.message : String(fetchError);
        await admin
          .from("generation_jobs")
          .update({
            status: "failed",
            error_message: `Could not reach generation service: ${msg}`,
          })
          .eq("id", jobId);
        return new Response(
          JSON.stringify({ error: `Could not reach generation service: ${msg}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      let serviceData: any = {};
      try {
        serviceData = await serviceResponse.json();
      } catch {
        serviceData = {};
      }

      if (!serviceResponse.ok) {
        const errMsg =
          serviceData?.message ?? serviceData?.error ?? "Generation service returned an error";
        await admin
          .from("generation_jobs")
          .update({ status: "failed", error_message: errMsg })
          .eq("id", jobId);
        return new Response(JSON.stringify({ error: errMsg }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (serviceData?.service_job_id) {
        await admin
          .from("generation_jobs")
          .update({ service_job_id: serviceData.service_job_id })
          .eq("id", jobId);
      }
    }

    return new Response(
      JSON.stringify({ jobId, started: true }),
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
