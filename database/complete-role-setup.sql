-- ============================================
-- COMPLETE ROLE SETUP MIGRATION
-- ============================================
-- This migration:
-- 1. Ensures roles table exists
-- 2. Populates roles table with standard roles
-- 3. Links profiles table to roles table
-- 4. Updates auto-create trigger

-- STEP 1: Ensure roles table exists with proper structure
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 2: Populate roles table with standard roles
-- ============================================
INSERT INTO roles (name, description)
VALUES
  ('super_admin', 'Super Administrator - Full system access, can manage all admins, franchisees, and technicians'),
  ('admin', 'Administrator - Can manage franchisees and technicians, access all features'),
  ('franchisee', 'Franchisee Owner - Manages their franchise, technicians, and job submissions'),
  ('tech', 'Technician - Submits jobs and photos, views their own submissions')
ON CONFLICT (name) DO UPDATE
  SET description = EXCLUDED.description;

-- Verify roles exist
SELECT '✅ Roles created:' as status;
SELECT id, name, description FROM roles ORDER BY name;

-- STEP 3: Backup existing role column in profiles
-- ============================================
DO $$
BEGIN
  -- Only rename if role column exists and role_old doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role_old'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN role TO role_old;
    RAISE NOTICE '✅ Renamed profiles.role to role_old';
  END IF;
END $$;

-- STEP 4: Add role_id column to profiles
-- ============================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);

-- STEP 5: Migrate existing role_old values to role_id
-- ============================================
UPDATE profiles
SET role_id = roles.id
FROM roles
WHERE LOWER(profiles.role_old) = LOWER(roles.name)
  AND profiles.role_id IS NULL;

-- STEP 6: Set default role_id for any NULL values (use 'tech' role)
-- ============================================
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE name = 'tech' LIMIT 1)
WHERE role_id IS NULL;

-- STEP 7: Make role_id NOT NULL
-- ============================================
ALTER TABLE profiles
  ALTER COLUMN role_id SET NOT NULL;

-- STEP 8: Create index for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);

-- STEP 9: Update auto-create profile trigger
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role_id UUID;
  user_role_id UUID;
BEGIN
  -- Get the default 'tech' role ID
  SELECT id INTO default_role_id
  FROM roles
  WHERE name = 'tech'
  LIMIT 1;

  -- Try to get role from user metadata
  IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
    SELECT id INTO user_role_id
    FROM roles
    WHERE LOWER(name) = LOWER(new.raw_user_meta_data->>'role')
    LIMIT 1;
  END IF;

  -- Insert profile with role_id
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role_id
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(user_role_id, default_role_id)
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 10: Add helpful comments
-- ============================================
COMMENT ON TABLE roles IS 'System roles - defines user permission levels';
COMMENT ON COLUMN profiles.role_id IS 'Foreign key to roles table - users assigned role';
COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-creates profile with default "tech" role when user signs up';

-- STEP 11: Verify the final result
-- ============================================
SELECT '✅ Migration complete! Final verification:' as status;

SELECT
  p.id,
  p.email,
  p.full_name,
  r.name as role_name,
  r.description as role_description,
  p.created_at
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Show role distribution
SELECT '📊 Users by role:' as status;
SELECT
  r.name as role,
  COUNT(p.id) as user_count
FROM roles r
LEFT JOIN profiles p ON r.id = p.role_id
GROUP BY r.id, r.name
ORDER BY user_count DESC;

-- ============================================
-- MIGRATION COMPLETE! ✅
-- ============================================
-- ✅ roles table created and populated
-- ✅ profiles.role_id linked to roles table
-- ✅ Old role column saved as role_old
-- ✅ Trigger updated to use role_id
-- ✅ Default role is 'tech'
--
-- To change a user's role:
-- UPDATE profiles SET role_id = (SELECT id FROM roles WHERE name = 'admin') WHERE email = 'user@example.com';
--
-- To add a new role:
-- INSERT INTO roles (name, description) VALUES ('new_role', 'Description here');
