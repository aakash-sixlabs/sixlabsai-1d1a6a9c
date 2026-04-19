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

    const metaAccountId = adAccount.account_id.startsWith('act_')
      ? adAccount.account_id
      : `act_${adAccount.account_id}`
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

    // Detect media type for every fetched creative and update ads table
    let videoCount = 0
    const nonVideoCreatives: any[] = []

    for (const c of creativeResults) {
      const hasVideoAssets =
        (c.asset_feed_spec?.videos?.length ?? 0) > 0
      const hasImageAssets =
        (c.asset_feed_spec?.images?.length ?? 0) > 0

      // video_id can be at top level OR
      // inside object_story_spec.video_data
      const hasVideoId =
        !!c.video_id ||
        !!c.object_story_spec?.video_data?.video_id

      const mediaType =
        hasVideoId || hasVideoAssets
          ? 'video'
          : hasImageAssets
            ? 'dco'
            : c.image_hash
              ? 'static_single'
              : 'unknown'

      await admin
        .from('ads')
        .update({ media_type: mediaType })
        .eq('meta_creative_id', c.id)
        .eq('user_id', userId)

      if (mediaType === 'video') {
        videoCount++
        continue
      }

      nonVideoCreatives.push({ ...c, _mediaType: mediaType, _hasImageAssets: hasImageAssets })
    }

    // Collect image hashes only from non-video creatives
    const imageHashes: string[] = []
    nonVideoCreatives.forEach((c: any) => {
      if (c.image_hash) imageHashes.push(c.image_hash)
      if (c._hasImageAssets) {
        c.asset_feed_spec.images.forEach((img: any) => {
          if (img.hash) imageHashes.push(img.hash)
        })
      }
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

    async function downloadAndStore(
      imageUrl: string,
      filePath: string
    ): Promise<string | null> {
      try {
        const response = await fetch(imageUrl)
        if (!response.ok) return null
        const blob = await response.blob()
        const contentType =
          response.headers.get('content-type') ?? 'image/jpeg'
        const { error } = await admin.storage
          .from('ad-creatives')
          .upload(filePath, blob, { contentType, upsert: true })
        if (error) {
          console.error('Storage upload failed:', error)
          return null
        }
        const { data } = admin.storage
          .from('ad-creatives')
          .getPublicUrl(filePath)
        return data.publicUrl
      } catch (err) {
        console.error('Download failed:', err)
        return null
      }
    }

    const rows = nonVideoCreatives
      .filter((c: any) => adMap[c.id])
      .map((c: any) => {
        const creativeType = c._mediaType

        const primaryHash =
          c.image_hash ??
          c.asset_feed_spec?.images?.[0]?.hash ??
          null

        const allHashes = c.asset_feed_spec?.images
          ?.map((img: any) => img.hash)
          .filter(Boolean) ?? []

        const allImageUrls = allHashes
          .map((h: string) => imageUrlMap[h])
          .filter(Boolean)

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
          stored_image_urls: allImageUrls.length > 0 ? allImageUrls : null,
          raw_asset_feed_spec: c.asset_feed_spec ?? null,
          raw_object_story_spec: c.object_story_spec ?? null,
          raw_data: c,
          updated_at: new Date().toISOString()
        }
      })

    let imagesDownloaded = 0
    let imagesFailed = 0

    for (const row of rows) {
      if (row.image_url) {
        const filePath = `ads/${row.meta_creative_id}_primary.jpg`
        const storedUrl = await downloadAndStore(row.image_url, filePath)
        if (storedUrl) {
          ;(row as any).stored_image_url = storedUrl
          imagesDownloaded++
        } else {
          imagesFailed++
        }
        await new Promise(r => setTimeout(r, 100))
      }

      if (
        row.image_hashes &&
        Array.isArray(row.image_hashes) &&
        row.image_hashes.length > 0
      ) {
        const storedUrls: string[] = []
        for (let i = 0; i < row.image_hashes.length; i++) {
          const hash = row.image_hashes[i]
          const variantUrl = imageUrlMap[hash]
          if (variantUrl) {
            const filePath = `ads/${row.meta_creative_id}_variant_${i}.jpg`
            const storedUrl = await downloadAndStore(variantUrl, filePath)
            if (storedUrl) storedUrls.push(storedUrl)
            await new Promise(r => setTimeout(r, 100))
          }
        }
        if (storedUrls.length > 0) {
          ;(row as any).stored_image_urls = storedUrls
        }
      }
    }

    const { error: upsertError } = await admin
      .from('ad_creatives')
      .upsert(rows, {
        onConflict: 'user_id,meta_creative_id',
        ignoreDuplicates: false
      })

    const staticStored = rows.filter((r: any) => r.creative_type === 'static_single').length
    const dcoStored = rows.filter((r: any) => r.creative_type === 'dco').length
    const unknownStored = rows.filter((r: any) => r.creative_type === 'unknown').length

    return new Response(
      JSON.stringify({
        success: !upsertError,
        total_creative_ids: creativeIds.length,
        total_fetched: creativeResults.length,
        videos_skipped: videoCount,
        non_video_processed: nonVideoCreatives.length,
        total_stored: upsertError ? 0 : rows.length,
        static_stored: staticStored,
        dco_stored: dcoStored,
        unknown_stored: unknownStored,
        total_hashes_collected: uniqueHashes.length,
        total_hashes_resolved: Object.keys(imageUrlMap).length,
        total_with_image_url: rows.filter((r: any) => r.image_url !== null).length,
        hit_limit: false,
        limit_reason: null,
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
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
