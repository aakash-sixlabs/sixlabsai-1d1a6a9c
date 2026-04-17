ALTER TABLE public.sync_jobs 
  ADD COLUMN IF NOT EXISTS cursor_date date,
  ADD COLUMN IF NOT EXISTS phase text;