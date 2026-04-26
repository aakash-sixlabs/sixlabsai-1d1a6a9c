## Goal

Replace the mock creatives on `/output` with real generated creatives, and persist every input + output of the generation flow into the database. The external generation service is stubbed for now (returns placeholder image URLs) so we can wire the full pipeline end-to-end and swap in the real endpoint later.

The "Edit creative" feature is dropped from both the schema and the UI.

---

## On your storage question

Yes — option 1 (storing the URLs as-is) works. The browser fetches the image directly from the external URL via a standard `<img src="...">` tag at runtime. No proxy needed.

Trade-offs:
- **Pros:** zero storage cost, no download step, faster generation flow.
- **Cons:** if the service ever expires/rotates URLs, our `/output` page breaks for old jobs. Acceptable for now since these are short-lived creative reviews.

For the large-image performance concern (UI layer, no schema impact):
1. **Lazy-load** thumbnails with `loading="lazy"` and `decoding="async"`.
2. **Skeleton/blur placeholder** shown until `onLoad` fires.
3. **Thumbnail variant** — we'll add a `thumbnail_url` column so the grid loads small images and the lightbox loads full-res. If the service doesn't expose thumbnails, we fall back to the full URL.
4. **Preload neighbors** in the lightbox so prev/next feels instant.

If image load times are still unacceptable later, we can flip on bucket storage + on-the-fly resizing without changing the schema (just populate a `stored_image_url` later).

---

## Database schema (new tables)

### `generation_jobs` — one row per "Generate" click
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid | RLS owner |
| `ad_account_id` | uuid | nullable |
| `goal` | text | sale-promo / product-highlight / etc. |
| `promo_scope` | text | brand-wide / product-specific / null |
| `product_input_method` | text | image / url / null |
| `product_url` | text | nullable |
| `product_image_url` | text | nullable |
| `aspect_ratios` | text[] | e.g. {"1:1","9:16"} |
| `promo_details` | jsonb | full PromoDetails object |
| `service_request_payload` | jsonb | exact JSON sent to generation service |
| `service_response_payload` | jsonb | raw response from service |
| `status` | text | pending / generating / completed / failed |
| `error_message` | text | nullable |
| `created_at`, `updated_at` | timestamptz | |

### `generated_creatives` — one row per output variant
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `job_id` | uuid | references generation_jobs.id |
| `user_id` | uuid | denormalized for RLS |
| `variant_index` | int | order in the output |
| `aspect_ratio` | text | "1:1", "9:16", etc. |
| `image_url` | text | full-res URL from service |
| `thumbnail_url` | text | nullable |
| `headline` | text | nullable |
| `primary_text` | text | nullable |
| `description` | text | nullable |
| `metadata` | jsonb | catch-all for service extras |
| `created_at` | timestamptz | |

Both tables get RLS: `auth.uid() = user_id`.

---

## Edge function: `generate-creatives` (stubbed)

New `supabase/functions/generate-creatives/index.ts`:
1. Validate JWT + parse the wizard payload (zod schema mirroring `CreateAdState`).
2. Insert a `generation_jobs` row with `status='generating'` + full input payload.
3. **Stub:** return N placeholder creatives (a few variants per aspect ratio) using picsum/placeholder URLs. Store the stub response in `service_response_payload`.
4. Bulk-insert rows into `generated_creatives`.
5. Update job to `status='completed'` and return `{ jobId, creatives }`.

When the real service is ready, only step 3 changes — add `GENERATION_SERVICE_URL` + `GENERATION_SERVICE_API_KEY` secrets and replace the stub with a `fetch()` call.

---

## Frontend wiring

### `CreateAdFlow.tsx` / `GeneratingStep.tsx`
- Pass the assembled `CreateAdState` from `ReviewStep` → `GeneratingStep`.
- On mount, `GeneratingStep` calls `supabase.functions.invoke('generate-creatives', { body: state })`.
- Existing animated stages stay; final stage waits for the real response.
- On success: navigate to `/output?jobId=<uuid>`. On failure: error state + retry.

### `OutputStep.tsx`
- Read `jobId` from the URL query string.
- Fetch `generated_creatives` for that job ordered by `variant_index`.
- Replace `MOCK_CREATIVES` gradient grid with real `<img>` tags using lazy loading, skeleton placeholder, `thumbnail_url ?? image_url` in the grid, full `image_url` in the lightbox, and neighbor preloading.
- **Remove the Edit feature entirely:** delete the pencil button on each card, the "Edit" button in the lightbox footer, the edit textarea panel, and all related state (`editingId`, `editText`, `handleEdit`, `submitEdit`).
- Keep "Download" and "Regenerate All" buttons (Regenerate All can simply re-trigger generation with the same job inputs — happy to plan separately if you want it wired now).
- Empty state if no `jobId` or no creatives: "No creatives yet" + button back to `/create-ad`.

---

## What ships in this change

1. Migration creating `generation_jobs` + `generated_creatives` with RLS.
2. New stubbed edge function `generate-creatives`.
3. `GeneratingStep` calls the function and routes to `/output?jobId=...`.
4. `OutputStep` fetches and renders real creatives with lazy loading + skeleton + preloaded neighbors.
5. Edit creative UI fully removed from `OutputStep`.

When the real generation service is ready: add the URL + API key as secrets and swap the stub block.