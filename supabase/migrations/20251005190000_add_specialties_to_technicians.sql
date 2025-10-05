-- Add specialties column to technicians table
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN technicians.specialties IS 'Array of technician specialties (e.g., Automotive Locksmith, Residential, Commercial)';
