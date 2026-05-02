const REVEAL_TOKEN = "reveal-tmp-7k2m9q4xz";

Deno.serve((req) => {
  if (req.headers.get("x-reveal-token") !== REVEAL_TOKEN) {
    return new Response("unauthorized", { status: 401 });
  }
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return new Response(key, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
});
