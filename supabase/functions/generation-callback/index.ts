import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-signature",
};

async function verifyHmacSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    if (!signature || !secret) return false;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const sigHex = signature.replace(/^sha256=/, "");
    const match = sigHex.match(/.{1,2}/g);
    if (!match) return false;
    const sigBytes = new Uint8Array(match.map((b) => parseInt(b, 16)));
    return await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(body));
  } catch {
    return false;
  }
}

async function downloadAndStore(
  imageUrl: string,
  filePath: string,
  admin: any,
): Promise<string | null> {
  try {
    const allowed = ["fal.ai", "fal.media", "v3.fal.media", "storage.googleapis.com"];
    const hostname = new URL(imageUrl).hostname;
    if (!allowed.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
      console.error("Blocked domain:", hostname);
      return null;
    }

    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.error("Image fetch failed:", res.status, imageUrl);
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      console.error("Not an image:", contentType);
      return null;
    }

    const blob = await res.blob();

    const { error } = await admin.storage
      .from("ad-creatives")
      .upload(filePath, blob, { contentType, upsert: true });

    if (error) {
      console.error("Upload failed:", error);
      return null;
    }

    const { data } = admin.storage.from("ad-creatives").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error("downloadAndStore error:", err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const admin = createClient(
    Deno.env.get("PROD_SUPABASE_URL")!,
    Deno.env.get("PROD_SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const rawBody = await req.text();

  try {
    // 1. Verify HMAC signature
    const signature = req.headers.get("x-signature") ?? "";
    const secret = Deno.env.get("GEN_CALLBACK_SECRET") ?? "";
    const isValid = await verifyHmacSignature(rawBody, signature, secret);

    if (!isValid) {
      console.error("HMAC verification failed");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody);
    const {
      job_id,
      service_job_id,
      status,
      creatives = [],
      error: serviceError,
    } = payload;

    if (!job_id) {
      return new Response(JSON.stringify({ error: "Missing job_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Find job
    const { data: job, error: jobError } = await admin
      .from("generation_jobs")
      .select("id, user_id, account_id, status")
      .eq("id", job_id)
      .single();

    if (jobError || !job) {
      console.error("Job not found:", job_id);
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Idempotency
    if (job.status === "completed") {
      return new Response(
        JSON.stringify({ received: true, job_id, note: "already processed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 4. Failed generation
    if (status === "failed") {
      await admin
        .from("generation_jobs")
        .update({
          status: "failed",
          error_message: serviceError?.message ?? serviceError ?? "Generation failed",
          callback_received_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", job_id);

      return new Response(JSON.stringify({ received: true, job_id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Insert creatives with provider URLs (storage_status = pending)
    const creativeRows = (creatives as any[]).map((c) => ({
      job_id,
      user_id: job.user_id,
      account_id: job.account_id,
      variant_index: c.variant_index,
      aspect_ratio: c.aspect_ratio,
      image_url: c.image_url,
      thumbnail_url: c.thumbnail_url ?? null,
      headline: c.headline ?? null,
      primary_text: c.primary_text ?? null,
      description: c.description ?? null,
      metadata: c.metadata ?? {},
      storage_status: "pending",
    }));

    let inserted: any[] = [];
    if (creativeRows.length > 0) {
      const { data, error: insertError } = await admin
        .from("generated_creatives")
        .insert(creativeRows)
        .select();
      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`);
      }
      inserted = data ?? [];
    }

    // 6. Mark job completed → fires Realtime
    const totalCredits = (creatives as any[]).reduce(
      (sum, c) => sum + (c.metadata?.cost_credits ?? 0),
      0,
    );

    await admin
      .from("generation_jobs")
      .update({
        status: "completed",
        service_job_id,
        callback_received_at: new Date().toISOString(),
        credits_used: totalCredits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job_id);

    // 7. Return 200 immediately
    const response = new Response(JSON.stringify({ received: true, job_id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    // 8. Background image rehosting
    // @ts-ignore — EdgeRuntime is a Deno Deploy global
    EdgeRuntime.waitUntil((async () => {
      if (!inserted.length) return;

      for (const creative of inserted) {
        try {
          const aspectSlug = (creative.aspect_ratio ?? "1x1").replace(":", "x");

          if (creative.image_url) {
            const storedUrl = await downloadAndStore(
              creative.image_url,
              `generations/${job_id}/${creative.variant_index}_${aspectSlug}.jpg`,
              admin,
            );

            let storedThumb: string | null = null;
            if (
              creative.thumbnail_url &&
              creative.thumbnail_url !== creative.image_url
            ) {
              storedThumb = await downloadAndStore(
                creative.thumbnail_url,
                `generations/${job_id}/${creative.variant_index}_${aspectSlug}_thumb.jpg`,
                admin,
              );
            }

            await admin
              .from("generated_creatives")
              .update({
                stored_image_url: storedUrl,
                stored_thumbnail_url: storedThumb,
                storage_status: storedUrl ? "stored" : "failed",
              })
              .eq("id", creative.id);
          }

          await new Promise((r) => setTimeout(r, 200));
        } catch (err) {
          console.error("Storage failed for creative:", creative.id, err);
          await admin
            .from("generated_creatives")
            .update({ storage_status: "failed" })
            .eq("id", creative.id);
        }
      }
    })());

    return response;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Callback error:", msg);

    try {
      const payload = JSON.parse(rawBody);
      if (payload.job_id) {
        await admin
          .from("generation_jobs")
          .update({
            status: "failed",
            error_message: msg,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payload.job_id);
      }
    } catch {
      // swallow
    }

    // Always return 200 so the upstream service doesn't retry forever.
    return new Response(JSON.stringify({ received: false, error: msg }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
