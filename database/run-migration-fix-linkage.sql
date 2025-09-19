-- Migration to fix existing franchisee linkage issues
-- Run this to fix any existing accounts that aren't properly linked

-- 1. First, run the main migration
\i fix-franchisee-linkage.sql

-- 2. Link any existing unlinked franchisee accounts
SELECT public.link_existing_franchisee_accounts();

-- 3. Verify the results
SELECT
  'Franchisees' as table_name,
  COUNT(*) as total_records,
  COUNT(owner_id) as linked_records,
  COUNT(*) - COUNT(owner_id) as unlinked_records
FROM franchisees
UNION ALL
SELECT
  'Profiles (franchisee role)' as table_name,
  COUNT(*) as total_records,
  COUNT(franchisee_id) as linked_records,
  COUNT(*) - COUNT(franchisee_id) as unlinked_records
FROM profiles
WHERE role = 'franchisee';

-- 4. Show franchisee dashboard data for verification
SELECT * FROM franchisee_dashboard LIMIT 10;