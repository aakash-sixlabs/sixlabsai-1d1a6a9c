

## Problem Analysis

The "Edge Function returned a non-2xx status code" error on the data sync step is caused by **two bugs**:

### Bug 1: Wrong account ID passed to meta-sync
The `AccountSelectStep` stores accounts from `sessionStorage` using Meta's raw account data (e.g. `acc.id` = `"act_887707724755084"`), but the `meta-sync` edge function queries `ad_accounts` by the database UUID column `id`. The selected value doesn't match.

- In `AccountSelectStep.tsx` line 39: `id: acc.id || acc.account_id` — this gets the Meta account ID, not the database UUID
- In `meta-sync/index.ts` line 91: `.eq("id", adAccountId)` — expects a UUID, gets a Meta ID
- Result: query returns null → 404 response

### Bug 2: `getClaims()` may not exist in supabase-js v2
The `meta-sync` function uses `supabase.auth.getClaims()` which is not a standard method in supabase-js v2. It should use `supabase.auth.getUser()` instead. (Note: meta-oauth has the same issue but apparently worked — possibly a newer supabase-js version added it.)

---

## Plan

### 1. Fix AccountSelectStep to use database UUIDs
When loading from sessionStorage, fetch the actual database records instead of using raw Meta API data. The accounts are already saved to the database by the meta-oauth function, so query `ad_accounts` as the fallback path already does. Simplify: always fetch from the database (remove sessionStorage path or use it only as a signal that accounts exist).

### 2. Fix meta-sync auth to use getUser() instead of getClaims()
Replace `getClaims()` with `getUser()` and extract `userId` from `data.user.id`. Apply the same fix to meta-oauth for consistency.

### 3. Fix meta-sync join query
The edge function does `.select("*, meta_connections(*)")` — while there IS a FK from `ad_accounts.connection_id` to `meta_connections.id`, this should work. But to be safe, verify the join works and add error logging.

### Files to change
- `src/components/wizard/AccountSelectStep.tsx` — always use database query for account selection, remove fragile sessionStorage-based account mapping
- `supabase/functions/meta-sync/index.ts` — replace `getClaims()` with `getUser()`
- `supabase/functions/meta-oauth/index.ts` — replace `getClaims()` with `getUser()` for consistency

