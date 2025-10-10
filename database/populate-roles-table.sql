-- ============================================
-- POPULATE ROLES TABLE
-- ============================================
-- Adds standard roles: super_admin, admin, franchisee, tech

-- First, clear any existing roles (optional - comment out if you want to keep existing)
-- TRUNCATE TABLE roles CASCADE;

-- Insert standard roles
INSERT INTO roles (name, description)
VALUES
  ('super_admin', 'Super Administrator - Full system access, can manage all admins, franchisees, and technicians'),
  ('admin', 'Administrator - Can manage franchisees and technicians, access all features'),
  ('franchisee', 'Franchisee Owner - Manages their franchise, technicians, and job submissions'),
  ('tech', 'Technician - Submits jobs and photos, views their own submissions')
ON CONFLICT (name) DO UPDATE
  SET description = EXCLUDED.description;

-- Verify roles were created
SELECT
  id,
  name,
  description,
  created_at
FROM roles
ORDER BY
  CASE name
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'franchisee' THEN 3
    WHEN 'tech' THEN 4
    ELSE 5
  END;

-- Show count
SELECT COUNT(*) as total_roles FROM roles;
