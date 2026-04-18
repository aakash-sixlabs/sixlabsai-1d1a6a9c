CREATE OR REPLACE FUNCTION public.refresh_campaign_ad_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.campaign_ad_data;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_campaign_ad_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_campaign_ad_data() TO service_role;
