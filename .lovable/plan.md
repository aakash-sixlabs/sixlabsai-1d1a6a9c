

## Problem

The MetaCallback page is stuck spinning because of a **redirect URI mismatch**:
1. OAuth initiated from `81f9a4c1-...lovableproject.com` → sends that as `redirect_uri` to Facebook
2. Facebook redirects back to `preview--intelligent-pdf-creator.lovable.app/auth/callback` (configured in Meta App dashboard)
3. MetaCallback calls `exchange-token` with `redirect_uri = preview--intelligent-pdf-creator.lovable.app/auth/callback`
4. Facebook rejects because the redirect_uri doesn't match step 1

Additionally, the edge function has no `console.log` statements, making debugging invisible.

## Fix

### 1. Add logging to `meta-oauth` edge function
Add `console.log` statements at key points (token exchange request, response, errors) so failures are visible in logs.

### 2. Ensure consistent redirect URI
The redirect URI must be the **same** in both the `get-auth-url` step and the `exchange-token` step. Two options:

**Option A (recommended)**: Store the redirect URI used during `get-auth-url` and pass it back during `exchange-token`. The MetaCallback already does `const redirectUri = window.location.origin + '/auth/callback'` — the issue is that the origin differs between where OAuth starts and where the callback lands.

**Option B**: Configure Meta App to redirect to the same domain the OAuth is initiated from. In your Meta App dashboard, add BOTH domains as valid redirect URIs:
- `https://81f9a4c1-f0ff-4d4a-9275-2d7778caabb8.lovableproject.com/auth/callback`
- `https://preview--intelligent-pdf-creator.lovable.app/auth/callback`

Then update the `get-auth-url` action to use a **hardcoded canonical redirect URI** (or accept it from the client and store it for exchange).

### 3. Update MetaConnectStep and LandingStep
Use a consistent, canonical redirect URI rather than `window.location.origin` so it always matches regardless of which preview domain the user is on.

### Files to change
- `supabase/functions/meta-oauth/index.ts` — add logging + optionally enforce a canonical redirect URI
- `src/components/wizard/MetaConnectStep.tsx` — use canonical redirect URI
- `src/components/wizard/LandingStep.tsx` — use canonical redirect URI  
- `src/pages/MetaCallback.tsx` — use same canonical redirect URI for exchange

