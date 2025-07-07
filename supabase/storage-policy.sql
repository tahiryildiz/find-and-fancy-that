CREATE POLICY "Public Access Policy" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated Users Upload Policy" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Owners Update/Delete Policy" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND owner = auth.uid());
CREATE POLICY "Owners Delete Policy" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND owner = auth.uid());