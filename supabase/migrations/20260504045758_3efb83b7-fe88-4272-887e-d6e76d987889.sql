
-- Tagged library of mock creatives used to populate generated_creatives
-- when a generation job "completes" in mock mode. Lets us seed visuals
-- per ICP / goal / offer combination.
CREATE TABLE public.mock_creative_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  thumbnail_url text,
  aspect_ratio text,
  icp_keyword text,         -- substring matched against icp name (case-insensitive)
  goal text,                -- exact match against generation_jobs.goal
  offer_name text,          -- matched against offers.name OR promo_details.customOfferHeadline
  headline text,
  primary_text text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mock_creative_library ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read the shared mock library.
CREATE POLICY "Authenticated can read mock creative library"
ON public.mock_creative_library
FOR SELECT
TO authenticated
USING (true);

-- Only superadmins can manage entries.
CREATE POLICY "Superadmins can manage mock creative library"
ON public.mock_creative_library
FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

CREATE TRIGGER trg_mock_creative_library_updated_at
BEFORE UPDATE ON public.mock_creative_library
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_mock_creative_library_match
  ON public.mock_creative_library (goal, offer_name, icp_keyword);

-- Seed the 4 Cirkul creatives uploaded for the
-- ICP=active lifestyle, goal=sale-promo, offer=10OffSKBottle combo.
INSERT INTO public.mock_creative_library (image_url, aspect_ratio, icp_keyword, goal, offer_name, headline, primary_text)
VALUES
  ('https://bhcusyaonpevmwaruvlx.supabase.co/storage/v1/object/public/ad-creatives/mock-library/active-lifestyle/sale-promo/10OffSKBottle/sugary_1.png',
   '4:5', 'active lifestyle', 'sale-promo', '10OffSKBottle',
   'Skip the Sugary Sports Drink', 'Bottle + up to 12 flavored drinks. Limited time only.'),
  ('https://bhcusyaonpevmwaruvlx.supabase.co/storage/v1/object/public/ad-creatives/mock-library/active-lifestyle/sale-promo/10OffSKBottle/sugary_2.png',
   '9:16', 'active lifestyle', 'sale-promo', '10OffSKBottle',
   'Skip the Sugary Sports Drink', 'Bottle + up to 12 flavored drinks. Limited time only.'),
  ('https://bhcusyaonpevmwaruvlx.supabase.co/storage/v1/object/public/ad-creatives/mock-library/active-lifestyle/sale-promo/10OffSKBottle/plain_1.png',
   '4:5', 'active lifestyle', 'sale-promo', '10OffSKBottle',
   'Plain Water Never Made It This Far', 'Bottle + up to 12 flavored drinks. Limited time only.'),
  ('https://bhcusyaonpevmwaruvlx.supabase.co/storage/v1/object/public/ad-creatives/mock-library/active-lifestyle/sale-promo/10OffSKBottle/plain_2.png',
   '9:16', 'active lifestyle', 'sale-promo', '10OffSKBottle',
   'Plain Water Never Made It This Far', 'Bottle + up to 12 flavored drinks. Limited time only.');
