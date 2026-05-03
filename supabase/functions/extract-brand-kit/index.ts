// Production brand kit extractor for the onboarding flow.
// SSE stream: emits `log` events for live progress, `result` with the final kit, `error` on failure.
// Pipeline: Firecrawl /v2/scrape (markdown + branding + screenshot + links) -> Lovable AI Gateway (Gemini 2.5 Flash, JSON mode).
// Writes nothing to the database — the client persists on user confirm.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeUrl(input: string): string | null {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return null;
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  try {
    const u = new URL(candidate);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

async function firecrawlScrape(url: string, apiKey: string) {
  const resp = await fetch(`${FIRECRAWL_V2}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown", "branding", "screenshot", "links"],
      onlyMainContent: true,
      timeout: 30000,
    }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`Firecrawl scrape failed [${resp.status}]: ${JSON.stringify(data).slice(0, 500)}`);
  }
  return data?.data ?? data;
}

interface AiInferred {
  brand_name?: string;
  tagline?: string;
  tone_of_voice?: string;
  product_categories?: string[];
  target_audience?: string;
  value_propositions?: string[];
}

async function inferBrandMeta(
  markdown: string,
  metadata: any,
  apiKey: string,
): Promise<{ inferred: AiInferred; usage: any; durationMs: number }> {
  const trimmed = (markdown || "").slice(0, 8000);
  const sysPrompt =
    "You are a brand strategist. Extract structured brand information from the provided website content. Output valid JSON only, matching this exact shape: { brand_name: string, tagline: string, tone_of_voice: string (3-5 comma-separated adjectives), product_categories: string[] (3-6 items), target_audience: string (one sentence), value_propositions: string[] (3 items, short phrases) }. If a field is unknown, use a sensible inference rather than leaving it blank.";

  const userPrompt = `Website metadata:\n${JSON.stringify({
    title: metadata?.title,
    description: metadata?.description,
    sourceURL: metadata?.sourceURL,
  })}\n\nPage content (markdown):\n${trimmed}`;

  const t0 = Date.now();
  const resp = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  const durationMs = Date.now() - t0;

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    if (resp.status === 429) throw new Error("AI rate limit exceeded — try again in a moment.");
    if (resp.status === 402) throw new Error("AI credits exhausted — please top up your workspace.");
    throw new Error(`AI inference failed [${resp.status}]: ${JSON.stringify(data).slice(0, 500)}`);
  }
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI inference returned empty content");
  let inferred: AiInferred;
  try {
    inferred = JSON.parse(content);
  } catch {
    throw new Error("AI inference returned non-JSON content");
  }
  return { inferred, usage: data?.usage ?? null, durationMs };
}

function extractColors(branding: any) {
  const c = branding?.colors ?? {};
  return {
    primary: c.primary ?? null,
    secondary: c.secondary ?? null,
    accent: c.accent ?? null,
    background: c.background ?? null,
    text_primary: c.textPrimary ?? null,
    text_secondary: c.textSecondary ?? null,
  };
}

function extractFonts(branding: any) {
  const fontsArr: string[] = Array.isArray(branding?.fonts)
    ? branding.fonts.map((f: any) => f?.family).filter(Boolean)
    : [];
  const typography = branding?.typography?.fontFamilies ?? {};
  return {
    primary: typography.primary ?? fontsArr[0] ?? null,
    heading: typography.heading ?? fontsArr[0] ?? null,
    all: Array.from(new Set(fontsArr)),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Auth check (this function runs with verify_jwt = false, so we validate manually)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "No Bearer token provided" }, 401);
  }
  // JWT was issued by Mubeen's prod auth → validate against prod.
  const supabase = createClient(Deno.env.get("PROD_SUPABASE_URL")!, Deno.env.get("PROD_SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (userErr || !userData?.user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!FIRECRAWL_API_KEY) return jsonResponse({ error: "FIRECRAWL_API_KEY not configured" }, 500);
  if (!LOVABLE_API_KEY) return jsonResponse({ error: "LOVABLE_API_KEY not configured" }, 500);

  const body = await req.json().catch(() => ({}));
  const websiteUrl = normalizeUrl(String(body?.websiteUrl ?? ""));
  if (!websiteUrl) {
    return jsonResponse({ error: "Invalid websiteUrl. Provide a hostname like nike.com." }, 400);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: any) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          /* controller closed */
        }
      };
      const log = (level: "info" | "warn" | "error" | "success", message: string, meta?: any) =>
        send("log", { ts: new Date().toISOString(), level, message, meta });

      const t0 = Date.now();
      const warnings: string[] = [];

      try {
        log("info", `▶ Starting brand kit extraction`, { url: websiteUrl });

        // Step 1 — Firecrawl
        log("info", "→ Scanning your website");
        const t1 = Date.now();
        let scrape: any;
        try {
          scrape = await firecrawlScrape(websiteUrl, FIRECRAWL_API_KEY);
          log("success", `✓ Site scanned in ${Date.now() - t1}ms`, {
            markdown_chars: (scrape?.markdown ?? "").length,
            has_branding: !!scrape?.branding,
            has_screenshot: !!scrape?.screenshot,
            page_title: scrape?.metadata?.title ?? null,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          log("error", `✗ Scan failed: ${msg}`);
          send("error", { error: `We couldn't read that site: ${msg}` });
          controller.close();
          return;
        }

        const branding = scrape?.branding ?? {};
        const metadata = scrape?.metadata ?? {};
        const markdown: string = scrape?.markdown ?? "";
        const screenshot: string | null = scrape?.screenshot ?? null;
        const links: string[] = Array.isArray(scrape?.links) ? scrape.links : [];

        const colors = extractColors(branding);
        const fonts = extractFonts(branding);
        log("info", "🎨 Reading your brand colors and fonts", {
          logo: branding?.logo ?? branding?.images?.logo ?? null,
          colors,
          fonts: fonts.all,
        });

        // Step 2 — AI inference
        log("info", "🧠 Analyzing brand voice and positioning");
        let aiInferred: AiInferred = {};
        try {
          const { inferred, usage, durationMs } = await inferBrandMeta(markdown, metadata, LOVABLE_API_KEY);
          aiInferred = inferred;
          log("success", `✓ Voice analysis complete (${durationMs}ms)`, { usage });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          log("warn", `⚠ Voice analysis skipped: ${msg}`);
          warnings.push(msg);
        }

        const logoUrl = branding?.logo ?? branding?.images?.logo ?? null;
        const faviconUrl = branding?.images?.favicon ?? null;

        const result = {
          brand_name: aiInferred.brand_name || metadata?.title?.split(/[|\-–—:]/)[0]?.trim() || null,
          tagline: aiInferred.tagline ?? null,
          website_url: websiteUrl,
          logo_url: logoUrl,
          favicon_url: faviconUrl,
          screenshot_url: screenshot,
          colors,
          fonts,
          tone_of_voice: aiInferred.tone_of_voice ?? null,
          product_categories: aiInferred.product_categories ?? [],
          target_audience: aiInferred.target_audience ?? null,
          value_propositions: aiInferred.value_propositions ?? [],
          raw: {
            firecrawl_branding: branding,
            firecrawl_metadata: metadata,
            firecrawl_links_sample: links.slice(0, 25),
            ai_inference_model: "google/gemini-2.5-flash",
            extracted_at: new Date().toISOString(),
          },
          warnings,
        };

        log("success", `✅ Brand kit ready (${Date.now() - t0}ms)`);
        send("result", result);
        controller.close();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        log("error", `✗ Unhandled error: ${msg}`);
        send("error", { error: msg });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
