-- Check if profiles table has role TEXT or role_id INTEGER
DO $$
DECLARE
    has_role_text BOOLEAN;
    has_role_id_integer BOOLEAN;
BEGIN
    -- Check for role TEXT column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'role'
        AND data_type = 'text'
    ) INTO has_role_text;

    -- Check for role_id INTEGER column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'role_id'
        AND data_type = 'integer'
    ) INTO has_role_id_integer;

    RAISE NOTICE '===========================================';
    RAISE NOTICE 'PROFILES TABLE SCHEMA CHECK';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Has role TEXT column: %', has_role_text;
    RAISE NOTICE 'Has role_id INTEGER column: %', has_role_id_integer;
    RAISE NOTICE '===========================================';

    IF has_role_text AND NOT has_role_id_integer THEN
        RAISE NOTICE 'ISSUE FOUND: profiles table still uses old schema (role TEXT)';
        RAISE NOTICE 'The trigger expects role_id INTEGER, which is causing the auth creation to fail!';
        RAISE NOTICE '';
        RAISE NOTICE 'SOLUTION: You need to run the migration from /database/complete-role-setup-fixed.sql';
        RAISE NOTICE 'OR use the simplified trigger below that works with role TEXT:';
    ELSIF has_role_id_integer THEN
        RAISE NOTICE 'Schema is correct: using role_id INTEGER with roles table';
    ELSE
        RAISE NOTICE 'ERROR: profiles table has neither role nor role_id column!';
    END IF;
END $$;

-- Show the actual columns in profiles table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;
