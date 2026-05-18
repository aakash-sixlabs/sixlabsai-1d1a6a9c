-- ============================================================
-- PATCH: Add missing tables and columns to new Supabase instance
-- Run this in the Supabase SQL editor for project jkzbuypbhqbssmqjpdtj
-- ============================================================

-- ── 0. Helper functions (not in any migration, created manually in Lovable) ──

CREATE OR REPLACE FUNCTION public.has_account_access(_user_id uuid, _account_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_users
    WHERE user_id = _user_id AND account_id = _account_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_account_admin(_account_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_users
    WHERE account_id = _account_id
      AND user_id = _user_id
      AND role IN ('account_admin', 'superadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_superadmin FROM public.profiles WHERE id = _user_id),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.user_account_ids(_user_id uuid)
RETURNS uuid[]
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(account_id) FROM public.account_users WHERE user_id = _user_id;
$$;

-- ── 1. Missing columns on ad_account_profiles ───────────────
ALTER TABLE public.ad_account_profiles
  ADD COLUMN IF NOT EXISTS brand_guidelines_path text,
  ADD COLUMN IF NOT EXISTS brand_guidelines_filename text,
  ADD COLUMN IF NOT EXISTS brand_guidelines_uploaded_at timestamp with time zone;

-- ── 2. Missing columns on brand_competitors ─────────────────
ALTER TABLE public.brand_competitors
  ADD COLUMN IF NOT EXISTS ad_account_id uuid,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS logo_url text;

CREATE INDEX IF NOT EXISTS idx_brand_competitors_ad_account_id
  ON public.brand_competitors(ad_account_id);

-- ── 3. Missing table: offers ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid NOT NULL,
  user_id uuid NOT NULL,
  ad_account_id uuid NOT NULL,
  brand_id uuid,
  name text NOT NULL,
  offer_type text NOT NULL,
  discount_value text,
  buy_qty text,
  get_qty text,
  bogo_discount text,
  trial_price text,
  freebie_description text,
  custom_offer_headline text,
  promo_code text,
  start_date timestamptz,
  end_date timestamptz,
  additional_notes text,
  disclaimer_ids uuid[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offers_account_access" ON public.offers
  FOR ALL USING (has_account_access(auth.uid(), account_id))
  WITH CHECK (has_account_access(auth.uid(), account_id));

CREATE TRIGGER offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_offers_ad_account ON public.offers(ad_account_id);

-- ── 4. Missing table: mock_creative_library ──────────────────
CREATE TABLE IF NOT EXISTS public.mock_creative_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  thumbnail_url text,
  aspect_ratio text,
  icp_keyword text,
  goal text,
  offer_name text,
  headline text,
  primary_text text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mock_creative_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read mock creative library"
ON public.mock_creative_library
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Superadmins can manage mock creative library"
ON public.mock_creative_library
FOR ALL TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

CREATE TRIGGER trg_mock_creative_library_updated_at
BEFORE UPDATE ON public.mock_creative_library
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_mock_creative_library_match
  ON public.mock_creative_library (goal, offer_name, icp_keyword);
