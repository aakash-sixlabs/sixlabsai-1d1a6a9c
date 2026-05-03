# Plan: Remove prod Supabase entirely, restore Lovable Cloud as the single backend

## Goal
Every read, write, auth call, storage upload, and edge-function admin client uses Lovable Cloud (`bhcusyaonpevmwaruvlx`). The prod project (`jkzbuypbhqbssmqjpdtj`) is no longer referenced anywhere. New users sign up fresh on Cloud — no data migration.

## 1. Frontend sweep (36 files)
Replace every `import { supabase, ... } from "@/integrations/prod/client"` with `import { supabase } from "@/integrations/supabase/client"`. Drop the `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `FUNCTIONS_BASE_URL` named imports — anywhere they're used, switch to `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`, and call edge functions via `supabase.functions.invoke(...)` (already routed to Cloud automatically).

Files: `src/lib/{accountContext,onboardingState,superAdmin}.ts`, all `src/pages/*` that touch auth/data (Insights, Settings, CreateAd, Output, PdpScrape, DataReview, MetaCallback, DebugSyncPage, GenerationDetail, OnboardingV1Live, OnboardingV2, Onboarding, Landing, LandingV1, LoginV2, Auth), all `src/components/wizard/*` using prod client, `src/components/insights/*`, `src/components/settings/*`, `src/components/create-ad/*`, `src/components/debug/BrandKitTestCard.tsx`, `src/context/GenerationNotificationsContext.tsx`.

Then delete `src/integrations/prod/client.ts`.

## 2. Edge functions sweep (16 functions)
For every function currently using `getProdSupabaseUrl()` + `PROD_SUPABASE_SERVICE_ROLE_KEY`, switch to platform-injected defaults:
```ts
const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
```
Same for any `auth.getUser(token)` calls — they validate Cloud-issued JWTs now.

Self-chain `fetch(`${SUPABASE_URL}/functions/v1/...`)` calls in `meta-sync-creatives` and `meta-sync-insights` already use `SUPABASE_URL`; update their `Authorization: Bearer ${PROD_SUPABASE_SERVICE_ROLE_KEY}` header to `SUPABASE_SERVICE_ROLE_KEY`.

Functions touched: `meta-oauth`, `meta-token-connect`, `meta-sync-accounts`, `meta-sync-creatives`, `meta-sync-insights`, `extract-brand-kit`, `build-brand-kit`, `generate-creatives`, `generation-callback`, `generation-watchdog`, `test-ads`, `test-adsets`, `test-campaigns`, `test-creatives`, `test-insights`, `test-brand-kit`.

Delete `supabase/functions/_shared/supabase-url.ts`.

## 3. Auth on Cloud — verify the existing flows still work
- Cloud already has the `handle_new_user` trigger that auto-creates `profiles + accounts + account_users` rows on signup, and `_shared/account.ts → getUserAccountId` auto-provisions for legacy users — both paths cover new signups.
- `LandingV1Step` placeholder-email signup (`meta_{id}@users.noreply` + `signInWithPassword`) keeps working unchanged — it just hits Cloud now.
- Meta OAuth popup → `meta-oauth` callback → `MetaCallback.tsx` redirect chain stays the same; the only change is the admin client inside `meta-oauth` writes to Cloud.

## 4. Cleanup
- Delete `src/integrations/prod/client.ts` and `supabase/functions/_shared/supabase-url.ts`.
- Delete `PROD_SETUP.md` (now stale).
- Leave `PROD_SUPABASE_*` secrets in the project (unused, harmless) — no secret tool changes.
- Update `mem://index.md` Core: replace the "Two Supabase projects" rule with "Single Lovable Cloud project (`bhcusyaonpevmwaruvlx`) hosts auth, DB, storage, and edge functions. Frontend imports `@/integrations/supabase/client`. Edge functions use `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`."
- Replace `mem://architecture/prod-supabase-switch` with a short note that the split was reverted.

## 5. Smoke test (after build)
- `/loginv1` signup → trigger creates profile/account → Meta connect popup completes → `meta-sync-accounts` writes ad_accounts to Cloud (verified via `read_query`).
- Pick account → brand kit extracted → ads/creatives/insights chain runs → rows land in Cloud `ads`, `ad_creatives`, `ad_performance_daily`.
- `/home` reads from Cloud and renders real data.
- `/debug-sync` test buttons (`test-campaigns`, `test-ads`, `test-adsets`, `test-creatives`, `test-insights`) all hit Cloud admin client and pass.

## Out of scope
- No data migration from prod.
- No UI changes.
- No schema migrations.
