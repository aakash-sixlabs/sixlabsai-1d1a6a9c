
-- ============================================================================
-- STEP 1: Drop redundant tables
-- ============================================================================
DROP TABLE IF EXISTS public.campaign_ad_data CASCADE;
DROP TABLE IF EXISTS public.ad_performance_daily CASCADE;
DROP TABLE IF EXISTS public.ad_insights CASCADE;
DROP TABLE IF EXISTS public.ad_creatives CASCADE;
DROP TABLE IF EXISTS public.ads CASCADE;
DROP TABLE IF EXISTS public.ad_sets CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.prod_ads CASCADE;
DROP TABLE IF EXISTS public.creatives CASCADE;

-- Drop legacy helper functions tied to dropped tables
DROP FUNCTION IF EXISTS public.owns_prod_ad(bigint);

-- ============================================================================
-- STEP 2: Recreate campaigns
-- ============================================================================
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_account_id uuid NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  meta_campaign_id text NOT NULL,
  name text,
  status text,
  effective_status text,
  objective text,
  daily_budget numeric,
  lifetime_budget numeric,
  start_time timestamptz,
  stop_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, meta_campaign_id)
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own campaigns" ON public.campaigns
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 3: Recreate ad_sets
-- ============================================================================
CREATE TABLE public.ad_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  meta_adset_id text NOT NULL,
  name text,
  status text,
  effective_status text,
  daily_budget numeric,
  lifetime_budget numeric,
  optimization_goal text,
  billing_event text,
  targeting jsonb,
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, meta_adset_id)
);

ALTER TABLE public.ad_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ad sets" ON public.ad_sets
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: Recreate ads
-- ============================================================================
CREATE TABLE public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_set_id uuid NOT NULL REFERENCES public.ad_sets(id) ON DELETE CASCADE,
  meta_ad_id text NOT NULL,
  name text,
  status text,
  effective_status text,
  meta_creative_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, meta_ad_id)
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ads" ON public.ads
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 5: Recreate ad_creatives
-- ============================================================================
CREATE TABLE public.ad_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  meta_creative_id text NOT NULL,
  creative_type text,
  headline text,
  primary_text text,
  description text,
  cta_type text,
  destination_url text,
  image_hash text,
  image_url text,
  stored_image_url text,
  image_hashes jsonb,
  stored_image_urls jsonb,
  raw_asset_feed_spec jsonb,
  raw_object_story_spec jsonb,
  raw_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, meta_creative_id)
);

ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ad creatives" ON public.ad_creatives
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: Recreate ad_performance_daily
-- ============================================================================
CREATE TABLE public.ad_performance_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  spend numeric DEFAULT 0,
  reach bigint DEFAULT 0,
  ctr numeric DEFAULT 0,
  cpc numeric DEFAULT 0,
  cpm numeric DEFAULT 0,
  frequency numeric DEFAULT 0,
  purchases int DEFAULT 0,
  revenue numeric DEFAULT 0,
  roas numeric DEFAULT 0,
  platform text,
  platform_position text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, ad_id, date)
);

ALTER TABLE public.ad_performance_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own performance" ON public.ad_performance_daily
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 7: Materialized view campaign_ad_data
-- ============================================================================
CREATE MATERIALIZED VIEW public.campaign_ad_data AS
SELECT
  b.id                          AS brand_id,
  p.date,
  c.meta_campaign_id            AS campaign_id,
  c.name                        AS campaign_name,
  c.status                      AS campaign_status,
  c.objective                   AS campaign_objective,
  s.meta_adset_id               AS adset_id,
  s.name                        AS adset_name,
  s.status                      AS adset_status,
  a.meta_ad_id                  AS ad_id,
  a.name                        AS ad_name,
  a.status                      AS ad_status,
  a.effective_status            AS ad_effective_status,
  ac.meta_creative_id           AS creative_id,
  ac.creative_type,
  ac.headline,
  ac.primary_text,
  ac.description,
  ac.cta_type,
  ac.destination_url,
  ac.stored_image_url           AS image_url,
  ac.stored_image_urls          AS image_urls,
  p.impressions,
  p.clicks,
  p.spend,
  p.reach,
  p.ctr,
  p.cpc,
  p.cpm,
  p.frequency,
  p.purchases,
  p.revenue,
  p.roas,
  p.platform,
  p.platform_position
FROM public.ad_performance_daily p
JOIN public.ads a            ON a.id = p.ad_id
JOIN public.ad_creatives ac  ON ac.ad_id = a.id
JOIN public.ad_sets s        ON s.id = a.ad_set_id
JOIN public.campaigns c      ON c.id = s.campaign_id
JOIN public.ad_accounts aa   ON aa.id = c.ad_account_id
JOIN public.brands b         ON b.meta_account_id = aa.account_id
WHERE p.user_id = a.user_id;

CREATE UNIQUE INDEX campaign_ad_data_unique_idx
  ON public.campaign_ad_data (brand_id, ad_id, date);

-- ============================================================================
-- STEP 8: Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_user        ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_account     ON public.campaigns(ad_account_id);
CREATE INDEX IF NOT EXISTS idx_ad_sets_user          ON public.ad_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_sets_campaign      ON public.ad_sets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ads_user              ON public.ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_adset             ON public.ads(ad_set_id);
CREATE INDEX IF NOT EXISTS idx_ads_meta_id           ON public.ads(meta_ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_user     ON public.ad_creatives(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_ad       ON public.ad_creatives(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_meta_id  ON public.ad_creatives(meta_creative_id);
CREATE INDEX IF NOT EXISTS idx_performance_user      ON public.ad_performance_daily(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_ad        ON public.ad_performance_daily(ad_id);
CREATE INDEX IF NOT EXISTS idx_performance_date      ON public.ad_performance_daily(date);

-- ============================================================================
-- STEP 9: sync_jobs counters
-- ============================================================================
ALTER TABLE public.sync_jobs
  ADD COLUMN IF NOT EXISTS total_campaigns int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_adsets int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_creatives int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_images int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS images_downloaded int DEFAULT 0;
