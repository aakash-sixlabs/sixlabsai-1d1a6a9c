ALTER TABLE public.ad_account_profiles
  ADD COLUMN IF NOT EXISTS brand_guidelines_path text,
  ADD COLUMN IF NOT EXISTS brand_guidelines_filename text,
  ADD COLUMN IF NOT EXISTS brand_guidelines_uploaded_at timestamp with time zone;