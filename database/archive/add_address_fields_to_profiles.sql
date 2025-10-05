-- Add Address Fields to Profiles Table
-- Execute this in your Supabase SQL Editor

-- Essential Address Information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';

-- Add indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_profiles_address ON profiles(address);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_zip_code ON profiles(zip_code);

-- Add comments to document each column
COMMENT ON COLUMN profiles.address IS 'Street address';
COMMENT ON COLUMN profiles.city IS 'City name';
COMMENT ON COLUMN profiles.state IS 'State or province';
COMMENT ON COLUMN profiles.zip_code IS 'ZIP or postal code';
COMMENT ON COLUMN profiles.country IS 'Country name';

-- Set defaults for existing records
UPDATE profiles SET
  country = 'United States'
WHERE country IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('address', 'city', 'state', 'zip_code', 'country')
ORDER BY column_name;