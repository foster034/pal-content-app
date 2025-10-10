-- Create admin_settings table for storing application-wide configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on setting_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON public.admin_settings(setting_key);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (used by API endpoints)
CREATE POLICY "Service role full access" ON public.admin_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Insert default Twilio settings
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES
  ('twilio_account_sid', ''),
  ('twilio_auth_token', ''),
  ('twilio_phone_number', ''),
  ('twilio_enabled', 'false'),
  ('twilio_test_mode', 'true')
ON CONFLICT (setting_key) DO NOTHING;

-- Comment on table
COMMENT ON TABLE public.admin_settings IS 'Stores application-wide configuration settings including Twilio SMS, email settings, etc.';
