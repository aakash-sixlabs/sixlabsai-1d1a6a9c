// Receives row-change webhooks from primary DB triggers and forwards
// them to the secondary Supabase project via PostgREST.
// Best-effort: always returns 200 so triggers never block writes.
//
// FK strategy: if a write fails with 23503 (foreign key violation),
// auto-create a stub row in the referenced table and retry. Recurses
// up to MAX_FK_DEPTH levels to handle chains.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mirror-secret",
};

const MIRROR_URL = Deno.env.get("MIRROR_SUPABASE_URL");
const MIRROR_KEY = Deno.env.get("MIRROR_SUPABASE_SERVICE_ROLE_KEY");
const SHARED_SECRET = Deno.env.get("MIRROR_WEBHOOK_SECRET");

const MAX_FK_DEPTH = 6;
const CLIENT1_UUID = "00000001-0000-0000-0000-000000000001";

// Per-cold-start cache so we don't repeatedly bootstrap the same parents.
const ensuredParents = new Set<string>();

function buildHeaders() {
  return {
    apikey: MIRROR_KEY!,
    Authorization: `Bearer ${MIRROR_KEY}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  };
}

// Inject defaults for columns that exist on the secondary but not on this primary.
const SECONDARY_DEFAULTS: Record<string, Record<string, unknown>> = {
  ad_account_profiles: { account_id: CLIENT1_UUID },
};

// Parse "Key (col)=(value) is not present in table \"x\"." → { table, col, value }
function parseFkViolation(detail: string): { table: string; col: string; value: string } | null {
  const m = detail.match(/Key \(([^)]+)\)=\(([^)]+)\) is not present in table "([^"]+)"/);
  if (!m) return null;
  return { col: m[1], value: m[2], table: m[3] };
}

async function ensureParentRow(
  base: string,
  table: string,
  col: string,
  value: string,
): Promise<boolean> {
  const cacheKey = `${table}:${col}:${value}`;
  if (ensuredParents.has(cacheKey)) return true;

  // Build the most permissive stub we can guess:
  //   id (PK) = value, plus a name/email if those columns exist.
  // We try a few shapes; first one that succeeds wins.
  const attempts: Record<string, unknown>[] = [
    { [col]: value },
    { [col]: value, name: `mirror-stub-${value.slice(0, 8)}` },
    { [col]: value, email: `mirror-stub-${value.slice(0, 8)}@mirror.local` },
    { [col]: value, name: `mirror-stub`, email: `mirror-stub-${value.slice(0, 8)}@mirror.local` },
  ];

  for (const body of attempts) {
    try {
      const res = await fetch(`${base}/rest/v1/${encodeURIComponent(table)}`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        console.log(`[mirror-write] bootstrapped ${table}.${col}=${value}`);
        ensuredParents.add(cacheKey);
        return true;
      }
      const txt = await res.text().catch(() => "");
      // 23502 = NOT NULL violation → try a richer body
      // 23503 = FK violation → recurse on this parent before retrying
      if (res.status === 409 && txt.includes('"23503"')) {
        try {
          const parsed = JSON.parse(txt);
          const child = parseFkViolation(parsed.details ?? "");
          if (child) {
            await ensureParentRow(base, child.table, child.col, child.value);
            // Retry this same attempt now that grandparent exists
            const retry = await fetch(`${base}/rest/v1/${encodeURIComponent(table)}`, {
              method: "POST",
              headers: buildHeaders(),
              body: JSON.stringify(body),
            });
            if (retry.ok) {
              console.log(`[mirror-write] bootstrapped ${table}.${col}=${value} (after parent)`);
              ensuredParents.add(cacheKey);
              return true;
            }
          }
        } catch {
          // fall through
        }
      }
      // Otherwise try next shape
    } catch (err) {
      console.error(`[mirror-write] bootstrap attempt failed:`, err);
    }
  }
  console.error(`[mirror-write] could not bootstrap ${table}.${col}=${value}`);
  return false;
}

async function postWithFkResolve(
  base: string,
  table: string,
  body: Record<string, unknown>,
  depth = 0,
): Promise<Response> {
  const url = `${base}/rest/v1/${encodeURIComponent(table)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  if (res.ok || depth >= MAX_FK_DEPTH) return res;

  const txt = await res.clone().text().catch(() => "");
  if (res.status !== 409 || !txt.includes('"23503"')) return res;

  try {
    const parsed = JSON.parse(txt);
    const fk = parseFkViolation(parsed.details ?? "");
    if (!fk) return res;
    const ok = await ensureParentRow(base, fk.table, fk.col, fk.value);
    if (!ok) return res;
    return await postWithFkResolve(base, table, body, depth + 1);
  } catch {
    return res;
  }
}

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

    // Normalize URL
    let base = MIRROR_URL.trim().replace(/\/+$/, "");
    base = base.replace(/\/rest\/v1$/, "");

    const enrichedRow =
      row && SECONDARY_DEFAULTS[table]
        ? { ...SECONDARY_DEFAULTS[table], ...row }
        : row;

    let res: Response;
    let url: string;
    if (op === "INSERT" || op === "UPDATE") {
      url = `${base}/rest/v1/${encodeURIComponent(table)}`;
      res = await postWithFkResolve(base, table, enrichedRow as Record<string, unknown>);
    } else {
      const id = (old_row as any)?.id;
      if (!id) {
        return new Response(JSON.stringify({ ok: true, skipped: "no_id" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      url = `${base}/rest/v1/${encodeURIComponent(table)}?id=eq.${encodeURIComponent(String(id))}`;
      res = await fetch(url, { method: "DELETE", headers: buildHeaders() });
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
