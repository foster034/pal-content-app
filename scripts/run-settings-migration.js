const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Read the SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, '..', 'database', 'create-settings-table.sql'),
      'utf8'
    );

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    }).single();

    if (error) {
      // If RPC doesn't exist, try direct approach
      console.log('RPC not available, creating table directly...');

      // Create table
      const { error: createError } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1);

      // If table doesn't exist, we need to create it via Supabase dashboard
      if (createError && createError.message.includes('relation') && createError.message.includes('does not exist')) {
        console.log('\n⚠️  Table needs to be created in Supabase Dashboard:');
        console.log('\n1. Go to your Supabase Dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Run the following SQL:\n');
        console.log(sql);
        return;
      }
    }

    console.log('✅ Settings table migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

runMigration();