
-- Create storage bucket for ad creative images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-creatives', 'ad-creatives', true);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own ad creatives"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ad-creatives' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access (images displayed in UI)
CREATE POLICY "Public can view ad creatives"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ad-creatives');

-- Allow users to update/delete their own files
CREATE POLICY "Users can manage own ad creatives"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'ad-creatives' AND auth.uid()::text = (storage.foldername(name))[1]);
