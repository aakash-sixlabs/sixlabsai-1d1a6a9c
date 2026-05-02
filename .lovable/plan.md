## Goal
Wire Badri's generation service (`adsopti-production.up.railway.app`) into the `generate-creatives` edge function.

## Current state
`supabase/functions/generate-creatives/index.ts` already reads the service URL from an env secret and calls it:

```ts
const genServiceUrl = Deno.env.get("GEN_SERVICE_URL");
...
fetch(`${genServiceUrl.replace(/\/$/, "")}/v1/generations`, { ... })
```

So no code changes are required — only the secret needs to be set.

## Steps

1. **Set `GEN_SERVICE_URL` secret** to `https://adsopti-production.up.railway.app` (using the secret manager — I'll prompt for it via `add_secret` so you confirm the value).
2. **Verify the other two required secrets exist** for production mode (the function fails fast if any are missing):
   - `GEN_SERVICE_API_KEY` — bearer token Badri's service expects
   - `GEN_CALLBACK_SECRET` — HMAC secret shared with Badri (already confirmed to be used as raw UTF-8)
   I'll list configured secrets via `fetch_secrets` and prompt for any that are missing.
3. **Confirm `GEN_USE_STUB` is not `true`** (otherwise the function will keep using the stub and never call Railway). If it's set to `true`, I'll ask whether to remove/flip it.
4. **Smoke test** by tailing edge function logs (`edge_function_logs` for `generate-creatives`) after you trigger one generation from the UI, so we can confirm the POST hits Railway and the response is parsed correctly.

## Notes
- Protocol: I'm assuming `https://` (Railway terminates TLS). If Badri exposes only HTTP, tell me and I'll set it accordingly.
- No path is appended in the secret — the function adds `/v1/generations` itself, matching `docs/generation-service-contract.md`. If Badri's endpoint differs, we'll update the code in step 1 instead of just the secret.
