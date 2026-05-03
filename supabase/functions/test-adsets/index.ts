import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getProdSupabaseUrl } from '../_shared/supabase-url.ts'

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

    // STEP 1 — Pull ALL ACTIVE ad sets
    const activeAdSets = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${metaAccountId}/adsets` +
      `?fields=id,name,status,effective_status,campaign_id,` +
      `daily_budget,lifetime_budget,optimization_goal,` +
      `billing_event,targeting,start_time,end_time` +
      `&effective_status=["ACTIVE"]` +
      `&limit=100` +
      `&access_token=${accessToken}`
    )

    // STEP 2 — Pull ALL PAUSED ad sets
    const pausedAdSets = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${metaAccountId}/adsets` +
      `?fields=id,name,status,effective_status,campaign_id,` +
      `daily_budget,lifetime_budget,optimization_goal,` +
      `billing_event,targeting,start_time,end_time` +
      `&effective_status=["PAUSED"]` +
      `&limit=100` +
      `&access_token=${accessToken}`
    )

    // STEP 3 — Pull adset-level insights to find which had impressions
    const insightRows = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${metaAccountId}/insights` +
      `?level=adset` +
      `&fields=adset_id,impressions` +
      `&time_range={"since":"${since}","until":"${until}"}` +
      `&limit=100` +
      `&access_token=${accessToken}`
    )

    const adSetsWithImpressions = new Set(
      insightRows.map((r: any) => r.adset_id)
    )

    // ACTIVE → always include; PAUSED → only if had impressions
    const relevantPausedAdSets = pausedAdSets
      .filter((s: any) => adSetsWithImpressions.has(s.id))

    // STEP 4 — Merge active + relevant paused
    const seen = new Set()
    const results = [
      ...activeAdSets,
      ...relevantPausedAdSets
    ].filter((s: any) => {
      if (seen.has(s.id)) return false
      seen.add(s.id)
      return true
    })

    // STEP 5 — Post-fetch filter: only keep if campaign in DB
    const { data: campaignData } = await admin
      .from('campaigns')
      .select('id, meta_campaign_id')
      .eq('user_id', userId)

    const campaignMap = Object.fromEntries(
      (campaignData ?? []).map((c: any) => [c.meta_campaign_id, c.id])
    )

    const filteredResults = results.filter((s: any) => campaignMap[s.campaign_id])

    const rows = filteredResults.map((s: any) => ({
      account_id: accountId,
      user_id: userId,
      campaign_id: campaignMap[s.campaign_id],
      meta_adset_id: s.id,
      name: s.name,
      status: s.status ?? null,
      effective_status: s.effective_status ?? null,
      daily_budget: s.daily_budget ? parseFloat(s.daily_budget) / 100 : null,
      lifetime_budget: s.lifetime_budget ? parseFloat(s.lifetime_budget) / 100 : null,
      optimization_goal: s.optimization_goal ?? null,
      billing_event: s.billing_event ?? null,
      targeting: s.targeting ?? null,
      start_time: s.start_time ?? null,
      end_time: s.end_time ?? null,
      updated_at: new Date().toISOString()
    }))

    const { error: upsertError } = await admin
      .from('ad_sets')
      .upsert(rows, {
        onConflict: 'campaign_id,meta_adset_id',
        ignoreDuplicates: false
      })

    return new Response(
      JSON.stringify({
        success: !upsertError,
        date_range: `${since} to ${until}`,
        total_active_pulled: activeAdSets.length,
        total_paused_pulled: pausedAdSets.length,
        total_paused_with_impressions: relevantPausedAdSets.length,
        total_paused_excluded: pausedAdSets.length - relevantPausedAdSets.length,
        total_merged: results.length,
        total_after_campaign_filter: filteredResults.length,
        skipped_no_campaign: results.length - filteredResults.length,
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
