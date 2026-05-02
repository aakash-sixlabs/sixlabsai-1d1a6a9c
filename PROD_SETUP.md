# Prod Supabase Switch — Setup Checklist

The app now points at the **prod Supabase project**
`jkzbuypbhqbssmqjpdtj` (`https://jkzbuypbhqbssmqjpdtj.supabase.co`)
for **all auth, database, and storage** operations.

Edge functions still deploy to the Lovable Cloud project
(`bhcusyaonpevmwaruvlx`), but they read/write the prod database via the
`PROD_SUPABASE_*` secrets. The frontend's `supabase.functions.invoke()`
is rewired to call the Lovable Cloud functions endpoint.

## What Mubeen needs to verify on prod

### 1. Storage buckets
Create these in `jkzbuypbhqbssmqjpdtj` if missing:
- `ad-creatives` — **public**
- `brand-guidelines` — **private**

### 2. Schema parity
The full 26-table schema (see `mem://schema/dictionary-alignment`) must
exist on prod with identical column names, enums, and RLS policies. Apply
all migrations from `supabase/migrations/` if they aren't already present.
Critical pieces:
- Enums: `user_role`, `brand_kit_status`, `sync_status`,
  `generation_status`, `generation_trigger_type`, `creative_status`,
  `fatigue_status`, `creative_source`, etc.
- Functions: `is_account_admin`, `is_superadmin`, `has_account_access`,
  `user_account_ids`, `update_updated_at_column`, `handle_new_user`
- Trigger: `on_auth_user_created` calling `handle_new_user()` on
  `auth.users` insert (provisions `accounts`, `profiles`,
  `account_users` rows)
- All `*_account_access` RLS policies

### 3. Auth providers
In prod's Supabase dashboard → Authentication → Providers:
- Enable **Email** (with confirm OFF if you want testing without
  verification, otherwise ON)
- Enable **Google** OAuth — paste the same Google client ID/secret as
  Lovable Cloud was using
- Add redirect URLs:
  - `https://www.sixlabs.ai/auth/callback`
  - `https://sixlabsai.lovable.app/auth/callback`
  - `https://id-preview--81f9a4c1-f0ff-4d4a-9275-2d7778caabb8.lovable.app/auth/callback`
  - `http://localhost:*` (dev)

### 4. Site URL
Set Site URL in prod Supabase to `https://www.sixlabs.ai`.

## What changed in code

- `src/integrations/prod/client.ts` — new client pointing at prod, with
  functions URL rewired to Lovable Cloud
- All 34 frontend files now import from `@/integrations/prod/client`
- All edge functions read `PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY`,
  `PROD_SUPABASE_SERVICE_ROLE_KEY` instead of the auto-injected
  `SUPABASE_*` env vars
- `supabase/config.toml` sets `verify_jwt = false` for every function
  (platform JWKS won't match prod-issued tokens; functions validate
  in-code via the prod admin client)

## Existing users

Lovable Cloud users do **not** carry over. Everyone signs up fresh
against prod. Super-admin email guard
(`aakash.ahuja101@gmail.com`) still works once that user signs up on
prod and the `handle_new_user` trigger sets `is_superadmin = true`.
