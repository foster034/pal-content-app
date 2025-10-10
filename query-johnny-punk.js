// Query script to find Johnny Punk's franchisee_id
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function queryJohnnyPunk() {
  const technicianId = '718b58a8-9cef-4cca-9d0a-7838a0374925';

  console.log('🔍 Querying technician with ID:', technicianId);
  console.log('');

  // Query 1: Get technician details
  const { data: technician, error: techError } = await supabase
    .from('technicians')
    .select('id, name, email, franchisee_id')
    .eq('id', technicianId)
    .single();

  if (techError) {
    console.error('❌ Error fetching technician:', techError.message);
    return;
  }

  if (!technician) {
    console.error('❌ Technician not found');
    return;
  }

  console.log('✅ TECHNICIAN FOUND:');
  console.log('─────────────────────────────────────────────────');
  console.log('ID:            ', technician.id);
  console.log('Name:          ', technician.name);
  console.log('Email:         ', technician.email);
  console.log('Franchisee ID: ', technician.franchisee_id || '(NULL)');
  console.log('─────────────────────────────────────────────────');
  console.log('');

  // Query 2: Verify franchisee exists
  if (technician.franchisee_id) {
    console.log('🔍 Querying franchisee with ID:', technician.franchisee_id);
    console.log('');

    const { data: franchisee, error: franchiseeError } = await supabase
      .from('franchisees')
      .select('id, business_name, territory')
      .eq('id', technician.franchisee_id)
      .single();

    if (franchiseeError) {
      console.error('❌ Error fetching franchisee:', franchiseeError.message);
      console.log('');
      console.log('⚠️  WARNING: Technician has franchisee_id but franchisee not found in database!');
      return;
    }

    if (!franchisee) {
      console.error('❌ Franchisee not found');
      console.log('');
      console.log('⚠️  WARNING: Technician has franchisee_id but franchisee not found in database!');
      return;
    }

    console.log('✅ FRANCHISEE FOUND:');
    console.log('─────────────────────────────────────────────────');
    console.log('ID:            ', franchisee.id);
    console.log('Business Name: ', franchisee.business_name);
    console.log('Territory:     ', franchisee.territory || '(not set)');
    console.log('─────────────────────────────────────────────────');
    console.log('');
    console.log('✅ SUCCESS: Valid franchisee association confirmed!');
  } else {
    console.log('⚠️  WARNING: Technician has no franchisee_id assigned!');
  }
}

queryJohnnyPunk()
  .then(() => {
    console.log('');
    console.log('✅ Query completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  });
