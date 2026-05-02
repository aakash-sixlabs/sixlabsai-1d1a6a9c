export function normalizeSupabaseUrl(rawUrl: string | undefined): string {
  if (!rawUrl) {
    throw new Error("Missing PROD_SUPABASE_URL");
  }

  const parsed = new URL(rawUrl.trim());
  const servicePath = parsed.pathname.match(/^(.*?)(?:\/(?:rest|auth|storage|functions)\/v\d+)(?:\/.*)?$/);
  parsed.pathname = servicePath?.[1] || "/";
  parsed.search = "";
  parsed.hash = "";

  return parsed.toString().replace(/\/$/, "");
}

export function getProdSupabaseUrl(): string {
  return normalizeSupabaseUrl(Deno.env.get("PROD_SUPABASE_URL"));
}
