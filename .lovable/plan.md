## Goal

Add a single "Run All Steps" button to `/debug-sync` that runs `test-campaigns → test-adsets → test-ads → test-creatives → test-insights` in sequence, stopping immediately if any step fails. Each step's per-card UI (status dot, result JSON, copy button) keeps working exactly as today — the new button just orchestrates the existing five cards.

No edge functions are touched. No production sync code is touched.

## Changes

### `src/pages/DebugSyncPage.tsx` — only file modified

**1. Add a "Run All Steps" button + global run state**

New state:
```text
isRunningAll: boolean
overallStatus: 'idle' | 'running' | 'success' | 'error'
overallMessage: string
currentStep: 1 | 2 | 3 | 4 | 5 | null
```

Place a prominent button in the Connection Details section (just below the access token input) labeled **"Run All Steps Sequentially"**. Disabled when `isRunningAll` is true or any individual card is loading.

**2. Sequential runner**

Refactor the existing `runTest` so it returns the result instead of only writing to state. Add a new `runAll()` that:

```text
1. validate() — same checks as today
2. Reset all 5 card states to 'loading' visually pending
3. For each step in [campaigns, adsets, ads, creatives, insights]:
   a. setCurrentStep(n)
   b. await runTest(fnName, setter)
   c. If returned status === 'error', stop the loop, set overallStatus='error',
      and leave the remaining cards in 'idle' (with a small "Skipped" badge)
   d. Otherwise continue
4. If all 5 succeed → overallStatus='success', overallMessage with totals summary
```

Between steps, wait ~500ms so the UI can update and Meta API doesn't get a thundering-herd burst.

**3. Progress indicator**

Above the cards, when `isRunningAll === true`, render a thin progress strip:
```text
Step 2 of 5 — Running test-adsets...
[████████░░░░░░░░░░░░] 40%
```

**4. "Skipped" state on cards**

Add a 5th visual status `skipped` (gray dashed border, gray dot, label "Skipped — previous step failed") so the user can see exactly where the chain broke.

**5. Top-level summary banner**

After `runAll` finishes, show a banner above the cards:
- Green: "✅ All 5 steps completed successfully"
- Red: "❌ Failed at Step N (test-creatives): {error message}"

Includes a "Reset" button that clears all card states.

## What stays the same

- Individual "Run Test" buttons on each card still work exactly as today
- Edge function signatures unchanged (`{ adAccountId, accessToken }`)
- Per-card result JSON, copy button, status dots — unchanged
- No new dependencies, no new files, no DB changes

## Technical details

| Concern | Decision |
|---|---|
| Order | campaigns → adsets → ads → creatives → insights (matches existing UI order and dependency graph) |
| Stop on error | Yes — `success: false` from the function, OR a thrown error, both halt the chain |
| Inter-step delay | 500ms (cosmetic + light rate-limit guard) |
| Insights date range | Whatever `test-insights` already uses (30 days, hardcoded in the function) — no change |
| `dateRangeDays` for campaigns/adsets | Use the function defaults (90 days). Not exposed in this UI change. |
| Concurrency | Strictly sequential — never parallel, since each step depends on the previous step's DB rows |
| Disabled buttons | While `isRunningAll`, all individual "Run Test" buttons are disabled too |

## Validation

After the change:
1. Open `/debug-sync`, paste your ad account ID + Meta access token
2. Click "Run All Steps Sequentially"
3. Watch the 5 cards turn yellow → green in order
4. Inspect the final summary banner; expand individual cards for per-step JSON
5. Force a failure (e.g., bad token) and confirm the chain stops with a red banner naming the failing step
