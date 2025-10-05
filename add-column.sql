-- Add selected_location_name column to gmb_oauth_tokens table
ALTER TABLE gmb_oauth_tokens ADD COLUMN IF NOT EXISTS selected_location_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN gmb_oauth_tokens.selected_location_name IS 'Default GMB location name for posting (e.g., accounts/123/locations/456)';

-- Verify column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gmb_oauth_tokens' AND column_name = 'selected_location_name';

-- Test update
UPDATE gmb_oauth_tokens
SET selected_location_name = 'accounts/demo123456/locations/demo789012'
WHERE franchisee_id = '4c8b70f3-797b-4384-869e-e1fb3919f615'
AND is_active = true
RETURNING id, franchisee_id, google_email, selected_location_name;
