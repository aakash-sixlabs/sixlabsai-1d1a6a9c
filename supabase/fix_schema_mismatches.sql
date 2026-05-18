-- ============================================================
-- FIX SCHEMA MISMATCHES
-- Run this in the NEW Supabase SQL editor (project jkzbuypbhqbssmqjpdtj)
-- NOTE: prompt_template_performance.evaluated_at and .notes are
--       intentional additions by Mubeen — left untouched.
-- ============================================================

-- ── TYPE MISMATCHES ──────────────────────────────────────────
-- campaign_ad_data is a materialized view that depends on these columns.
-- We save its definition, drop it, alter types, then recreate it.

DO $$
DECLARE
  v_view_def text;
  v_idx      record;
  v_idx_defs text[] := '{}';
BEGIN
  -- 1. Save the materialized view definition
  SELECT definition INTO v_view_def
  FROM pg_catalog.pg_matviews
  WHERE schemaname = 'public' AND matviewname = 'campaign_ad_data';

  -- 2. Save all indexes on the view
  FOR v_idx IN
    SELECT indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'campaign_ad_data'
  LOOP
    v_idx_defs := array_append(v_idx_defs, v_idx.indexdef);
  END LOOP;

  -- 3. Drop the view (and its indexes)
  DROP MATERIALIZED VIEW IF EXISTS public.campaign_ad_data;

  -- 4. Alter the column types now that the view is gone
  ALTER TABLE public.ad_performance_daily
    ALTER COLUMN clicks      TYPE numeric USING clicks::numeric,
    ALTER COLUMN impressions TYPE numeric USING impressions::numeric,
    ALTER COLUMN purchases   TYPE numeric USING purchases::numeric,
    ALTER COLUMN reach       TYPE numeric USING reach::numeric;

  -- 5. Recreate the materialized view with the saved definition
  IF v_view_def IS NOT NULL THEN
    EXECUTE 'CREATE MATERIALIZED VIEW public.campaign_ad_data AS ' || v_view_def;

    -- 6. Recreate all indexes
    FOR i IN 1..array_length(v_idx_defs, 1) LOOP
      BEGIN
        EXECUTE v_idx_defs[i];
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Could not recreate index: %', v_idx_defs[i];
      END;
    END LOOP;
  END IF;
END;
$$;

-- integer → numeric
ALTER TABLE public.competitor_ads
  ALTER COLUMN days_running TYPE numeric USING days_running::numeric;

ALTER TABLE public.prompt_template_performance
  ALTER COLUMN purchases_7d TYPE numeric USING purchases_7d::numeric;

-- ── NULLABLE MISMATCHES: DROP NOT NULL ────────────────────────

ALTER TABLE public.brand_competitors
  ALTER COLUMN brand_id DROP NOT NULL;

ALTER TABLE public.generated_creatives
  ALTER COLUMN brand_id DROP NOT NULL;

ALTER TABLE public.generation_jobs
  ALTER COLUMN brand_id DROP NOT NULL;

-- ── NULLABLE MISMATCHES: SET NOT NULL ────────────────────────

-- ad_account_profiles.account_id
-- Placeholder UUID used for any orphaned rows (fix manually if you have real data here)
UPDATE public.ad_account_profiles
  SET account_id = '00000000-0000-0000-0000-000000000000'
  WHERE account_id IS NULL;
ALTER TABLE public.ad_account_profiles
  ALTER COLUMN account_id SET NOT NULL;

-- ad_accounts.onboarding_completed
UPDATE public.ad_accounts
  SET onboarding_completed = false
  WHERE onboarding_completed IS NULL;
ALTER TABLE public.ad_accounts
  ALTER COLUMN onboarding_completed SET NOT NULL;

-- generated_creatives.metadata
UPDATE public.generated_creatives
  SET metadata = '{}'::jsonb
  WHERE metadata IS NULL;
ALTER TABLE public.generated_creatives
  ALTER COLUMN metadata SET NOT NULL;

-- generation_jobs.aspect_ratios
UPDATE public.generation_jobs
  SET aspect_ratios = '{}'::text[]
  WHERE aspect_ratios IS NULL;
ALTER TABLE public.generation_jobs
  ALTER COLUMN aspect_ratios SET NOT NULL;

-- generation_jobs.promo_details
UPDATE public.generation_jobs
  SET promo_details = '{}'::jsonb
  WHERE promo_details IS NULL;
ALTER TABLE public.generation_jobs
  ALTER COLUMN promo_details SET NOT NULL;

-- generation_jobs.service_request_payload
UPDATE public.generation_jobs
  SET service_request_payload = '{}'::jsonb
  WHERE service_request_payload IS NULL;
ALTER TABLE public.generation_jobs
  ALTER COLUMN service_request_payload SET NOT NULL;
