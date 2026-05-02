# Slim Outbound Generation Request + Contract Doc

## 1. Code change (one edit)

**File:** `supabase/functions/generate-creatives/index.ts`

In the production-mode `fetch` to `${GEN_SERVICE_URL}/v1/generations`, replace the body:

```ts
// before
body: JSON.stringify({
  job_id: jobId,
  callback_url: callbackUrl,
  callback_secret: callbackSecret,
  payload: { ...body, brand_kit: brandKit },
}),

// after
body: JSON.stringify({
  job_id: jobId,
  callback_url: callbackUrl,
  callback_secret: callbackSecret,
}),
```

Nothing else in this file changes. The initial `generation_jobs` INSERT (which already runs BEFORE the POST) persists every wizard input Badri's service needs. Verified column-by-column against the live schema — no migration required.

## 2. Contract doc for Badri

Create `docs/generation-service-contract.md` with the content below so Badri has one source of truth.

---

### Generation Service Contract — v2

#### Inbound: `POST /v1/generations`

Headers:
```
Authorization: Bearer <GEN_SERVICE_API_KEY>
Content-Type: application/json
```

Body (exactly these three fields, nothing else):
```json
{
  "job_id": "uuid",
  "callback_url": "https://bhcusyaonpevmwaruvlx.supabase.co/functions/v1/generation-callback",
  "callback_secret": "hex-string"
}
```

Response: any 2xx. Optionally `{ "service_job_id": "string" }` — if returned, we'll store it on the job row. Non-2xx marks the job failed.

#### How to load the job inputs

Use the Supabase service-role key to read from `generation_jobs`:

```sql
SELECT
  id,
  user_id,
  ad_account_id,
  goal,                       -- 'sale-promo' | 'product-highlight' | 'new-arrival' | 'brand-story' | 'category-highlight'
  promo_scope,
  product_input_method,       -- 'image' | 'url'
  product_image_url,
  product_url,
  aspect_ratios,              -- text[] e.g. ['1:1','4:5','9:16','16:9']
  promo_details,              -- jsonb (offerType, discountValue, disclaimers, ...)
  offer_type,
  icp_id,
  icp_snapshot,               -- jsonb { name, description }
  disclaimer_ids,
  service_request_payload     -- jsonb: full raw wizard body, includes brand_kit snapshot
FROM generation_jobs
WHERE id = $1;
```

Brand kit lives at `service_request_payload.brand_kit` (snapshot taken at submit time). Schema:
```ts
{
  brand_name: string | null,
  primary_color: string | null,
  secondary_color: string | null,
  accent_color: string | null,
  font_family: string | null,
  tone_of_voice: string | null,
  tagline: string | null,
  logo_url: string | null,
  product_categories: string[] | null
}
```
May be `null` if the brand kit wasn't ready. Fall back to defaults.

For `client_name`: `slugify(brand_kit.brand_name)` with `ad_account_id` as stable fallback.
For `ad_type`: map directly from `goal`.

#### Outbound: `POST {callback_url}`

Headers:
```
Content-Type: application/json
x-signature: sha256=<hex(HMAC_SHA256(callback_secret, raw_body))>
```

Success body:
```json
{
  "job_id": "uuid",
  "service_job_id": "optional-string",
  "status": "completed",
  "creatives": [
    {
      "variant_index": 0,
      "aspect_ratio": "1:1",
      "image_url": "https://v3.fal.media/...",
      "thumbnail_url": "https://v3.fal.media/...",
      "headline": "string",
      "primary_text": "string",
      "description": "string",
      "metadata": { "cost_credits": 2 }
    }
  ]
}
```

Failure body:
```json
{
  "job_id": "uuid",
  "status": "failed",
  "error": { "code": "STRING_CODE", "message": "Human-readable reason" }
}
```

#### Constraints

- `image_url` host must be one of: `fal.ai`, `fal.media`, `v3.fal.media`, `storage.googleapis.com` (we re-host into our bucket).
- Callback always returns HTTP 200, even on signature mismatch — do not implement retries based on response code; rely on watchdog (10 min) for stuck jobs.
- Idempotent: sending `completed` twice for the same `job_id` is a no-op on our side.
- Sign the **raw request body bytes** as sent on the wire; do not re-serialize before HMAC.

## Out of scope

- `generation-callback/index.ts` — unchanged
- `generation-watchdog/index.ts` — unchanged
- DB schema — unchanged
- Wizard UI — unchanged
- Stub-mode branch — unchanged

Approve to apply the edit and write the contract doc.
