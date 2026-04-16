

# Create Production Tables in Lovable Cloud & Update Meta Sync

## Summary
Create the 10 production tables in this project's database (alongside the existing ones), then update the `meta-sync` edge function to write to the new production schema. Old tables stay untouched for now.

## Naming conflict
The production schema has an `ads` table, but so does the current database. To avoid collisions, I'll name the production version `prod_ads` (or we can drop/rename the old one — your call). Same applies if any other names clash. **Alternative**: since we're keeping old tables temporarily, I can prefix all production tables with `prod_` or keep the exact names and rename the old tables to `legacy_*`.

## Step 1 — Create production tables via migration

Create these 10 tables with the exact schema you provided:
- `brands` (+ add `user_id uuid` column for RLS)
- `prod_ads` (to avoid collision with existing `ads`)
- `ad_performance_daily`
- `campaign_ad_data`
- `creatives`
- `creative_tags`
- `products`
- `competitor_ads`
- `brand_competitors`
- `fatigue_diagnoses`

All use `bigint GENERATED ALWAYS AS IDENTITY` as primary keys per your schema. Add foreign keys where logical (e.g., `prod_ads.brand_id → brands.id`).

## Step 2 — Add RLS policies

Enable RLS on all new tables. Access checks go through `brands.user_id`:
- `brands`: `auth.uid() = user_id`
- All others: subquery join on `brand_id` to verify ownership

## Step 3 — Update `meta-sync` edge function

Rewrite `supabase/functions/meta-sync/index.ts` to:
1. Upsert a `brands` row using the ad account's Meta credentials (name, account ID, token, currency, timezone)
2. Fetch campaigns, adsets, ads, creatives, and daily insights (`time_increment=1`) from Meta API
3. Write flattened rows into `campaign_ad_data` (one row per ad per day)
4. Write daily metrics into `ad_performance_daily`
5. Write ads into `prod_ads` and creatives into `creatives`
6. Continue downloading images to `ad-creatives` storage bucket
7. Keep writing to old tables as well (dual-write) so nothing breaks during transition

## Step 4 — Update frontend queries

Update Insights, DataReview, and Home dashboard components to read from the new production tables (`campaign_ad_data`, `ad_performance_daily`, `creatives`) instead of the old normalized chain.

## What stays the same
- Auth flow, onboarding, Meta OAuth — unchanged
- Old tables (`campaigns`, `ad_sets`, `ads`, `ad_insights`, `ad_creatives`) remain but are deprecated
- `meta_connections`, `ad_accounts`, `profiles`, `sync_jobs` — unchanged

## Open question
Should I use exact table names from your production schema (renaming old `ads` to `legacy_ads`) or prefix the new ones as `prod_ads`?

