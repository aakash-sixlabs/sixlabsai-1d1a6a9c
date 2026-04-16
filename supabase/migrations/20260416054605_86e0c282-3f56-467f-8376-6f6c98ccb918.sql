
-- ============================================================
-- 1. brands
-- ============================================================
CREATE TABLE public.brands (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  name text,
  meta_ad_account_id text,
  meta_access_token text,
  currency text DEFAULT 'USD',
  timezone text,
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own brands" ON public.brands FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.owns_brand(_brand_id bigint)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.brands WHERE id = _brand_id AND user_id = auth.uid());
$$;

-- ============================================================
-- 2. prod_ads
-- ============================================================
CREATE TABLE public.prod_ads (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  brand_id bigint,
  meta_ad_id text,
  meta_campaign_id text,
  meta_adset_id text,
  ad_name text,
  status text,
  format text,
  thumbnail_url text,
  CONSTRAINT prod_ads_pkey PRIMARY KEY (id),
  CONSTRAINT prod_ads_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE
);
ALTER TABLE public.prod_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own prod_ads" ON public.prod_ads FOR ALL TO authenticated
  USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));

CREATE OR REPLACE FUNCTION public.owns_prod_ad(_ad_id bigint)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.prod_ads a JOIN public.brands b ON b.id = a.brand_id WHERE a.id = _ad_id AND b.user_id = auth.uid());
$$;

-- ============================================================
-- 3. ad_performance_daily
-- ============================================================
CREATE TABLE public.ad_performance_daily (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  ad_id bigint,
  date date,
  impressions bigint,
  clicks bigint,
  spend double precision,
  ctr double precision,
  frequency double precision,
  roas double precision,
  creative_id bigint,
  CONSTRAINT ad_performance_daily_pkey PRIMARY KEY (id),
  CONSTRAINT ad_performance_daily_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.prod_ads(id) ON DELETE CASCADE
);
ALTER TABLE public.ad_performance_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ad_performance_daily" ON public.ad_performance_daily FOR ALL TO authenticated
  USING (public.owns_prod_ad(ad_id)) WITH CHECK (public.owns_prod_ad(ad_id));

-- ============================================================
-- 4. campaign_ad_data
-- ============================================================
CREATE TABLE public.campaign_ad_data (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  brand_id bigint,
  meta_campaign_id text,
  campaign_name text,
  campaign_status text,
  objective text,
  meta_adset_id text,
  adset_name text,
  adset_status text,
  daily_budget double precision,
  lifetime_budget double precision,
  targeting jsonb,
  meta_ad_id text,
  ad_name text,
  ad_status text,
  creative_id bigint,
  date date,
  impressions bigint,
  clicks bigint,
  spend double precision,
  ctr double precision,
  cpc double precision,
  cpm double precision,
  roas double precision,
  conversions bigint,
  conversion_value double precision,
  CONSTRAINT campaign_ad_data_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_ad_data_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE
);
ALTER TABLE public.campaign_ad_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own campaign_ad_data" ON public.campaign_ad_data FOR ALL TO authenticated
  USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));

-- ============================================================
-- 5. creatives
-- ============================================================
CREATE TABLE public.creatives (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  brand_id bigint,
  ad_id bigint,
  creative_type text,
  headline text,
  primary_text text,
  call_to_action text,
  image_urls text,
  video_url text,
  destination_url text,
  CONSTRAINT creatives_pkey PRIMARY KEY (id),
  CONSTRAINT creatives_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE,
  CONSTRAINT creatives_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.prod_ads(id) ON DELETE CASCADE
);
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own creatives" ON public.creatives FOR ALL TO authenticated
  USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));

CREATE OR REPLACE FUNCTION public.owns_creative(_creative_id bigint)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.creatives c JOIN public.brands b ON b.id = c.brand_id WHERE c.id = _creative_id AND b.user_id = auth.uid());
$$;

-- ============================================================
-- 6. creative_tags
-- ============================================================
CREATE TABLE public.creative_tags (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  creative_id bigint,
  tag_name text,
  tag_source text,
  confidence double precision,
  CONSTRAINT creative_tags_pkey PRIMARY KEY (id),
  CONSTRAINT creative_tags_creative_id_fkey FOREIGN KEY (creative_id) REFERENCES public.creatives(id) ON DELETE CASCADE
);
ALTER TABLE public.creative_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own creative_tags" ON public.creative_tags FOR ALL TO authenticated
  USING (public.owns_creative(creative_id)) WITH CHECK (public.owns_creative(creative_id));

-- ============================================================
-- 7. products
-- ============================================================
CREATE TABLE public.products (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  brand_id bigint,
  shopify_id bigint,
  title text,
  description text,
  image_urls text,
  handle text,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own products" ON public.products FOR ALL TO authenticated
  USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));

-- ============================================================
-- 8. competitor_ads
-- ============================================================
CREATE TABLE public.competitor_ads (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  brand_id bigint,
  competitor_page_id text,
  competitor_page_name text,
  ad_archive_id text,
  started_running date,
  stopped_running date,
  spend_lower double precision,
  spend_upper double precision,
  impressions_lower bigint,
  impressions_upper bigint,
  media_url text,
  media_type text,
  ad_text text,
  detected_tags text,
  platform text,
  CONSTRAINT competitor_ads_pkey PRIMARY KEY (id),
  CONSTRAINT competitor_ads_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE
);
ALTER TABLE public.competitor_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own competitor_ads" ON public.competitor_ads FOR ALL TO authenticated
  USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));

-- ============================================================
-- 9. brand_competitors
-- ============================================================
CREATE TABLE public.brand_competitors (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  brand_id bigint,
  competitor_page_id text,
  competitor_name text,
  CONSTRAINT brand_competitors_pkey PRIMARY KEY (id),
  CONSTRAINT brand_competitors_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE
);
ALTER TABLE public.brand_competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own brand_competitors" ON public.brand_competitors FOR ALL TO authenticated
  USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));

-- ============================================================
-- 10. fatigue_diagnoses
-- ============================================================
CREATE TABLE public.fatigue_diagnoses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  ad_id bigint,
  brand_id bigint,
  diagnosis_date date,
  fatigue_score double precision,
  fatigue_stage text,
  days_running integer,
  frequency_current double precision,
  recommended_action text,
  replacement_creative_id bigint,
  adset_id text,
  ctr_trend_7d double precision,
  est_daily_waste double precision,
  current_visual_tags text,
  platform text,
  CONSTRAINT fatigue_diagnoses_pkey PRIMARY KEY (id),
  CONSTRAINT fatigue_diagnoses_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE,
  CONSTRAINT fatigue_diagnoses_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.prod_ads(id) ON DELETE CASCADE
);
ALTER TABLE public.fatigue_diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own fatigue_diagnoses" ON public.fatigue_diagnoses FOR ALL TO authenticated
  USING (public.owns_brand(brand_id)) WITH CHECK (public.owns_brand(brand_id));

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_prod_ads_brand_id ON public.prod_ads(brand_id);
CREATE INDEX idx_prod_ads_meta_ad_id ON public.prod_ads(meta_ad_id);
CREATE INDEX idx_ad_perf_daily_ad_date ON public.ad_performance_daily(ad_id, date);
CREATE INDEX idx_campaign_ad_data_brand_date ON public.campaign_ad_data(brand_id, date);
CREATE INDEX idx_creatives_brand_id ON public.creatives(brand_id);
CREATE INDEX idx_creatives_ad_id ON public.creatives(ad_id);
CREATE INDEX idx_creative_tags_creative_id ON public.creative_tags(creative_id);
CREATE INDEX idx_fatigue_diagnoses_ad_id ON public.fatigue_diagnoses(ad_id);
