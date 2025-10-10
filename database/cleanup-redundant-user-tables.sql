-- Cleanup Script: Remove Redundant User/Role Tables
-- This keeps ONLY the profiles table for user management
-- Run this to simplify your database structure

-- Drop redundant tables if they exist
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS user_with_roles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Ensure profiles table has the role column with proper constraints
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'tech'
  CHECK (role IN ('admin', 'franchisee', 'tech'));

-- Create index on role for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Verify the profiles table structure
COMMENT ON TABLE profiles IS 'Main user profile table - extends auth.users with role and additional fields';
COMMENT ON COLUMN profiles.role IS 'User role: admin, franchisee, or tech';

-- Show current users and their roles
SELECT
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;
