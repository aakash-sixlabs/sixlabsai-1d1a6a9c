import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TEST_MAX_ADS = 200

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

async function fetchAllPages(
  url: string,
  maxRecords = Number.MAX_SAFE_INTEGER
): Promise<any[]> {
  const results: any[] = []
  let nextUrl: string | null = url

  while (nextUrl && results.length < maxRecords) {
    const response = await fetch(nextUrl)
    const data = await response.json()
    if (data.error) throw new Error(data.error.message)
    if (data.data) results.push(...data.data)
    nextUrl = results.length < maxRecords ? data.paging?.next ?? null : null
    await new Promise(r => setTimeout(r, 200))
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

    const { data: adAccount } = await admin
      .from('ad_accounts')
      .select('account_id, user_id')
      .eq('id', adAccountId)
      .single()

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

    const allAds: any[] = []
    for (const adSet of adSetData) {
      if (allAds.length >= TEST_MAX_ADS) break

      // Pull 1 — ACTIVE + WITH_ISSUES ads (no date filter)
      const activeAds = await fetchAllPages(
        `https://graph.facebook.com/v21.0/${adSet.meta_adset_id}/ads` +
        `?fields=id,name,status,effective_status,` +
        `adset_id,creative{id}` +
        `&effective_status=["ACTIVE","WITH_ISSUES"]` +
        `&limit=100` +
        `&access_token=${accessToken}`
      )

      // Pull 2 — PAUSED ads updated within date range
      const pausedAds = await fetchAllPages(
        `https://graph.facebook.com/v21.0/${adSet.meta_adset_id}/ads` +
        `?fields=id,name,status,effective_status,` +
        `adset_id,creative{id}` +
        `&effective_status=["PAUSED"]` +
        `&filtering=[{"field":"ad.updated_time",` +
        `"operator":"GREATER_THAN","value":"${since}"}]` +
        `&limit=100` +
        `&access_token=${accessToken}`
      )

      // Merge and deduplicate per ad set
      const seen = new Set()
      const adSetAds = [...activeAds, ...pausedAds]
        .filter(a => {
          if (seen.has(a.id)) return false
          seen.add(a.id)
          return true
        })

      allAds.push(...adSetAds)
      await new Promise(r => setTimeout(r, 200))
    }

    const results = allAds.slice(0, TEST_MAX_ADS)
    const hitLimit = allAds.length >= TEST_MAX_ADS

    const rows = results.map(a => ({
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
        total_adsets_checked: adSetData.length,
        total_pulled: results.length,
        total_stored: upsertError ? 0 : rows.length,
        capped_at: TEST_MAX_ADS,
        hit_limit: hitLimit,
        limit_reason: hitLimit ? `Reached ${TEST_MAX_ADS} ad cap` : null,
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
