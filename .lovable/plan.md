

User wants schema restructure. Clear, well-specified spec. Just need to plan the migration and identify code touchpoints.

Code that references dropped/changed tables needs updating:
- `meta-sync-accounts/index.ts` — uses `prod_ads`, old `campaigns/ad_sets/ads` columns (`campaign_id`, `adset_id`, `ad_name`)
- `meta-sync-creatives/index.ts` — likely uses `ad_creatives` + `prod_ads`
- `meta-sync-insights/index.ts` — uses `ad_insights` + `ad_performance_daily` + `campaign_ad_data`
- `meta-sync/index.ts` — legacy
- Frontend: `Insights.tsx`, `DataReviewStep.tsx`, `AdCreativeGrid.tsx`, `Output.tsx`, `Home` — may read `prod_ads`/`creatives`/`campaign_ad_data`/`ad_insights`

Plan keeps it tight: one migration + edge function rewrites + audit frontend reads.

---

# Plan: Restructure schema for new sync pipeline

## 1. Single migration (all schema changes)

Run as one migration so it's atomic and re-runnable.

**Drop redundant tables**
- `prod_ads`, `creatives`, `ad_insights`, `campaign_ad_data` (all CASCADE)

**Rebuild changed tables** (drop + recreate, since column renames + new FKs are extensive)
- `campaigns` — adds `meta_campaign_id`, `effective_status`, budgets, times; FKs to `auth.users` + `ad_accounts`; UNIQUE `(user_id, meta_campaign_id)`
- `ad_sets` — adds `meta_adset_id`, `effective_status`, budgets, `optimization_goal`, `billing_event`, times; FK to `campaigns`
- `ads` — renames `adset_id`→`ad_set_id`, adds `meta_ad_id`/`meta_creative_id`/`effective_status`; FK to `ad_sets`
- `ad_creatives` — adds `meta_creative_id`, image hash fields, `stored_image_url(s)`, raw spec jsonb columns; FK to `ads`
- `ad_performance_daily` — adds `user_id`, `reach`, `cpc`, `cpm`, `purchases`, `revenue`; FK to `ads`; UNIQUE `(user_id, ad_id, date)`

**Re-apply RLS** on rebuilt tables (same `auth.uid() = user_id` policies as today).

**Materialized view** `campaign_ad_data` joining performance → ads → creatives → ad_sets → campaigns → ad_accounts → brands; unique index `(brand_id, ad_id, date)`.

**Indexes** — all 13 from spec.

**`sync_jobs`** — add the 8 new counter columns via `ALTER TABLE … ADD COLUMN IF NOT EXISTS`.

Untouched: `auth.users`, `profiles`, `meta_connections`, `ad_accounts`, `ad_account_profiles`, `brands`.

## 2. Rewrite the 3 edge functions

Sync code references columns/tables that no longer exist. Must update before next sync.

- **`meta-sync-accounts`** — write `meta_campaign_id` (not `campaign_id`), `meta_adset_id`, `meta_ad_id`, `ad_set_id` (renamed). Remove all `prod_ads` writes. Remove brand upsert from this function (brand already exists pre-sync, or move to a one-shot step).
- **`meta-sync-creatives`** — write to new `ad_creatives` shape (`meta_creative_id`, `image_hash`, `stored_image_url`, `raw_asset_feed_spec`, etc.). Remove `prod_ads.creative_url` updates.
- **`meta-sync-insights`** — write to new `ad_performance_daily` (now has `user_id`, `reach`, `cpc`, `cpm`, `purchases`, `revenue`). Remove all `ad_insights` and `campaign_ad_data` writes. At end of insights phase, `REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_ad_data`.
- Update `sync_jobs` progress to use new counter columns (`total_campaigns`, `total_creatives`, `images_downloaded`, etc.).

## 3. Audit + patch frontend reads

Find every component querying dropped tables and switch to the new sources:

| Old read | New source |
|---|---|
| `prod_ads` | `ads` (joined as needed) |
| `creatives` | `ad_creatives` |
| `ad_insights` | `ad_performance_daily` |
| `campaign_ad_data` (table) | `campaign_ad_data` (materialized view — same name, similar columns) |

Files to check & update: `Insights.tsx`, `Output.tsx`, `Home`/dashboard, `DataReviewStep.tsx`, `AdCreativeGrid.tsx`, `DigestCards.tsx`, anything in `src/components/insights/`.

Column renames to propagate everywhere:
- `campaigns.campaign_id` → `meta_campaign_id`, `campaign_name` → `name`
- `ad_sets.adset_id` → `meta_adset_id`, `adset_name` → `name`
- `ads.ad_id` → `meta_ad_id`, `ad_name` → `name`, `adset_id` → `ad_set_id`
- `ad_creatives.creative_id` → `meta_creative_id`, `image_urls` → `stored_image_urls`

## 4. Regenerate types

`src/integrations/supabase/types.ts` is auto-regenerated after migration — frontend type errors will surface the remaining call sites to fix.

---

## Notes / risks

- **Drop+recreate vs ALTER**: spec uses `CREATE TABLE IF NOT EXISTS` which would skip existing tables. But existing `campaigns/ad_sets/ads/ad_creatives/ad_performance_daily` have *different* column names (`campaign_id` vs `meta_campaign_id`, etc.), so `IF NOT EXISTS` would leave them stale. Will explicitly `DROP … CASCADE` then recreate. All current sync data is test data — confirmed safe to wipe.
- **Materialized view refresh**: must be triggered after each sync (added to insights phase). Initial refresh runs empty after migration.
- **RLS on new `ad_performance_daily`**: switches from `owns_prod_ad(ad_id)` to `auth.uid() = user_id` (since `user_id` is now on the row directly — simpler & faster).
- Sync code rewrites are necessary in the same delivery — schema migration alone will break the next sync run.

