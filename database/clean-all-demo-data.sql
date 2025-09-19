-- Complete Demo Data Cleanup Script
-- This will remove ALL demo data from your database

-- Clear all table data
DELETE FROM job_reports;
DELETE FROM job_submissions;
DELETE FROM technicians;
DELETE FROM franchisees;
DELETE FROM profiles;

-- Clear auth users (this will cascade to profiles due to foreign key)
-- WARNING: This will delete ALL users - only run this if you want a completely clean start
DELETE FROM auth.users;

-- Reset any auto-increment sequences (if applicable)
-- Note: UUIDs don't use sequences, but including for completeness

-- Verify tables are empty
SELECT 'job_reports' as table_name, COUNT(*) as record_count FROM job_reports
UNION ALL
SELECT 'job_submissions' as table_name, COUNT(*) as record_count FROM job_submissions
UNION ALL
SELECT 'technicians' as table_name, COUNT(*) as record_count FROM technicians
UNION ALL
SELECT 'franchisees' as table_name, COUNT(*) as record_count FROM franchisees
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'auth.users' as table_name, COUNT(*) as record_count FROM auth.users;