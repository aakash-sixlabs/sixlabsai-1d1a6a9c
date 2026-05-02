ALTER TABLE public.generation_jobs
  ADD COLUMN IF NOT EXISTS service_job_id text,
  ADD COLUMN IF NOT EXISTS callback_received_at timestamptz,
  ADD COLUMN IF NOT EXISTS attempt_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_used int DEFAULT 0;

ALTER TABLE public.generated_creatives
  ADD COLUMN IF NOT EXISTS stored_image_url text,
  ADD COLUMN IF NOT EXISTS stored_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS storage_status text DEFAULT 'pending';

ALTER TABLE public.generated_creatives REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'generated_creatives'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_creatives';
  END IF;
END $$;