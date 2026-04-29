## Why it's slow

Your screenshot shows "Processing creatives (175/377)". The `meta-sync-creatives` edge function is the bottleneck. For each of 377 ads it does the following **sequentially, one ad at a time**:

1. Downloads the creative image from Meta's CDN (~300–800ms)
2. Uploads it to your storage bucket (~200–500ms)
3. Writes a row to `ad_creatives`
4. Updates the `ads` row

At ~1.5–2.5s per ad serially, 377 ads = **10–15 minutes**. That matches what you're seeing. Some ads have multiple images (carousels, DCO), making it worse.

There is **no parallelism** today — every image download blocks the next ad.

## What to change

### 1. Process ads in parallel batches (biggest win)

In `supabase/functions/meta-sync-creatives/index.ts`, replace the `for (const storedAd of storedAds)` serial loop with a batched parallel runner:

- Process **10 ads concurrently** using `Promise.all` over chunks of 10
- Within each ad, also parallelize the per-image download/upload loop (carousels with 5 images currently take 5x longer than they should)
- Keep the progress-update cadence (every 25 ads) but compute it from a shared counter

Expected speedup: **5–8x**. 377 ads should finish in ~90–120 seconds instead of 10+ minutes.

### 2. Skip re-downloading images we already have

Right now every resync re-downloads and re-uploads every image, even when the creative hasn't changed. Add a guard at the top of the per-ad block:

- Look up the existing `ad_creatives` row for `(user_id, meta_creative_id)`
- If it exists and `stored_image_urls` is non-empty and `image_hashes` matches what Meta returned, skip the download/upload entirely — just refresh the metadata fields

Expected speedup on **subsequent syncs**: most ads skip the network entirely, finishing in ~10–20 seconds.

### 3. Tighten the Meta batch pacing

`fetchCreativesInBatches` sleeps **500ms between every batch of 50** creatives. For 377 ads that's 8 batches = 4s of pure waiting. Drop to 150ms — Meta's batch endpoint comfortably handles this and the existing rate-limit retry logic catches any 429s.

### 4. Add a per-image timeout

Some Meta CDN images hang for 30+ seconds before failing. Wrap each `fetch(urls[imgIdx])` in an `AbortController` with a 10s timeout so one slow image doesn't stall the whole batch.

## Files to edit

- `supabase/functions/meta-sync-creatives/index.ts` — all four changes above

No schema changes, no frontend changes. The `Processing creatives (X/Y)` chip will simply count up much faster.

## Expected result

| Sync type | Today | After |
|---|---|---|
| First sync of 377 ads | 10–15 min | ~90–120 sec |
| Re-sync (most images already stored) | 10–15 min | 10–30 sec |

If you want even more speed later, we could move to a true job-queue model with multiple workers, but the parallelization above will already make this feel near-instant for typical accounts.
