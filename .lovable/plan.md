# Sort Structure & New Sort Controls

## Current sort behavior (today)

All ads are loaded once and globally sorted by a computed **Score** (descending) in `InsightsStep.tsx`:

```
score = min(100, round(roas * 15 + ctr * 20))
```

Then the view-specific filtering picks from that pre-sorted list:

| Section / View | Source | Sort applied |
|---|---|---|
| **Top Performers** (Home `🔥` block) | `filteredAds.slice(0, ceil(20%))` | Inherits global **Score desc** |
| **All Ads** (Home, `discover`) | `filteredAds` | **Score desc** |
| **Top Performers view** (`top` in sidebar) | top 20% by score | **Score desc** |
| **Opportunities** (`opportunities`) | `spend > 1000 AND roas < 2` | **Spend desc** |
| **Needs Review** (`needs-review`) | `decayScore > 50` | **Decay desc** |

Search filter is applied before sort/slice; no user control over sort order.

## What we'll add

A small **Sort by** dropdown in the section header (next to the "N creatives" pill) on the Home view, controlling **both** the Top Performers grid and the All Ads grid (single shared sort, since Top Performers is just the top slice of the same list).

### Sort options

- Score (default) — `roas*15 + ctr*20`
- Spend — highest first
- ROAS — highest first
- CTR — highest first
- Impressions — highest first
- Decay score — highest first (worst first, useful for triage)
- Ad name — A→Z

Each is descending by default except Ad name (A→Z). Nulls always sort last.

Opportunities and Needs Review keep their opinionated sorts (spend desc / decay desc) since those views are defined by their ranking — but the dropdown will still be visible and override when changed.

## Implementation

**File: `src/components/wizard/InsightsStep.tsx`**

1. Add `sortKey` state: `"score" | "spend" | "roas" | "ctr" | "impressions" | "decay" | "name"`, default `"score"`.
2. Remove the hard-coded `enriched.sort(...)` calls in `enrichAndSet` and `fetchData` (sort moves to the memo).
3. In `filteredAds` useMemo, after filtering, apply sort based on `sortKey`. Keep the existing override sorts for `opportunities` / `needs-review` only when `sortKey === "score"` (default); otherwise honor the user's choice.
4. Top slice (`topAds`) keeps using `filteredAds.slice(0, ceil(20%))` so it follows the same sort.

**File: `src/components/insights/AdCreativeGrid.tsx`** — no changes needed (sort happens upstream).

**UI: Sort dropdown**

Place a compact `DropdownMenu` (already imported via shadcn) in the section header at line ~545, replacing the current right-side pill area:

```text
[ Section title ]              [ Sort by: Score ▾ ]  [ N creatives ]
```

- Trigger: ghost button, small text, `ArrowUpDown` icon, current label.
- Items: the 7 options above; selected item shows a check.
- Styling matches existing rounded-xl, text-xs, muted foreground patterns.

## Out of scope

- Per-grid independent sort (Top Performers vs All Ads use the same order — this is intentional so "Top" remains the head of the same ranking).
- Ascending/descending toggle (defaults are the meaningful direction for each metric).
- Persisting sort choice across sessions.
