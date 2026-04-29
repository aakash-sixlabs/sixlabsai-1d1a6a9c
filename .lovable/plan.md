# Limit resync window to 30 days

## Why 30 days is enough
Meta's attribution windows close by 28 days (7-day click + 1-day view is the default; 28-day click is the longest available). Once a day is past that, spend, impressions, conversions and revenue are effectively frozen and won't change on a repull. Re-fetching 90 days every click is wasted work.

- Initial onboarding sync: still uses the user's chosen window (defaults to 90 days) so we have historical context.
- Manual resync from `/home`: hardcoded to **30 days** — covers the full attribution window with a small buffer.

Result: ~3× fewer Meta API calls and ~3× fewer `ad_performance_daily` row writes per resync. Older days stay in the database untouched (upserts only overwrite the days we re-pull).

## Change

**File: `src/components/wizard/InsightsStep.tsx`** — in `triggerBackgroundSync`, replace:

```ts
body: { adAccountId: accountId, dateRangeDays: state.dateRange || "90" },
```

with:

```ts
body: { adAccountId: accountId, dateRangeDays: "30" },
```

Add a brief comment explaining the 30-day rationale (attribution window).

## Out of scope
- No backend changes. `meta-sync-accounts` already accepts any `dateRangeDays` value.
- Initial onboarding sync (`DataSyncStep`) is unchanged — keeps the user-selected range.
