## Changes to /home

### 1. Mark "Needs Review" and "Opportunities" as upcoming (not clickable)

File: `src/components/insights/InsightsSidebar.tsx`

- Add an `upcoming?: boolean` flag to the `NavItemMeta` items for `opportunities` and `needs-review`.
- Drop their numeric counts (4 and 3) — they're fake placeholders.
- In the render loop, when `upcoming` is true:
  - Render the row as a `<div>` (not a button), `disabled`-styled (muted text, `cursor-not-allowed`, no hover bg).
  - Replace the count pill with a small "Soon" badge (`bg-secondary text-muted-foreground`).
  - Skip the `onViewChange` handler so clicks do nothing.

### 2. Hide the "Replay onboarding v1" floating button

File: `src/pages/Insights.tsx`

- Remove the entire `showReplay` state, the super-admin email check that sets it, and the floating `<Button>` block (lines ~31–35 + 86–98).
- Drop the now-unused imports: `FlaskConical`, `Button`, `isSuperAdmin`.

### 3. Fix ROAS showing 0.0x on every product card

File: `src/components/wizard/InsightsStep.tsx` (line 362)

The aggregation loop reads `p.revenue` (line 442) to compute `roas = revenue / spend`, but the Supabase select for `ad_performance_daily` does not include the `revenue` column — so `revenue` is always `undefined → 0`, giving ROAS `0`.

Fix: add `revenue` to the select list:

```ts
.select("ad_id, date, spend, impressions, clicks, ctr, roas, purchases, revenue")
```

This makes the per-creative ROAS aggregation work for real synced accounts. (Mock/dev data already has correct ROAS values and will continue to render unchanged.)

### Out of scope

- No schema changes, no edge-function changes, no changes to the dev-mode mock generator.
- The "Top Performers" sidebar item stays clickable.