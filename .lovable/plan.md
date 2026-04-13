

## Plan: Update completion modal in OnboardingV2

**What changes:**

In `src/pages/OnboardingV2.tsx`, update the Phase 3 "Complete" dialog (lines 399–445):

1. Remove the "Go to Dashboard" button and the `handleGoToDashboard` function
2. Update the copy to thank the user for providing access to their selected ad account (by name), and inform them the team will share a link to the review portal once creatives are ready
3. Reference the selected account name dynamically from the `accounts` + `selected` state

**Updated completion content will read:**

> **Thank you!**
>
> Thank you for providing us access to **{account name}**. The team will share the link for our review portal once the creatives are ready for your review.

No other files need changes.

