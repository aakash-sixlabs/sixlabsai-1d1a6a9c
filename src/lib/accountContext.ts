import { supabase } from "@/integrations/prod/client";

/**
 * Returns the current user's primary Lovable account_id (the multi-tenant
 * `accounts.id` row created on signup, NOT the Meta ad account).
 *
 * Caches the result in-memory per session.
 */
let cachedAccountId: string | null = null;
let cachedForUserId: string | null = null;

export async function getCurrentAccountId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (cachedAccountId && cachedForUserId === user.id) return cachedAccountId;

  const { data, error } = await supabase
    .from("account_users")
    .select("account_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.account_id) throw new Error("No account membership found for user");

  cachedAccountId = data.account_id;
  cachedForUserId = user.id;
  return data.account_id;
}

/**
 * Convenience: returns both the auth user id and the primary account id.
 */
export async function getCurrentUserAndAccount(): Promise<{ userId: string; accountId: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const accountId = await getCurrentAccountId();
  return { userId: user.id, accountId };
}

export function clearAccountCache() {
  cachedAccountId = null;
  cachedForUserId = null;
}
