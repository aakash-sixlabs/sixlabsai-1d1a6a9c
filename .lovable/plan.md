## Goal
Bypass the real `extract-brand-kit` (Firecrawl) call in the brand kit onboarding step. Show the step as if it's working — animated progress logs, then the preview screen — but populate it with hardcoded **Drink Cirkul** data instead of making any network call.

## Scope
Single file: `src/components/wizard/BrandKitStep.tsx`

No edge function or DB changes. The confirm/save step at the end (writing to `ad_account_profiles`) keeps working unchanged — it just persists the hardcoded Cirkul values.

## Changes

1. **Add a `cirkulStubKit()` helper** alongside the existing `devStubKit()`. It returns a fully-populated `ExtractedKit` with Cirkul's real branding:
   - `brand_name`: "Cirkul"
   - `tagline`: "Drink More Water. Enjoy Every Sip."
   - `website_url`: "https://drinkcirkul.com"
   - `logo_url`: favicon-service URL for drinkcirkul.com
   - colors: Cirkul blue palette (primary `#00B4E4`, secondary `#0A2540`, accent `#FF6B35`, plus background/text)
   - fonts: heading/body "Inter" (safe default; Cirkul's site uses a custom font we won't load)
   - tone_of_voice, product_categories ("hydration", "flavor cartridges"), target_audience, value_propositions
   - `raw.stub: "cirkul"` marker

2. **Short-circuit `handleBuild()`**: replace the entire try/catch that opens the SSE stream with the same fake-log replay used by dev mode, then set the Cirkul kit and move to `preview`. Keep the `setPhase("building")` + `setLogs([])` setup so the UI animation still plays.

   Effectively the new body of `handleBuild` becomes:
   ```text
   - validate trimmed url
   - setPhase("building"), clear logs/error
   - replay fake logs with ~450ms delays (Scanning… / Reading colors… / Analyzing voice… / Brand kit ready ✓)
   - kit = cirkulStubKit()
   - seedEdits(kit), setPhase("preview")
   ```
   The `isDevMode` branch and the abort controller can be removed since no fetch happens, but we'll leave `abortRef` intact to avoid touching the cleanup effect.

3. **Leave `handleConfirm()` unchanged** — it will save the Cirkul values to `ad_account_profiles` exactly as if they had come from the real extractor (or to sessionStorage in dev mode).

## Out of scope
- No changes to the `extract-brand-kit` edge function itself (it stays deployed; just unused by this step).
- No changes to the settings page "Re-extract from website" button — it uses the same component, so it will also produce Cirkul data while this stub is in place. That matches the user's intent ("bypass the build brand kit step fully").
- Easy to revert later: remove `cirkulStubKit` and restore the original `handleBuild` body.
