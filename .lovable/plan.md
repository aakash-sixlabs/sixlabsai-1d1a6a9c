## Problem

Sync completed on the backend (417 ads, 293 creatives) but UI stayed on "Pulling ad performance" because:
1. UI checks `status === "complete"` but prod enum value is `"completed"`.
2. UI relies solely on Supabase Realtime, which isn't enabled on the prod `sync_jobs` table.
3. No polling fallback.

## Changes

### 1. `src/components/wizard/DataSyncStep.tsx`
- Replace `"complete"` checks with `"completed"` (and handle `"failed"`).
- Add a 3s polling interval on `sync_jobs` by `syncJobId` as a fallback to Realtime. Clear interval on terminal status or unmount.

### 2. Migration — enable Realtime on prod
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.sync_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.generation_jobs;
ALTER TABLE public.sync_jobs REPLICA IDENTITY FULL;
ALTER TABLE public.generation_jobs REPLICA IDENTITY FULL;
```

### 3. Verify `meta-sync-accounts` returns `syncJobId`
Read the function; if it doesn't return the job id, patch it to do so and redeploy.

## Out of scope
No schema changes beyond enabling realtime. No edge function logic changes unless the syncJobId isn't returned.
