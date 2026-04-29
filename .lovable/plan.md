# Add Resync button on /home

## Goal
Place a manual "Resync" button in the `/home` (Insights) header that re-runs the Meta sync for the currently selected ad account, with progress shown inline (reusing the existing realtime sync UX).

## Why duplicates won't be a problem
The sync writers are all idempotent upserts keyed on natural identifiers, so re-running overwrites instead of appending:

- `campaigns` → `onConflict: user_id, meta_campaign_id`
- `ad_sets` → `onConflict: user_id, meta_adset_id`
- `ads` → `onConflict: user_id, meta_ad_id`
- `ad_creatives` → `onConflict: user_id, meta_creative_id` (also `upsert: true` on storage upload to same path)
- `ad_performance_daily` → `onConflict: user_id, ad_id, date` (one row per ad per day — re-pulling a day overwrites it with the latest Meta numbers)

Result: the latest pull is always the latest data; no duplicate rows are created. The materialized view `campaign_ad_data` is refreshed at the end of the insights phase, so dashboard reflects the fresh data.

## Do we need to repull the full 90 days?
**Recommendation: yes for now, with a smart default.** Reasons:

1. **Meta backfills attributions late.** Conversions and revenue for an ad can keep changing for ~7 days (and sometimes up to 28) after the impression date because of the attribution window and delayed pixel fires. Only re-pulling "today" would leave stale numbers for the prior week.
2. **Spend, impressions, frequency, reach can also be revised** by Meta within the first 72h.
3. **Cost is bounded.** Because we upsert on `(user_id, ad_id, date)`, a 90-day repull is just ~90 days × ad count rows rewritten — no growth, no dedup logic needed.
4. **It's already chunked + chained.** `meta-sync-insights` walks one day at a time with a soft 100s budget and self-chains via `cursor_date`, so a 90-day repull is safe.

Plan: keep the resync button as a **full re-pull of `state.dateRange` (defaults to 90)** — same window the user originally chose. Later optimization (out of scope here) could offer a "Quick refresh (last 7 days)" option that just narrows `dateRangeDays`.

## UI changes

**File: `src/components/insights/InsightsTopBar.tsx`**
- Add a new `Resync` button (icon: `RefreshCw` from lucide-react) placed left of the notifications bell.
- Props additions: `onResync: () => void`, `syncStatus: "idle" | "syncing" | "complete" | "error"`, `syncStep?: string`.
- States:
  - `idle` → "Resync" button enabled.
  - `syncing` → button disabled, shows spinner + truncated `syncStep` (e.g. "Pulling performance (2026-04-12)") in a small chip.
  - `complete` → brief "Synced" confirmation (auto-revert to idle after ~2s).
  - `error` → red chip "Sync failed — retry".

**File: `src/components/wizard/InsightsStep.tsx`**
- Already has `triggerBackgroundSync()` and `syncStatus` / `syncStep` state. Just:
  - Pass `syncStatus`, `syncStep`, and `onResync={triggerBackgroundSync}` down to `InsightsTopBar` (via whatever component currently mounts it — likely the Insights layout).
  - Ensure `triggerBackgroundSync` is safe to call multiple times: guard with `if (syncStatus === "syncing") return;`.
  - On `complete`, after `fetchData()`, set `syncStatus` back to `"idle"` after ~2s so the button is reusable.

## No backend changes required
The existing `meta-sync-accounts` → `meta-sync-creatives` → `meta-sync-insights` chain already supports re-runs. Each phase's writers upsert. The MV refresh at the end keeps `/home` fresh.

## Edge cases handled
- **Concurrent syncs:** the button is disabled while `syncStatus === "syncing"`. A new `sync_jobs` row is inserted per click; the realtime subscription always tracks the latest UPDATE event so progress stays accurate.
- **Missing selected account:** button hidden if `state.selectedAccount` is null.
- **Stale rows for ads removed in Meta:** out of scope — current sync doesn't delete rows for ads no longer returned. Flag for follow-up if needed.

## Out of scope
- Differential / "last 7 days only" sync mode.
- Cleaning up rows for ads that disappeared from Meta.
- Per-row sync timestamp display.
