CREATE TABLE public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid NOT NULL,
  user_id uuid NOT NULL,
  ad_account_id uuid NOT NULL,
  brand_id uuid,
  name text NOT NULL,
  offer_type text NOT NULL,
  discount_value text,
  buy_qty text,
  get_qty text,
  bogo_discount text,
  trial_price text,
  freebie_description text,
  custom_offer_headline text,
  promo_code text,
  start_date timestamptz,
  end_date timestamptz,
  additional_notes text,
  disclaimer_ids uuid[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offers_account_access" ON public.offers
  FOR ALL USING (has_account_access(auth.uid(), account_id))
  WITH CHECK (has_account_access(auth.uid(), account_id));

CREATE TRIGGER offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_offers_ad_account ON public.offers(ad_account_id);