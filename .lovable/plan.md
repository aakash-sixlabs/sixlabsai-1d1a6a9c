

## Plan: Route all users through Onboarding V2, gate /home to super admin

**Super admin email:** `aakash.ahuja101@gmail.com`

### Changes

**1. New file: `src/lib/superAdmin.ts`**
- Export `SUPER_ADMIN_EMAIL = "aakash.ahuja101@gmail.com"`
- Export helper `isSuperAdmin(email: string): boolean`

**2. `src/components/wizard/LandingStep.tsx`**
- Remove the `isNewUser` conditional — always navigate to `/onboarding-v2?meta=connected` after auth

**3. `src/pages/MetaCallback.tsx`**
- Remove the `isNewUser` conditional in fallback navigation — always navigate to `/onboarding-v2?meta=connected`

**4. `src/pages/Insights.tsx`**
- Add auth guard: fetch user profile, check `profiles.email` against super admin
- Non-admin users get redirected to `/onboarding-v2`

**5. `src/pages/Onboarding.tsx`**
- Same guard as Insights — redirect non-admin users to `/onboarding-v2`

