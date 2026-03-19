
-- Add unique constraints needed for upserts
ALTER TABLE public.meta_connections ADD CONSTRAINT meta_connections_user_id_key UNIQUE (user_id);
ALTER TABLE public.ad_accounts ADD CONSTRAINT ad_accounts_account_id_key UNIQUE (account_id);
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_campaign_id_key UNIQUE (campaign_id);
ALTER TABLE public.ad_sets ADD CONSTRAINT ad_sets_adset_id_key UNIQUE (adset_id);
ALTER TABLE public.ads ADD CONSTRAINT ads_ad_id_key UNIQUE (ad_id);
ALTER TABLE public.ad_creatives ADD CONSTRAINT ad_creatives_creative_id_key UNIQUE (creative_id);
ALTER TABLE public.ad_insights ADD CONSTRAINT ad_insights_ad_id_key UNIQUE (ad_id);
