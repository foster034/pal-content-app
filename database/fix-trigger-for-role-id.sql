-- Fixed handle_new_user trigger that properly handles role_id with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_role_id INTEGER;
  user_role_id INTEGER;
  requested_role TEXT;
  final_role_id INTEGER;
BEGIN
  -- Get the default 'tech' role ID (MUST exist!)
  SELECT id INTO default_role_id FROM roles WHERE name = 'tech' LIMIT 1;

  -- If tech role doesn't exist, fail gracefully
  IF default_role_id IS NULL THEN
    RAISE EXCEPTION 'Default tech role not found in roles table! Cannot create user profile.';
  END IF;

  -- Log for debugging
  RAISE NOTICE 'handle_new_user trigger fired for user %', new.email;
  RAISE NOTICE 'User metadata: %', new.raw_user_meta_data;
  RAISE NOTICE 'Default tech role_id: %', default_role_id;

  -- Try to get role from user metadata
  requested_role := new.raw_user_meta_data->>'role';

  IF requested_role IS NOT NULL AND requested_role != '' THEN
    RAISE NOTICE 'Requested role from metadata: %', requested_role;

    -- Look up the role_id for the requested role
    SELECT id INTO user_role_id FROM roles
    WHERE LOWER(name) = LOWER(requested_role) LIMIT 1;

    IF user_role_id IS NOT NULL THEN
      RAISE NOTICE 'Found role_id % for role %', user_role_id, requested_role;
      final_role_id := user_role_id;
    ELSE
      RAISE NOTICE 'Role % not found in roles table, using default tech role_id %', requested_role, default_role_id;
      final_role_id := default_role_id;
    END IF;
  ELSE
    RAISE NOTICE 'No role in metadata, using default tech role_id %', default_role_id;
    final_role_id := default_role_id;
  END IF;

  -- Ensure we have a valid role_id before inserting
  IF final_role_id IS NULL THEN
    RAISE EXCEPTION 'Cannot determine role_id for user %. This should never happen!', new.email;
  END IF;

  -- Insert profile with role_id
  RAISE NOTICE 'Inserting profile for user % with role_id %', new.id, final_role_id;

  INSERT INTO public.profiles (id, email, full_name, role_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    final_role_id
  );

  RAISE NOTICE 'Profile created successfully for user % with role_id %', new.email, final_role_id;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the detailed error
    RAISE WARNING 'Error in handle_new_user trigger for user %: % (SQLSTATE: %)', new.email, SQLERRM, SQLSTATE;
    RAISE WARNING 'User ID: %, Email: %, Requested role: %', new.id, new.email, requested_role;
    -- Re-raise to prevent user creation if profile creation fails
    RAISE;
END;
$$;

-- Verify the trigger exists and recreate if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify all required roles exist
DO $$
DECLARE
  tech_count INTEGER;
  franchisee_count INTEGER;
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tech_count FROM roles WHERE name = 'tech';
  SELECT COUNT(*) INTO franchisee_count FROM roles WHERE name = 'franchisee';
  SELECT COUNT(*) INTO admin_count FROM roles WHERE name = 'admin';

  RAISE NOTICE '===========================================';
  RAISE NOTICE 'ROLES TABLE CHECK';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'tech role exists: %', (tech_count > 0);
  RAISE NOTICE 'franchisee role exists: %', (franchisee_count > 0);
  RAISE NOTICE 'admin role exists: %', (admin_count > 0);
  RAISE NOTICE '===========================================';

  IF tech_count = 0 THEN
    RAISE EXCEPTION 'tech role is missing from roles table!';
  END IF;

  IF franchisee_count = 0 THEN
    RAISE EXCEPTION 'franchisee role is missing from roles table!';
  END IF;

  IF admin_count = 0 THEN
    RAISE WARNING 'admin role is missing from roles table!';
  END IF;
END $$;

SELECT 'Trigger updated successfully! Auth user creation should now work.' AS result;
