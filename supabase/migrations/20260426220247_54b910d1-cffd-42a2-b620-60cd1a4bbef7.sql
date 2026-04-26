
ALTER TABLE public.ad_account_profiles
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS brand_name text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS primary_color text,
  ADD COLUMN IF NOT EXISTS secondary_color text,
  ADD COLUMN IF NOT EXISTS accent_color text,
  ADD COLUMN IF NOT EXISTS font_family text,
  ADD COLUMN IF NOT EXISTS tone_of_voice text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS product_categories text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS brand_kit jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS brand_kit_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS brand_kit_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_ad_account_profiles_user_account
  ON public.ad_account_profiles (user_id, ad_account_id);
