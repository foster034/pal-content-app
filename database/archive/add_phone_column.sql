-- Add phone column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add comment to document the column
COMMENT ON COLUMN profiles.phone IS 'User phone number for contact purposes';