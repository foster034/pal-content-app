-- ============================================
-- GET FRANCHISEE USERS
-- ============================================
-- Query to find all users with the franchisee role
-- Joins profiles table with roles table

-- Main query: Get franchisee users with their details
SELECT
    p.id,
    p.email,
    p.full_name,
    p.franchisee_id,
    r.name as role_name,
    r.description as role_description,
    p.created_at,
    p.updated_at
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE r.name = 'franchisee'
ORDER BY p.created_at DESC
LIMIT 10;

-- Alternative query: Get all users grouped by role
SELECT
    r.name as role_name,
    r.description as role_description,
    COUNT(p.id) as user_count,
    ARRAY_AGG(p.email ORDER BY p.created_at DESC) as user_emails
FROM roles r
LEFT JOIN profiles p ON p.role_id = r.id
GROUP BY r.id, r.name, r.description
ORDER BY r.name;

-- Query to get franchisee users with their franchisee business details
SELECT
    p.id as user_id,
    p.email,
    p.full_name,
    r.name as role_name,
    f.id as franchisee_id,
    f.business_name,
    f.phone as franchisee_phone,
    f.territory,
    f.country,
    f.status as franchisee_status,
    p.created_at as user_created_at
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
LEFT JOIN franchisees f ON p.franchisee_id = f.id
WHERE r.name = 'franchisee'
ORDER BY p.created_at DESC;

-- Count of users by role
SELECT
    r.name as role_name,
    COUNT(p.id) as count
FROM roles r
LEFT JOIN profiles p ON p.role_id = r.id
GROUP BY r.name
ORDER BY COUNT(p.id) DESC;
