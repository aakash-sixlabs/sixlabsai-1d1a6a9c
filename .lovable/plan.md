## Goal

1. Update prod `meta-sync-creatives` to skip video upserts (match `test-creatives`) while still tagging `ads.media_type='video'`.
2. Backfill: purge existing video rows from `ad_creatives`, and tag pre-existing video ads in the `ads` table.

## Change scope

- **File:** `supabase/functions/meta-sync-creatives/index.ts`
- **Migration:** one-time SQL to clean current state.

## Edits to `meta-sync-creatives/index.ts`

Inside the per-ad loop in `runPhase` (around lines 193–272):

1. After `classifyCreative(creative)` returns `creativeType`, branch:
   - **If `creativeType === "video"`:**
     - `await admin.from("ads").update({ media_type: "video" }).eq("id", storedAd.id);`
     - `continue;` — skip image extraction, download loop, and `ad_creatives` upsert.
   - **Otherwise (dco / static_single / static_carousel / unknown):**
     - Existing flow unchanged: extract images, download/rehost, upsert `ad_creatives`.
     - Also write `media_type` to `ads` matching `creative_type`, so both tables stay consistent.

2. Add lightweight counters (`videosSkipped`, `creativesStored`, by-type breakdown) and a `console.log` at the end of the loop for log/audit visibility. No schema change.

## Backfill migration

One migration with two statements, scoped to current data:

```sql
-- 1. Tag existing video ads in the ads table (before deleting the source of truth)
UPDATE public.ads a
SET media_type = 'video'
FROM public.ad_creatives c
WHERE c.ad_id = a.id
  AND c.creative_type = 'video';

-- 2. Purge video rows from ad_creatives (now redundant)
DELETE FROM public.ad_creatives
WHERE creative_type = 'video';
```

Order matters: tag `ads` first, then delete from `ad_creatives` — otherwise we lose the join needed to identify which ads were videos.

## Out of scope

- Other gaps from the earlier review (missing `video_id`/`url_tags` fields in fetch, DCO image-hash resolution via `/adimages`) — separate plan.
- `meta-sync-accounts` and `meta-sync-insights` — untouched.

## Net effect

- `ads`: every video ad correctly tagged `media_type='video'` (both historical and future).
- `ad_creatives`: zero video rows after migration; future syncs never add them.
- Sync runtime: faster on video-heavy accounts.
