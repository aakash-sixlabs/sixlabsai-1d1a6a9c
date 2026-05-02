ALTER TABLE public.icps
  ADD CONSTRAINT icps_ad_account_id_fkey
  FOREIGN KEY (ad_account_id)
  REFERENCES public.ad_accounts(id)
  ON DELETE CASCADE;

ALTER TABLE public.disclaimers
  ADD CONSTRAINT disclaimers_ad_account_id_fkey
  FOREIGN KEY (ad_account_id)
  REFERENCES public.ad_accounts(id)
  ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_icps_ad_account_id ON public.icps(ad_account_id);
CREATE INDEX IF NOT EXISTS idx_disclaimers_ad_account_id ON public.disclaimers(ad_account_id);