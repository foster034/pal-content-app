-- Add selected_location_name column to gmb_oauth_tokens table
ALTER TABLE gmb_oauth_tokens
ADD COLUMN IF NOT EXISTS selected_location_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN gmb_oauth_tokens.selected_location_name IS 'Default GMB location name for posting (e.g., accounts/123/locations/456)';
