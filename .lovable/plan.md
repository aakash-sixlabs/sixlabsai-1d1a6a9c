

## Fix: Lightweight ads fetch + batched creative details

Apply the user's prescribed fix in `supabase/functions/meta-sync/index.ts` around line 237.

### Changes

1. **Replace the heavy ads fetch (line 237-239)** with a minimal `creative{id}` query at `limit=100`.

2. **Add a helper `fetchCreativesInBatches`** (placed near `fetchAllPages`, above the main handler) that:
   - Batches creative IDs in groups of 50
   - Calls `GET https://graph.facebook.com/v21.0/?ids=...&fields=id,name,image_url,image_hash,thumbnail_url,title,body,object_story_spec`
   - Skips failed batches with a console error (no abort)
   - Sleeps 200ms between batches
   - Returns `Record<string, creative>`

3. **Between the ads fetch and the `for (const ad of ads)` loop**, extract unique creative IDs, fetch the creative map, and build `adsWithCreatives` by attaching `creativeDetails`.

4. **Swap the loop** to iterate `adsWithCreatives` and read heavy fields from `ad.creativeDetails` instead of `ad.creative`:
   - `ad.creative?.id` stays as-is (already on lightweight object)
   - `ad.creative?.image_url`, `ad.creative?.thumbnail_url`, `object_story_spec`, `name`, etc. → read from `ad.creativeDetails`
   - `classifyCreative(ad.creative || {})` → `classifyCreative(ad.creativeDetails || ad.creative || {})`
   - `const creative = ad.creative || {}` → `const creative = ad.creativeDetails || {}`

5. **Remove `asset_feed_spec`** — only referenced in the old URL; gone after the replacement. Will grep the rest of the file to confirm no other references remain.

### Out of scope (not touched)
- `fetchAllPages`, `sync_jobs` updates, realtime, image download logic, error handling, day-by-day insights loop.

