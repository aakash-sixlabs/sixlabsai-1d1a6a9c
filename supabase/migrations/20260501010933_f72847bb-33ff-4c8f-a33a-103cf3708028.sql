CREATE TABLE public.disclaimers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ad_account_id UUID NOT NULL,
  label TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.disclaimers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own disclaimers" ON public.disclaimers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own disclaimers" ON public.disclaimers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own disclaimers" ON public.disclaimers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own disclaimers" ON public.disclaimers FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_disclaimers_updated_at
BEFORE UPDATE ON public.disclaimers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_disclaimers_account ON public.disclaimers(ad_account_id);