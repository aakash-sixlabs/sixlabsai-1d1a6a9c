/**
 * fix-duplicate-user.mjs
 * Clears meta_user_id from the duplicate auth user so meta-oauth
 * finds the correct user (2d9d9818...) instead.
 *
 * Usage:
 *   NEW_SUPABASE_URL=https://jkzbuypbhqbssmqjpdtj.supabase.co \
 *   NEW_SERVICE_ROLE_KEY=<key> \
 *   node fix-duplicate-user.mjs
 */

import { createClient } from '@supabase/supabase-js'

const DUPLICATE_USER_ID = '093b5061-513e-49ae-9c9e-b66afb66a364'

const url = process.env.NEW_SUPABASE_URL
const key = process.env.NEW_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing env vars'); process.exit(1) }

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

// Clear meta_user_id so it doesn't get picked up by the listUsers search
const { data, error } = await admin.auth.admin.updateUserById(DUPLICATE_USER_ID, {
  user_metadata: { meta_user_id: null },
})

if (error) {
  console.error('Failed:', error.message)
  process.exit(1)
}
console.log('Cleared meta_user_id from duplicate user:', DUPLICATE_USER_ID)
console.log('Updated metadata:', data.user.user_metadata)
