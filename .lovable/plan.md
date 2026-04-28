## Goal

Port the active + paused-with-impressions filter from the `/debug-sync` test functions into the production `meta-sync-accounts` edge function so onboarding only stores campaigns, ad sets, and ads that actually delivered.

## Filter rule (per stage)

For each level of the Meta hierarchy:

- **ACTIVE** entities → always kept
- **PAUSED** entities → kept only if they had ≥1 impression in the user's selected date range
- **Ads only:** also accept `WITH_ISSUES` as "active" (matches `test-ads`)
- Everything else (`ARCHIVED`, `DELETED`, `DISAPPROVED`, etc.) → excluded
- Hierarchical filter (`campaignMap` / `adsetMap` membership) and the `TEST_MODE_LIMIT = 500` cap remain in place, applied **after** the merge

## Implementation

**File:** `supabase/functions/meta-sync-accounts/index.ts` — replace lines 170–274 (the `runPhase` body up to the chain-to-creatives block).

### Per-stage pattern (3 stages: campaigns, ad sets, ads)

```
1. Fetch ACTIVE entities    → /{actId}/{entity}?effective_status=["ACTIVE"]
2. Fetch insights at level  → /{actId}/insights?level={...}&fields={id,impressions}
                              &time_range={since,until}
   → build Set of IDs that delivered
3. Fetch PAUSED entities    → /{actId}/{entity}?effective_status=["PAUSED"]
4. Filter PAUSED to set     → relevantPaused = paused.filter(p => set.has(p.id))
5. Merge + dedupe by id     → [...active, ...relevantPaused]
6. Apply parent-membership filter (existing logic)
7. Apply slice(0, 500)      → existing TEST_MODE_LIMIT cap
8. Upsert to DB
```

Date range comes from existing `dateStart` / `dateEnd` (already computed from `dateRangeDays`). Use `since`/`until` formatted as `YYYY-MM-DD`.

### New helpers (added once, reused 3×)

- `since`, `until` strings derived from existing `dateStart`/`dateEnd`
- `dedupeById<T>(rows: T[])` to merge active + paused without duplicate IDs

### Logging

Each stage logs counts: active, paused-with-impressions, paused-excluded, final kept. Replaces the old `TEST MODE: X → using Y` lines.

### Net Meta API calls per sync

| Before | After |
|---|---|
| 3 calls (1 per stage) | **9 calls** (3 per stage: active, paused, insights) |

Insights probes only request `id,impressions` so payloads stay small. Well within Meta rate limits for any practical account size.

## Unchanged

- `fetchAllPages` retry/backoff logic
- Auth, brand upsert, sync_jobs lifecycle
- Hierarchical filtering via `campaignMap` / `adsetMap`
- `TEST_MODE_LIMIT = 500` ceiling
- Chain-to-`meta-sync-creatives` at the end
- All downstream functions (`meta-sync-creatives`, `meta-sync-insights`) — they already operate on whatever ads exist in the DB

## Out of scope

- Touching the `/debug-sync` test functions (already correct)
- Backfilling/cleaning existing rows in the DB that were synced under the old "pull everything" logic — only future syncs will respect the filter
- Changes to insights date range or per-day fetch loop in `meta-sync-insights`