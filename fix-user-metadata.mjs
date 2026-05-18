/**
 * fix-user-metadata.mjs
 * Patches the migrated user's metadata to include meta_user_id
 * so meta-oauth can find them on login.
 *
 * Usage:
 *   NEW_SUPABASE_URL=https://jkzbuypbhqbssmqjpdtj.supabase.co \
 *   NEW_SERVICE_ROLE_KEY=<key> \
 *   node fix-user-metadata.mjs
 */

import { createClient } from '@supabase/supabase-js'

const USER_ID      = '2d9d9818-d657-48d6-b6df-77f273c9f3b9'
const META_USER_ID = '10164255027828872'
const FULL_NAME    = 'Aakash Ahuja'

const url = process.env.NEW_SUPABASE_URL
const key = process.env.NEW_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing env vars'); process.exit(1) }

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

const { data, error } = await admin.auth.admin.updateUserById(USER_ID, {
  user_metadata: { full_name: FULL_NAME, meta_user_id: META_USER_ID },
})

if (error) {
  console.error('Failed:', error.message)
  process.exit(1)
}
console.log('Updated user metadata:', data.user.user_metadata)
