-- Check what roles exist in the database
SELECT id, name FROM roles ORDER BY id;

-- Check the current trigger function
SELECT pg_get_functiondef('public.handle_new_user()'::regprocedure);

-- Test finding the franchisee role
SELECT id FROM roles WHERE LOWER(name) = LOWER('franchisee') LIMIT 1;
