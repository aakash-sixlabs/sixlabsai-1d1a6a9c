## Goal

Wire the real brand kit confirmation step into **both** onboarding flows (`/onboarding-v2` and `/onboarding`), powered by the production-grade Firecrawl + Lovable AI extractor. Keep the existing `ad_account_profiles` schema. Hide three fields from the user (still extracted and persisted silently): **product categories, target audience, tone of voice**.

## Where it plugs in

- **`/onboarding-v2`** (default flow, all users): already has `select-account → brand-kit → pulling → complete`. Just upgrade the `BrandKitStep` itself.
- **`/onboarding`** (super-admin only v1): currently `profile → account-select → tool-explanation → data-sync`. Insert `brand-kit` between `account-select` and `tool-explanation`.

## Changes

### 1. New edge function: `extract-brand-kit`

Production version of `test-brand-kit`, kept separate so the debug sandbox is untouched.

- `supabase/functions/extract-brand-kit/index.ts`
- SSE streaming: `log` events for live progress, `result` event with the full kit, `error` event on failure.
- Pipeline: Firecrawl `/v2/scrape` (markdown + branding + screenshot + links) → Lovable AI Gateway (`google/gemini-2.5-flash`, JSON mode) for tone, tagline, categories, audience, value props.
- Requires `Authorization: Bearer <jwt>`; validates with `supabase.auth.getUser`.
- Returns the same payload shape as `test-brand-kit`'s `result` event.

### 2. Rewrite `src/components/wizard/BrandKitStep.tsx`

Three internal phases inside one dialog:

**A. Input** — single field (brand website URL), "Build my brand kit" button.

**B. Building (live)** — opens SSE stream from `${VITE_SUPABASE_URL}/functions/v1/extract-brand-kit` with the user's JWT. Shows a small live log feed (latest 5–6 lines, fading) plus spinner. Backend logs are mapped to friendly headlines ("Scanning your site…", "Reading brand colors…", "Analyzing voice…"). Raw logs kept for console only.

**C. Confirm** — visible & editable:
- Brand name
- Logo (preview + URL)
- Color palette: Primary / Secondary / Accent (swatch + hex)
- Heading font + Body font
- Tagline

**Hidden from UI** (extracted + saved silently):
- `tone_of_voice`
- `product_categories`
- `target_audience`, `value_propositions`, `favicon_url`, `screenshot_url`, extra colors, `fonts.all`, full raw payload

Buttons: "Try a different URL" and "Confirm brand kit". Confirm disabled until extraction completes. Inline error with retry on extractor failure. Error boundary + defensive normalization (same pattern that fixed the debug-page crash).

### 3. Save shape (no schema change)

On confirm, upsert `ad_account_profiles` for `(ad_account_id, user_id)`:

| Column | Source |
|---|---|
| `brand_name`, `logo_url`, `primary_color`, `secondary_color`, `accent_color`, `font_family`, `tagline` | Edited values |
| `tone_of_voice`, `product_categories` | Extracted, hidden |
| `website_url` | Normalized URL |
| `brand_kit` (jsonb) | Full extractor result (target_audience, value_propositions, favicon, screenshot, heading font, all fonts, all colors, raw) |
| `brand_kit_status` | `'ready'` |
| `brand_kit_updated_at` | `now()` |
| `confirmed` | `true` |

### 4. Insert step into v1 onboarding (`src/pages/Onboarding.tsx`)

- Add `"brand-kit"` to `OnboardingPhase` type.
- After `handleAccountSelected`, set phase to `"brand-kit"` instead of `"tool-explanation"`.
- Render `<BrandKitStep open={phase === "brand-kit"} adAccountId={state.selectedAccount} defaultBrandName={state.selectedAccountName} onComplete={() => setPhase("tool-explanation")} />`.
- Dev mode: `BrandKitStep` accepts an `isDevMode` prop and short-circuits to a stubbed kit so super-admin testing isn't blocked.

### 5. v2 onboarding (`src/pages/OnboardingV2.tsx`)

No structural changes — already mounts `BrandKitStep`. The rewritten component just behaves better. Pass `isDevMode={isDevMode}`.

## Files

**Created**
- `supabase/functions/extract-brand-kit/index.ts`

**Edited**
- `src/components/wizard/BrandKitStep.tsx` — full rewrite (streaming extractor, hide 3 fields, error boundary, dev-mode stub)
- `src/pages/Onboarding.tsx` — insert brand-kit phase between account-select and tool-explanation
- `src/pages/OnboardingV2.tsx` — pass `isDevMode` prop to `BrandKitStep`

**Untouched**
- `ad_account_profiles` schema
- `test-brand-kit` function and `/debug-sync` page
- `build-brand-kit` (legacy stub left alone for now)

## What the user sees (both flows)

1. Pick ad account → Continue.
2. "Tell us about your brand" dialog → enter website → "Build my brand kit".
3. ~5–15s of friendly live progress.
4. Edit brand name, logo, 3 colors, 2 fonts, tagline → Confirm.
5. Onboarding continues (data pull on v2, tool explanation → data sync on v1).

Tone, product categories, and target audience are extracted, stored, and available for downstream creative generation — never shown in the onboarding UI.
