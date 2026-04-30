# Fix: "No brand kit found" in Settings → Brand Kit

## Root cause

Your `ad_account_profiles` table is empty for the Cirkul Primary Acct (`account_id: 4462492886662`). The Firecrawl-powered brand kit was never persisted — most likely the brand kit step in onboarding was skipped (or run in an earlier flow that didn't write here). `BrandKitSettings.tsx` queries this table by `ad_account_id` and shows the empty state when nothing comes back.

Nothing is corrupted; we just need an in-page way to create the row.

## Changes

### 1. `src/components/settings/BrandKitSettings.tsx`

Replace the dead-end "No brand kit found" card with an empty-state that offers two actions:

- **Extract from website** (primary) — opens the existing `BrandKitStep` dialog with a website input. On completion, that flow already inserts/updates `ad_account_profiles` via `build-brand-kit` (Firecrawl + Lovable AI). After it returns, re-`load()` the profile.
- **Set up manually** (secondary) — inserts a minimal `ad_account_profiles` row (just `ad_account_id` + `user_id`, `brand_kit_status='pending'`) so the editable form renders. User can then fill fields and Save.

After either path completes, the existing edit form takes over.

### 2. (Optional polish) Pre-seed website from `brands.meta_account_id` lookup

When the empty state opens, look up the matching `brands` row (`meta_account_id = ad_accounts.account_id`) so we can prefill `website_url` if available. The current `brands` row for Cirkul has no website, so this is best-effort.

## Files touched

- `src/components/settings/BrandKitSettings.tsx` — replace empty-state branch with extract/manual CTAs and wire `BrandKitStep`.

No DB migration, no new edge function — `build-brand-kit` already handles the extraction and persistence.

## Acceptance

- Going to `/settings` → Brand Kit on an account with no `ad_account_profiles` row shows two CTAs (Extract / Manual) instead of a dead card.
- Clicking "Extract from website" → enter `cirkul.com` → completes → form populates with logo, colors, font, tone.
- Clicking "Set up manually" → form appears empty and Save creates the row.
- Reloading shows the saved kit.
