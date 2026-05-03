
-- Dedupe (keep most recently updated)
DELETE FROM public.ad_creatives a USING public.ad_creatives b
  WHERE a.meta_creative_id = b.meta_creative_id AND a.updated_at < b.updated_at;
DELETE FROM public.ads a USING public.ads b
  WHERE a.meta_ad_id = b.meta_ad_id AND a.updated_at < b.updated_at;
DELETE FROM public.ad_sets a USING public.ad_sets b
  WHERE a.meta_adset_id = b.meta_adset_id AND a.updated_at < b.updated_at;
DELETE FROM public.campaigns a USING public.campaigns b
  WHERE a.meta_campaign_id = b.meta_campaign_id AND a.updated_at < b.updated_at;

-- Drop old composite unique constraints
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_ad_account_id_meta_campaign_id_key;
ALTER TABLE public.ad_sets DROP CONSTRAINT IF EXISTS ad_sets_campaign_id_meta_adset_id_key;
ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_ad_set_id_meta_ad_id_key;
ALTER TABLE public.ad_creatives DROP CONSTRAINT IF EXISTS ad_creatives_ad_id_meta_creative_id_key;

-- Single-column unique on the Meta id
CREATE UNIQUE INDEX IF NOT EXISTS campaigns_meta_campaign_id_uq ON public.campaigns (meta_campaign_id);
CREATE UNIQUE INDEX IF NOT EXISTS ad_sets_meta_adset_id_uq ON public.ad_sets (meta_adset_id);
CREATE UNIQUE INDEX IF NOT EXISTS ads_meta_ad_id_uq ON public.ads (meta_ad_id);
CREATE UNIQUE INDEX IF NOT EXISTS ad_creatives_meta_creative_id_uq ON public.ad_creatives (meta_creative_id);

-- Generated creatives: one row per (job, variant)
CREATE UNIQUE INDEX IF NOT EXISTS generated_creatives_job_variant_uq ON public.generated_creatives (job_id, variant_index);
