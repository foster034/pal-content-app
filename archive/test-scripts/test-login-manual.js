const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const TEST_EMAIL = process.env.PLAYWRIGHT_DEMO_EMAIL || 'admin@test.ca';
const TEST_PASSWORD = process.env.PLAYWRIGHT_DEMO_PASSWORD || '123456';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  try {
    console.log(`\nTesting login with credentials from .env:`);
    console.log(`Email: ${TEST_EMAIL}`);
    console.log(`Password: ${TEST_PASSWORD.replace(/./g, '*')}`);

    // Test login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (error) {
      console.error('\n❌ Login failed:', error.message);
      return;
    }

    console.log('\n✅ Login successful!');
    console.log('User ID:', data.user.id);
    console.log('User email:', data.user.email);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      console.log('User role:', profile.role);
      console.log('Full name:', profile.full_name);
    }

    // Test settings save
    console.log('\n📝 Testing settings save...');
    const testSettings = {
      imageType: 'dynamic',
      staticImageUrl: '/test-image.jpg',
      showLatestJobs: true,
      jobPhotoCount: 10
    };

    const { error: saveError } = await supabase
      .from('app_settings')
      .upsert({
        key: 'login_screen',
        value: testSettings,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (saveError) {
      console.error('❌ Settings save failed:', saveError);
    } else {
      console.log('✅ Settings saved successfully');

      // Verify by reading back
      const { data: savedSettings, error: readError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'login_screen')
        .single();

      if (!readError && savedSettings) {
        console.log('✅ Settings verified:', savedSettings.value);
      }
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('Test error:', error);
  }
}

testLogin();