## Diagnosis

The mirror trigger fires and authenticates correctly. The second Supabase rejects the request with PostgREST error **PGRST125 "Invalid path specified in request URL"** — which means the URL path is malformed (not that the table is missing — that would be PGRST205, and you've confirmed the tables exist).

Most likely cause: the `MIRROR_SUPABASE_URL` secret was entered with a trailing path like `https://jkzbuypbhqbssmqjpdtj.supabase.co/rest/v1/` (which is what your sample URL looked like), so the actual fetch URL ends up as `.../rest/v1/rest/v1/ad_account_profiles` — invalid.

## Fix

1. **Harden URL handling in `mirror-write`** so any of these shapes work:
   - `https://jkzbuypbhqbssmqjpdtj.supabase.co`
   - `https://jkzbuypbhqbssmqjpdtj.supabase.co/`
   - `https://jkzbuypbhqbssmqjpdtj.supabase.co/rest/v1`
   - `https://jkzbuypbhqbssmqjpdtj.supabase.co/rest/v1/`

   Logic: strip trailing `/`, strip trailing `/rest/v1`, then always append `/rest/v1/<table>` ourselves.

2. **Add diagnostic logging** so the next failure (if any) shows the exact URL being hit and the second project's full response — making future debugging instant.

3. **Trigger a test write** to `ad_account_profiles` and check `mirror-write` logs to confirm the row reached the second project.

4. **Verify** by running a `SELECT id, brand_kit_updated_at FROM ad_account_profiles WHERE id = '978d6c64-...'` against the second project (via curl) and confirming the timestamp matches.

## Files to change

- `supabase/functions/mirror-write/index.ts` — robust URL normalization + better logs
