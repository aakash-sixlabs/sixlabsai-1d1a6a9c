
## Plan: Update test-ads with retry logic + single-call-per-adset

Two surgical changes to `supabase/functions/test-ads/index.ts` only.

### Change 1 — Replace `fetchAllPages` with retry-with-backoff

Add inner retry loop (up to 4 attempts) that detects Meta rate-limit error codes (17, 4, 32, 80004) and waits with exponential backoff: 2s → 4s → 8s. Non-rate-limit errors throw immediately. Keeps the 500ms inter-page delay. Drops the `maxRecords` parameter (no longer used after Change 2).

### Change 2 — One Graph API call per ad set

Currently: 2 calls per ad set (active + paused). New: 1 call per ad set with no status filter, then filter in code:
- `ACTIVE` / `WITH_ISSUES` → always keep
- `PAUSED` → keep only if ad ID is in `adsWithImpressions` set
- Other statuses → drop

The ad-level insights pull (already exists) feeds the `adsWithImpressions` set.

**Result**: Halves Graph API call volume per sync, which is the real fix for the "User request limit reached" error. Combined with retry-on-429, the function should handle large accounts reliably.

### Response payload
Updated to include: `date_range`, `total_adsets_checked`, `total_ads_pulled`, `total_stored`, `skipped_no_adset`, `capped_at`, `hit_limit`, `limit_reason`, `upsert_error`, `sample`. The `total_paused_excluded` field is removed (no longer tracked separately since filtering happens inline).

### Files modified
- `supabase/functions/test-ads/index.ts` (only)

### Not touched
- `fetchAllPages` in other functions, database schema, debug page, other test functions
