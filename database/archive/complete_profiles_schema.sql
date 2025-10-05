-- Complete Profile Schema Enhancement for Pop-A-Lock
-- Add missing columns to the existing profiles table

-- Contact Information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobile_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_phone TEXT;

-- Address Information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_line_2 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';

-- Personal Information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- Professional Information (for Pop-A-Lock business)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certifications TEXT[]; -- Array for multiple certifications

-- Profile Settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private', 'team'));

-- Communication Preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false;

-- Additional Profile Data
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes TEXT; -- Admin notes about user

-- System Fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Add comments to document each column
COMMENT ON COLUMN profiles.phone IS 'Primary phone number';
COMMENT ON COLUMN profiles.mobile_phone IS 'Mobile/cell phone number';
COMMENT ON COLUMN profiles.work_phone IS 'Work phone number';
COMMENT ON COLUMN profiles.address IS 'Street address line 1';
COMMENT ON COLUMN profiles.address_line_2 IS 'Street address line 2 (apt, suite, etc.)';
COMMENT ON COLUMN profiles.city IS 'City name';
COMMENT ON COLUMN profiles.state IS 'State or province';
COMMENT ON COLUMN profiles.zip_code IS 'ZIP or postal code';
COMMENT ON COLUMN profiles.country IS 'Country name';
COMMENT ON COLUMN profiles.first_name IS 'First name (parsed from full_name if needed)';
COMMENT ON COLUMN profiles.last_name IS 'Last name (parsed from full_name if needed)';
COMMENT ON COLUMN profiles.date_of_birth IS 'Date of birth for age verification';
COMMENT ON COLUMN profiles.emergency_contact_name IS 'Emergency contact full name';
COMMENT ON COLUMN profiles.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN profiles.title IS 'Job title or position';
COMMENT ON COLUMN profiles.department IS 'Department or team';
COMMENT ON COLUMN profiles.hire_date IS 'Date of employment start';
COMMENT ON COLUMN profiles.employee_id IS 'Unique employee identifier';
COMMENT ON COLUMN profiles.license_number IS 'Professional license number if applicable';
COMMENT ON COLUMN profiles.certifications IS 'Array of certifications and training completed';
COMMENT ON COLUMN profiles.timezone IS 'User timezone for scheduling';
COMMENT ON COLUMN profiles.language IS 'Preferred language code (en, es, fr, etc.)';
COMMENT ON COLUMN profiles.profile_visibility IS 'Who can see this profile (public, private, team)';
COMMENT ON COLUMN profiles.email_notifications IS 'Allow email notifications';
COMMENT ON COLUMN profiles.sms_notifications IS 'Allow SMS notifications';
COMMENT ON COLUMN profiles.push_notifications IS 'Allow push notifications';
COMMENT ON COLUMN profiles.marketing_emails IS 'Allow marketing communications';
COMMENT ON COLUMN profiles.bio IS 'Personal or professional bio';
COMMENT ON COLUMN profiles.website IS 'Personal or professional website URL';
COMMENT ON COLUMN profiles.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN profiles.skills IS 'Array of skills and competencies';
COMMENT ON COLUMN profiles.notes IS 'Administrative notes about the user';
COMMENT ON COLUMN profiles.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN profiles.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN profiles.email_verified IS 'Whether email address has been verified';
COMMENT ON COLUMN profiles.phone_verified IS 'Whether phone number has been verified';

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_license_number ON profiles(license_number);
CREATE INDEX IF NOT EXISTS idx_profiles_hire_date ON profiles(hire_date);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login_at ON profiles(last_login_at);

-- Update existing records to set default values where appropriate
UPDATE profiles SET
  country = 'United States'
WHERE country IS NULL;

UPDATE profiles SET
  timezone = 'America/New_York'
WHERE timezone IS NULL;

UPDATE profiles SET
  language = 'en'
WHERE language IS NULL;

UPDATE profiles SET
  profile_visibility = 'private'
WHERE profile_visibility IS NULL;

UPDATE profiles SET
  email_notifications = true,
  sms_notifications = true,
  push_notifications = true,
  marketing_emails = false,
  is_active = true,
  email_verified = false,
  phone_verified = false
WHERE email_notifications IS NULL;

-- Show the updated table structure
\d profiles;