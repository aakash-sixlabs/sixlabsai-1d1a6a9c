

## Plan: Add Profile Creation + Ad Account Profile Flow

### New Flow

```text
1. Landing page (public) → "Connect with Meta" button
2. Meta OAuth → callback → session established
3. Profile Creation Dialog (overlay on grayed-out dashboard)
   - Pre-filled with Meta data: name, email, business accounts
   - User confirms/edits → saved to `profiles` table
4. Ad Account Selection
   - Show all ad accounts from Meta
   - User picks one to start with
5. Ad Account Profile Dialog (first-time only)
   - Pre-filled: industry (from FB page category), Facebook page ID, account ID
   - User validates/corrects the info → saved to `ad_account_profiles` table
6. Data Sync begins → pulls historical data
```

### Database Changes

**New table: `profiles`**
- `id` (uuid, PK, references auth.users)
- `email` (text)
- `full_name` (text)
- `meta_user_id` (text)
- `avatar_url` (text, nullable)
- `created_at` (timestamptz)
- RLS: users can read/update own row

**New table: `ad_account_profiles`**
- `id` (uuid, PK)
- `ad_account_id` (uuid) — references ad_accounts.id
- `user_id` (uuid)
- `industry` (text, nullable)
- `facebook_page_id` (text, nullable)
- `facebook_page_name` (text, nullable)
- `confirmed` (boolean, default false)
- `created_at` (timestamptz)
- RLS: users can manage own rows

**Trigger**: auto-create profile row on auth.users insert (via database function)

### File Changes

**1. `supabase/functions/meta-oauth/index.ts`**
- Add `email` to OAuth scope
- Fetch `/me?fields=id,name,email` 
- After creating the Supabase auth user, also fetch the user's Facebook pages via `/me/accounts?fields=id,name,category` and return them alongside the accounts data
- Return `pages` array in the response so the frontend can use it for ad account profiling

**2. `src/pages/MetaCallback.tsx`**
- Store the pages data in sessionStorage alongside accounts

**3. New: `src/components/wizard/ProfileDialog.tsx`**
- Modal dialog overlaid on a grayed-out dashboard background
- Pre-filled fields: full name, email (from Meta)
- Shows connected business accounts as read-only chips
- "Continue" button saves to `profiles` table and closes dialog

**4. `src/components/wizard/AccountSelectStep.tsx`**
- After user selects an account, check if `ad_account_profiles` exists for that account
- If not (first time), open the Ad Account Profile dialog before proceeding to sync

**5. New: `src/components/wizard/AdAccountProfileDialog.tsx`**
- Modal dialog showing pre-fetched data: industry (from FB page category), Facebook page ID/name, account ID
- User can edit/correct these fields
- "Confirm & Start Sync" saves to `ad_account_profiles` and proceeds to data sync

**6. `src/context/WizardContext.tsx`**
- Add `profileComplete` boolean to state
- The wizard flow checks this before proceeding past account selection

**7. `src/pages/Index.tsx`**
- After auth is confirmed, check if profile exists in DB
- If not, show `ProfileDialog` as an overlay on the dashboard (dashboard rendered but grayed out behind it)

### UI Behavior

- Profile dialog: uses `Dialog` component with `modal` mode, no close button (must complete). Background shows the dashboard layout but with `opacity-30 pointer-events-none`.
- Ad Account Profile dialog: same overlay pattern, shown only on first selection of an account.
- Both dialogs use motion animations for a polished feel.

### Meta API Data Used

- **Profile creation**: `name`, `email` from `/me` endpoint (already fetched during OAuth)
- **Ad account profiling**: Facebook pages from `/me/accounts?fields=id,name,category` — the `category` field provides the industry signal, and `id`/`name` give the page identity

