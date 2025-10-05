-- Comprehensive storage RLS diagnosis
-- Run this in your Supabase SQL editor

-- 1. Check current storage policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 2. Check if RLS is enabled on storage.objects
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 3. Check storage buckets
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- 4. Check current storage objects in avatars bucket
SELECT
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'avatars'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check technician and auth user details
SELECT
    t.id as technician_id,
    t.name,
    t.email,
    t.user_id,
    p.full_name,
    p.role,
    p.avatar_url
FROM technicians t
LEFT JOIN profiles p ON t.user_id = p.id
WHERE t.id = 'f95f54d7-51be-4f55-a081-2d3b692ff5d9';

-- 6. Check auth user details
SELECT
    id,
    email,
    role,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users
WHERE id = 'e0d11f60-031b-45d6-a0d2-030861f89f35';

-- 7. Test RLS context - what user ID would be seen by policies
SELECT
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- 8. Show all storage-related policies (not just avatars)
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;