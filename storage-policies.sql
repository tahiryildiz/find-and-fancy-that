-- Allow public read access to images
CREATE POLICY "Public Access Images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated Users Can Upload Images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
  
-- Allow authenticated users to update their own images
CREATE POLICY "Users Can Update Own Images" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'images' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'images' AND auth.uid() = owner);
  
-- Allow authenticated users to delete their own images
CREATE POLICY "Users Can Delete Own Images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'images' AND auth.uid() = owner);
