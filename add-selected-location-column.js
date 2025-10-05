// Script to add selected_location_name column to gmb_oauth_tokens table
// Run with: node add-selected-location-column.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addColumn() {
  console.log('\n=== Adding selected_location_name column ===\n');

  // Since exec_sql RPC doesn't exist, we'll use a workaround
  // Try to query the column first to see if it exists
  const { data: testData, error: testError } = await supabase
    .from('gmb_oauth_tokens')
    .select('selected_location_name')
    .limit(1);

  if (testError) {
    if (testError.message.includes('Could not find') || testError.message.includes('column')) {
      console.log('❌ Column does not exist. Error:', testError.message);
      console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
      console.log('\n---SQL START---');
      console.log('ALTER TABLE gmb_oauth_tokens ADD COLUMN IF NOT EXISTS selected_location_name TEXT;');
      console.log('COMMENT ON COLUMN gmb_oauth_tokens.selected_location_name IS \'Default GMB location name for posting (e.g., accounts/123/locations/456)\';');
      console.log('---SQL END---\n');
      console.log('Go to: https://supabase.com/dashboard/project/hagfscurfkqfsjkczjyi/editor/sql');
      process.exit(1);
    } else {
      console.error('❌ Unexpected error:', testError);
      process.exit(1);
    }
  } else {
    console.log('✅ Column "selected_location_name" already exists!');
    console.log('\nTest query result:', testData);

    // Now test an update
    console.log('\n🧪 Testing update operation...');
    const { data: updateData, error: updateError } = await supabase
      .from('gmb_oauth_tokens')
      .update({ selected_location_name: 'accounts/demo123456/locations/demo789012' })
      .eq('franchisee_id', '4c8b70f3-797b-4384-869e-e1fb3919f615')
      .eq('is_active', true)
      .select();

    if (updateError) {
      console.error('❌ Update test failed:', updateError);
      process.exit(1);
    } else {
      console.log('✅ Update test successful!');
      console.log('Updated records:', updateData);
      process.exit(0);
    }
  }
}

addColumn();
