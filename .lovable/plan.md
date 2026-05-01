## Goal

Add the optional ICP (Ideal Customer Profile) step to the **v1** onboarding flow at `/onboarding`, placed **after** the Brand Kit step and **before** the Data Sync step. Works in both real and dev mode.

## Current v1 phase order (src/pages/Onboarding.tsx)

```text
loading → profile → tool-explanation → account-select → brand-kit → data-sync → /home
```

## New v1 phase order

```text
loading → profile → tool-explanation → account-select → brand-kit → add-icp → data-sync → /home
```

The `IcpOnboardingStep` component already exists (`src/components/wizard/IcpOnboardingStep.tsx`) and is currently used by `OnboardingV2.tsx`. It already supports:
- An `isDevMode` prop that skips the Supabase insert
- An optional/skippable UX (the "Skip for now" button)
- Persisting to the `icps` table when not in dev mode

We just need to mount it as an extra phase in the v1 page.

## Changes

### `src/pages/Onboarding.tsx`

1. Extend the `OnboardingPhase` union to include `"add-icp"`:
   ```ts
   type OnboardingPhase =
     | "loading"
     | "profile"
     | "tool-explanation"
     | "account-select"
     | "brand-kit"
     | "add-icp"
     | "data-sync";
   ```

2. Import `IcpOnboardingStep`.

3. Update `handleBrandKitComplete` to advance to `"add-icp"` instead of jumping straight to `"data-sync"`:
   ```ts
   const handleBrandKitComplete = () => setPhase("add-icp");
   const handleIcpComplete = () => setPhase("data-sync");
   ```

4. Render the step (inside the JSX, after the `BrandKitStep` block):
   ```tsx
   {phase === "add-icp" && state.selectedAccount && (
     <IcpOnboardingStep
       open
       adAccountId={state.selectedAccount}
       isDevMode={isDevMode}
       onComplete={handleIcpComplete}
     />
   )}
   ```

That's the entire change — one file, scoped strictly to the v1 page. No DB, routing, or other component changes are needed because:
- The `icps` table + RLS already exist
- `IcpOnboardingStep` already handles dev mode, skipping, and persistence
- v2 is untouched

## Notes

- The step remains **optional** — the existing "Skip for now" button advances without saving, matching the v2 behavior.
- In dev mode, no rows are written to `icps` (component already short-circuits via `isDevMode`).
- No memory updates needed; the routing/onboarding memory entries already describe the unified post-Meta phase model.
