import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

async function fetchAllPages(url: string): Promise<any[]> {
  const results: any[] = []
  let nextUrl: string | null = url

  while (nextUrl) {
    const response = await fetch(nextUrl)
    const data = await response.json()
    if (data.error) throw new Error(data.error.message)
    if (data.data) results.push(...data.data)
    nextUrl = data.paging?.next ?? null
    await new Promise(r => setTimeout(r, 300))
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

    const { adAccountId, accessToken } = await req.json()

    const { data: adAccount } = await admin
      .from('ad_accounts')
      .select('account_id, user_id')
      .eq('id', adAccountId)
      .single()

    const metaAccountId = adAccount.account_id.startsWith('act_')
      ? adAccount.account_id
      : `act_${adAccount.account_id}`
    const userId = adAccount.user_id

    // Only pull insights for non-video ads we've stored
    const { data: adsData } = await admin
      .from('ads')
      .select('id, meta_ad_id')
      .eq('user_id', userId)
      .neq('media_type', 'video')

    if (!adsData || adsData.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No non-video ads found. Run test-creatives first.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adMap = Object.fromEntries(
      adsData.map((a: any) => [a.meta_ad_id, a.id])
    )
    const metaAdIds = adsData.map((a: any) => a.meta_ad_id)

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    const since = startDate.toISOString().split('T')[0]
    const until = endDate.toISOString().split('T')[0]

    // Batch insights queries — 50 ad IDs per call
    const BATCH_SIZE = 50
    const allInsights: any[] = []

    for (let i = 0; i < metaAdIds.length; i += BATCH_SIZE) {
      const batch = metaAdIds.slice(i, i + BATCH_SIZE)
      const filtering = encodeURIComponent(
        JSON.stringify([
          { field: 'ad.id', operator: 'IN', value: batch }
        ])
      )

      const batchResults = await fetchAllPages(
        `https://graph.facebook.com/v21.0/${metaAccountId}/insights` +
        `?level=ad` +
        `&fields=ad_id,reach,impressions,clicks,spend,ctr,` +
        `unique_ctr,cpc,cpm,frequency,actions,action_values` +
        `&filtering=${filtering}` +
        `&time_range={"since":"${since}","until":"${until}"}` +
        `&time_increment=1` +
        `&limit=100` +
        `&access_token=${accessToken}`
      )

      allInsights.push(...batchResults)
      await new Promise(r => setTimeout(r, 300))
    }

    const rows = allInsights
      .filter(r => adMap[r.ad_id])
      .map(r => {
        const purchases = parseFloat(
          r.actions?.find((a: any) => a.action_type === 'purchase')?.value ?? '0'
        )
        const revenue = parseFloat(
          r.action_values?.find((a: any) => a.action_type === 'purchase')?.value ?? '0'
        )
        const spend = parseFloat(r.spend ?? '0')

        return {
          user_id: userId,
          ad_id: adMap[r.ad_id],
          date: r.date_start,
          impressions: parseInt(r.impressions ?? '0'),
          clicks: parseInt(r.clicks ?? '0'),
          spend,
          reach: parseInt(r.reach ?? '0'),
          ctr: parseFloat(r.ctr ?? '0'),
          unique_ctr: parseFloat(r.unique_ctr ?? '0'),
          cpc: parseFloat(r.cpc ?? '0'),
          cpm: parseFloat(r.cpm ?? '0'),
          frequency: parseFloat(r.frequency ?? '0'),
          purchases,
          revenue,
          roas: spend > 0 ? revenue / spend : 0,
          cost_per_purchase: purchases > 0 ? spend / purchases : 0,
          result_type: 'purchase',
          updated_at: new Date().toISOString()
        }
      })

    const { error: upsertError } = await admin
      .from('ad_performance_daily')
      .upsert(rows, {
        onConflict: 'user_id,ad_id,date',
        ignoreDuplicates: false
      })

    return new Response(
      JSON.stringify({
        success: !upsertError,
        date_range: `${since} to ${until}`,
        total_ads_checked: adsData.length,
        total_insight_rows_pulled: allInsights.length,
        total_stored: upsertError ? 0 : rows.length,
        hit_limit: false,
        limit_reason: null,
        upsert_error: upsertError?.message ?? null,
        sample: rows.slice(0, 3)
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
