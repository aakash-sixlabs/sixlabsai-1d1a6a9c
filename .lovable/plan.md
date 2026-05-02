## Problem

In `src/components/insights/GenerationsTable.tsx`, the `StatusBadge` checks for `status === "complete"`, but the `generate-creatives` edge function writes `"completed"` to `generation_jobs.status`. As a result, completed jobs fall into the default branch and render an animated `Loader2` spinner next to the word "completed" — making finished jobs look like they're still running.

## Fix

Update `StatusBadge` in `src/components/insights/GenerationsTable.tsx` (lines ~42–59):

1. Recognize `"completed"` (the actual DB value) as the done state — also accept `"complete"` for backward compatibility with any older rows.
2. Show a static `CheckCircle2` icon (green/accent) for completed jobs instead of nothing/spinner.
3. Show a static `XCircle` icon for `error` / `failed`.
4. Only show the animated `Loader2` spinner for in-progress states (`pending`, `generating`, `syncing`, etc.).

Icons come from `lucide-react` (already used in this file).

## Out of scope

- `GenerationDetail.tsx` line 367 also checks `"complete"` — flagging here but not changing unless you want it; it's a separate display string and worth a quick follow-up to align on `"completed"` across the app.
- No DB or schema changes.
