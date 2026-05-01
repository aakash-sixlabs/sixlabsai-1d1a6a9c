ALTER TABLE public.generation_jobs
  ADD COLUMN IF NOT EXISTS icp_id uuid,
  ADD COLUMN IF NOT EXISTS icp_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS disclaimer_ids uuid[] DEFAULT '{}'::uuid[];

CREATE INDEX IF NOT EXISTS idx_generation_jobs_icp_id ON public.generation_jobs(icp_id);