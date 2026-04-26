-- generation_jobs: one row per "Generate" click
CREATE TABLE public.generation_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  ad_account_id uuid,
  goal text,
  promo_scope text,
  product_input_method text,
  product_url text,
  product_image_url text,
  aspect_ratios text[] NOT NULL DEFAULT '{}',
  promo_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  service_request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  service_response_payload jsonb,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own generation jobs"
ON public.generation_jobs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_generation_jobs_user_created ON public.generation_jobs(user_id, created_at DESC);

-- generated_creatives: one row per output variant
CREATE TABLE public.generated_creatives (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.generation_jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  variant_index integer NOT NULL DEFAULT 0,
  aspect_ratio text,
  image_url text NOT NULL,
  thumbnail_url text,
  headline text,
  primary_text text,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own generated creatives"
ON public.generated_creatives
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_generated_creatives_job ON public.generated_creatives(job_id, variant_index);
CREATE INDEX idx_generated_creatives_user ON public.generated_creatives(user_id);

-- Reuse update_updated_at_column if exists, else create
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_generation_jobs_updated_at
BEFORE UPDATE ON public.generation_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();