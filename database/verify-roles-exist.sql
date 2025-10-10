-- Verify all required roles exist in the roles table
SELECT
    id,
    name,
    description
FROM roles
ORDER BY id;

-- Check specifically for tech and franchisee roles
DO $$
DECLARE
    tech_id INTEGER;
    franchisee_id INTEGER;
BEGIN
    -- Check tech role
    SELECT id INTO tech_id FROM roles WHERE name = 'tech' LIMIT 1;

    IF tech_id IS NULL THEN
        RAISE WARNING 'CRITICAL: tech role is MISSING from roles table!';
    ELSE
        RAISE NOTICE 'tech role exists with id: %', tech_id;
    END IF;

    -- Check franchisee role
    SELECT id INTO franchisee_id FROM roles WHERE name = 'franchisee' LIMIT 1;

    IF franchisee_id IS NULL THEN
        RAISE WARNING 'CRITICAL: franchisee role is MISSING from roles table!';
    ELSE
        RAISE NOTICE 'franchisee role exists with id: %', franchisee_id;
    END IF;

    -- Show result
    IF tech_id IS NULL OR franchisee_id IS NULL THEN
        RAISE NOTICE '===========================================';
        RAISE NOTICE 'PROBLEM FOUND: Required roles are missing!';
        RAISE NOTICE 'You need to insert the missing roles.';
        RAISE NOTICE '===========================================';
    ELSE
        RAISE NOTICE '===========================================';
        RAISE NOTICE 'All required roles exist!';
        RAISE NOTICE 'tech role_id: %, franchisee role_id: %', tech_id, franchisee_id;
        RAISE NOTICE '===========================================';
    END IF;
END $$;
