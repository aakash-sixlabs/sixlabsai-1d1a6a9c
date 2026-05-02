// Shared helpers for edge functions to look up the user's Lovable account_id
// (multi-tenant accounts.id), per the schema dictionary.
//
// If the user has no account membership yet (legacy users created before the
// multi-tenant migration), this auto-provisions a personal account so flows
// like Meta login don't hard-fail.

export async function getUserAccountId(admin: any, userId: string): Promise<string> {
  const { data, error } = await admin
    .from("account_users")
    .select("account_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Account lookup failed: ${error.message}`);
  if (data?.account_id) return data.account_id as string;

  // No membership — provision a personal account for this legacy user.
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", userId)
    .maybeSingle();
  const accountName =
    profile?.full_name ||
    (profile?.email ? String(profile.email).split("@")[0] : "Personal");

  const { data: account, error: accErr } = await admin
    .from("accounts")
    .insert({ name: accountName, account_type: "brand", is_active: true })
    .select("id")
    .single();
  if (accErr || !account) {
    throw new Error(`Failed to provision account: ${accErr?.message ?? "unknown"}`);
  }

  const { error: memErr } = await admin
    .from("account_users")
    .insert({ account_id: account.id, user_id: userId, role: "account_admin" });
  if (memErr) {
    throw new Error(`Failed to add account membership: ${memErr.message}`);
  }

  return account.id as string;
}
