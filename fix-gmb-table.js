const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hagfscurfkqfsjkczjyi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2ZzY3VyZmtxZnNqa2N6anlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQzMjc3NiwiZXhwIjoyMDczMDA4Nzc2fQ.GHAoMdAx3fIuNjJnPMW1quGwAh-OikPdkwI8k7p-iPs'
);

async function fixTable() {
  console.log('\n=== Fixing GMB OAuth Tokens Table ===\n');

  // Add the missing column
  console.log('1. Adding selected_location_name column...');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE gmb_oauth_tokens ADD COLUMN IF NOT EXISTS selected_location_name TEXT;'
  });

  if (error) {
    console.error('Error adding column via RPC:', error);
    console.log('\nTrying direct SQL execution...');

    // Try using the management API instead
    const { Client } = require('pg');
    const client = new Client({
      connectionString: 'postgresql://postgres.hagfscurfkqfsjkczjyi:popalock2025@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('Connected to PostgreSQL');

      const result = await client.query('ALTER TABLE gmb_oauth_tokens ADD COLUMN IF NOT EXISTS selected_location_name TEXT;');
      console.log('Column added successfully!', result);

      await client.end();
    } catch (pgError) {
      console.error('PostgreSQL error:', pgError);
    }
  } else {
    console.log('Column added successfully!');
  }

  // Verify the column was added
  console.log('\n2. Verifying column exists...');
  const { data: testData, error: testError } = await supabase
    .from('gmb_oauth_tokens')
    .update({ selected_location_name: 'test' })
    .eq('franchisee_id', '4c8b70f3-797b-4384-869e-e1fb3919f615')
    .select();

  if (testError) {
    console.error('Verification failed:', testError);
  } else {
    console.log('Verification successful! Column is accessible.');
  }
}

fixTable().catch(console.error);
