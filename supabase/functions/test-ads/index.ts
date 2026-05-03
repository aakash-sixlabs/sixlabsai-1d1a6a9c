import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getProdSupabaseUrl } from '../_shared/supabase-url.ts'

const TEST_MAX_ADS = 500
const ADSET_BATCH_SIZE = 50

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

async function fetchAllPages(url: string): Promise<any[]> {
  const results: any[] = []
  let nextUrl: string | null = url

  while (nextUrl) {
    let retries = 0
    let response: Response | null = null
    let data: any = null

    while (retries < 4) {
      response = await fetch(nextUrl)
      data = await response.json()

      if (data.error) {
        const code = data.error.code
        const isRateLimit =
          code === 17 ||
          code === 4 ||
          code === 32 ||
          code === 80004

        if (isRateLimit && retries < 3) {
          const delay = Math.pow(2, retries + 1) * 1000
          console.log(`Rate limit hit, retrying in ${delay}ms...`)
          await new Promise(r => setTimeout(r, delay))
          retries++
          continue
        }
        throw new Error(data.error.message)
      }
      break
    }

    if (data.data) results.push(...data.data)
    nextUrl = data.paging?.next ?? null
    await new Promise(r => setTimeout(r, 500))
  }

  return results
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const prodAdmin = createClient(
      getProdSupabaseUrl(),
      Deno.env.get('PROD_SUPABASE_SERVICE_ROLE_KEY')!
    )
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { adAccountId, accessToken, dateRangeDays = 90 } = await req.json()

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - dateRangeDays)
    const since = cutoffDate.toISOString().split('T')[0]
    const until = new Date().toISOString().split('T')[0]

    const { data: adAccount, error: adAccountErr } = await prodAdmin
      .from('ad_accounts')
      .select('account_id, user_id, account_id_meta')
      .eq('id', adAccountId)
      .maybeSingle()

    if (adAccountErr || !adAccount) {
      return new Response(
        JSON.stringify({ success: false, error: `Ad account ${adAccountId} not found`, db_error: adAccountErr?.message ?? null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const metaAccountId = adAccount.account_id_meta.startsWith('act_')
      ? adAccount.account_id_meta
      : `act_${adAccount.account_id_meta}`
    const userId = adAccount.user_id
    const accountId = adAccount.account_id

    // STEP 1 — Get stored ad sets from DB
    const { data: adSetData } = await admin
      .from('ad_sets')
      .select('id, meta_adset_id')
      .eq('user_id', userId)

    if (!adSetData || adSetData.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No ad sets found. Run test-adsets first.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adSetMap = Object.fromEntries(
      adSetData.map((s: any) => [s.meta_adset_id, s.id])
    )
    const metaAdSetIds = adSetData.map((s: any) => s.meta_adset_id)

    // STEP 2 — Pull ad insights scoped to stored ad sets
    const insightRows = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${metaAccountId}/insights` +
      `?level=ad` +
      `&fields=ad_id,impressions` +
      `&time_range={"since":"${since}","until":"${until}"}` +
      `&filtering=[{"field":"adset.id","operator":"IN",` +
      `"value":${JSON.stringify(metaAdSetIds.slice(0, 50))}}]` +
      `&limit=100` +
      `&access_token=${accessToken}`
    )

    const adsWithImpressions = new Set(
      insightRows.map((r: any) => r.ad_id)
    )

    // STEP 3 — Pull ACTIVE + PAUSED ads in batches of 50 ad set IDs
    const activeAds: any[] = []
    const pausedAds: any[] = []

    for (let i = 0; i < metaAdSetIds.length; i += ADSET_BATCH_SIZE) {
      const batch = metaAdSetIds.slice(i, i + ADSET_BATCH_SIZE)

      const batchActive = await fetchAllPages(
        `https://graph.facebook.com/v21.0/${metaAccountId}/ads` +
        `?fields=id,name,status,effective_status,adset_id,creative{id}` +
        `&effective_status=["ACTIVE","WITH_ISSUES"]` +
        `&filtering=[{"field":"adset.id","operator":"IN",` +
        `"value":${JSON.stringify(batch)}}]` +
        `&limit=100` +
        `&access_token=${accessToken}`
      )
      activeAds.push(...batchActive)

      const batchPaused = await fetchAllPages(
        `https://graph.facebook.com/v21.0/${metaAccountId}/ads` +
        `?fields=id,name,status,effective_status,adset_id,creative{id}` +
        `&effective_status=["PAUSED"]` +
        `&filtering=[{"field":"adset.id","operator":"IN",` +
        `"value":${JSON.stringify(batch)}}]` +
        `&limit=100` +
        `&access_token=${accessToken}`
      )
      pausedAds.push(...batchPaused)

      await new Promise(r => setTimeout(r, 500))
    }

    // STEP 4 — Filter paused ads to only those with impressions
    const relevantPausedAds = pausedAds.filter(
      (a: any) => adsWithImpressions.has(a.id)
    )

    // STEP 5 — Merge and deduplicate
    const seen = new Set()
    const allAds = [...activeAds, ...relevantPausedAds].filter((a: any) => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    })

    // STEP 6 — Cap at 200 for testing
    const results = allAds.slice(0, TEST_MAX_ADS)

    // STEP 7 — Build and upsert rows
    const rows = results
      .filter((a: any) => adSetMap[a.adset_id])
      .map((a: any) => ({
        user_id: userId,
        ad_set_id: adSetMap[a.adset_id],
        meta_ad_id: a.id,
        name: a.name,
        status: a.status ?? null,
        effective_status: a.effective_status ?? null,
        meta_creative_id: a.creative?.id ?? null,
        media_type: 'unknown',
        updated_at: new Date().toISOString()
      }))

    const { error: upsertError } = await admin
      .from('ads')
      .upsert(rows, {
        onConflict: 'user_id,meta_ad_id',
        ignoreDuplicates: false
      })

    return new Response(
      JSON.stringify({
        success: !upsertError,
        date_range: `${since} to ${until}`,
        total_adsets_in_db: metaAdSetIds.length,
        total_batches: Math.ceil(metaAdSetIds.length / ADSET_BATCH_SIZE),
        total_active_pulled: activeAds.length,
        total_paused_pulled: pausedAds.length,
        total_paused_with_impressions: relevantPausedAds.length,
        total_paused_excluded: pausedAds.length - relevantPausedAds.length,
        total_merged: allAds.length,
        total_stored: upsertError ? 0 : rows.length,
        capped_at: TEST_MAX_ADS,
        hit_limit: allAds.length > TEST_MAX_ADS,
        upsert_error: upsertError?.message ?? null,
        sample: results.slice(0, 3)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
