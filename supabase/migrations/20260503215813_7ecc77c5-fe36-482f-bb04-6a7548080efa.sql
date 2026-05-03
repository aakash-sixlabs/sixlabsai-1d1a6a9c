-- PostgREST upsert requires unique constraints, not just unique indexes.
-- Drop the unique indexes and recreate as constraints.

ALTER TABLE public.ad_creatives DROP CONSTRAINT IF EXISTS ad_creatives_meta_creative_id_uq;
DROP INDEX IF EXISTS public.ad_creatives_meta_creative_id_uq;
ALTER TABLE public.ad_creatives ADD CONSTRAINT ad_creatives_meta_creative_id_uq UNIQUE (meta_creative_id);

ALTER TABLE public.ad_performance_daily DROP CONSTRAINT IF EXISTS ad_performance_daily_ad_id_date_uq;
DROP INDEX IF EXISTS public.ad_performance_daily_ad_id_date_uq;
ALTER TABLE public.ad_performance_daily ADD CONSTRAINT ad_performance_daily_ad_id_date_uq UNIQUE (ad_id, date);

ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_meta_campaign_id_uq;
DROP INDEX IF EXISTS public.campaigns_meta_campaign_id_uq;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_meta_campaign_id_uq UNIQUE (meta_campaign_id);

ALTER TABLE public.ad_sets DROP CONSTRAINT IF EXISTS ad_sets_meta_adset_id_uq;
DROP INDEX IF EXISTS public.ad_sets_meta_adset_id_uq;
ALTER TABLE public.ad_sets ADD CONSTRAINT ad_sets_meta_adset_id_uq UNIQUE (meta_adset_id);

ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_meta_ad_id_uq;
DROP INDEX IF EXISTS public.ads_meta_ad_id_uq;
ALTER TABLE public.ads ADD CONSTRAINT ads_meta_ad_id_uq UNIQUE (meta_ad_id);
