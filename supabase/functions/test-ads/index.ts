import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TEST_MAX_ADS = 200

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
          code === 17 ||   // user request limit
          code === 4 ||    // app request limit
          code === 32 ||   // page request limit
          code === 80004   // ads management limit

        if (isRateLimit && retries < 3) {
          const delay = Math.pow(2, retries + 1) * 1000
          // 2s → 4s → 8s
          console.log(`Rate limit hit, retrying in ${delay}ms...`)
          await new Promise(r => setTimeout(r, delay))
          retries++
          continue
        }
        throw new Error(data.error.message)
      }
      break // success — exit retry loop
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
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { adAccountId, accessToken, dateRangeDays = 90 } = await req.json()

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - dateRangeDays)
    const since = cutoffDate.toISOString().split('T')[0]
    const until = new Date().toISOString().split('T')[0]

    const { data: adAccount } = await admin
      .from('ad_accounts')
      .select('account_id, user_id')
      .eq('id', adAccountId)
      .single()

    const metaAccountId = adAccount.account_id.startsWith('act_')
      ? adAccount.account_id
      : `act_${adAccount.account_id}`
    const userId = adAccount.user_id

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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adSetMap = Object.fromEntries(
      adSetData.map((s: any) => [s.meta_adset_id, s.id])
    )

    // Pull ad-level insights to know which paused ads had impressions
    // AND which ad sets had any activity (so we can skip dead ad sets)
    const adInsightRows = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${metaAccountId}/insights` +
      `?level=ad` +
      `&fields=ad_id,adset_id,impressions` +
      `&time_range={"since":"${since}","until":"${until}"}` +
      `&limit=100` +
      `&access_token=${accessToken}`
    )

    const adsWithImpressions = new Set(
      adInsightRows.map((r: any) => r.ad_id)
    )
    const adSetsWithActivity = new Set(
      adInsightRows.map((r: any) => r.adset_id)
    )

    // Prioritize ad sets that had recent activity — skip cold ad sets
    // to avoid 150s function timeout on accounts with many dormant ad sets
    const prioritizedAdSets = adSetData.filter(
      (s: any) => adSetsWithActivity.has(s.meta_adset_id)
    )

    const allAds: any[] = []
    const skippedColdAdSets = adSetData.length - prioritizedAdSets.length

    // ONE call per ad set — no status filter, filter in code after
    for (const adSet of prioritizedAdSets) {
      if (allAds.length >= TEST_MAX_ADS) break

      const adSetAds = await fetchAllPages(
        `https://graph.facebook.com/v21.0/${adSet.meta_adset_id}/ads` +
        `?fields=id,name,status,effective_status,` +
        `adset_id,creative{id}` +
        `&limit=100` +
        `&access_token=${accessToken}`
      )

      // Filter in code:
      // ACTIVE + WITH_ISSUES → always keep
      // PAUSED → only if had impressions
      const relevantAds = adSetAds.filter((a: any) => {
        const status = a.effective_status
        if (status === 'ACTIVE' || status === 'WITH_ISSUES') return true
        if (status === 'PAUSED') {
          return adsWithImpressions.has(a.id)
        }
        return false
      })

      allAds.push(...relevantAds)
      await new Promise(r => setTimeout(r, 500))
    }

    const results = allAds.slice(0, TEST_MAX_ADS)

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
        total_adsets_checked: adSetData.length,
        adsets_with_activity: adSetData.length - skippedColdAdSets,
        skipped_cold_adsets: skippedColdAdSets,
        total_ads_pulled: allAds.length,
        total_stored: upsertError ? 0 : rows.length,
        skipped_no_adset: results.length - rows.length,
        capped_at: TEST_MAX_ADS,
        hit_limit: allAds.length >= TEST_MAX_ADS,
        limit_reason: allAds.length >= TEST_MAX_ADS
          ? `Reached ${TEST_MAX_ADS} ad cap`
          : null,
        upsert_error: upsertError?.message ?? null,
        sample: results.slice(0, 3)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
