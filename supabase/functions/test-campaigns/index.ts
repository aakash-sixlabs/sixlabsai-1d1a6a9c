import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TEST_MAX_RECORDS = 200

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

    const { adAccountId, accessToken, dateRangeDays = 90 } = await req.json()

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - dateRangeDays)
    const since = cutoffDate.toISOString().split('T')[0]

    const { data: adAccount } = await admin
      .from('ad_accounts')
      .select('account_id, user_id')
      .eq('id', adAccountId)
      .single()

    const metaAccountId = adAccount.account_id.startsWith('act_')
      ? adAccount.account_id
      : `act_${adAccount.account_id}`
    const userId = adAccount.user_id

    // Pull 1 — ALL ACTIVE campaigns (no date filter)
    const activeCampaigns = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${metaAccountId}/campaigns` +
      `?fields=id,name,status,effective_status,objective,` +
      `daily_budget,lifetime_budget,start_time,stop_time` +
      `&effective_status=["ACTIVE"]` +
      `&limit=100` +
      `&access_token=${accessToken}`
    )

    // Pull 2 — PAUSED campaigns updated within date range
    const pausedCampaigns = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${metaAccountId}/campaigns` +
      `?fields=id,name,status,effective_status,objective,` +
      `daily_budget,lifetime_budget,start_time,stop_time` +
      `&effective_status=["PAUSED"]` +
      `&filtering=[{"field":"campaign.updated_time",` +
      `"operator":"GREATER_THAN","value":"${since}"}]` +
      `&limit=100` +
      `&access_token=${accessToken}`
    )

    // Merge and deduplicate by id
    const seen = new Set()
    const results = [...activeCampaigns, ...pausedCampaigns]
      .filter(c => {
        if (seen.has(c.id)) return false
        seen.add(c.id)
        return true
      })

    const rows = results.map(c => ({
      user_id: userId,
      ad_account_id: adAccountId,
      meta_campaign_id: c.id,
      name: c.name,
      status: c.status ?? null,
      effective_status: c.effective_status ?? null,
      objective: c.objective ?? null,
      daily_budget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
      lifetime_budget: c.lifetime_budget ? parseFloat(c.lifetime_budget) / 100 : null,
      start_time: c.start_time ?? null,
      stop_time: c.stop_time ?? null,
      updated_at: new Date().toISOString()
    }))

    const { error: upsertError } = await admin
      .from('campaigns')
      .upsert(rows, {
        onConflict: 'user_id,meta_campaign_id',
        ignoreDuplicates: false
      })

    return new Response(
      JSON.stringify({
        success: !upsertError,
        total_active_pulled: activeCampaigns.length,
        total_paused_pulled: pausedCampaigns.length,
        total_merged: results.length,
        total_stored: upsertError ? 0 : rows.length,
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
