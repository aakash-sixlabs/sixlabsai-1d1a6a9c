

## Fix: Remove Email Requirement from Meta OAuth User Creation

### Problem
The `email` scope is rejected by Meta (app likely doesn't have Facebook Login product enabled). The current code hard-fails when email is missing and uses email as the primary identifier for user creation and lookup.

### Solution
Remove `email` from OAuth scopes. Use the Meta User ID as the primary identifier for creating/finding users. If Meta returns an email, store it in the profile — but never require it.

### Changes

**`supabase/functions/meta-oauth/index.ts`**

1. **Line 29** — Remove `email` from scope: change to `ads_read,business_management`

2. **Lines 82-87** — Remove the hard error when `meData.email` is missing

3. **Lines 89-113** — Rework user creation/lookup to use Meta User ID instead of email:
   - Use a deterministic identifier like `meta_{meData.id}` to find existing users via `user_metadata`
   - Create user without requiring email: pass `email: undefined` or use a phone-based approach
   - Since Supabase `createUser` requires email or phone, we'll use a stable placeholder email `meta_{meData.id}@users.noreply` purely as a Supabase auth identifier (not shown to user)
   - If Meta provides a real email, we store it only in the `profiles` table

4. **Lines 100-110** — Change user lookup from email-based to metadata-based: search by `user_metadata.meta_user_id` instead of email

5. **Lines 115-119** — Generate magic link using the placeholder email (internal auth only)

6. **Lines 156-164** — Profile upsert: use `meData.email` if available, otherwise `null`

7. **Response** — Return `userEmail: meData.email || null`

### Key Behavior
- Meta User ID is the single source of identity
- Real email (if returned by Meta) goes into `profiles.email` for display/contact
- Supabase auth uses a stable placeholder email derived from Meta ID — never shown to the user
- No user-facing error if email permission is denied

