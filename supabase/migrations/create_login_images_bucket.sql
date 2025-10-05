-- Create storage bucket for login page images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'login-images',
  'login-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for login-images bucket
-- Allow public read access
CREATE POLICY "Public read access for login images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'login-images');

-- Allow authenticated admins to upload/update/delete
CREATE POLICY "Admin upload access for login images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'login-images'
  AND (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'email' IN (
      SELECT email FROM profiles WHERE role = 'admin'
    )
  )
);

CREATE POLICY "Admin update access for login images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'login-images'
  AND (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'email' IN (
      SELECT email FROM profiles WHERE role = 'admin'
    )
  )
);

CREATE POLICY "Admin delete access for login images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'login-images'
  AND (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'email' IN (
      SELECT email FROM profiles WHERE role = 'admin'
    )
  )
);
