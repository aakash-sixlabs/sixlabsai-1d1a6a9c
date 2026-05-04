import { supabase } from "@/integrations/supabase/client";

/**
 * Resolve the current user's tenant `account_id` (from `account_users`).
 * Required on every multi-tenant insert from the frontend.
 */
export async function getCurrentAccountId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("account_users")
    .select("account_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data?.account_id) return null;
  return data.account_id;
}
