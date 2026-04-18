import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TEST_MAX_RECORDS = 200

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
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

    const metaAccountId = adAccount.account_id
    const userId = adAccount.user_id

    const { data: adsData } = await admin
      .from('ads')
      .select('id, meta_creative_id')
      .eq('user_id', userId)
      .not('meta_creative_id', 'is', null)

    if (!adsData || adsData.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No ads found. Run test-ads first.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adMap = Object.fromEntries(
      adsData.map((a: any) => [a.meta_creative_id, a.id])
    )

    const creativeIds = [...new Set(
      adsData.map((a: any) => a.meta_creative_id).filter(Boolean)
    )]

    const BATCH_SIZE = 50
    const creativeResults: any[] = []

    for (let i = 0; i < creativeIds.length; i += BATCH_SIZE) {
      const batch = creativeIds.slice(i, i + BATCH_SIZE)
      const response = await fetch(
        `https://graph.facebook.com/v21.0/` +
        `?ids=${batch.join(',')}` +
        `&fields=id,name,title,body,image_url,image_hash,` +
        `thumbnail_url,video_id,object_story_spec,asset_feed_spec,` +
        `call_to_action_type,url_tags` +
        `&access_token=${accessToken}`
      )
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      creativeResults.push(...Object.values(data))
      await new Promise(r => setTimeout(r, 300))
    }

    const imageHashes: string[] = []
    creativeResults.forEach((c: any) => {
      if (c.image_hash) imageHashes.push(c.image_hash)
      c.asset_feed_spec?.images?.forEach((img: any) => {
        if (img.hash) imageHashes.push(img.hash)
      })
    })
    const uniqueHashes = [...new Set(imageHashes)]

    const imageUrlMap: Record<string, string> = {}
    for (let i = 0; i < uniqueHashes.length; i += BATCH_SIZE) {
      const batch = uniqueHashes.slice(i, i + BATCH_SIZE)
      const hashesParam = encodeURIComponent(JSON.stringify(batch))
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${metaAccountId}/adimages` +
        `?hashes=${hashesParam}` +
        `&fields=hash,url` +
        `&access_token=${accessToken}`
      )
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      data.data?.forEach((img: any) => {
        imageUrlMap[img.hash] = img.url
      })
      await new Promise(r => setTimeout(r, 300))
    }

    const rows = creativeResults
      .filter((c: any) => adMap[c.id])
      .map((c: any) => {
        let creativeType = 'unknown'
        if (c.video_id) {
          creativeType = 'video'
        } else if (c.asset_feed_spec) {
          creativeType = 'dco'
        } else if (c.image_hash) {
          creativeType = 'static_single'
        }

        const primaryHash =
          c.image_hash ??
          c.asset_feed_spec?.images?.[0]?.hash ??
          null

        const allHashes = c.asset_feed_spec?.images
          ?.map((img: any) => img.hash)
          .filter(Boolean) ?? []

        const headline =
          c.title ??
          c.asset_feed_spec?.titles?.[0]?.text ??
          null

        const primaryText =
          c.body ??
          c.asset_feed_spec?.bodies?.[0]?.text ??
          null

        const description =
          c.object_story_spec?.link_data?.description ??
          c.asset_feed_spec?.descriptions?.[0]?.text ??
          null

        const destinationUrl =
          c.object_story_spec?.link_data?.link ??
          c.asset_feed_spec?.link_urls?.[0]?.website_url ??
          null

        return {
          user_id: userId,
          ad_id: adMap[c.id],
          meta_creative_id: c.id,
          creative_type: creativeType,
          headline,
          primary_text: primaryText,
          description,
          cta_type: c.call_to_action_type ??
            c.asset_feed_spec?.call_to_action_types?.[0] ??
            null,
          destination_url: destinationUrl,
          image_hash: primaryHash,
          image_url: primaryHash ? imageUrlMap[primaryHash] ?? null : null,
          image_hashes: allHashes.length > 0 ? allHashes : null,
          raw_asset_feed_spec: c.asset_feed_spec ?? null,
          raw_object_story_spec: c.object_story_spec ?? null,
          raw_data: c,
          updated_at: new Date().toISOString()
        }
      })

    const { error: upsertError } = await admin
      .from('ad_creatives')
      .upsert(rows, {
        onConflict: 'user_id,meta_creative_id',
        ignoreDuplicates: false
      })

    return new Response(
      JSON.stringify({
        success: !upsertError,
        total_creative_ids: creativeIds.length,
        total_fetched: creativeResults.length,
        total_stored: upsertError ? 0 : rows.length,
        total_hashes_resolved: Object.keys(imageUrlMap).length,
        capped_at: TEST_MAX_RECORDS,
        is_complete: creativeResults.length < TEST_MAX_RECORDS,
        upsert_error: upsertError?.message ?? null,
        sample: rows.slice(0, 3).map(r => ({
          meta_creative_id: r.meta_creative_id,
          creative_type: r.creative_type,
          headline: r.headline,
          image_hash: r.image_hash,
          image_url: r.image_url,
          has_asset_feed_spec: !!r.raw_asset_feed_spec
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
