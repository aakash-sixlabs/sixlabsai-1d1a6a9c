
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_account_id_fkey;
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_ad_account_id_fkey;
ALTER TABLE public.ad_sets DROP CONSTRAINT IF EXISTS ad_sets_account_id_fkey;
ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_account_id_fkey;
ALTER TABLE public.ad_creatives DROP CONSTRAINT IF EXISTS ad_creatives_account_id_fkey;
ALTER TABLE public.ad_performance_daily DROP CONSTRAINT IF EXISTS ad_performance_daily_account_id_fkey;
