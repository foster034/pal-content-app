const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSettingsTable() {
  try {
    // First, check if table exists by trying to query it
    const { data: existingData, error: checkError } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1);

    if (!checkError) {
      console.log('✅ Settings table already exists');

      // Check if default settings exist
      const { data: settings, error: settingsError } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'login_screen')
        .single();

      if (settingsError && settingsError.code === 'PGRST116') {
        // Insert default settings
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert({
            key: 'login_screen',
            value: {
              imageType: 'static',
              staticImageUrl: '/login-image.jpg',
              showLatestJobs: false,
              jobPhotoCount: 5
            }
          });

        if (insertError) {
          console.error('Error inserting default settings:', insertError);
        } else {
          console.log('✅ Default login settings created');
        }
      } else {
        console.log('✅ Login settings already exist');
      }
      return;
    }

    // If table doesn't exist, show instructions
    if (checkError.message.includes('relation') && checkError.message.includes('does not exist')) {
      console.log('\n⚠️  Table does not exist. Please create it in Supabase Dashboard:\n');
      console.log('1. Go to: ' + supabaseUrl);
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run this SQL:\n');
      console.log(`
-- Create settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read
CREATE POLICY "Allow authenticated users to read settings" ON app_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow service role to manage settings
CREATE POLICY "Allow service role to manage settings" ON app_settings
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
      `);
      console.log('\n4. After creating the table, run this script again to insert default settings.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

createSettingsTable();