ALTER TABLE public.generated_creatives
ADD COLUMN IF NOT EXISTS feedback TEXT
CHECK (feedback IN ('like','dislike'));