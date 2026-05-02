// Shared helpers for edge functions to look up the user's Lovable account_id
// (multi-tenant accounts.id), per the schema dictionary.

export async function getUserAccountId(admin: any, userId: string): Promise<string> {
  const { data, error } = await admin
    .from("account_users")
    .select("account_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Account lookup failed: ${error.message}`);
  if (!data?.account_id) throw new Error("No account membership found for user");
  return data.account_id as string;
}
