## Root cause

The sync did "complete" — but it wrote everything to the **Lovable Cloud** Supabase project (`bhcusyaonpevmwaruvlx`) instead of the **Prod** project (`jkzbuypbhqbssmqjpdtj`).

Verified by querying Lovable Cloud directly:

```
ads:                  417   ← should be in prod
ad_creatives:           0   ← never written anywhere
ad_performance_daily:   0   ← never written anywhere
sync_jobs:              1 (status=completed, total_ads=417, total_creatives=293)
```

So three things are wrong:

1. **All sync writes are landing in the wrong project.** The frontend reads from prod, so the user sees an empty UI (or partially populated, since ads got copied somewhere else too).
2. **`ad_creatives` is empty in BOTH projects** even though `sync_jobs.total_creatives = 293`. That counter is incremented optimistically inside `meta-sync-creatives`, but every per-ad upsert is silently failing — almost certainly because of the new FK `ad_creatives.account_id → accounts(id)` combined with the wrong-project writes (the `ads.id` it references doesn't exist in the target DB) **or** the unique key change (`(ad_id, meta_creative_id)` instead of the old `(user_id, meta_creative_id)` we're upserting on).
3. **`ad_performance_daily` is empty** because `meta-sync-insights` upserts with `onConflict: "user_id,ad_id,date"`, but the actual unique key on the prod table is just `id` (PK). With no unique constraint matching that conflict target, the upsert errors out — but the function swallows the error and still flips the job to `completed`.

## What to fix

### 1. Point edge-function secrets at the real prod project

Verify these secrets in Lovable Cloud actually point at `jkzbuypbhqbssmqjpdtj`, not at the Cloud project:

- `PROD_SUPABASE_URL` → must be `https://jkzbuypbhqbssmqjpdtj.supabase.co`
- `PROD_SUPABASE_SERVICE_ROLE_KEY` → must be the service-role key from the prod project
- `PROD_SUPABASE_ANON_KEY` → already correct

I'll surface these via `update_secret` so you can paste the right values. Without this every edge function will keep writing into the Cloud project.

### 2. Fix the upsert conflict targets to match the prod schema

In the prod DB the unique constraints are:

```
ad_creatives:         UNIQUE (ad_id, meta_creative_id)
ad_performance_daily: (no unique key besides PK)
```

But the edge functions upsert with:

```
ad_creatives          → onConflict: "user_id,meta_creative_id"   ❌
ad_performance_daily  → onConflict: "user_id,ad_id,date"         ❌
```

Both fail at runtime because the conflict target doesn't exist. Fixes:

- `meta-sync-creatives/index.ts`: change `onConflict` to `"ad_id,meta_creative_id"` and use the internal `storedAd.id` (which is already done) — done by virtue of the conflict key change.
- Add a migration on prod creating `UNIQUE (user_id, ad_id, date)` on `ad_performance_daily`, then keep the existing `onConflict: "user_id,ad_id,date"`.

(Migration tool only targets Lovable Cloud, so I'll print the SQL for Mubeen to run on prod, plus apply it on Cloud so both schemas stay in sync.)

### 3. Stop reporting "completed" when phases silently failed

In `meta-sync-creatives` and `meta-sync-insights`, every `admin.from(...).upsert(...)` call should check `error` and call `failJob(...)` instead of swallowing it. Without this we keep getting green ticks on broken syncs.

### 4. Clean the Cloud project of mis-written rows

Truncate `ads`, `ad_sets`, `campaigns`, `ad_accounts`, `meta_connections`, `sync_jobs`, `brands`, `accounts`, `account_users`, `profiles` on Lovable Cloud (one migration). All real data should live in prod going forward; Cloud holds only edge-function code.

### 5. Re-run the sync

After secrets are corrected and the function patches are deployed, retry the sync from `/onboarding-v2`. The polling already added in the last round will surface real `failed` states if anything else breaks.

## Out of scope

- No frontend changes.
- No Meta-API logic changes.

## Order of operations

1. Ask you to confirm/repaste `PROD_SUPABASE_URL` and `PROD_SUPABASE_SERVICE_ROLE_KEY`.
2. Patch `meta-sync-creatives` and `meta-sync-insights` (conflict targets + error propagation).
3. Migration on Cloud: clean tables; add unique constraint on `ad_performance_daily`. Print equivalent SQL for prod.
4. You re-run the sync; we watch logs.
