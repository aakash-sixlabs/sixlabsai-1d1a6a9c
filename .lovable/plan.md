

## Plan: Fix Data Sync Behavior for New vs Returning Users

### Problem
Currently, both new and returning users see the background sync notification bar on `/home`. New users already complete a full data sync during onboarding (DataSyncStep overlay), but when they land on `/home`, it triggers another sync via the SyncNotificationBar — redundant and confusing.

### Solution

**1. Pass sync-complete signal via WizardContext**
The onboarding DataSyncStep already sets `syncComplete: true` in WizardContext. The InsightsStep just needs to check this before triggering another sync.

**2. Update InsightsStep sync logic** (`src/components/wizard/InsightsStep.tsx`)
- In the `useEffect` (lines ~288-319), check `state.syncComplete` before calling `triggerBackgroundSync()`
- If `syncComplete` is true (new user just finished onboarding sync), skip the background sync entirely
- If `syncComplete` is false (returning user), trigger background sync as usual with the notification bar

### Technical Details
- **File**: `src/components/wizard/InsightsStep.tsx` — modify the initial load `useEffect` to gate `triggerBackgroundSync()` behind `!state.syncComplete`
- No new files, no database changes, no new dependencies

