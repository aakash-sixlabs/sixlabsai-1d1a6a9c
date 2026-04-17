

## Understanding the phase split for `meta-sync`

The current function does everything in one invocation and dies at ~150s. Here's the plan to split it into chained phases, each safely under the limit.

### Why split?

Edge Functions have a **~150s wall-clock limit**. Current sync does 5 heavy things serially in one call:

```text
[boot] → campaigns → adsets → ads(skeleton) → creatives(batched+images) → insights(90 days loop) → [done]
                                                                              ^ dies here around 150s
```

Splitting means each phase returns fast, then triggers the next phase via a new function invocation. `sync_jobs` acts as the baton.

### Proposed phases

```text
Phase 1: meta-sync-accounts    (~5-15s)
  └─ campaigns + adsets + ads(skeleton) → writes to campaigns/ad_sets/ads/prod_ads
  └─ updates sync_jobs.current_step = "creatives"
  └─ invokes meta-sync-creatives

Phase 2: meta-sync-creatives   (~30-90s)
  └─ batched creative details (50 at a time) + image rehost to ad-creatives bucket
  └─ writes to ad_creatives + creatives + updates prod_ads.creative_url
  └─ updates sync_jobs.current_step = "insights"
  └─ invokes meta-sync-insights

Phase 3: meta-sync-insights    (can loop itself if needed)
  └─ pulls day-by-day insights, writes campaign_ad_data + ad_insights
  └─ if date range is large, processes N days then re-invokes itself with a cursor
  └─ on final day → sync_jobs.status = "complete"
```

### How phases chain

Two patterns, both safe:

1. **Fire-and-forget invoke**: Phase 1 returns its HTTP response, then in `EdgeRuntime.waitUntil(...)` calls `supabase.functions.invoke('meta-sync-creatives', { body: { jobId } })`. The next phase boots as a fresh invocation with its own 150s budget.

2. **Self-chaining for insights**: If 90 days of insights can't fit in 150s, Phase 3 processes e.g. 30 days, updates `sync_jobs` with a `cursor_date`, and re-invokes itself. Repeat until cursor reaches end date.

### What `sync_jobs` tracks

Already has `current_step`, `status`, `error_message`. We'd add:
- `cursor_date` (date, nullable) — for Phase 3 self-chaining
- `phase` (text, nullable) — explicit "accounts" / "creatives" / "insights" for clarity

Frontend realtime subscription on `sync_jobs` keeps the progress UI live across all phases — no UI changes needed beyond mapping the new `phase` values to friendly step labels.

### Failure handling

- Each phase wraps its work in try/catch. On error → `sync_jobs.status = 'error'`, store message, stop chain.
- Retry = re-invoke the specific failed phase (knowable from `current_step`) rather than restarting from scratch.

### What stays the same

- All table writes (same schema, same data mapping we discussed earlier)
- Realtime subscription to `sync_jobs` from the frontend
- CORS, auth, error surfaces
- Image bucket logic

### What changes

- `meta-sync/index.ts` becomes `meta-sync-accounts/index.ts` (phase 1 only)
- Two new functions: `meta-sync-creatives/`, `meta-sync-insights/`
- One small migration adding `cursor_date` + `phase` columns
- Frontend `OnboardingV2.tsx` step labels updated (cosmetic)

### Trade-off

More moving parts, but each phase is independently retriable and nothing can ever exceed the wall limit. This is the standard pattern for Meta/Google Ads pulls on Supabase.

