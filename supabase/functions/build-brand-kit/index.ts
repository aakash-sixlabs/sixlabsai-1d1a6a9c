import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getUserAccountId } from "../_shared/account.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BuildBrandKitBody {
  adAccountId: string;
  websiteUrl: string;
  brandName?: string | null;
}

interface BrandKit {
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  tone_of_voice: string;
  tagline: string;
  product_categories: string[];
  raw: Record<string, unknown>;
}

// Normalize and parse a website URL → { hostname, origin }
function parseWebsite(input: string): { hostname: string; origin: string } | null {
  try {
    const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const u = new URL(withProtocol);
    return { hostname: u.hostname.replace(/^www\./, ""), origin: `${u.protocol}//${u.hostname}` };
  } catch {
    return null;
  }
}

// Deterministic palette derived from the domain — replaced with real extraction later.
function paletteFromDomain(host: string): { primary: string; secondary: string; accent: string } {
  let h = 0;
  for (let i = 0; i < host.length; i++) h = (h * 31 + host.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  const toHex = (hsl: [number, number, number]) => {
    const [hh, ss, ll] = hsl;
    const s = ss / 100;
    const l = ll / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = l - c / 2;
    let [r, g, b] = [0, 0, 0];
    if (hh < 60) [r, g, b] = [c, x, 0];
    else if (hh < 120) [r, g, b] = [x, c, 0];
    else if (hh < 180) [r, g, b] = [0, c, x];
    else if (hh < 240) [r, g, b] = [0, x, c];
    else if (hh < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    const fmt = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return `#${fmt(r)}${fmt(g)}${fmt(b)}`;
  };
  return {
    primary: toHex([hue, 70, 45]),
    secondary: toHex([(hue + 30) % 360, 30, 25]),
    accent: toHex([(hue + 180) % 360, 75, 55]),
  };
}

// STUB: in production this fans out to scraping + Lovable AI extraction.
function stubBrandKit(websiteUrl: string, brandName: string | null): BrandKit {
  const parsed = parseWebsite(websiteUrl);
  const host = parsed?.hostname ?? "example.com";
  const origin = parsed?.origin ?? "https://example.com";
  const palette = paletteFromDomain(host);
  const inferredName =
    brandName?.trim() ||
    host.split(".")[0].replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    brand_name: inferredName,
    logo_url: `https://www.google.com/s2/favicons?domain=${host}&sz=128`,
    primary_color: palette.primary,
    secondary_color: palette.secondary,
    accent_color: palette.accent,
    font_family: "Inter",
    tone_of_voice: "confident, friendly",
    tagline: `${inferredName} — crafted for everyday moments.`,
    product_categories: ["general"],
    raw: {
      stub: true,
      source: origin,
      derivedAt: new Date().toISOString(),
      note: "Replace with real scrape + AI extraction.",
    },
  };
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

    const body = (await req.json()) as BuildBrandKitBody;
    if (!body?.adAccountId || !body?.websiteUrl) {
      return new Response(JSON.stringify({ error: "adAccountId and websiteUrl are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = parseWebsite(body.websiteUrl);
    if (!parsed) {
      return new Response(JSON.stringify({ error: "Invalid website URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Mark as scraping (upsert preserves any pre-existing fields like industry / facebook_page_id)
    await supabase
      .from("ad_account_profiles")
      .upsert(
        {
          ad_account_id: body.adAccountId,
          user_id: userId,
          website_url: parsed.origin,
          brand_kit_status: "scraping",
        },
        { onConflict: "ad_account_id,user_id" },
      );

    // 2. Build the kit (stubbed)
    const kit = stubBrandKit(body.websiteUrl, body.brandName ?? null);

    // 3. Persist the derived fields
    const { error: updateErr } = await supabase
      .from("ad_account_profiles")
      .update({
        brand_name: kit.brand_name,
        logo_url: kit.logo_url,
        primary_color: kit.primary_color,
        secondary_color: kit.secondary_color,
        accent_color: kit.accent_color,
        font_family: kit.font_family,
        tone_of_voice: kit.tone_of_voice,
        tagline: kit.tagline,
        product_categories: kit.product_categories,
        brand_kit: kit.raw,
        brand_kit_status: "ready",
        brand_kit_updated_at: new Date().toISOString(),
      })
      .eq("ad_account_id", body.adAccountId)
      .eq("user_id", userId);

    if (updateErr) {
      await supabase
        .from("ad_account_profiles")
        .update({ brand_kit_status: "failed" })
        .eq("ad_account_id", body.adAccountId)
        .eq("user_id", userId);
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ kit }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
