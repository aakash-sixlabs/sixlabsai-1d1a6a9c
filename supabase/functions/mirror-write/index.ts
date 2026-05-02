// Receives row-change webhooks from primary DB triggers and forwards
// them to the secondary Supabase project via PostgREST.
// Best-effort: always returns 200 so triggers never block writes.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mirror-secret",
};

const MIRROR_URL = Deno.env.get("MIRROR_SUPABASE_URL");
const MIRROR_KEY = Deno.env.get("MIRROR_SUPABASE_SERVICE_ROLE_KEY");
const SHARED_SECRET = Deno.env.get("MIRROR_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const provided = req.headers.get("x-mirror-secret") ?? "";
    if (!SHARED_SECRET || provided !== SHARED_SECRET) {
      console.error("[mirror-write] unauthorized webhook call");
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!MIRROR_URL || !MIRROR_KEY) {
      console.error("[mirror-write] mirror project secrets missing");
      return new Response(JSON.stringify({ ok: false, error: "not_configured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const { table, op, row, old_row } = payload as {
      table: string;
      op: "INSERT" | "UPDATE" | "DELETE";
      row: Record<string, unknown> | null;
      old_row: Record<string, unknown> | null;
    };

    if (!table || !op) {
      return new Response(JSON.stringify({ ok: false, error: "bad_payload" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize URL: accept any of these shapes
    //   https://x.supabase.co
    //   https://x.supabase.co/
    //   https://x.supabase.co/rest/v1
    //   https://x.supabase.co/rest/v1/
    let base = MIRROR_URL.trim().replace(/\/+$/, "");
    base = base.replace(/\/rest\/v1$/, "");
    const headers = {
      apikey: MIRROR_KEY,
      Authorization: `Bearer ${MIRROR_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    };

    // Inject default values for columns that exist on the SECOND project
    // but not on this primary DB. Lets us mirror without changing tables.
    const SECONDARY_DEFAULTS: Record<string, Record<string, unknown>> = {
      ad_account_profiles: { account_id: "Client1" },
    };
    const enrichedRow =
      row && SECONDARY_DEFAULTS[table]
        ? { ...SECONDARY_DEFAULTS[table], ...row }
        : row;

    let res: Response;
    let url: string;
    if (op === "INSERT" || op === "UPDATE") {
      url = `${base}/rest/v1/${encodeURIComponent(table)}`;
      res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(enrichedRow),
      });
    } else {
      const id = (old_row as any)?.id;
      if (!id) {
        return new Response(JSON.stringify({ ok: true, skipped: "no_id" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      url = `${base}/rest/v1/${encodeURIComponent(table)}?id=eq.${encodeURIComponent(String(id))}`;
      res = await fetch(url, { method: "DELETE", headers });
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error(
        `[mirror-write] ${op} ${table} -> ${url} :: ${res.status} ${txt.slice(0, 600)}`,
      );
    } else {
      console.log(`[mirror-write] ${op} ${table} -> ${res.status}`);
    }

    return new Response(JSON.stringify({ ok: res.ok, status: res.status }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[mirror-write] error:", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
