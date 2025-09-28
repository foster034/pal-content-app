-- Apply this migration in your Supabase SQL editor to add vehicle fields
-- Run this IMMEDIATELY to fix the "column does not exist" error

-- Add vehicle fields to job_submissions table for automotive services
ALTER TABLE job_submissions
ADD COLUMN IF NOT EXISTS vehicle_year TEXT,
ADD COLUMN IF NOT EXISTS vehicle_make TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS vehicle_color TEXT,
ADD COLUMN IF NOT EXISTS vehicle_vin TEXT;

-- Verify the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'job_submissions'
AND column_name LIKE 'vehicle%'
ORDER BY column_name;

-- You should see 5 rows returned with the vehicle columns