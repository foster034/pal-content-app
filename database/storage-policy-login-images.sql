-- Allow authenticated users to INSERT files into login-images bucket
CREATE POLICY "Allow authenticated uploads to login-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'login-images');

-- Allow authenticated users to UPDATE files in login-images bucket
CREATE POLICY "Allow authenticated updates to login-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'login-images');

-- Allow public SELECT (read) access to login-images bucket
CREATE POLICY "Allow public reads from login-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'login-images');

-- Allow authenticated users to DELETE files from login-images bucket
CREATE POLICY "Allow authenticated deletes from login-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'login-images');
