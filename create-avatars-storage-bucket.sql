-- Create storage bucket for avatars in Supabase
-- Run this in your Supabase SQL editor

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('avatars', 'avatars', true, false)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete avatars" ON storage.objects;

-- Set up RLS policy for avatars bucket to allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow public read access to avatars
CREATE POLICY "Allow public read access to avatars" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to update avatars
CREATE POLICY "Allow users to update avatars" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow authenticated users to delete avatars
CREATE POLICY "Allow users to delete avatars" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'avatars';