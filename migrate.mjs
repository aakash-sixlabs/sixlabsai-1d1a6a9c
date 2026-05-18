/**
 * migrate.mjs — one-shot data migration from Lovable Supabase → new Supabase
 *
 * Usage:
 *   NEW_SUPABASE_URL=https://jkzbuypbhqbssmqjpdtj.supabase.co \
 *   NEW_SERVICE_ROLE_KEY=<your_service_role_key> \
 *   node migrate.mjs
 */

import { createClient } from '@supabase/supabase-js'

// ── Config ────────────────────────────────────────────────────────────────────

const LOVABLE_URL = 'https://bhcusyaonpevmwaruvlx.supabase.co'
const LOVABLE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoY3VzeWFvbnBldm13YXJ1dmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzY3NzEsImV4cCI6MjA4OTQ1Mjc3MX0.hXG7M9CkKFRqAIh2e1TsSO54G0h8qjNF3AaHIQQLwdU'

// JWT from browser localStorage — pass via env var, valid for 1 hour
const LOVABLE_ACCESS_TOKEN = process.env.LOVABLE_ACCESS_TOKEN

// Decoded from the JWT above
const LOVABLE_USER_ID    = '2d9d9818-d657-48d6-b6df-77f273c9f3b9'
const LOVABLE_USER_EMAIL = 'meta_101642550278288872@users.noreply'
const LOVABLE_USER_NAME  = 'Aakash Ahuja'

const NEW_URL         = process.env.NEW_SUPABASE_URL
const NEW_SERVICE_KEY = process.env.NEW_SERVICE_ROLE_KEY

// Per-table conflict column for upsert (default: 'id')
const UPSERT_ON = {
  scene_archetypes: 'key',  // unique on key, not id — Mubeen pre-populated with different UUIDs
}

// Tables in FK dependency order (parents before children)
const TABLES = [
  'accounts',               // no deps
  'scene_archetypes',       // no deps
  'mock_creative_library',  // no deps
  'meta_connections',       // refs auth.users, accounts
  'ad_accounts',            // refs meta_connections, accounts
  'profiles',               // refs auth.users + ad_accounts (must come after ad_accounts)
  'account_users',          // refs accounts, auth.users
  'brands',                 // refs accounts, ad_accounts
  'campaigns',              // refs ad_accounts, accounts
  'ad_sets',                // refs campaigns
  'ads',                    // refs ad_sets
  'ad_creatives',           // refs ads
  'ad_performance_daily',   // refs ads
  'ad_account_profiles',    // refs ad_accounts, accounts, brands
  'brand_competitors',      // refs accounts, brands
  'brand_archetypes',       // refs accounts, brands, scene_archetypes
  'icps',                   // refs accounts, ad_accounts, brands
  'disclaimers',            // refs accounts, ad_accounts, brands
  'offers',                 // refs accounts, ad_accounts, brands
  'competitor_ads',         // refs accounts, brands, brand_competitors
  'creative_tags',          // refs accounts
  'prompt_templates',       // refs accounts
  'sync_jobs',              // refs accounts, ad_accounts
  'products',               // refs accounts, brands
  'fatigue_diagnoses',      // refs accounts, brands, ads, ad_sets
  'generation_jobs',        // refs accounts, ad_accounts, brands, icps, ads, fatigue_diagnoses
  'generated_creatives',    // refs generation_jobs, accounts, brands, ads, fatigue_diagnoses, prompt_templates
  'prompt_template_performance', // refs generated_creatives, prompt_templates
]

const PAGE_SIZE = 1000

// ── Helpers ───────────────────────────────────────────────────────────────────

function required(name) {
  const val = process.env[name]
  if (!val) { console.error(`Missing env var: ${name}`); process.exit(1) }
  return val
}

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch {
    return null
  }
}

async function fetchAllRows(client, table) {
  const rows = []
  let from = 0
  while (true) {
    const { data, error } = await client
      .from(table)
      .select('*')
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`Reading ${table}: ${error.message}`)
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return rows
}

async function insertRows(client, table, rows) {
  if (rows.length === 0) return
  const CHUNK = 500
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { error } = await client.from(table).insert(chunk)
    if (error) throw new Error(`Writing ${table}: ${error.message}`)
  }
}

async function wipeTable(client, table) {
  // Delete all rows — .not('id','is',null) matches every row
  const { error } = await client.from(table).delete().not('id', 'is', null)
  if (error) throw new Error(`Wiping ${table}: ${error.message}`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  required('NEW_SUPABASE_URL')
  required('NEW_SERVICE_ROLE_KEY')
  required('LOVABLE_ACCESS_TOKEN')

  console.log('\n=== Sixlabs Data Migration: Lovable → New Supabase ===\n')

  // 1. Build source client using the pre-obtained JWT (no login needed)
  console.log('1. Connecting to Lovable Supabase with JWT...')
  const payload = decodeJwt(LOVABLE_ACCESS_TOKEN)
  if (!payload) {
    console.error('   Could not decode JWT — check the token value.')
    process.exit(1)
  }
  const nowSecs = Math.floor(Date.now() / 1000)
  const minsLeft = Math.round((payload.exp - nowSecs) / 60)
  if (payload.exp <= nowSecs) {
    console.error(`   JWT expired ${Math.abs(minsLeft)} minute(s) ago. Get a fresh one from the browser console.`)
    process.exit(1)
  }
  console.log(`   Token valid for ~${minsLeft} more minute(s).`)
  console.log(`   User: ${payload.email} (id: ${payload.sub})`)

  const source = createClient(LOVABLE_URL, LOVABLE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${LOVABLE_ACCESS_TOKEN}` } },
    auth:   { autoRefreshToken: false, persistSession: false },
  })

  // 2. Set up destination client (service_role bypasses RLS)
  const destKeyPayload = decodeJwt(NEW_SERVICE_KEY)
  if (!destKeyPayload) {
    console.error('   NEW_SERVICE_ROLE_KEY does not look like a JWT — check for extra quotes or whitespace.')
    process.exit(1)
  }
  if (destKeyPayload.role !== 'service_role') {
    console.error(`   NEW_SERVICE_ROLE_KEY has role="${destKeyPayload.role}" — you need the service_role key, not the anon key.`)
    process.exit(1)
  }

  const dest = createClient(NEW_URL, NEW_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // 3. Re-create the user in the new project's auth.users (same UUID)
  console.log('\n2. Re-creating user in new Supabase auth...')
  const { data: existingData } = await dest.auth.admin.getUserById(LOVABLE_USER_ID)
  if (existingData?.user) {
    console.log('   User already exists — skipping.')
  } else {
    const { error: createErr } = await dest.auth.admin.createUser({
      id:             LOVABLE_USER_ID,
      email:          LOVABLE_USER_EMAIL,
      email_confirm:  true,
      user_metadata:  { full_name: LOVABLE_USER_NAME },
    })
    if (createErr) {
      console.error('   Failed to create user:', createErr.message)
      process.exit(1)
    }
    console.log(`   Created user ${LOVABLE_USER_EMAIL} with id ${LOVABLE_USER_ID}`)
    console.log('   NOTE: No password set — use "Forgot password" in the app to log in.')
  }

  // 4. Wipe destination tables (reverse FK order: children first)
  console.log('\n3. Wiping destination tables (reverse FK order)...')
  const TABLES_REVERSED = [...TABLES].reverse()
  for (const table of TABLES_REVERSED) {
    process.stdout.write(`   Wiping ${table}...`)
    try {
      await wipeTable(dest, table)
      console.log(' done')
    } catch (err) {
      console.log(` ERROR: ${err.message}`)
      console.error('   Aborting — fix the wipe error before re-running.')
      process.exit(1)
    }
  }

  // 5. Migrate each table (fresh insert, no conflicts possible)
  console.log('\n4. Migrating tables...\n')
  console.log('   Table'.padEnd(36) + 'Source'.padStart(8) + '  Dest'.padStart(8) + '  Status')
  console.log('   ' + '─'.repeat(60))

  const results = []
  for (const table of TABLES) {
    process.stdout.write(`   ${table.padEnd(34)}`)
    try {
      const rows = await fetchAllRows(source, table)
      process.stdout.write(String(rows.length).padStart(8))

      if (rows.length > 0) {
        await insertRows(dest, table, rows)
      }

      // Verify count in dest matches source exactly
      const { count, error: countErr } = await dest
        .from(table)
        .select('*', { count: 'exact', head: true })
      const destCount = countErr ? '?' : count

      process.stdout.write(`  ${String(destCount).padStart(6)}`)
      const ok = rows.length === destCount
      console.log(`  ${ok ? '✓' : '⚠ MISMATCH'}`)
      results.push({ table, source: rows.length, dest: destCount, ok })
    } catch (err) {
      console.log(`  ERROR: ${err.message}`)
      results.push({ table, source: '?', dest: '?', ok: false })
    }
  }

  // 6. Summary
  const failed = results.filter(r => !r.ok)
  console.log('\n' + '─'.repeat(63))
  if (failed.length === 0) {
    console.log('All tables migrated successfully.\n')
  } else {
    console.log(`\n⚠  ${failed.length} table(s) need attention:`)
    for (const r of failed) {
      console.log(`   ${r.table}: source=${r.source} dest=${r.dest}`)
    }
    console.log()
  }

  await source.auth.signOut()
}

main().catch(err => { console.error(err); process.exit(1) })
