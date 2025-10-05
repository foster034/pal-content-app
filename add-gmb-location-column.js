require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addGMBLocationColumn() {
  console.log('📍 Adding gmb_location_id column to franchisees table...');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE franchisees ADD COLUMN IF NOT EXISTS gmb_location_id TEXT;
      COMMENT ON COLUMN franchisees.gmb_location_id IS 'Google My Business location ID for direct posting';
    `
  });

  if (error) {
    console.error('❌ Error:', error);
    console.log('\n🔧 Please run this SQL manually in Supabase dashboard:');
    console.log('ALTER TABLE franchisees ADD COLUMN IF NOT EXISTS gmb_location_id TEXT;');
  } else {
    console.log('✅ Column added successfully!');
  }
}

addGMBLocationColumn();
