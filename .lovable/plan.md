# Fix duplicated creatives in /home grid

## Why it happens
`InsightsStep.tsx` builds the grid with `rawAds.map(...)` — one card per ad. In Meta, a creative is often reused across multiple ads (A/B tests, ad-set duplication, scaling). Today's data: 417 ads but only 293 distinct `meta_creative_id`s, so ~124 cards are visual duplicates.

## What to change

**File:** `src/components/wizard/InsightsStep.tsx` (the `enriched` builder around lines 382–423)

Replace the per-ad map with a per-creative grouping:

1. Build a key per ad:
   - Prefer `ad.meta_creative_id`
   - Fallback to the resolved creative's `stored_image_url || image_url` (covers the rare case where two ads share an image but have different creative IDs)
   - Final fallback: `ad.id` (so creativeless ads still render once)
2. Group `rawAds` by that key. For each group:
   - Pick a representative ad (prefer one with `effective_status === 'ACTIVE'`, else most recent)
   - Sum `spend`, `impressions`, `clicks`, `purchases` across **all** ads in the group's perf rows in the date window
   - Recompute aggregates: `roas = totalRevenue / totalSpend` (use `revenue` sum, not the average of per-row `roas` — that's also a small bug today), `ctr = clicks / impressions * 100`, `cpp = spend / purchases`
   - `hasActiveAd = true` if any ad in the group is ACTIVE
   - `adName`: representative ad's name, optionally suffixed with `(+N)` when grouped
3. Card `id` becomes the creative key (so click handlers/preview keep working — update `previewAdId` lookup to also accept a creative key, or pass the representative ad's id as a secondary field)
4. Keep current sort by `score`, current "no video ads" filter, and current date-range filtering — they all still apply, just to grouped rows.

## Technical notes

- `rawPerf` already has `revenue` per row (see `ad_performance_daily` schema), so switching ROAS from "avg of per-row roas" to `sumRevenue / sumSpend` is both more correct and necessary once we aggregate across multiple ads.
- No DB or edge-function changes needed. This is purely a client-side aggregation fix.
- Preview dialog (`CreativePreviewDialog` via `previewAdId`) currently expects an ad id — keep the representative ad id on the enriched row (e.g. `representativeAdId`) and pass that into the dialog when a card is clicked.

## Out of scope
- No schema changes.
- No sync changes — duplicates in `ads` are correct (Meta really does have those rows); we just shouldn't render them as separate creatives.
