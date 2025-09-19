-- Add missing columns to franchisees table
ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';

ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS territory TEXT;

ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS image TEXT;

ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS owners JSONB DEFAULT '[]'::jsonb;

ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}'::jsonb;

-- Update existing records with default values
UPDATE franchisees
SET
  country = COALESCE(country, 'United States'),
  status = COALESCE(status, 'Active'),
  owners = COALESCE(owners, '[]'::jsonb),
  notification_preferences = COALESCE(notification_preferences, '{
    "newTechSubmissions": {"email": true, "sms": false, "app": true},
    "mediaArchival": {"email": true, "sms": false, "app": false},
    "systemUpdates": {"email": true, "sms": false, "app": true},
    "marketingReports": {"email": true, "sms": false, "app": false},
    "emergencyAlerts": {"email": true, "sms": true, "app": true},
    "weeklyDigest": {"email": true, "sms": false, "app": false}
  }'::jsonb)
WHERE country IS NULL OR status IS NULL OR owners IS NULL OR notification_preferences IS NULL;