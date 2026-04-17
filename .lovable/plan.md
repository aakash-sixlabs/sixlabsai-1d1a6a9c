
User asking about token security before approving the manual-token workaround. This is a research question — short, direct answer, no plan needed beyond restating the security model.

## Is your access token safe? — Short answer: **Yes, with caveats.**

### How it's protected

**At rest (database)**
- Stored in `meta_connections.access_token` (Postgres column)
- RLS policy: `auth.uid() = user_id` → only the row's owner can SELECT/UPDATE it
- No other user (even other authenticated users) can read it
- Service role can read it, but service role only runs inside edge functions you control

**In transit**
- Pasted over HTTPS to the edge function
- Edge function → Meta API over HTTPS

**Who can see it**
- You (the row owner), via your session
- Edge functions running with service role (`meta-sync`, `meta-token-connect`)
- Lovable/Supabase platform admins (same as any DB column)
- **Not** other app users, not the frontend of other sessions, not exposed in any API response

### Caveats / things to know

1. **Plaintext in DB** — the column is not encrypted at the application layer. Same as how OAuth-issued tokens are stored today. Postgres encrypts at-rest at the disk level but anyone with DB-level access (service role key, DB admin) can read it. This matches the existing OAuth flow's security posture exactly.

2. **Browser exposure during paste** — the token sits in React state and the network request body for ~1 second during submit. Standard for any credential paste flow (passwords, API keys). Mitigations: don't log it, don't put it in a GET querystring, clear the input after submit.

3. **Token capability** — a Meta user/system token with `ads_read`+`ads_management` can read all ad data and *modify* campaigns. If leaked, an attacker could pause/edit ads. Use a **System User token scoped to specific ad accounts** to limit blast radius — that's the recommended pattern for client tokens anyway.

4. **No expiry tracking** — `token_expires_at` would be `null` for pasted tokens (we don't know when it expires). If a client gives you a short-lived token, sync will silently 401 later. System User tokens don't expire, so this is a non-issue if clients use those.

### Optional hardening (say the word and I'll add to the plan)
- Encrypt `access_token` at the application layer using `pgsodium` / a vault secret before storing
- Add an audit log row whenever a token is read by an edge function
- Mask the token in any admin UI (show `EAAB…last4`)

### Recommendation
Ship the workaround as-is — security parity with the existing OAuth flow. If you want defense-in-depth (encryption-at-rest at the app layer), I can layer that on as a follow-up without changing the user flow.

No code changes proposed in this message — awaiting your go-ahead on the original workaround plan (and whether to add encryption).
