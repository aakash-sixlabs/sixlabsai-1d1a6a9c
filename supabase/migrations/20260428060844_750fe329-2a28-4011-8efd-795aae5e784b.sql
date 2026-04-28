-- 1. Tag existing video ads in the ads table (must run before the delete)
UPDATE public.ads a
SET media_type = 'video'
FROM public.ad_creatives c
WHERE c.ad_id = a.id
  AND c.creative_type = 'video';

-- 2. Purge video rows from ad_creatives (now redundant)
DELETE FROM public.ad_creatives
WHERE creative_type = 'video';