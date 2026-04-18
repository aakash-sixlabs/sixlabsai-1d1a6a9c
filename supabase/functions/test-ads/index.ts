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
      `https://graph.facebook.com/v21.0/${metaAccountId}/ads` +
      `?fields=id,name,status,effective_status,adset_id,creative{id}` +
      `&limit=100` +
      `&access_token=${accessToken}`
    )

    const { data: adSetData } = await admin
      .from('ad_sets')
      .select('id,meta_adset_id')
      .eq('user_id', userId)

    const adSetMap = Object.fromEntries(
      (adSetData ?? []).map((s: any) => [s.meta_adset_id, s.id])
    )

    const rows = results
      .filter(a => adSetMap[a.adset_id])
      .map(a => ({
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

    const skipped = results.length - rows.length

    return new Response(
      JSON.stringify({
        success: !upsertError,
        total_pulled: results.length,
        total_stored: upsertError ? 0 : rows.length,
        skipped_no_adset: skipped,
        capped_at: TEST_MAX_RECORDS,
        is_complete: results.length < TEST_MAX_RECORDS,
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
