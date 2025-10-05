-- Add vehicle fields to job_submissions table for automotive services
ALTER TABLE job_submissions
ADD COLUMN IF NOT EXISTS vehicle_year TEXT,
ADD COLUMN IF NOT EXISTS vehicle_make TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS vehicle_color TEXT,
ADD COLUMN IF NOT EXISTS vehicle_vin TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN job_submissions.vehicle_year IS 'Vehicle year for automotive services';
COMMENT ON COLUMN job_submissions.vehicle_make IS 'Vehicle make (manufacturer) for automotive services';
COMMENT ON COLUMN job_submissions.vehicle_model IS 'Vehicle model for automotive services';
COMMENT ON COLUMN job_submissions.vehicle_color IS 'Vehicle color for automotive services';
COMMENT ON COLUMN job_submissions.vehicle_vin IS 'Vehicle identification number for automotive services';

-- Create index for vehicle searches
CREATE INDEX IF NOT EXISTS idx_job_submissions_vehicle
ON job_submissions(vehicle_year, vehicle_make, vehicle_model)
WHERE vehicle_make IS NOT NULL;