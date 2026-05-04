-- Extend brand_competitors to support onboarding-confirmed competitors with display fields
ALTER TABLE public.brand_competitors
  ALTER COLUMN brand_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS ad_account_id uuid,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS logo_url text;

CREATE INDEX IF NOT EXISTS idx_brand_competitors_ad_account_id
  ON public.brand_competitors(ad_account_id);