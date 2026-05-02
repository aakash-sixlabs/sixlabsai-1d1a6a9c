## Production Generation Pipeline — Async Webhook Architecture

Rewire the creative generation flow from inline stub to a real async webhook-based pipeline, while preserving existing stub behavior behind a feature flag.

### 1. Database migration

Add columns to support async lifecycle and image rehosting:

```sql
ALTER TABLE generation_jobs
  ADD COLUMN IF NOT EXISTS service_job_id text,
  ADD COLUMN IF NOT EXISTS callback_received_at timestamptz,
  ADD COLUMN IF NOT EXISTS attempt_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_used int DEFAULT 0;

ALTER TABLE generated_creatives
  ADD COLUMN IF NOT EXISTS stored_image_url text,
  ADD COLUMN IF NOT EXISTS stored_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS storage_status text DEFAULT 'pending';
```

Realtime is already enabled on `generation_jobs`. Add `generated_creatives` to `supabase_realtime` so OutputStep can react to background storage updates.

### 2. Refactor `supabase/functions/generate-creatives/index.ts`

Keep: auth (`getClaims`/`getUser`), input validation, brand kit lookup, CORS, the initial `generation_jobs` INSERT (status `generating`), `icp_snapshot`, `service_request_payload`.

Remove: `stubGenerate()` definition usage in production path, the inline `generated_creatives` INSERT, the post-insert "completed" update.

Add a branch on `GEN_USE_STUB`:
- **Stub mode** (`GEN_USE_STUB === 'true'`): preserve current behavior exactly — call `stubGenerate`, insert creatives, mark job completed. Stub creatives get `storage_status: 'stored'` and their picsum URL copied into `stored_image_url` so the UI shows the "Saved" badge correctly.
- **Production mode**: POST to `${GEN_SERVICE_URL}/v1/generations` with `{ job_id, callback_url, callback_secret }`. On network error or non-2xx, mark job `failed` with `error_message` and return 500-equivalent error JSON (HTTP 200 body with error per the "always 200" rule for the callback only — `generate-creatives` keeps current 4xx/5xx convention for the wizard caller). On success, store `service_job_id` on the job row.

Always respond `{ jobId, started: true }` on success so the wizard's fire-and-forget keeps working.

Use a service-role admin client for the status updates (the user-scoped client is fine too since RLS allows the owner). Keep using the user-scoped client for the initial INSERT to preserve audit clarity.

### 3. New edge function `supabase/functions/generation-callback/index.ts`

Public webhook (no JWT). Configured in `supabase/config.toml`:

```toml
[functions.generation-callback]
verify_jwt = false
```

Behavior:
1. Read raw body as text (required for HMAC).
2. Verify `x-signature` header (`sha256=<hex>`) against `GEN_CALLBACK_SECRET` using Web Crypto HMAC-SHA256. Reject with 401 on mismatch.
3. Parse payload `{ job_id, service_job_id, status, creatives[], error }`.
4. Look up job; 404 if missing.
5. Idempotency: if `status === 'completed'` already, return 200 no-op.
6. If `status === 'failed'`, update job to failed with `error.message` and `callback_received_at`, return 200.
7. Otherwise insert all `generated_creatives` rows with the Fal.ai URLs and `storage_status: 'pending'`.
8. Update job to `completed` with `service_job_id`, `callback_received_at`, `credits_used` (sum of `metadata.cost_credits`). This fires Realtime → user gets the "ready" toast immediately.
9. Use `EdgeRuntime.waitUntil(...)` to download each image in the background:
   - Domain whitelist: `fal.ai`, `fal.media`, `v3.fal.media`, `storage.googleapis.com`.
   - Verify `content-type` starts with `image/`.
   - Upload to `ad-creatives` bucket at `generations/{jobId}/{variantIndex}_{aspectSlug}.jpg` (and `_thumb.jpg`), `upsert: true`.
   - Update each row with `stored_image_url`, `stored_thumbnail_url`, `storage_status: 'stored'|'failed'`. This fires Realtime → OutputStep swaps the image source.
   - 200ms throttle between creatives.
10. Always return HTTP 200 (even on internal error, with `{ received: false, error }`) so Badri's service does not retry indefinitely.

### 4. New edge function `supabase/functions/generation-watchdog/index.ts`

Finds jobs stuck in `generating` for >10 minutes and marks them failed with "Generation timed out. Please try again." Triggers Realtime → user sees failure toast. Returns `{ checked, stuck, failed_ids }`.

### 5. Schedule watchdog

Use the **insert tool** (not migration) to schedule via `pg_cron` + `pg_net` every 5 minutes, calling `/functions/v1/generation-watchdog` with the service role key. This file contains project-specific URL/key so it must not be in migrations.

If `pg_cron`/`pg_net` aren't enabled, enable them first; if that fails, leave a note in the response that the watchdog must be triggered manually.

### 6. Update `src/components/wizard/OutputStep.tsx`

- Extend `GeneratedCreative` interface with `stored_image_url`, `stored_thumbnail_url`, `storage_status`.
- Add `displayImage = stored_image_url ?? image_url` and `displayThumbnail = stored_thumbnail_url ?? thumbnail_url ?? image_url` helpers; use these in the grid `LazyImage` and lightbox.
- Add a small status badge overlay on each card: yellow "Saving…" for `pending`, green "✓ Saved" for `stored`. Hide for stub mode jobs (they're inserted as `stored`).
- Add a Realtime subscription on `generated_creatives` filtered by `job_id=eq.{jobId}` that merges UPDATE payloads into local state. Skip subscription for `dev_*` jobIds.
- Download button uses `displayImage` so stored URLs are preferred.

### 7. Update `src/context/GenerationNotificationsContext.tsx`

Existing failed-status toast already exists. Enhance it:
- Title stays "Generation failed".
- Description: `row.error_message ?? "Something went wrong. Please try again."`
- Add an action button "Try Again" that navigates to `/create-ad`.

Completed toast unchanged.

Also fix the existing **runtime error** ("cannot add `postgres_changes` callbacks after `subscribe()`"): the channel is created and `.subscribe()` called inline — verify the chained `.on(...).subscribe()` order is correct (it currently is). The error suggests StrictMode double-mount is reusing a subscribed channel. Guard by giving the channel a stable per-mount name and ensuring cleanup runs `removeChannel` before the second mount re-creates it (the existing `cancelled` flag plus cleanup handles this; double-check `channel` is only assigned after subscribe completes).

### 8. Secrets

Request via `add_secret` (only the ones that don't exist yet — `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` already exist):

- `GEN_USE_STUB` — set to `true` initially so stub mode keeps working until Badri's service is live.
- `GEN_SERVICE_URL` — Badri's Railway URL (placeholder OK for now).
- `GEN_SERVICE_API_KEY` — bearer token for Badri's API.
- `GEN_CALLBACK_SECRET` — HMAC secret shared with Badri.

### 9. `supabase/config.toml`

Append:
```toml
[functions.generation-callback]
verify_jwt = false
```
`generation-watchdog` can keep default (called server-side with service role token).

### Files touched

- New migration SQL for the schema changes + realtime publication.
- `supabase/functions/generate-creatives/index.ts` — refactored.
- `supabase/functions/generation-callback/index.ts` — new.
- `supabase/functions/generation-watchdog/index.ts` — new.
- `supabase/config.toml` — add callback function block.
- `src/components/wizard/OutputStep.tsx` — stored URL preference, badges, realtime.
- `src/context/GenerationNotificationsContext.tsx` — "Try Again" action on failure toast.
- Cron scheduling via insert tool (separate from migration).
- Add 4 secrets via `add_secret`.

### What stays untouched

- `CreateAdFlow.tsx`, `GeneratingStep.tsx`, wizard UI/animation.
- `jobId` handling in the frontend.
- All existing RLS policies.
- `ad-creatives` bucket (already exists, public).
- Stub-mode dev experience (picsum + sessionStorage path in `GeneratingStep`).
