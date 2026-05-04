
ALTER TABLE public.campaigns    DROP CONSTRAINT IF EXISTS campaigns_meta_campaign_id_uq;
ALTER TABLE public.ad_sets      DROP CONSTRAINT IF EXISTS ad_sets_meta_adset_id_uq;
ALTER TABLE public.ads          DROP CONSTRAINT IF EXISTS ads_meta_ad_id_uq;
ALTER TABLE public.ad_creatives DROP CONSTRAINT IF EXISTS ad_creatives_meta_creative_id_uq;

DELETE FROM public.ad_performance_daily WHERE account_id = '555a8ff8-1d60-49d7-8c84-e651de8a2e44';
DELETE FROM public.ad_creatives        WHERE account_id = '555a8ff8-1d60-49d7-8c84-e651de8a2e44';
DELETE FROM public.ads                 WHERE account_id = '555a8ff8-1d60-49d7-8c84-e651de8a2e44';
DELETE FROM public.ad_sets             WHERE account_id = '555a8ff8-1d60-49d7-8c84-e651de8a2e44';
DELETE FROM public.campaigns           WHERE account_id = '555a8ff8-1d60-49d7-8c84-e651de8a2e44';

CREATE UNIQUE INDEX IF NOT EXISTS campaigns_account_meta_uq    ON public.campaigns    (account_id, meta_campaign_id);
CREATE UNIQUE INDEX IF NOT EXISTS ad_sets_account_meta_uq      ON public.ad_sets      (account_id, meta_adset_id);
CREATE UNIQUE INDEX IF NOT EXISTS ads_account_meta_uq          ON public.ads          (account_id, meta_ad_id);
CREATE UNIQUE INDEX IF NOT EXISTS ad_creatives_account_meta_uq ON public.ad_creatives (account_id, meta_creative_id);

UPDATE public.ad_accounts SET onboarding_completed = false
  WHERE user_id = '2d9d9818-d657-48d6-b6df-77f273c9f3b9';
DELETE FROM public.sync_jobs
  WHERE user_id = '2d9d9818-d657-48d6-b6df-77f273c9f3b9';
