-- Create ICPs table for storing Ideal Customer Profiles per ad account
CREATE TABLE public.icps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ad_account_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.icps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ICPs"
ON public.icps FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ICPs"
ON public.icps FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ICPs"
ON public.icps FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ICPs"
ON public.icps FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_icps_user_account ON public.icps(user_id, ad_account_id);

CREATE TRIGGER update_icps_updated_at
BEFORE UPDATE ON public.icps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();