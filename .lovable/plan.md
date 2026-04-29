# Populate `cost_per_purchase` in insights sync

## Change
In `supabase/functions/meta-sync-insights/index.ts`, derive `cost_per_purchase` at write time as `spend / purchases` (0 when `purchases === 0`) and include it in each `perfRows` upsert payload.

## Implementation
- After computing `purchases`, `spend`, `revenue`, `roas`, add:
  ```ts
  const costPerPurchase = purchases > 0 ? spend / purchases : 0;
  ```
- Add `cost_per_purchase: costPerPurchase` to the row object pushed into `perfRows`.
- No schema change needed — column already exists on `ad_performance_daily` with default `0`.
- No backfill of historical rows in this change; only newly-synced/upserted rows will be populated. (Re-running a sync for a date range will overwrite via the existing `user_id,ad_id,date` upsert conflict target.)

## Out of scope
- Pulling Meta's native `cost_per_action_type` field (would match Ads Manager exactly but requires a wider API change).
- Backfilling existing rows via SQL.
