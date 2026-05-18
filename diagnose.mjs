/**
 * diagnose.mjs — check profile + ICP linkage for the real user
 *
 * Usage:
 *   NEW_SUPABASE_URL=https://jkzbuypbhqbssmqjpdtj.supabase.co \
 *   NEW_SERVICE_ROLE_KEY=<key> \
 *   node diagnose.mjs
 */

import { createClient } from '@supabase/supabase-js'

const USER_ID = '2d9d9818-d657-48d6-b6df-77f273c9f3b9'

const url = process.env.NEW_SUPABASE_URL
const key = process.env.NEW_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing env vars'); process.exit(1) }

const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

// 1. Profile
const { data: profile } = await db.from('profiles').select('*').eq('id', USER_ID).single()
console.log('\n── Profile ──────────────────────────────')
console.log('default_ad_account_id:', profile?.default_ad_account_id)
console.log('full row:', JSON.stringify(profile, null, 2))

// 2. Ad accounts accessible to this user
const { data: au } = await db.from('account_users').select('account_id').eq('user_id', USER_ID)
console.log('\n── account_users rows ───────────────────')
console.log(au)

const { data: adAccounts } = await db.from('ad_accounts').select('id, account_id, account_name')
console.log('\n── ad_accounts (all) ────────────────────')
console.log(adAccounts)

// 3. ICPs
const { data: icps } = await db.from('icps').select('id, name, user_id, account_id, ad_account_id')
console.log('\n── ICPs (all) ───────────────────────────')
console.log(icps)
