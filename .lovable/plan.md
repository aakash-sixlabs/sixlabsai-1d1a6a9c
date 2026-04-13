

## Plan: Redirect `/` to `/login` with Konami code easter egg

### What happens
- Anyone visiting `/` gets immediately redirected to `/login`
- On `/login`, entering the Konami code (↑↑↓↓←→←→) reveals a hidden "Explore Six Labs →" link below the Privacy Policy/Terms line
- Clicking that link sets a sessionStorage flag and navigates to `/`
- The `/` (SixLabsLanding) page checks for that flag on mount — if missing, redirects to `/login`; if present, renders normally

### Files to change

**1. `src/pages/SixLabsLanding.tsx`**
- On mount, check `sessionStorage.getItem("easter_egg_access")`
- If not set, redirect to `/login`
- If set, render the marketing landing page as normal

**2. `src/components/wizard/LandingStep.tsx`**
- Add a `useEffect` that listens for the Konami code sequence via `keydown` events
- When the code is entered, show a subtle animated link below the Privacy/Terms line: "Explore Six Labs →"
- Clicking the link sets `sessionStorage.setItem("easter_egg_access", "true")` and navigates to `/`

