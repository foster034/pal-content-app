-- Simple script to insert the 4 standard roles
-- Run this in Supabase SQL Editor

INSERT INTO roles (name, description)
VALUES
  ('super_admin', 'Super Administrator - Full system access, can manage all admins, franchisees, and technicians'),
  ('admin', 'Administrator - Can manage franchisees and technicians, access all features'),
  ('franchisee', 'Franchisee Owner - Manages their franchise, technicians, and job submissions'),
  ('tech', 'Technician - Submits jobs and photos, views their own submissions')
ON CONFLICT (name) DO NOTHING;

-- Verify they were inserted
SELECT * FROM roles ORDER BY id;
