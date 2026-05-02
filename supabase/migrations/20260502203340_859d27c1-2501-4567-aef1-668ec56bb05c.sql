
-- ============================================================
-- 1. TEAR DOWN MIRROR PLUMBING
-- ============================================================
DROP FUNCTION IF EXISTS public.mirror_to_secondary() CASCADE;

-- ============================================================
-- 2. DROP EXISTING TABLES (CASCADE)
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS public.campaign_ad_data CASCADE;
DROP FUNCTION IF EXISTS public.refresh_campaign_ad_data() CASCADE;
DROP FUNCTION IF EXISTS public.owns_brand(bigint) CASCADE;

DROP TABLE IF EXISTS public.ad_account_profiles CASCADE;
DROP TABLE IF EXISTS public.ad_performance_daily CASCADE;
DROP TABLE IF EXISTS public.ad_creatives CASCADE;
DROP TABLE IF EXISTS public.ads CASCADE;
DROP TABLE IF EXISTS public.ad_sets CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.ad_accounts CASCADE;
DROP TABLE IF EXISTS public.meta_connections CASCADE;
DROP TABLE IF EXISTS public.disclaimers CASCADE;
DROP TABLE IF EXISTS public.icps CASCADE;
DROP TABLE IF EXISTS public.generated_creatives CASCADE;
DROP TABLE IF EXISTS public.generation_jobs CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.sync_jobs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================================
-- 3. ENUMS
-- ============================================================
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.fatigue_severity CASCADE;
DROP TYPE IF EXISTS public.fatigue_component CASCADE;
DROP TYPE IF EXISTS public.fatigue_status CASCADE;
DROP TYPE IF EXISTS public.brand_kit_status CASCADE;
DROP TYPE IF EXISTS public.generation_trigger_type CASCADE;
DROP TYPE IF EXISTS public.generation_status CASCADE;
DROP TYPE IF EXISTS public.creative_status CASCADE;
DROP TYPE IF EXISTS public.creative_source CASCADE;
DROP TYPE IF EXISTS public.sync_status CASCADE;

CREATE TYPE public.user_role AS ENUM ('superadmin', 'account_admin', 'account_member');
CREATE TYPE public.fatigue_severity AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.fatigue_component AS ENUM ('creative_visual', 'copy', 'audience', 'offer');
CREATE TYPE public.fatigue_status AS ENUM ('pending', 'generating', 'generated', 'dismissed');
CREATE TYPE public.brand_kit_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.generation_trigger_type AS ENUM ('manual', 'automated');
CREATE TYPE public.generation_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.creative_status AS ENUM ('draft', 'approved', 'published', 'rejected', 'archived');
CREATE TYPE public.creative_source AS ENUM ('own_ad', 'competitor_ad', 'generated');
CREATE TYPE public.sync_status AS ENUM ('pending', 'running', 'completed', 'failed');

-- ============================================================
-- 4. CORE TABLES (no FK cycles)
-- ============================================================

CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  account_type text,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  full_name text,
  email text,
  avatar_url text,
  meta_user_id text,
  default_ad_account_id uuid,
  is_superadmin boolean NOT NULL DEFAULT false
);

CREATE TABLE public.account_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.user_role NOT NULL DEFAULT 'account_member',
  UNIQUE (account_id, user_id)
);

CREATE TABLE public.meta_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  meta_user_id text,
  meta_user_name text,
  token_expires_at timestamptz
);

CREATE TABLE public.ad_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  connection_id uuid NOT NULL REFERENCES public.meta_connections(id) ON DELETE CASCADE,
  account_id_meta text NOT NULL,
  account_name text NOT NULL,
  currency text,
  timezone text,
  connection_status text NOT NULL DEFAULT 'pending',
  UNIQUE (user_id, account_id_meta)
);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_default_ad_account_fk
  FOREIGN KEY (default_ad_account_id) REFERENCES public.ad_accounts(id) ON DELETE SET NULL;

CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  ad_account_id uuid REFERENCES public.ad_accounts(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text,
  target_regions text,
  target_languages text
);

CREATE TABLE public.ad_account_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  ad_account_id uuid NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  brand_name text,
  industry text,
  tagline text,
  tone_of_voice text,
  logo_url text,
  website_url text,
  facebook_page_id text,
  facebook_page_name text,
  primary_color text,
  secondary_color text,
  accent_color text,
  font_family text,
  product_categories text[] DEFAULT '{}',
  brand_kit jsonb DEFAULT '{}'::jsonb,
  brand_kit_status public.brand_kit_status DEFAULT 'pending',
  brand_kit_updated_at timestamptz,
  confirmed boolean NOT NULL DEFAULT false,
  UNIQUE (user_id, ad_account_id)
);

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  ad_account_id uuid NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  meta_campaign_id text NOT NULL,
  name text,
  objective text,
  status text,
  effective_status text,
  daily_budget numeric,
  lifetime_budget numeric,
  start_time timestamptz,
  stop_time timestamptz,
  UNIQUE (ad_account_id, meta_campaign_id)
);

CREATE TABLE public.ad_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  meta_adset_id text NOT NULL,
  name text,
  status text,
  effective_status text,
  optimization_goal text,
  billing_event text,
  daily_budget numeric,
  lifetime_budget numeric,
  targeting jsonb,
  start_time timestamptz,
  end_time timestamptz,
  UNIQUE (campaign_id, meta_adset_id)
);

CREATE TABLE public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  ad_set_id uuid NOT NULL REFERENCES public.ad_sets(id) ON DELETE CASCADE,
  meta_ad_id text NOT NULL,
  meta_creative_id text,
  name text,
  status text,
  effective_status text,
  media_type text,
  parent_ad_id uuid REFERENCES public.ads(id) ON DELETE SET NULL,
  UNIQUE (ad_set_id, meta_ad_id)
);

CREATE TABLE public.ad_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  meta_creative_id text NOT NULL,
  creative_type text,
  headline text,
  primary_text text,
  description text,
  cta_type text,
  destination_url text,
  image_url text,
  image_hash text,
  image_hashes jsonb,
  stored_image_url text,
  stored_image_urls jsonb,
  thumbnail_url text,
  raw_object_story_spec jsonb,
  raw_asset_feed_spec jsonb,
  raw_data jsonb,
  UNIQUE (ad_id, meta_creative_id)
);

CREATE TABLE public.ad_performance_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  reach bigint DEFAULT 0,
  spend numeric DEFAULT 0,
  ctr numeric DEFAULT 0,
  unique_ctr numeric DEFAULT 0,
  cpc numeric DEFAULT 0,
  cpm numeric DEFAULT 0,
  frequency numeric DEFAULT 0,
  roas numeric DEFAULT 0,
  purchases bigint DEFAULT 0,
  revenue numeric DEFAULT 0,
  cost_per_purchase numeric DEFAULT 0,
  result_type text,
  platform text,
  platform_position text,
  thumb_stop_rate numeric
);
CREATE INDEX idx_perf_ad_date ON public.ad_performance_daily(ad_id, date);
CREATE INDEX idx_perf_account_date ON public.ad_performance_daily(account_id, date);

CREATE TABLE public.fatigue_diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  adset_id uuid REFERENCES public.ad_sets(id) ON DELETE SET NULL,
  severity public.fatigue_severity NOT NULL,
  component public.fatigue_component NOT NULL,
  status public.fatigue_status NOT NULL DEFAULT 'pending',
  ctr_7d_slope numeric,
  frequency_value numeric,
  roas_7d_slope numeric,
  ctr_drop_pct numeric,
  roas_drop_pct numeric,
  est_daily_waste numeric,
  preserve_tags text,
  replace_tags text,
  current_visual_tags text,
  diagnosed_at timestamptz NOT NULL DEFAULT now(),
  dismissed_at timestamptz,
  dismissed_by uuid,
  notes text
);

CREATE TABLE public.brand_competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  competitor_name text,
  competitor_meta_page_id text,
  competitor_meta_page_name text,
  foreplay_brand_id text,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE public.competitor_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  brand_competitor_id uuid REFERENCES public.brand_competitors(id) ON DELETE SET NULL,
  foreplay_ad_id text,
  foreplay_brand_id text,
  competitor_brand_name text,
  meta_ad_id text,
  platform text,
  display_format text,
  image_url text,
  video_url text,
  thumbnail_url text,
  copy_headline text,
  copy_body text,
  full_transcription text,
  cta_type text,
  cta_title text,
  emotional_drivers text,
  niches text,
  product_category text,
  est_monthly_spend numeric,
  first_seen_date date,
  last_seen_date date,
  days_running integer,
  is_active boolean
);

CREATE TABLE public.icps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  ad_account_id uuid NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE public.disclaimers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  ad_account_id uuid NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  label text NOT NULL,
  text text NOT NULL
);

CREATE TABLE public.scene_archetypes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer
);

CREATE TABLE public.brand_archetypes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  archetype_id uuid NOT NULL REFERENCES public.scene_archetypes(id) ON DELETE CASCADE,
  ad_type text,
  is_permitted boolean NOT NULL DEFAULT true
);

CREATE TABLE public.prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  template_text text NOT NULL,
  model text,
  use_case text,
  parameters jsonb,
  notes text
);

CREATE TABLE public.generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  ad_account_id uuid REFERENCES public.ad_accounts(id) ON DELETE SET NULL,
  trigger_type public.generation_trigger_type NOT NULL DEFAULT 'manual',
  source_ad_id uuid REFERENCES public.ads(id) ON DELETE SET NULL,
  fatigue_diagnosis_id uuid REFERENCES public.fatigue_diagnoses(id) ON DELETE SET NULL,
  status public.generation_status NOT NULL DEFAULT 'pending',
  goal text,
  aspect_ratios text[] NOT NULL DEFAULT '{}',
  promo_scope text,
  promo_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  product_input_method text,
  product_url text,
  product_image_url text,
  icp_id uuid REFERENCES public.icps(id) ON DELETE SET NULL,
  icp_snapshot jsonb,
  disclaimer_ids text[] DEFAULT '{}',
  offer_type text,
  service_request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  service_response_payload jsonb,
  error_message text,
  -- Operational fields kept from prior schema for edge functions
  service_job_id text,
  callback_received_at timestamptz,
  attempt_count integer DEFAULT 0,
  credits_used integer DEFAULT 0
);

CREATE TABLE public.generated_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES public.generation_jobs(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  parent_ad_id uuid REFERENCES public.ads(id) ON DELETE SET NULL,
  fatigue_diagnosis_id uuid REFERENCES public.fatigue_diagnoses(id) ON DELETE SET NULL,
  variant_index integer NOT NULL DEFAULT 0,
  image_url text NOT NULL,
  thumbnail_url text,
  stored_image_url text,
  stored_thumbnail_url text,
  storage_status text DEFAULT 'pending',
  aspect_ratio text,
  headline text,
  primary_text text,
  description text,
  status public.creative_status NOT NULL DEFAULT 'draft',
  approved_by uuid,
  approved_at timestamptz,
  rejected_by uuid,
  rejected_at timestamptz,
  rejection_reason text,
  published_meta_ad_id text,
  published_at timestamptz,
  published_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  prompt_template_id uuid REFERENCES public.prompt_templates(id) ON DELETE SET NULL,
  feedback text
);
CREATE INDEX idx_gencreatives_job ON public.generated_creatives(job_id);

CREATE TABLE public.prompt_template_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  prompt_template_id uuid NOT NULL REFERENCES public.prompt_templates(id) ON DELETE CASCADE,
  generated_creative_id uuid NOT NULL REFERENCES public.generated_creatives(id) ON DELETE CASCADE,
  ctr_7d numeric,
  roas_7d numeric,
  ctr_vs_parent numeric,
  roas_vs_parent numeric,
  spend_7d numeric,
  purchases_7d integer,
  is_winner boolean
);

CREATE TABLE public.creative_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  creative_source public.creative_source NOT NULL,
  creative_id uuid NOT NULL,
  tag_category text NOT NULL,
  tag_value text NOT NULL,
  confidence numeric,
  is_ai_generated boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false
);
CREATE INDEX idx_tags_creative ON public.creative_tags(creative_source, creative_id);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  shopify_id bigint,
  title text,
  description text,
  handle text,
  image_urls jsonb
);

CREATE TABLE public.sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  ad_account_id uuid NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  status public.sync_status NOT NULL DEFAULT 'pending',
  phase text,
  current_step text,
  cursor_date date,
  date_range_start date,
  date_range_end date,
  total_campaigns integer DEFAULT 0,
  total_adsets integer DEFAULT 0,
  total_ads integer DEFAULT 0,
  total_creatives integer DEFAULT 0,
  total_images integer DEFAULT 0,
  images_downloaded integer DEFAULT 0,
  supported_ads integer DEFAULT 0,
  unsupported_ads integer DEFAULT 0,
  error_message text
);

-- ============================================================
-- 5. SECURITY DEFINER HELPERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_superadmin FROM public.profiles WHERE id = _user_id), false);
$$;

CREATE OR REPLACE FUNCTION public.user_account_ids(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT account_id FROM public.account_users WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.has_account_access(_user_id uuid, _account_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_superadmin(_user_id)
      OR EXISTS (SELECT 1 FROM public.account_users WHERE user_id = _user_id AND account_id = _account_id);
$$;

-- ============================================================
-- 6. UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'accounts','profiles','meta_connections','ad_accounts','brands','ad_account_profiles',
    'campaigns','ad_sets','ads','ad_creatives','ad_performance_daily','fatigue_diagnoses',
    'brand_competitors','competitor_ads','icps','disclaimers','scene_archetypes',
    'brand_archetypes','prompt_templates','generation_jobs','generated_creatives',
    'prompt_template_performance','products','sync_jobs'
  ]) LOOP
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $$;

-- ============================================================
-- 7. NEW USER HANDLER (per-user account on signup)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_account_id uuid;
  v_full_name text;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.accounts (name, account_type, is_active)
  VALUES (v_full_name, 'brand', true)
  RETURNING id INTO v_account_id;

  INSERT INTO public.profiles (id, email, full_name, meta_user_id, is_superadmin)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    NEW.raw_user_meta_data->>'meta_user_id',
    NEW.email = 'aakash.ahuja101@gmail.com'
  );

  INSERT INTO public.account_users (account_id, user_id, role)
  VALUES (v_account_id, NEW.id, 'account_admin');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 8. RLS
-- ============================================================
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_account_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_performance_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatigue_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disclaimers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_template_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;

-- profiles: own row
CREATE POLICY "profiles_self_read" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_superadmin(auth.uid()));
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- accounts: members can read; superadmin can do everything
CREATE POLICY "accounts_member_read" ON public.accounts FOR SELECT
  USING (id IN (SELECT public.user_account_ids(auth.uid())) OR public.is_superadmin(auth.uid()));
CREATE POLICY "accounts_admin_update" ON public.accounts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.account_users WHERE account_id = accounts.id AND user_id = auth.uid() AND role IN ('account_admin','superadmin')) OR public.is_superadmin(auth.uid()));

-- account_users: members of an account can see its memberships
CREATE POLICY "account_users_read" ON public.account_users FOR SELECT
  USING (user_id = auth.uid() OR account_id IN (SELECT public.user_account_ids(auth.uid())) OR public.is_superadmin(auth.uid()));
CREATE POLICY "account_users_admin_write" ON public.account_users FOR ALL
  USING (public.is_superadmin(auth.uid()) OR EXISTS (SELECT 1 FROM public.account_users au WHERE au.account_id = account_users.account_id AND au.user_id = auth.uid() AND au.role IN ('account_admin','superadmin')))
  WITH CHECK (public.is_superadmin(auth.uid()) OR EXISTS (SELECT 1 FROM public.account_users au WHERE au.account_id = account_users.account_id AND au.user_id = auth.uid() AND au.role IN ('account_admin','superadmin')));

-- Generic account-scoped policy for tenant tables
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'meta_connections','ad_accounts','brands','ad_account_profiles','campaigns','ad_sets','ads',
    'ad_creatives','ad_performance_daily','fatigue_diagnoses','brand_competitors','competitor_ads',
    'icps','disclaimers','brand_archetypes','generation_jobs','generated_creatives',
    'creative_tags','products','sync_jobs'
  ]) LOOP
    EXECUTE format($f$CREATE POLICY "%1$s_account_access" ON public.%1$I FOR ALL
      USING (public.has_account_access(auth.uid(), account_id))
      WITH CHECK (public.has_account_access(auth.uid(), account_id))$f$, t);
  END LOOP;
END $$;

-- prompt_templates: account_id can be NULL (global)
CREATE POLICY "prompt_templates_access" ON public.prompt_templates FOR ALL
  USING (account_id IS NULL OR public.has_account_access(auth.uid(), account_id))
  WITH CHECK (account_id IS NULL OR public.has_account_access(auth.uid(), account_id));

-- prompt_template_performance: any authenticated user (linked via prompt_templates)
CREATE POLICY "ptp_authenticated" ON public.prompt_template_performance FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- scene_archetypes: global read
CREATE POLICY "scene_archetypes_read" ON public.scene_archetypes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "scene_archetypes_superadmin_write" ON public.scene_archetypes FOR ALL
  USING (public.is_superadmin(auth.uid())) WITH CHECK (public.is_superadmin(auth.uid()));

-- ============================================================
-- 9. SEED scene_archetypes
-- ============================================================
INSERT INTO public.scene_archetypes (key, name, description, sort_order) VALUES
  ('BOLD_COLOR_BLOCK','Bold Color Block','High-contrast solid color background with hero product centered. Studio lighting. Strong typography.',1),
  ('LIFESTYLE_IN_USE','Lifestyle In Use','Real person using the product in a natural environment. Warm, candid lighting.',2),
  ('UGC_TESTIMONIAL','UGC Testimonial','Selfie-style framing, phone-camera quality, casual setting, talking-head style.',3),
  ('FLAT_LAY','Flat Lay','Top-down arrangement of product with complementary props on a clean surface.',4),
  ('BEFORE_AFTER','Before / After','Split composition showing problem state vs solution state.',5),
  ('BENEFIT_CALLOUTS','Benefit Callouts','Hero product with annotated callouts pointing to key features and benefits.',6),
  ('OFFER_BURST','Offer Burst','Bold price/discount badge dominates. High-urgency typography. Bright accent colors.',7),
  ('STUDIO_HERO','Studio Hero','Magazine-style hero shot. Premium lighting, shallow depth of field, minimal background.',8),
  ('NATURE_OUTDOOR','Nature / Outdoor','Outdoor environment with natural light. Product placed in scenic context.',9),
  ('GROUP_SOCIAL','Group / Social','Multiple people enjoying the product together. Sense of community and belonging.',10);
