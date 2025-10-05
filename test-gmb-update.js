// Test script to verify GMB location update works
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUpdate() {
  console.log('\n=== Testing GMB Location Update ===\n');

  const franchiseeId = '4c8b70f3-797b-4384-869e-e1fb3919f615';
  const testLocationId = 'accounts/demo123456/locations/demo789012';

  console.log(`Franchisee ID: ${franchiseeId}`);
  console.log(`Test Location ID: ${testLocationId}\n`);

  // 1. Check if record exists
  console.log('1. Checking for existing GMB connection...');
  const { data: existing, error: fetchError } = await supabase
    .from('gmb_oauth_tokens')
    .select('*')
    .eq('franchisee_id', franchiseeId)
    .eq('is_active', true)
    .single();

  if (fetchError) {
    console.error('❌ GMB connection not found:', fetchError.message);
    process.exit(1);
  }

  console.log('✅ GMB connection found');
  console.log(`   Email: ${existing.google_email}`);
  console.log(`   Current location: ${existing.selected_location_name || '(not set)'}\n`);

  // 2. Test update
  console.log('2. Testing update operation...');
  const { data: updateData, error: updateError } = await supabase
    .from('gmb_oauth_tokens')
    .update({ selected_location_name: testLocationId })
    .eq('franchisee_id', franchiseeId)
    .eq('is_active', true)
    .select();

  if (updateError) {
    console.error('❌ Update failed:', updateError.message);
    console.error('   Details:', updateError);
    process.exit(1);
  }

  console.log('✅ Update successful!');
  console.log(`   Updated location to: ${updateData[0].selected_location_name}\n`);

  // 3. Verify update persisted
  console.log('3. Verifying update persisted...');
  const { data: verified, error: verifyError } = await supabase
    .from('gmb_oauth_tokens')
    .select('selected_location_name')
    .eq('franchisee_id', franchiseeId)
    .eq('is_active', true)
    .single();

  if (verifyError) {
    console.error('❌ Verification failed:', verifyError.message);
    process.exit(1);
  }

  if (verified.selected_location_name === testLocationId) {
    console.log('✅ Verification successful!');
    console.log(`   Location matches: ${verified.selected_location_name}\n`);
  } else {
    console.log('❌ Verification failed - location does not match');
    console.log(`   Expected: ${testLocationId}`);
    console.log(`   Got: ${verified.selected_location_name}\n`);
    process.exit(1);
  }

  console.log('🎉 All tests passed! GMB location update is working correctly.\n');
  console.log('Next step: Test in the UI at http://localhost:3000/dashboard/franchisees/' + franchiseeId);
}

testUpdate().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
