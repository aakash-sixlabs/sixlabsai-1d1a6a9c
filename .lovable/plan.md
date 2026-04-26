## Goal

Build a real (non-stub) brand kit extractor that takes a single input — a website URL — scrapes the site, runs AI inference, and returns a complete brand kit. Add a dedicated test panel on `/debug-sync` to try it and visually render the result.

This is a **standalone test tool**: it does NOT touch `ad_account_profiles`, does NOT require an ad account, and does NOT modify the existing `build-brand-kit` function. It's a sandbox to validate the real extraction pipeline before wiring it into onboarding.

## Prerequisite: connect Firecrawl

The extraction relies on Firecrawl's `branding` + `markdown` formats. We'll prompt the user to connect the Firecrawl connector. `LOVABLE_API_KEY` is already configured for the AI inference step.

## New edge function: `test-brand-kit`

**Path:** `supabase/functions/test-brand-kit/index.ts`
**Auth:** JWT validated (matches existing pattern), but writes nothing to the database — pure compute + return.

**Input:**
```json
{ "websiteUrl": "https://nike.com" }
```

**Pipeline:**

```text
websiteUrl
   │
   ├─► 1. Normalize URL (add https://, strip path if needed)
   │
   ├─► 2. Firecrawl scrape (single call, multi-format)
   │      formats: ['markdown', 'branding', 'screenshot', 'links']
   │      onlyMainContent: true
   │      Returns: logo, real color palette, fonts, typography,
   │               page copy (markdown), hero screenshot, internal links
   │
   ├─► 3. Lovable AI inference (Gemini 2.5 Flash)
   │      Input: page markdown (truncated to ~8k chars) + metadata
   │      Output JSON schema:
   │        - brand_name
   │        - tagline
   │        - tone_of_voice (3-5 adjectives)
   │        - product_categories (array)
   │        - target_audience (one line)
   │        - value_propositions (3 bullet points)
   │
   └─► 4. Merge + return unified brand kit
```

**Response shape:**
```json
{
  "brand_name": "Nike",
  "website_url": "https://nike.com",
  "logo_url": "https://...",
  "favicon_url": "https://...",
  "screenshot_url": "data:image/png;base64,..." or hosted URL,
  "colors": {
    "primary": "#111111",
    "secondary": "#FFFFFF",
    "accent": "#FA5400",
    "background": "#FFFFFF",
    "text_primary": "#111111",
    "text_secondary": "#757575"
  },
  "fonts": {
    "primary": "Helvetica Neue",
    "heading": "Futura",
    "all": ["Helvetica Neue", "Futura", "Arial"]
  },
  "tone_of_voice": "bold, motivational, athletic",
  "tagline": "Just Do It",
  "product_categories": ["footwear", "apparel", "equipment"],
  "target_audience": "Athletes and active lifestyle consumers worldwide",
  "value_propositions": ["Performance innovation", "Iconic design", "Trusted by pros"],
  "raw": {
    "firecrawl_branding": { ... },
    "firecrawl_metadata": { ... },
    "ai_inference_model": "google/gemini-2.5-flash",
    "extracted_at": "2026-04-26T..."
  }
}
```

If any step fails partially (e.g. AI inference fails but Firecrawl succeeded), return the partial kit with a `warnings` array — the test panel should still show what we got.

## UI: new card on `/debug-sync`

Add a **"Brand Kit Extraction"** section above the existing Meta sync cards (or in a new tab — TBD when implementing; one section above is simpler). It contains:

**Inputs:**
- Single text input: "Brand website URL" (e.g. `nike.com`)
- "Extract Brand Kit" button

**Output panel** (renders below the input once results arrive):
1. **Header strip:** logo, brand name, tagline, website link
2. **Color palette:** swatches for each color with hex labels (clickable to copy)
3. **Typography:** primary/heading font names rendered in their actual font (with Google Fonts fallback)
4. **Voice & Audience:** tone_of_voice chips, target audience paragraph
5. **Product categories:** chips
6. **Value propositions:** bulleted list
7. **Screenshot preview:** hero image of the scraped site (collapsed by default)
8. **Raw JSON:** collapsible `<details>` with copy-to-clipboard (matches the existing TestCard pattern)

Status states reuse the existing pattern: idle / loading (with steps: "Scraping site..." → "Inferring brand voice..." → "Done") / success / error.

## Files to create / edit

**Create:**
- `supabase/functions/test-brand-kit/index.ts` — new edge function
- `src/components/debug/BrandKitTestCard.tsx` — encapsulates the input + rich output renderer

**Edit:**
- `src/pages/DebugSyncPage.tsx` — mount `BrandKitTestCard` at the top of the page

**No DB migration.** No changes to `build-brand-kit`, `ad_account_profiles`, or the onboarding flow.

## Technical notes

- **Firecrawl call:** server-side only; reads `FIRECRAWL_API_KEY` from env. Use REST `POST https://api.firecrawl.dev/v2/scrape` with `Authorization: Bearer <key>`.
- **AI call:** `https://ai.gateway.lovable.dev/v1/chat/completions` with `LOVABLE_API_KEY`, model `google/gemini-2.5-flash`, `response_format: { type: "json_object" }`, system prompt instructing strict JSON shape.
- **Color fallback:** if Firecrawl `branding` format returns empty (some sites have no theme metadata), fall back to a screenshot-based extraction prompt to Gemini vision (`gemini-2.5-flash` accepts images) asking for a 5-color palette. Keep this as a clearly-labeled fallback in the response.
- **Logo handling:** hot-link from the source URL in the test panel (no bucket mirroring — this is a test tool).
- **CORS:** standard headers, OPTIONS handler, errors include CORS headers.
- **Validation:** zod schema on `websiteUrl` (string, must parse as URL after normalization).
- **Timeout safety:** Firecrawl scrape with `timeout: 30000`; AI call with reasonable max_tokens (~800). Total well under Supabase's 60s limit.

## Out of scope

- Persisting results to `ad_account_profiles` (this is a sandbox).
- Replacing the stub in `build-brand-kit` — that's a follow-up once we're happy with the extraction quality here.
- Logo/screenshot mirroring to storage.
- Auth on the debug page itself (it stays super-admin gated as today).
