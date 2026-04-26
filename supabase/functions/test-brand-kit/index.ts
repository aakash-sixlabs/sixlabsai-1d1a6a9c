// Test brand kit extractor: URL -> Firecrawl scrape (markdown + branding + screenshot) -> Lovable AI inference -> unified brand kit
// Writes nothing to the database. Pure compute + return.

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
  const trimmed = input.trim();
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
    throw new Error(
      `Firecrawl scrape failed [${resp.status}]: ${JSON.stringify(data).slice(0, 500)}`,
    );
  }
  // Firecrawl v2 returns { success, data: { markdown, branding, screenshot, links, metadata } }
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
): Promise<AiInferred> {
  const trimmed = (markdown || "").slice(0, 8000);
  const sysPrompt =
    "You are a brand strategist. Extract structured brand information from the provided website content. Output valid JSON only, matching this exact shape: { brand_name: string, tagline: string, tone_of_voice: string (3-5 comma-separated adjectives), product_categories: string[] (3-6 items), target_audience: string (one sentence), value_propositions: string[] (3 items, short phrases) }. If a field is unknown, use a sensible inference rather than leaving it blank.";

  const userPrompt = `Website metadata:\n${JSON.stringify({
    title: metadata?.title,
    description: metadata?.description,
    sourceURL: metadata?.sourceURL,
  })}\n\nPage content (markdown):\n${trimmed}`;

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

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(
      `AI inference failed [${resp.status}]: ${JSON.stringify(data).slice(0, 500)}`,
    );
  }
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI inference returned empty content");
  try {
    return JSON.parse(content);
  } catch {
    throw new Error("AI inference returned non-JSON content");
  }
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

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return jsonResponse({ error: "FIRECRAWL_API_KEY not configured" }, 500);
    }
    if (!LOVABLE_API_KEY) {
      return jsonResponse({ error: "LOVABLE_API_KEY not configured" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const websiteUrl = normalizeUrl(String(body?.websiteUrl ?? ""));
    if (!websiteUrl) {
      return jsonResponse(
        { error: "Invalid websiteUrl. Provide a valid hostname like nike.com." },
        400,
      );
    }

    const warnings: string[] = [];

    // Step 1: Firecrawl scrape
    let scrape: any;
    try {
      scrape = await firecrawlScrape(websiteUrl, FIRECRAWL_API_KEY);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return jsonResponse({ error: `Scrape step failed: ${msg}` }, 502);
    }

    const branding = scrape?.branding ?? {};
    const metadata = scrape?.metadata ?? {};
    const markdown: string = scrape?.markdown ?? "";
    const screenshot: string | null = scrape?.screenshot ?? null;
    const links: string[] = Array.isArray(scrape?.links) ? scrape.links : [];

    // Step 2: AI inference (best-effort)
    let aiInferred: AiInferred = {};
    try {
      aiInferred = await inferBrandMeta(markdown, metadata, LOVABLE_API_KEY);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      warnings.push(`AI inference skipped: ${msg}`);
    }

    const logoUrl =
      branding?.logo ?? branding?.images?.logo ?? null;
    const faviconUrl = branding?.images?.favicon ?? null;

    const result = {
      brand_name:
        aiInferred.brand_name || metadata?.title?.split(/[|\-–—:]/)[0]?.trim() || null,
      tagline: aiInferred.tagline ?? null,
      website_url: websiteUrl,
      logo_url: logoUrl,
      favicon_url: faviconUrl,
      screenshot_url: screenshot,
      colors: extractColors(branding),
      fonts: extractFonts(branding),
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

    return jsonResponse(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("test-brand-kit error:", msg);
    return jsonResponse({ error: msg }, 500);
  }
});
