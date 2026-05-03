## Goal

Make all five `test-*` edge functions write the pulled Meta data into the **Lovable Cloud** database (this project's own Supabase) instead of the prod Supabase project. The current `there is no unique or exclusion constraint matching the ON CONFLICT specification` error happens because the functions are pointing at prod with `onConflict` keys that don't match prod's constraints. Cloud already has the right tables and unique keys.

## Approach

Use **two clients** inside each test function:

- `prodAdmin` → only used to look up `ad_accounts` by UUID (since the picker on `/debugsync` reads from prod and the user selects a prod ad account).
- `cloudAdmin` → used for every read/write of campaigns / ad_sets / ads / ad_creatives / ad_performance_daily. Built from the default `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` env vars (Lovable Cloud).

All downstream lookups (campaigns by `meta_campaign_id`, ad_sets by `meta_adset_id`, ads by `meta_ad_id`, etc.) and all upserts move to `cloudAdmin`.

## Fix `onConflict` to match Cloud unique constraints

Cloud's actual unique keys (verified):

| Table | Unique key |
|---|---|
| campaigns | `(ad_account_id, meta_campaign_id)` |
| ad_sets | `(campaign_id, meta_adset_id)` |
| ads | `(ad_set_id, meta_ad_id)` |
| ad_creatives | `(ad_id, meta_creative_id)` |
| ad_performance_daily | none today |

Updates per function:

- `test-campaigns`: keep `onConflict: 'ad_account_id,meta_campaign_id'` (already correct).
- `test-adsets`: change to `onConflict: 'campaign_id,meta_adset_id'`.
- `test-ads`: change to `onConflict: 'ad_set_id,meta_ad_id'`.
- `test-creatives`: change to `onConflict: 'ad_id,meta_creative_id'`.
- `test-insights`: needs a unique index on `ad_performance_daily(ad_id, date)`. Add it via migration, then upsert with `onConflict: 'ad_id,date'`.

## Required NOT NULL columns

Cloud rows need `account_id` (NOT NULL) on every insert. Pull `account_id` from the prod `ad_accounts` lookup and stamp it onto every row alongside `user_id`. (RLS is bypassed by the service-role key, so we only care about NOT NULL.)

## Files to change

- `supabase/functions/test-campaigns/index.ts`
- `supabase/functions/test-adsets/index.ts`
- `supabase/functions/test-ads/index.ts`
- `supabase/functions/test-creatives/index.ts`
- `supabase/functions/test-insights/index.ts`
- New migration: add unique index `ad_performance_daily_ad_id_date_uq` on `(ad_id, date)`.

## Deploy & verify

Redeploy the 5 functions, then re-run Step 1 → Step 5 on `/debugsync`. Expected: rows land in Lovable Cloud's `campaigns`, `ad_sets`, `ads`, `ad_creatives`, `ad_performance_daily` tables and the `there is no unique or exclusion constraint…` error disappears.

## Notes

- Ad-creative images will continue to be uploaded to Cloud's `ad-creatives` storage bucket (already the case since storage uses the same client we're switching). I'll confirm the bucket exists in Cloud before deploying; if not, the migration will create it.
- This is a temporary debug routing — the real prod sync functions are untouched.
