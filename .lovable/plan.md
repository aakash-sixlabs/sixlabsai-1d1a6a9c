## Goal

Increase the per-entity sync ceiling in the Meta data-pull pipeline from **10** to **500**, so onboarding pulls a meaningful slice of the user's account instead of a tiny smoke-test sample.

## Change

**File:** `supabase/functions/meta-sync-accounts/index.ts` (line 167)

```diff
- // TEST MODE: cap each entity to keep Meta API calls minimal during debugging.
- const TEST_MODE_LIMIT = 10;
+ // Per-entity safety ceiling — caps each level of the Meta hierarchy
+ // (campaigns, ad sets, ads) at 500 to bound downstream Meta API cost.
+ const TEST_MODE_LIMIT = 500;
```

That's the only line change. The constant is already referenced at all three stages (campaigns, ad sets, ads) so bumping the value automatically lifts the cap everywhere.

## Effect

| Stage | Before | After |
|---|---|---|
| Campaigns kept | 10 | 500 |
| Ad sets kept (within kept campaigns) | 10 | 500 |
| Ads kept (within kept ad sets) | 10 | 500 |
| Creatives hydrated by `meta-sync-creatives` | up to 10 | up to 500 |
| Daily insights pulled by `meta-sync-insights` | up to 10 ads × N days | up to 500 ads × N days |

The Meta API page-size (`limit=500` in the URL) is unrelated and untouched — it just controls pagination chunk size, not totals.

## Considerations

- **Sync time:** A sync that previously finished in seconds will now take longer. `meta-sync-insights` is the dominant cost (it makes one call per day in the date range, per page of ads). For 500 ads over 30 days this is still well within Meta's per-hour rate limits but the user should expect the data-sync step in onboarding to take a couple of minutes instead of seconds.
- **No schema or UI changes** required — the realtime `sync_jobs` progress UI in `DataSyncStep.tsx` already handles longer-running syncs.
- **Deployment:** Only `meta-sync-accounts` needs to redeploy; the cap only lives there.

## Out of scope

- Making the cap configurable via env var or request body (offered earlier — skipping per your decision to just raise the number).
- Touching `meta-sync-creatives` or `meta-sync-insights` (no caps live in them; they process whatever ads exist in the DB).