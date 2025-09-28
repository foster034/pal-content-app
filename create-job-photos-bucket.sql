-- Create job-photos bucket for tech submissions
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'job-photos',
  'job-photos',
  true,  -- Make public to avoid RLS issues
  false,  -- No AVIF auto-detection
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/quicktime']
) ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy 4: Public read access for approved photos (optional)
-- Uncomment if you want approved photos to be publicly accessible
-- CREATE POLICY "Public can view approved job photos" ON storage.objects
-- FOR SELECT
-- TO public
-- USING (
--   bucket_id = 'job-photos'
--   AND (storage.foldername(name))[2] = 'approved'
-- );

-- Create customer-photos bucket for customer submissions
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'customer-photos',
  'customer-photos',
  false,
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Policies for customer photos
CREATE POLICY "Service role has full access to customer photos" ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'customer-photos')
WITH CHECK (bucket_id = 'customer-photos');

-- Anyone can upload customer photos (they use submit codes)
CREATE POLICY "Anyone can upload customer photos" ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'customer-photos');

-- Create job-reports bucket for generated PDFs
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'job-reports',
  'job-reports',
  true,  -- Public for sharing
  false,
  52428800, -- 50MB limit for PDFs
  ARRAY['application/pdf']
);

-- Job reports are public once generated
CREATE POLICY "Anyone can view job reports" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'job-reports');

CREATE POLICY "Service role can manage job reports" ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'job-reports')
WITH CHECK (bucket_id = 'job-reports');