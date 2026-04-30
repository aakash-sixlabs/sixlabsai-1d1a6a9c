# Insights Dashboard: Tile updates + Date range filter

## What changes

### 1. Tile 1 — "Creative Velocity" → count of creatives in **active ads**

Today: shows total creatives in account, with a hardcoded "+40%" delta.

New behavior:
- Show the count of **distinct creatives** that are used in at least one ad whose `ad_effective_status = 'ACTIVE'` within the selected date range.
- One creative used in 4 ads = counts as 1.
- Replace the fake "+40% vs last 14 days" with a truthful sublabel: `in active ads` (and the small delta chip is removed for now — we don't have a reliable historical baseline).

### 2. Tile 2 — "Top Performer" → 3-slide carousel

Today: shows `ads[0]` (whatever the global sort happens to surface), with non-functional left/right arrows.

New behavior — wire the existing arrows to a real 3-slide slider, each slide pinned to a fixed metric (computed from data filtered by the date range):

| Slide | Metric                   | Tie-break          |
|------:|--------------------------|--------------------|
|   1   | Highest **Spend**        | most recent date   |
|   2   | Most **Purchases**       | highest spend      |
|   3   | Most **Impressions**     | highest spend      |

Each slide shows: ad name, the headline metric (e.g. `$31.2K spend`, `1,284 purchases`, `1.35M impressions`), plus the existing two secondary rows (Avg Spend, Format).

Slide indicator dots under the arrows (3 dots, current one filled). Arrows cycle with wrap-around; a small label above ("Top by Spend" / "Top by Purchases" / "Top by Impressions") tells the user which ranking they're on.

### 3. Page-level **Date range filter**

A single date-range selector at the top of the main content area (right of the page title row, above the digest tiles) controls **everything on the page** — the 3 digest tiles, Top Performers grid, All Ads grid, and view-specific filters (Opportunities, Needs Review).

Options (preset chips, single-select):
- Last 7 days
- Last 14 days
- Last 30 days (default)
- Last 90 days
- All time

We're keeping it to presets — no custom calendar — to ship simply. The selected range is stored in component state and passed into the data aggregation in `InsightsStep.tsx`.

## How it works (technical)

**File: `src/components/wizard/InsightsStep.tsx`**

1. Add `dateRange` state: `"7" | "14" | "30" | "90" | "all"`, default `"30"`.
2. In `fetchData`, after pulling `campaign_ad_data` rows, filter by `row.date >= cutoff` before aggregating. Also keep raw rows around so we can recompute when the user changes the range without re-querying.
   - Actually simpler: keep the full `cadRows` in state, then derive `ads` via a `useMemo` on `[cadRows, dateRange]`. Aggregation logic moves from `fetchData` into the memo.
3. Add a new derived value `activeCreativeCount` — distinct `creative_id` where any row in the date range for that creative has `ad_effective_status = 'ACTIVE'`.
4. Add a new derived value `topPerformersTriple`:
   ```ts
   {
     bySpend:       sortAds(ads, "spend")[0],
     byPurchases:   ads.slice().sort((a,b) => (b.purchases ?? 0) - (a.purchases ?? 0))[0],
     byImpressions: sortAds(ads, "impressions")[0],
   }
   ```
   This requires adding `purchases: number | null` to the `EnrichedAd` type and summing `purchases` in the aggregator.
5. Pass `dateRange`, `setDateRange`, `activeCreativeCount`, and `topPerformersTriple` down to `DigestCards`.

**File: `src/components/insights/DigestCards.tsx`**

1. New props: `activeCreativeCount: number`, `topPerformers: { bySpend, byPurchases, byImpressions }`. Drop `velocityChange` and `newAdsLast14Days` (no longer used).
2. Tile 1 renders `activeCreativeCount` with sublabel "in active ads". Remove the green delta chip.
3. Tile 2 holds local `slideIndex` state (0–2). Arrows decrement/increment with wrap. Render the slide for the current index with a small "Top by {Metric}" eyebrow label and 3 indicator dots below.

**New file: `src/components/insights/DateRangeFilter.tsx`**

Small pill-group component. 5 chip buttons, active one highlighted with `bg-primary/10 text-primary`. Emits string values matching the `dateRange` keys above. Rendered in `InsightsStep.tsx` just below the hero block, right-aligned.

**Out of scope (intentionally)**
- Custom date pickers — presets only.
- Persisting date range across sessions.
- Reflowing the Format Mix tile (no change requested).
- Recomputing the velocity % delta — removed, not refactored.

## Files touched
- `src/components/wizard/InsightsStep.tsx` — date-range state, re-derive ads, new metrics, prop wiring
- `src/components/insights/DigestCards.tsx` — Tile 1 simplified, Tile 2 becomes 3-slide carousel
- `src/components/insights/DateRangeFilter.tsx` — new presentational component
