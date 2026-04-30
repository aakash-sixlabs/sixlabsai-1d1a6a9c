# Persist brand kit even in dev/skip mode

## Problem

`BrandKitStep.handleConfirm` short-circuits when `isDevMode` is true (lines 404–408):

```ts
if (isDevMode) {
  toast.success("Brand kit saved (dev mode).");
  onComplete();
  return;   // ← upsert never runs
}
```

Result: users who onboard via the dev/Konami bypass never get a row in `ad_account_profiles`, which is why the Settings → Brand Kit page is empty for the Cirkul account.

## Fix

In `src/components/wizard/BrandKitStep.tsx`:

1. Remove the `if (isDevMode) { ...; return; }` block so the upsert always runs with whatever `kit` + `edits` are currently on screen (Firecrawl-extracted or stub).
2. Keep the optional **brand-guidelines PDF upload** gated on `!isDevMode` — storage uploads in dev mode aren't necessary and we don't want to clutter the bucket. Everything else (the `ad_account_profiles` upsert) runs unconditionally.
3. Leave the existing success toast and `onComplete()` flow as-is (they already fire after the upsert succeeds).

No changes to schema, edge functions, or other files.

## Acceptance

- Confirming the brand kit in dev mode writes a row to `ad_account_profiles` with `confirmed=true`, `brand_kit_status='ready'`, and all extracted fields populated.
- Settings → Brand Kit displays the saved kit on next visit.
- Non-dev flow is unchanged (still uploads the optional PDF if provided).
