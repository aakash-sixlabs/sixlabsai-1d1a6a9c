## Goal

Retrieve the value of `SUPABASE_SERVICE_ROLE_KEY` by exposing it once via a temporary edge function, then immediately remove that function so the key is not left publicly accessible.

## Steps

1. **Create a temporary edge function** at `supabase/functions/_reveal-key/index.ts` that:
   - Accepts a `GET` request.
   - Requires a one-time shared secret in the `x-reveal-token` header that you and I agree on in this session (so a random scanner hitting the URL gets `401`, not your service role key).
   - When the header matches, returns the value of `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")` as plain text.
   - Returns `401` for any other request.
   - Configured with `verify_jwt = false` in `supabase/config.toml` so it can be called without a Supabase auth token.

2. **Deploy the function** so it's live.

3. **Call the function** using `supabase--curl_edge_functions` with the agreed `x-reveal-token` header. The response body will contain your service role key. I'll surface it to you in chat.

4. **Immediately delete the function** from the codebase and from Supabase (via `supabase--delete_edge_functions`) in the same step, plus remove the config.toml block. After this, the URL returns 404 and the key is no longer exposed.

5. **Confirm cleanup** by calling the URL once more — should return 404.

## What I need from you before starting

Pick a one-time reveal token (any random string, e.g. `reveal-9f3k2m-xyz`). Reply with the token and I'll execute steps 1–5 in a single pass. If you'd rather I just generate one, say "generate it" and I will.

## Security notes (please read)

- Once you have the key, treat it as **root credentials to your entire database**. Anyone holding it can read, modify, or delete every row in every table, bypassing all RLS.
- Give it to Badri over a secure channel (1Password, Bitwarden share link, signed message — **not** plain email or Slack).
- If it ever leaks, the only remediation is contacting Lovable/Supabase support to rotate it, which will require redeploying every edge function.
- I still recommend the scoped endpoint approach instead, but this plan delivers exactly what you asked for.