# Demo Mode for v1 Onboarding Walkthrough

Goal: record a clean demo of the full `/loginv1` → `/onboarding` flow without waiting on the real Meta sync (which is slow), while keeping the real Meta auth + the real data already in the database intact.

## Approach

Add a lightweight **demo flag** that travels through the onboarding URL. When set, it makes one and only one change: the `DataSyncStep` plays a scripted animated progress sequence instead of invoking `meta-sync-accounts`. Everything else — Meta OAuth, account selection, brand kit, ICP, competitors, and the eventual landing on `/home` — runs against the real database, so the dashboard shows the real data we already synced.

We do NOT touch:
- `meta-oauth` / `meta-token-connect` edge functions
- `meta-sync-accounts` edge function
- The non-demo path of `DataSyncStep`
- `OnboardingV2` (only v1 is in scope)

## Changes

### 1. `src/components/wizard/LandingV1Step.tsx`
- Read `?demo=true` from current URL on mount; if present, append `&demo=true` to the post-auth navigation so it persists into `/onboarding`.
- Add a small "Demo Mode" toggle button next to the existing Dev Mode button (only visible when the page is loaded with `?demo=true`, OR show it always — your call). Recommend: always show a subtle "🎬 Demo Mode" link that re-loads the page with `?demo=true` so it's discoverable when recording.
- In `handleAuthMessage` (Meta OAuth popup callback) and `handleTokenSubmit`, preserve the demo flag in the redirect: `navigate(\`/onboarding?meta=connected${demo ? "&demo=true" : ""}\`)`.

### 2. `src/pages/Onboarding.tsx`
- Read `const isDemoMode = searchParams.get("demo") === "true"` alongside the existing `isDevMode`.
- Pass `isDemoMode` down to `<DataSyncStep />` as a new prop (separate from `isDevMode`, because `isDevMode` also bypasses auth — we don't want that here since real auth happened).

### 3. `src/components/wizard/DataSyncStep.tsx`
- Add a new prop `isDemoMode?: boolean`.
- In the `useEffect` that starts the sync, branch:
  - If `isDemoMode` is true → run the same scripted progression that `isDevMode` already runs (step every ~1.2s through the 6 SYNC_STEPS, then mark complete) but **do not** call `supabase.functions.invoke("meta-sync-accounts", …)` and do **not** subscribe to realtime updates.
  - Else → existing behavior unchanged.
- This reuses the existing animation infrastructure; no UI changes needed.

### 4. (Optional polish) `AccountSelectStep`
- No code change required. Real `ad_accounts` rows are already in the DB from prior syncs, so the account list will populate normally.
- If we want the demo to *always* select a known good account, we can add a tiny note — but I'd skip this and just click it manually during recording.

## Demo flow

1. Open `/loginv1?demo=true`.
2. Click "Login with Meta" → real OAuth popup → real session.
3. Land on `/onboarding?meta=connected&demo=true`.
4. Profile → Tool Explanation → Account Select → Brand Kit → ICP → Competitors all run normally against real data.
5. Data Sync step plays the scripted 6-step animation in ~8 seconds, then routes to `/home`.
6. `/home` shows the real creatives/insights already in the database.

## Technical notes

- Demo mode is purely a frontend display tweak; no DB writes are skipped that matter, because in demo mode we deliberately don't *want* a fresh sync — we want to showcase pre-existing data.
- The flag is URL-based (no env var, no build flag), so we can demo from the production preview without redeploying.
- Easy to remove later: drop the `isDemoMode` branch in `DataSyncStep` and the prop plumbing.
