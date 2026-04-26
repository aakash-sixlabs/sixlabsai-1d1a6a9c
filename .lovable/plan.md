
## Goal

Capture the brand's website URL **once per ad account** right after login, automatically derive a **brand kit** (logo, colors, fonts, tone, tagline, product categories), persist it, and pass it into every `generate-creatives` call so outputs stay on-brand.

## Why not capture it on `/login`

`/login` is a Meta OAuth handoff — there's no form there, and we don't yet know which ad account the user will work with. The natural collection point is **`OnboardingV2`**, immediately after the user picks their default ad account, and again as an editable field in the existing **`AdAccountProfileDialog`** so returning users / additional accounts can fill it in.

## Where the brand kit lives

Extend the existing `ad_account_profiles` table (already keyed by `user_id` + `ad_account_id`, already RLS'd) rather than introducing a new table. New columns:

- `website_url text`
- `brand_name text`
- `logo_url text`
- `primary_color text`, `secondary_color text`, `accent_color text` (hex)
- `font_family text`
- `tone_of_voice text` (e.g. "playful", "premium", "technical")
- `tagline text`
- `product_categories text[]`
- `brand_kit jsonb` — full raw payload from the scraper (extra colors, all fonts, social links, og:image variants, screenshots, etc.) for future use
- `brand_kit_status text` — `pending | scraping | ready | failed`
- `brand_kit_updated_at timestamptz`

`confirmed` (already on the table) gates whether the kit has been reviewed by the user.

## Flow

```text
Meta OAuth (/login)
        ↓
OnboardingV2  ── pick default ad account ──┐
                                            ↓
                          NEW: "Tell us about your brand" step
                          - prefill website from ad_account / Facebook page if available
                          - input: website URL (required), brand name (prefilled from account)
                          - on submit → invoke build-brand-kit edge function
                                            ↓
                          Show live preview as kit returns
                          (logo, palette swatches, fonts, tone, tagline)
                          User can edit any field, then "Confirm brand kit"
                                            ↓
                          /home
```

For returning users with an account that has no kit yet, surface a soft banner on `/home` and inside `AdAccountProfileDialog` to complete it.

## New edge function: `build-brand-kit`

Stubbed first, real later — same pattern as `generate-creatives`.

Input: `{ adAccountId, websiteUrl }`
Steps:
1. Auth via JWT → `userId`.
2. Upsert `ad_account_profiles` row with `brand_kit_status = 'scraping'` and `website_url`.
3. **Stub:** return mock palette/fonts/logo (use favicon + a deterministic palette from the domain).
   **Real later:** fetch the page server-side, parse `<meta>` / og tags / theme-color, extract dominant colors from hero image + logo, pull Google Fonts from CSS, run Lovable AI (Gemini 2.5 Flash) on the page text to infer tone/tagline/categories.
4. Update the row with derived fields and `brand_kit_status = 'ready'`.
5. Return the kit to the client.

Return shape mirrors the columns above so the UI can render immediately.

## Wiring the kit into generations

Extend `generate-creatives`:
- Accept `adAccountId` (the wizard already tracks `selectedAccount`; thread it through `CreateAdState` → request body — currently dropped).
- On entry, load the matching `ad_account_profiles` row.
- Add a `brand_kit` block to `service_request_payload` (so it's auditable in `generation_jobs`) and forward it to the generation service stub.
- The stub starts using `brand_name`, `primary_color`, `tone_of_voice` in mock copy so we can visually verify wiring before real generation goes live.

## UI changes

- **`OnboardingV2`** — add a new `"brand-kit"` phase between `select-account` and `pulling`. New component `BrandKitStep.tsx` handles URL entry, loading state, editable preview, confirm.
- **`AdAccountProfileDialog`** — add Brand Kit section (website URL, editable kit fields, "Rebuild from website" button).
- **`/home`** — non-blocking banner: "Add your brand kit to improve generations" linking to the dialog, shown when the active ad account's `brand_kit_status != 'ready'` or `confirmed = false`.
- **`CreateAdFlow`** — pass `selectedAccount` (the ad account UUID) into the `generate-creatives` invoke body.

## Migration

Single migration adding the new columns (all nullable, safe defaults) to `ad_account_profiles`. No backfill needed — `brand_kit_status` defaults to `pending` for existing rows, banner prompts users to fill it in.

## Out of scope (call out for later)

- Real scraping/AI extraction (stubbed for now).
- Storing logos in the `ad-creatives` bucket vs. hot-linking from the source site — stub uses the source URL; can mirror to storage when we productionize.
- Multiple brand kits per ad account / kit versioning.
- Using the kit to constrain real image generation (depends on the generation service contract).

## Technical notes

- Reuse the existing `auth.getUser(token)` pattern from `generate-creatives` for the new function.
- RLS on `ad_account_profiles` already enforces per-user access; no new policies needed.
- Keep `brand_kit jsonb` as the source of truth for anything we don't promote to a typed column, mirroring how `generation_jobs` keeps `service_request_payload`.
- Add `aspect_account_id` plumbing in `CreateAdState` (currently `selectedAccount` exists in `WizardContext` but isn't forwarded into the create-ad request body).
