ALTER TABLE public.generation_jobs ADD COLUMN IF NOT EXISTS offer_type text;
CREATE INDEX IF NOT EXISTS idx_generation_jobs_offer_type ON public.generation_jobs(offer_type);