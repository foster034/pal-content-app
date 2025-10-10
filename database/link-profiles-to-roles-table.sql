-- ============================================
-- LINK PROFILES TO ROLES TABLE
-- ============================================
-- Changes profiles.role from TEXT to UUID foreign key
-- linking to the roles table

-- Step 1: Get existing role IDs from roles table
-- ============================================
-- First, let's see what roles exist
SELECT * FROM roles ORDER BY name;

-- Step 2: Add new role_id column (UUID) to profiles
-- ============================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);

-- Step 3: Migrate existing text roles to role_id
-- ============================================
-- Map text role values to role UUIDs
-- (You'll need to update these UUIDs based on your actual roles table)

-- Get the role IDs (run this first to see the IDs)
SELECT id, name FROM roles;

-- Example mapping (UPDATE THESE WITH YOUR ACTUAL ROLE IDs):
-- UPDATE profiles SET role_id = (SELECT id FROM roles WHERE name = 'admin') WHERE role = 'admin';
-- UPDATE profiles SET role_id = (SELECT id FROM roles WHERE name = 'franchisee') WHERE role = 'franchisee';
-- UPDATE profiles SET role_id = (SELECT id FROM roles WHERE name = 'tech') WHERE role = 'tech';

-- Or do it in one go:
UPDATE profiles
SET role_id = roles.id
FROM roles
WHERE LOWER(profiles.role) = LOWER(roles.name);

-- Step 4: Set default role_id for any NULL values (use 'tech' role)
-- ============================================
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE LOWER(name) = 'tech' LIMIT 1)
WHERE role_id IS NULL;

-- Step 5: Make role_id NOT NULL and remove old role column
-- ============================================
ALTER TABLE profiles
  ALTER COLUMN role_id SET NOT NULL;

-- Rename old role column to role_old (keep as backup)
ALTER TABLE profiles
  RENAME COLUMN role TO role_old;

-- Step 6: Create index for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);

-- Step 7: Update the auto-create trigger to use role_id
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Get the default 'tech' role ID
  SELECT id INTO default_role_id
  FROM roles
  WHERE LOWER(name) = 'tech'
  LIMIT 1;

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
    COALESCE(
      (SELECT id FROM roles WHERE LOWER(name) = LOWER(new.raw_user_meta_data->>'role')),
      default_role_id
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 8: Add helpful comments
-- ============================================
COMMENT ON COLUMN profiles.role_id IS 'Foreign key to roles table - users role';
COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-creates profile with default "tech" role_id when user signs up';

-- Step 9: Verify the migration
-- ============================================
SELECT
  p.id,
  p.email,
  p.full_name,
  r.name as role_name,
  r.description as role_description,
  p.created_at
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
ORDER BY p.created_at DESC;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- ✅ profiles.role_id now links to roles table
-- ✅ Old role column renamed to role_old (backup)
-- ✅ Auto-create trigger updated to use role_id
-- ✅ Default role is 'tech' from roles table
--
-- To change a user's role:
-- UPDATE profiles SET role_id = (SELECT id FROM roles WHERE name = 'admin') WHERE email = 'user@example.com';
