## Why images are missing

All "No preview" cards in Top Performers are **DCO** (Dynamic Creative Optimization) ads. Verified against the DB: every such row has `creative_type = 'dco'`, `image_hashes` populated, but `image_url = null` and `stored_image_urls = []`. Static creatives render fine.

Meta's `asset_feed_spec.images[]` returns only `{ hash }` — never a `url`. The current `extractImages()` in `meta-sync-creatives` pushes the hashes but ends up with an empty `urls` array, so nothing is downloaded into the `ad-creatives` storage bucket and the UI has no image to render.

## Fix

Resolve DCO hashes to CDN URLs by calling Meta's `/act_{accountId}/adimages` endpoint, then run them through the existing download → Supabase Storage path.

### Changes to `supabase/functions/meta-sync-creatives/index.ts`

1. **Pre-pass: collect all unique DCO hashes** from this sync batch (any creative where `asset_feed_spec.images` exists and the hash isn't already paired with a direct URL).

2. **Bulk-resolve hashes → URLs** via Meta:
   ```
   GET /v21.0/act_{accountId}/adimages
       ?hashes=["h1","h2",...]
       &fields=hash,url,url_128,permalink_url,width,height
   ```
   Batch in chunks of 50 hashes per call. Page through results. Build a `Map<hash, string>` keyed by `hash`, value = `url` (fall back to `permalink_url` if needed). Use the same `fetchAllPages` retry/backoff helper already in this function.

3. **Update `extractImages(creative, hashUrlMap)`** — for `asset_feed_spec.images[]` items without `img.url`, look up `hashUrlMap.get(img.hash)` and push that. Keep the existing dedupe.

4. **Persistence stays as-is** — once `urls` is non-empty, the existing parallel download/upload block writes JPEGs to the `ad-creatives` bucket and populates `stored_image_urls` + `stored_image_url`.

5. **Edge cases**
   - If a hash can't be resolved (deleted asset, permission issue), log and continue — store the hash but leave URL slots null for that one.
   - Skip the resolve call entirely when there are zero unresolved DCO hashes (keeps re-syncs fast — they short-circuit on `hashesMatch` before reaching this anyway).
   - Video-only DCO (`asset_feed_spec.videos` but no `images`) — already handled by the existing `creative_type === "video"` early-return; no change.

### Backfill existing rows

Existing 300+ DCO rows in `ad_creatives` already have `image_hashes` but empty `stored_image_urls`. After the function fix ships, trigger one resync for the affected account — the per-ad logic will detect `existingUrls.length === 0` and run the new download path, populating storage and URLs without reprocessing static creatives unnecessarily.

### Out of scope

- No DB schema changes (columns already exist).
- No frontend changes — `AdCreativeGrid` already renders `imageUrl` when present.
- No changes to `meta-sync-accounts` or other sync stages.

## Files

- **Edit**: `supabase/functions/meta-sync-creatives/index.ts` (add hash-resolution pre-pass + thread map into `extractImages`)
