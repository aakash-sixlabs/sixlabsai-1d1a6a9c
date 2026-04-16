
-- Drop existing production tables (no data, just created)
DROP TABLE IF EXISTS public.fatigue_diagnoses CASCADE;
DROP TABLE IF EXISTS public.creative_tags CASCADE;
DROP TABLE IF EXISTS public.competitor_ads CASCADE;
DROP TABLE IF EXISTS public.brand_competitors CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.ad_performance_daily CASCADE;
DROP TABLE IF EXISTS public.campaign_ad_data CASCADE;
DROP TABLE IF EXISTS public.creatives CASCADE;
DROP TABLE IF EXISTS public.prod_ads CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;

-- Drop old helper functions
DROP FUNCTION IF EXISTS public.owns_brand(bigint);
DROP FUNCTION IF EXISTS public.owns_prod_ad(bigint);
DROP FUNCTION IF EXISTS public.owns_creative(bigint);

-- 1. brands
CREATE TABLE public.brands (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  meta_account_id text,
  meta_access_token text,
  category text,
  target_regions text,
  target_languages text,
  account_timezone text,
  account_currency text,
  user_id uuid NOT NULL,
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);

-- 2. prod_ads (maps to production "ads")
CREATE TABLE public.prod_ads (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  brand_id bigint,
  meta_ad_id text,
  name text,
  status text,
  creative_url text,
  adset_id text,
  creative_id bigint,
  parent_ad_id bigint,
  CONSTRAINT prod_ads_pkey PRIMARY KEY (id),
  CONSTRAINT prod_ads_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);

-- 3. creatives
CREATE TABLE public.creatives (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  brand_id bigint,
  image_url text,
  copy_headline text,
  copy_body text,
  copy_cta text,
  source text,
  parent_creative_id bigint,
  platform text,
  CONSTRAINT creatives_pkey PRIMARY KEY (id),
  CONSTRAINT creatives_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);

-- 4. ad_performance_daily
CREATE TABLE public.ad_performance_daily (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  ad_id bigint,
  date date,
  impressions bigint,
  clicks bigint,
  spend double precision,
  ctr double precision,
  frequency double precision,
  roas double precision,
  creative_id bigint,
  platform text,
  platform_position text,
  CONSTRAINT ad_performance_daily_pkey PRIMARY KEY (id),
  CONSTRAINT ad_performance_daily_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.prod_ads(id)
);

-- 5. campaign_ad_data
CREATE TABLE public.campaign_ad_data (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  brand_id bigint,
  campaign_id text,
  campaign_name text,
  campaign_status text,
  adset_id text,
  adset_name text,
  adset_status text,
  ad_id text,
  ad_name text,
  ad_status text,
  creative_id text,
  creative_title text,
  creative_body text,
  creative_image_url text,
  creative_thumbnail_url text,
  call_to_action text,
  date date,
  impressions bigint,
  clicks bigint,
  spend double precision,
  reach bigint,
  ctr double precision,
  cpc double precision,
  cpm double precision,
  frequency double precision,
  roas double precision,
  purchases bigint,
  fatigue_severity text,
  is_fatigued boolean,
  platform text,
  platform_position text,
  target_countries text,
  target_languages text,
  CONSTRAINT campaign_ad_data_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_ad_data_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);

-- 6. creative_tags
CREATE TABLE public.creative_tags (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  ad_id bigint,
  brand_id bigint,
  tags text,
  CONSTRAINT creative_tags_pkey PRIMARY KEY (id)
);

-- 7. products
CREATE TABLE public.products (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  brand_id bigint,
  shopify_id bigint,
  title text,
  description text,
  image_urls text,
  handle text,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);

-- 8. brand_competitors
CREATE TABLE public.brand_competitors (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  brand_id bigint,
  competitor_name text,
  competitor_meta_page_id text,
  competitor_meta_page_name text,
  foreplay_brand_id text,
  CONSTRAINT brand_competitors_pkey PRIMARY KEY (id),
  CONSTRAINT brand_competitors_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);

-- 9. competitor_ads
CREATE TABLE public.competitor_ads (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  brand_id bigint,
  competitor_brand_name text,
  meta_ad_id text,
  image_url text,
  copy_headline text,
  copy_body text,
  first_seen_date date,
  last_seen_date date,
  days_running bigint,
  est_monthly_spend double precision,
  is_active boolean,
  platform text,
  display_format text,
  emotional_drivers text,
  niches text,
  product_category text,
  cta_type text,
  cta_title text,
  video_url text,
  thumbnail_url text,
  full_transcription text,
  foreplay_ad_id text UNIQUE,
  foreplay_brand_id text,
  link_url text,
  source text,
  CONSTRAINT competitor_ads_pkey PRIMARY KEY (id),
  CONSTRAINT competitor_ads_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);

-- 10. fatigue_diagnoses
CREATE TABLE public.fatigue_diagnoses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  ad_id bigint,
  brand_id bigint,
  severity text,
  fatigued_component text,
  preserve_tags text,
  replace_tags text,
  is_actioned boolean,
  creative_id bigint,
  adset_id text,
  ctr_trend_7d double precision,
  est_daily_waste double precision,
  current_visual_tags text,
  platform text,
  CONSTRAINT fatigue_diagnoses_pkey PRIMARY KEY (id),
  CONSTRAINT fatigue_diagnoses_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.prod_ads(id),
  CONSTRAINT fatigue_diagnoses_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);

-- Enable RLS on all tables
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_performance_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_ad_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatigue_diagnoses ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.owns_brand(_brand_id bigint)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.brands WHERE id = _brand_id AND user_id = auth.uid()); $$;

CREATE OR REPLACE FUNCTION public.owns_prod_ad(_ad_id bigint)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.prod_ads a JOIN public.brands b ON b.id = a.brand_id WHERE a.id = _ad_id AND b.user_id = auth.uid()); $$;

CREATE OR REPLACE FUNCTION public.owns_creative(_creative_id bigint)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.creatives c JOIN public.brands b ON b.id = c.brand_id WHERE c.id = _creative_id AND b.user_id = auth.uid()); $$;

-- RLS policies
CREATE POLICY "Users can manage own brands" ON public.brands FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own prod_ads" ON public.prod_ads FOR ALL TO authenticated USING (owns_brand(brand_id)) WITH CHECK (owns_brand(brand_id));
CREATE POLICY "Users can manage own creatives" ON public.creatives FOR ALL TO authenticated USING (owns_brand(brand_id)) WITH CHECK (owns_brand(brand_id));
CREATE POLICY "Users can manage own ad_performance_daily" ON public.ad_performance_daily FOR ALL TO authenticated USING (owns_prod_ad(ad_id)) WITH CHECK (owns_prod_ad(ad_id));
CREATE POLICY "Users can manage own campaign_ad_data" ON public.campaign_ad_data FOR ALL TO authenticated USING (owns_brand(brand_id)) WITH CHECK (owns_brand(brand_id));
CREATE POLICY "Users can manage own creative_tags" ON public.creative_tags FOR ALL TO authenticated USING (owns_brand(brand_id)) WITH CHECK (owns_brand(brand_id));
CREATE POLICY "Users can manage own products" ON public.products FOR ALL TO authenticated USING (owns_brand(brand_id)) WITH CHECK (owns_brand(brand_id));
CREATE POLICY "Users can manage own brand_competitors" ON public.brand_competitors FOR ALL TO authenticated USING (owns_brand(brand_id)) WITH CHECK (owns_brand(brand_id));
CREATE POLICY "Users can manage own competitor_ads" ON public.competitor_ads FOR ALL TO authenticated USING (owns_brand(brand_id)) WITH CHECK (owns_brand(brand_id));
CREATE POLICY "Users can manage own fatigue_diagnoses" ON public.fatigue_diagnoses FOR ALL TO authenticated USING (owns_brand(brand_id)) WITH CHECK (owns_brand(brand_id));
