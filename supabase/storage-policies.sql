-- Create storage bucket if it doesn't exist (run this in SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable row level security
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the images bucket

-- Allow public access to view images (no auth needed)
CREATE POLICY "Public Access Policy" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- Only authenticated users can upload images
CREATE POLICY "Authenticated Users Upload Policy" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Only owners can update their images
CREATE POLICY "Owners Update Policy" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'images' AND owner = auth.uid());

-- Only owners can delete their images
CREATE POLICY "Owners Delete Policy" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'images' AND owner = auth.uid());
