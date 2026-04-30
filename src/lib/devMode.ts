/**
 * Dev-mode bypass helper.
 *
 * The "Dev Mode — Test New User Flow" buttons in LandingStep / LandingV1Step
 * skip Supabase auth entirely and stub a Meta connection in sessionStorage.
 * That works inside the onboarding wizard, but downstream pages
 * (/home, /settings, /create-ad, ...) gate on `supabase.auth.getUser()` and
 * would otherwise bounce a dev tester back to the login screen.
 *
 * On the dev bypass we set `dev_mode_session` in sessionStorage, and these
 * pages consult `isDevSession()` to skip the auth gate.
 *
 * Pure presentation/dev tooling — does NOT grant any real DB access (RLS
 * still applies to any actual Supabase calls).
 */
const KEY = "dev_mode_session";

export const enableDevSession = () => {
  try { sessionStorage.setItem(KEY, "true"); } catch {}
};

export const isDevSession = (): boolean => {
  try { return sessionStorage.getItem(KEY) === "true"; } catch { return false; }
};

export const clearDevSession = () => {
  try { sessionStorage.removeItem(KEY); } catch {}
};
