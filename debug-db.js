const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hagfscurfkqfsjkczjyi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2ZzY3VyZmtxZnNqa2N6anlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQzMjc3NiwiZXhwIjoyMDczMDA4Nzc2fQ.GHAoMdAx3fIuNjJnPMW1quGwAh-OikPdkwI8k7p-iPs'
);

async function checkDatabase() {
  console.log('\n=== Checking GMB OAuth Tokens Table ===\n');

  // 1. Check table schema
  console.log('1. Checking table schema...');
  const { data: columns, error: schemaError } = await supabase
    .from('gmb_oauth_tokens')
    .select('*')
    .limit(0);

  if (schemaError) {
    console.error('Schema check error:', schemaError);
  } else {
    console.log('Table exists and is accessible');
  }

  // 2. Query for the specific franchisee
  console.log('\n2. Querying for franchisee 4c8b70f3-797b-4384-869e-e1fb3919f615...');
  const { data: records, error: queryError } = await supabase
    .from('gmb_oauth_tokens')
    .select('*')
    .eq('franchisee_id', '4c8b70f3-797b-4384-869e-e1fb3919f615');

  if (queryError) {
    console.error('Query error:', queryError);
  } else {
    console.log(`Found ${records.length} record(s):`);
    records.forEach((record, idx) => {
      console.log(`\nRecord ${idx + 1}:`);
      console.log('  ID:', record.id);
      console.log('  Franchisee ID:', record.franchisee_id);
      console.log('  Google Email:', record.google_email);
      console.log('  Selected Location:', record.selected_location_name);
      console.log('  Is Active:', record.is_active);
      console.log('  Locations:', JSON.stringify(record.locations, null, 2));
      console.log('  Created:', record.created_at);
      console.log('  Updated:', record.updated_at);
    });
  }

  // 3. Try to update the selected_location_name
  console.log('\n3. Testing update operation...');
  const testLocationId = 'accounts/demo123456/locations/demo789012';

  const { data: updateData, error: updateError } = await supabase
    .from('gmb_oauth_tokens')
    .update({ selected_location_name: testLocationId })
    .eq('franchisee_id', '4c8b70f3-797b-4384-869e-e1fb3919f615')
    .eq('is_active', true)
    .select();

  if (updateError) {
    console.error('Update error:', updateError);
    console.error('Error details:', JSON.stringify(updateError, null, 2));
  } else {
    console.log('Update successful!');
    console.log('Updated records:', updateData);
  }

  // 4. Verify the update
  console.log('\n4. Verifying the update...');
  const { data: verifyRecords, error: verifyError } = await supabase
    .from('gmb_oauth_tokens')
    .select('*')
    .eq('franchisee_id', '4c8b70f3-797b-4384-869e-e1fb3919f615');

  if (verifyError) {
    console.error('Verify error:', verifyError);
  } else {
    console.log(`Verification - Found ${verifyRecords.length} record(s):`);
    verifyRecords.forEach((record, idx) => {
      console.log(`\nRecord ${idx + 1}:`);
      console.log('  Selected Location:', record.selected_location_name);
    });
  }
}

checkDatabase().catch(console.error);
