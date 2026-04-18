ALTER TABLE public.ad_performance_daily
ADD COLUMN IF NOT EXISTS unique_ctr numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS result_type text,
ADD COLUMN IF NOT EXISTS cost_per_purchase numeric DEFAULT 0;

ALTER TABLE public.ads
ADD COLUMN IF NOT EXISTS media_type text;