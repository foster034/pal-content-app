-- ============================================
-- SIMPLIFY USER ROLES - ONE PROFILE TABLE
-- ============================================
-- This migration simplifies user management to use ONLY the profiles table
-- Auto-creates profiles with default 'tech' role (changeable later)

-- Step 1: Drop redundant tables
-- ============================================
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS user_with_roles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Step 2: Ensure profiles table has role column with constraints
-- ============================================
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'tech';

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'franchisee', 'tech'));

-- Step 3: Create index on role for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Step 4: Update auto-create profile trigger
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'tech') -- Default to 'tech' role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Add helpful comments
-- ============================================
COMMENT ON TABLE profiles IS 'Main user profile table - extends auth.users with role and additional fields';
COMMENT ON COLUMN profiles.role IS 'User role: admin, franchisee, or tech (default)';
COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-creates profile with default "tech" role when user signs up';

-- Step 6: Show current users and their roles
-- ============================================
SELECT
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- ✅ Removed redundant user/role tables
-- ✅ Simplified to ONE profiles table
-- ✅ Auto-creates profiles with 'tech' role
-- ✅ Roles can be changed anytime in Supabase
--
-- To change a user's role:
-- UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
