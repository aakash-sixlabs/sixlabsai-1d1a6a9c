// Shared helper to resolve a user's tenant account_id from account_users.
// Used by every multi-tenant edge function insert/upsert.
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function getUserAccountId(
  admin: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("account_users")
    .select("account_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data?.account_id) return null;
  return data.account_id as string;
}
