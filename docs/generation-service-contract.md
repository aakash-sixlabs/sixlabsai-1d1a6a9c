# Generation Service Contract — v2

The Lovable app sends a minimal request to the external generation service. The service reads all wizard inputs from the database using `job_id`, then posts results back to a signed callback URL.

## Inbound: `POST {GEN_SERVICE_URL}/v1/generations`

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

Response: any 2xx. Optionally return `{ "service_job_id": "string" }` — if present we'll persist it on the job row. Non-2xx marks the job as failed.

## Loading job inputs from the database

Use the Supabase service-role key. All wizard inputs are persisted **before** the POST.

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

### Brand kit

Lives at `service_request_payload.brand_kit` (snapshot taken at submit time; may be `null` if not ready). Schema:

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

Alternatively, re-fetch the live brand kit from `ad_account_profiles` using `(ad_account_id, user_id)`.

### Mapping to internal pipeline

- `client_name` → `slugify(brand_kit.brand_name)`, with `ad_account_id` as a stable fallback.
- `ad_type` → maps directly from `goal`.
- Product asset → use `product_image_url` if `product_input_method === 'image'`, else fetch from `product_url`.

## Outbound: `POST {callback_url}`

Headers:
```
Content-Type: application/json
x-signature: sha256=<hex(HMAC_SHA256(callback_secret, raw_body))>
```

Sign the **raw request body bytes as sent on the wire**. Do not re-serialize before HMAC.

### Success body

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

### Failure body

```json
{
  "job_id": "uuid",
  "status": "failed",
  "error": { "code": "STRING_CODE", "message": "Human-readable reason" }
}
```

## Constraints

- `image_url` host must be one of: `fal.ai`, `fal.media`, `v3.fal.media`, `storage.googleapis.com`. We re-host into our own bucket in the background.
- The callback endpoint always responds HTTP 200, even on signature mismatch or internal error. Do not implement retry-on-non-200 — rely on the watchdog (10 min) for stuck jobs.
- Idempotent: posting `completed` twice for the same `job_id` is a no-op on our side.
- `variant_index` should be unique per job.
- `aspect_ratio` values must match those requested in the job's `aspect_ratios` array.
