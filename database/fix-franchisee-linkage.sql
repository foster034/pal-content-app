-- Fix franchisee linkage issue and improve auth flow
-- This migration addresses the core issue where franchisee accounts aren't properly linked

-- Step 1: Update the existing profile trigger to handle franchisee linkage
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    matching_franchisee_id UUID;
BEGIN
  -- First create the basic profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'tech')
  );

  -- If user is signing up as franchisee, try to link them to an existing franchise
  IF COALESCE(new.raw_user_meta_data->>'role', 'tech') = 'franchisee' THEN
    -- Look for a franchise with matching email
    SELECT id INTO matching_franchisee_id
    FROM franchisees
    WHERE email = new.email
    AND owner_id IS NULL  -- Only link if not already linked
    LIMIT 1;

    IF matching_franchisee_id IS NOT NULL THEN
      -- Link the franchisee record to this user
      UPDATE franchisees
      SET owner_id = new.id
      WHERE id = matching_franchisee_id;

      -- Update the profile with the franchisee_id
      UPDATE public.profiles
      SET franchisee_id = matching_franchisee_id
      WHERE id = new.id;
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create a function to handle franchisee registration with auto-linking
CREATE OR REPLACE FUNCTION public.create_franchisee_with_auth(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_business_name TEXT,
  p_phone TEXT,
  p_website TEXT DEFAULT NULL,
  p_google_review_url TEXT DEFAULT NULL,
  p_country TEXT DEFAULT 'Canada'
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  new_franchisee_id UUID;
  auth_response JSON;
BEGIN
  -- Create the franchisee record first
  INSERT INTO franchisees (business_name, phone, email, website, google_review_url, country)
  VALUES (p_business_name, p_phone, p_email, p_website, p_google_review_url, p_country)
  RETURNING id INTO new_franchisee_id;

  -- The auth user creation will be handled by the application layer
  -- This function is called after auth user is created to complete the linkage

  RETURN json_build_object(
    'success', true,
    'franchisee_id', new_franchisee_id,
    'message', 'Franchisee record created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create function to link existing franchisee accounts
CREATE OR REPLACE FUNCTION public.link_existing_franchisee_accounts()
RETURNS JSON AS $$
DECLARE
  link_count INTEGER := 0;
  profile_record RECORD;
BEGIN
  -- Find profiles with role 'franchisee' that aren't linked yet
  FOR profile_record IN
    SELECT p.id, p.email
    FROM profiles p
    WHERE p.role = 'franchisee'
    AND p.franchisee_id IS NULL
  LOOP
    -- Try to find a matching franchisee record
    UPDATE franchisees
    SET owner_id = profile_record.id
    WHERE email = profile_record.email
    AND owner_id IS NULL;

    IF FOUND THEN
      -- Update the profile with the franchisee_id
      UPDATE profiles
      SET franchisee_id = (
        SELECT id FROM franchisees WHERE owner_id = profile_record.id
      )
      WHERE id = profile_record.id;

      link_count := link_count + 1;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'linked_accounts', link_count,
    'message', format('Successfully linked %s franchisee accounts', link_count)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Add country field to franchisees table if it doesn't exist
ALTER TABLE franchisees ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Canada';

-- Step 5: Create index for better performance on franchisee lookups
CREATE INDEX IF NOT EXISTS idx_franchisees_email_owner ON franchisees(email, owner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_franchisee ON profiles(role, franchisee_id);

-- Step 6: Update RLS policies to ensure proper access control
-- Policy for franchisees to access their own records via profile linkage
DROP POLICY IF EXISTS "Franchisees can view own data via profile" ON franchisees;
CREATE POLICY "Franchisees can view own data via profile" ON franchisees
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT franchisee_id FROM profiles
      WHERE id = auth.uid() AND role = 'franchisee'
    ) OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Policy for updating franchisee data
DROP POLICY IF EXISTS "Franchisees can update own data via profile" ON franchisees;
CREATE POLICY "Franchisees can update own data via profile" ON franchisees
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT franchisee_id FROM profiles
      WHERE id = auth.uid() AND role = 'franchisee'
    )
  );

-- Step 7: Create a view for easy franchisee dashboard access
CREATE OR REPLACE VIEW franchisee_dashboard AS
SELECT
  f.id as franchisee_id,
  f.business_name,
  f.phone,
  f.email,
  f.website,
  f.google_review_url,
  f.country,
  f.created_at,
  p.id as user_id,
  p.full_name as owner_name,
  p.avatar_url,
  COUNT(t.id) as technician_count,
  COUNT(js.id) as total_jobs,
  COUNT(CASE WHEN js.status = 'pending' THEN 1 END) as pending_jobs
FROM franchisees f
LEFT JOIN profiles p ON f.owner_id = p.id
LEFT JOIN technicians t ON f.id = t.franchisee_id
LEFT JOIN job_submissions js ON f.id = js.franchisee_id
WHERE f.owner_id IS NOT NULL  -- Only show linked franchisees
GROUP BY f.id, p.id;

-- Grant access to the view
GRANT SELECT ON franchisee_dashboard TO authenticated;

-- Step 8: Add RLS policy for the view
ALTER VIEW franchisee_dashboard SET (security_invoker = true);

COMMENT ON FUNCTION public.handle_new_user() IS 'Handles new user creation and auto-links franchisee accounts based on email matching';
COMMENT ON FUNCTION public.create_franchisee_with_auth() IS 'Creates a new franchisee record that can be linked to an auth user';
COMMENT ON FUNCTION public.link_existing_franchisee_accounts() IS 'Links existing unlinked franchisee accounts to their corresponding auth users';
COMMENT ON VIEW franchisee_dashboard IS 'Comprehensive view of franchisee data with stats, only accessible by linked franchisees';