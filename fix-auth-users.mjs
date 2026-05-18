/**
 * fix-auth-users.mjs
 * 1. Deletes the orphaned duplicate user (093b5061...) that holds the correct email
 * 2. Updates the real migrated user (2d9d9818...) with correct meta_user_id + email
 *
 * Usage:
 *   NEW_SUPABASE_URL=https://jkzbuypbhqbssmqjpdtj.supabase.co \
 *   NEW_SERVICE_ROLE_KEY=<key> \
 *   node fix-auth-users.mjs
 */

import { createClient } from '@supabase/supabase-js'

const DUPLICATE_USER_ID = '093b5061-513e-49ae-9c9e-b66afb66a364'
const REAL_USER_ID      = '2d9d9818-d657-48d6-b6df-77f273c9f3b9'
const META_USER_ID      = '10164255027828872'   // actual ID from Meta API
const CORRECT_EMAIL     = `meta_${META_USER_ID}@users.noreply`

const url = process.env.NEW_SUPABASE_URL
const key = process.env.NEW_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing env vars'); process.exit(1) }

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

// Step 1: Delete the duplicate user
console.log(`Deleting duplicate user ${DUPLICATE_USER_ID}...`)
const { error: delErr } = await admin.auth.admin.deleteUser(DUPLICATE_USER_ID)
if (delErr) {
  console.error('Failed to delete duplicate user:', delErr.message)
  process.exit(1)
}
console.log('Deleted.')

// Step 2: Update real user with correct meta_user_id and email
console.log(`\nUpdating real user ${REAL_USER_ID}...`)
const { data, error: updateErr } = await admin.auth.admin.updateUserById(REAL_USER_ID, {
  email: CORRECT_EMAIL,
  user_metadata: { full_name: 'Aakash Ahuja', meta_user_id: META_USER_ID },
})
if (updateErr) {
  console.error('Failed to update real user:', updateErr.message)
  process.exit(1)
}
console.log('Updated email:', data.user.email)
console.log('Updated metadata:', data.user.user_metadata)
