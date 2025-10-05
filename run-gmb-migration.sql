ALTER TABLE franchisees ADD COLUMN IF NOT EXISTS gmb_location_id TEXT;
COMMENT ON COLUMN franchisees.gmb_location_id IS 'Google My Business location ID for direct posting';
