## Problem

When the Meta OAuth callback runs, the edge function fails with:

```
null value in column "account_id" of relation "meta_connections" violates not-null constraint
```

The `meta_connections` table requires a non-null `account_id` (the Lovable tenant uuid), but `supabase/functions/meta-oauth/index.ts` upserts the row with only `user_id`, `access_token`, `meta_user_id`, etc. — no `account_id`. As a result the OAuth callback returns a non-2xx, which the UI surfaces as “Edge Function returned a non-2xx status code at auth”.

Existing users always have at least one row in `account_users` (created by the `handle_new_user` trigger), so we just need to resolve it before the insert.

## Fix

Edit `supabase/functions/meta-oauth/index.ts`, in the `exchange-token` action, right before the `meta_connections` upsert:

1. Resolve the user's account id:
   ```ts
   const { data: au, error: auErr } = await adminClient
     .from("account_users")
     .select("account_id")
     .eq("user_id", userId)
     .order("created_at", { ascending: true })
     .limit(1)
     .maybeSingle();

   if (auErr || !au?.account_id) {
     console.error("[meta-oauth] no account for user", userId, auErr);
     return new Response(
       JSON.stringify({ error: "No account found for user." }),
       { status: 500, headers: corsHeaders },
     );
   }
   const accountId = au.account_id;
   ```

2. Include `account_id: accountId` in the `meta_connections` upsert payload.

3. Keep `onConflict: "user_id"` (one connection per user). If the unique constraint is actually `(account_id, user_id)`, switch to `onConflict: "account_id,user_id"` — verify via `\d meta_connections` if the first variant errors after the fix.

No DB migration is required; the column already exists and is NOT NULL. No client changes needed.

## Verification

- Re-run the Meta OAuth flow from `/login` → callback should complete and `meta_connections` should contain the new row with `account_id` populated.
- Edge function logs should no longer show the `23502` error.
