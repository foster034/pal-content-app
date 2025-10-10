-- Enhanced handle_new_user trigger with better error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_role_id INTEGER;
  user_role_id INTEGER;
  requested_role TEXT;
BEGIN
  -- Get the default 'tech' role ID
  SELECT id INTO default_role_id FROM roles WHERE name = 'tech' LIMIT 1;

  -- Log for debugging (will appear in Supabase logs)
  RAISE NOTICE 'handle_new_user trigger fired for user %', new.email;
  RAISE NOTICE 'User metadata: %', new.raw_user_meta_data;

  -- Try to get role from user metadata
  requested_role := new.raw_user_meta_data->>'role';

  IF requested_role IS NOT NULL THEN
    RAISE NOTICE 'Requested role: %', requested_role;

    SELECT id INTO user_role_id FROM roles
    WHERE LOWER(name) = LOWER(requested_role) LIMIT 1;

    IF user_role_id IS NOT NULL THEN
      RAISE NOTICE 'Found role_id % for role %', user_role_id, requested_role;
    ELSE
      RAISE NOTICE 'Role % not found in roles table, falling back to default', requested_role;
    END IF;
  END IF;

  -- Insert profile with role_id
  RAISE NOTICE 'Inserting profile for user % with role_id %', new.id, COALESCE(user_role_id, default_role_id);

  INSERT INTO public.profiles (id, email, full_name, role_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(user_role_id, default_role_id)
  );

  RAISE NOTICE 'Profile created successfully for user %', new.email;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user trigger: % %', SQLERRM, SQLSTATE;
    RAISE WARNING 'User: %, Email: %', new.id, new.email;
    -- Re-raise the error so Supabase Auth knows something went wrong
    RAISE;
END;
$$;

-- Verify the trigger is still attached
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
    RAISE NOTICE 'Trigger on_auth_user_created created';
  ELSE
    RAISE NOTICE 'Trigger on_auth_user_created already exists';
  END IF;
END $$;

-- Verify that all required roles exist
DO $$
BEGIN
  -- Check for tech role
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'tech') THEN
    RAISE EXCEPTION 'tech role does not exist in roles table!';
  END IF;

  -- Check for franchisee role
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'franchisee') THEN
    RAISE EXCEPTION 'franchisee role does not exist in roles table!';
  END IF;

  RAISE NOTICE 'All required roles exist';
END $$;

SELECT 'Trigger updated successfully!' AS result;
