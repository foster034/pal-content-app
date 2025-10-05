-- Add GMB Location ID column to franchisees table
-- This stores the Google My Business location ID that admins use to post directly to the franchisee's GMB
ALTER TABLE franchisees ADD COLUMN IF NOT EXISTS gmb_location_id TEXT;

COMMENT ON COLUMN franchisees.gmb_location_id IS 'Google My Business location ID for direct posting (e.g., 12345678901234567890)';
