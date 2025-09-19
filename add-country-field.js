const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addCountryField() {
  console.log('🌍 Adding country field to franchisees table...\n');

  try {
    // Add country column to franchisees table
    console.log('1️⃣ Adding country column...');
    const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE franchisees
        ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';
      `
    });

    if (alterError) {
      // Try direct SQL execution approach
      console.log('Trying alternative approach...');

      // First, let's check if the column already exists
      const { data: columns, error: columnsError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'franchisees')
        .eq('column_name', 'country');

      if (columnsError) {
        console.log('⚠️  Cannot check existing columns:', columnsError.message);
      }

      if (!columns || columns.length === 0) {
        console.log('❌ Cannot add column directly. Need to use database migration.');
        console.log('Please run this SQL in your Supabase dashboard:');
        console.log('');
        console.log('ALTER TABLE franchisees ADD COLUMN country TEXT DEFAULT \'United States\';');
        console.log('');
        return;
      } else {
        console.log('✅ Country column already exists');
      }
    } else {
      console.log('✅ Country column added successfully');
    }

    // Update existing franchisees with default country
    console.log('\n2️⃣ Updating existing franchisees with default country...');
    const { error: updateError } = await supabaseAdmin
      .from('franchisees')
      .update({ country: 'United States' })
      .is('country', null);

    if (updateError) {
      console.log('⚠️  Error updating existing records:', updateError.message);
    } else {
      console.log('✅ Updated existing franchisees with default country');
    }

    // Verify the changes
    console.log('\n3️⃣ Verifying changes...');
    const { data: franchisees, error: selectError } = await supabaseAdmin
      .from('franchisees')
      .select('business_name, country')
      .limit(5);

    if (selectError) {
      console.log('⚠️  Error verifying changes:', selectError.message);
    } else {
      console.log('✅ Current franchisees:');
      franchisees.forEach(f => {
        console.log(`   - ${f.business_name}: ${f.country || 'NULL'}`);
      });
    }

    console.log('\n🎉 Country field setup complete!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

addCountryField();