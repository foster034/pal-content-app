-- Create settings table for storing application configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);

-- Insert default login settings
INSERT INTO app_settings (key, value)
VALUES (
  'login_screen',
  '{
    "imageType": "static",
    "staticImageUrl": "/login-image.jpg",
    "showLatestJobs": false,
    "jobPhotoCount": 5
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;