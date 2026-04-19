import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TEST_MAX_RECORDS = 200

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

async function fetchAllPages(
  url: string,
  maxRecords = TEST_MAX_RECORDS
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

    const results = await fetchAllPages(
      `https://graph.facebook.com/v21.0/${metaAccountId}/adsets` +
      `?fields=id,name,status,effective_status,campaign_id,` +
      `daily_budget,lifetime_budget,optimization_goal,` +
      `billing_event,targeting,start_time,end_time` +
      `&limit=100` +
      `&access_token=${accessToken}`,
      Number.MAX_SAFE_INTEGER
    )

    const { data: campaignData } = await admin
      .from('campaigns')
      .select('id,meta_campaign_id')
      .eq('user_id', userId)

    const campaignMap = Object.fromEntries(
      (campaignData ?? []).map((c: any) => [c.meta_campaign_id, c.id])
    )

    const rows = results
      .filter(s => campaignMap[s.campaign_id])
      .map(s => ({
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
        onConflict: 'user_id,meta_adset_id',
        ignoreDuplicates: false
      })

    const skipped = results.length - rows.length

    return new Response(
      JSON.stringify({
        success: !upsertError,
        total_pulled: results.length,
        total_stored: upsertError ? 0 : rows.length,
        skipped_no_campaign: skipped,
        capped_at: null,
        is_complete: true,
        hit_limit: false,
        limit_reason: null,
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
