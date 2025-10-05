-- Essential Profile Schema - Add Only Core Missing Fields
-- This is a minimal version with just the most important fields

-- Essential Contact Information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Essential Address Information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';

-- Essential System Fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Add basic indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Set defaults for existing records
UPDATE profiles SET
  country = 'United States',
  is_active = true
WHERE country IS NULL OR is_active IS NULL;

-- Add comments
COMMENT ON COLUMN profiles.phone IS 'Primary phone number';
COMMENT ON COLUMN profiles.address IS 'Street address';
COMMENT ON COLUMN profiles.city IS 'City name';
COMMENT ON COLUMN profiles.state IS 'State or province';
COMMENT ON COLUMN profiles.zip_code IS 'ZIP or postal code';
COMMENT ON COLUMN profiles.country IS 'Country name';
COMMENT ON COLUMN profiles.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN profiles.last_login_at IS 'Timestamp of last successful login';