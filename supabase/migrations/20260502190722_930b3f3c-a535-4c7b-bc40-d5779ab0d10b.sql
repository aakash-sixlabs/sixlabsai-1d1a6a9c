-- Enable pg_net for async HTTP from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Store mirror webhook config in Vault (created if needed)
DO $$
BEGIN
  -- noop placeholder; secret value must be inserted via vault.create_secret separately
  PERFORM 1;
END $$;

-- Generic mirror trigger function: posts row changes to mirror-write edge function
CREATE OR REPLACE FUNCTION public.mirror_to_secondary()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  webhook_url text := 'https://bhcusyaonpevmwaruvlx.supabase.co/functions/v1/mirror-write';
  webhook_secret text;
  payload jsonb;
BEGIN
  -- Pull shared secret from vault; if missing, no-op (best-effort)
  BEGIN
    SELECT decrypted_secret INTO webhook_secret
    FROM vault.decrypted_secrets
    WHERE name = 'MIRROR_WEBHOOK_SECRET'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    webhook_secret := NULL;
  END;

  IF webhook_secret IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'op', TG_OP,
    'row', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    'old_row', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
  );

  PERFORM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-mirror-secret', webhook_secret
    ),
    body := payload,
    timeout_milliseconds := 5000
  );

  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  -- Never fail the original write
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach trigger to every user table
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'ad_account_profiles',
    'ad_accounts',
    'ad_creatives',
    'ad_performance_daily',
    'ad_sets',
    'ads',
    'brands',
    'campaigns',
    'disclaimers',
    'generated_creatives',
    'generation_jobs',
    'icps',
    'meta_connections',
    'profiles',
    'sync_jobs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS mirror_to_secondary_trg ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER mirror_to_secondary_trg
         AFTER INSERT OR UPDATE OR DELETE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.mirror_to_secondary()',
      t
    );
  END LOOP;
END $$;