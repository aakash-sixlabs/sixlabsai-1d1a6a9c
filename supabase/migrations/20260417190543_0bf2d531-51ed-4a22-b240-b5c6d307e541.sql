DROP TABLE IF EXISTS public.brand_competitors CASCADE;
DROP TABLE IF EXISTS public.competitor_ads CASCADE;
DROP TABLE IF EXISTS public.creative_tags CASCADE;
DROP TABLE IF EXISTS public.fatigue_diagnoses CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- Drop the owns_creative helper since it's no longer referenced by any RLS policy
-- (owns_brand and owns_prod_ad are still used by remaining tables, keep them)
DROP FUNCTION IF EXISTS public.owns_creative(bigint);