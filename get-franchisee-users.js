/**
 * Script to find users with the franchisee role
 * Queries the profiles table joined with roles table
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getFranchiseeUsers() {
  try {
    console.log('🔍 Fetching users with franchisee role...\n');
    console.log('SQL Query:');
    console.log('SELECT p.id, p.email, p.full_name, p.franchisee_id, r.name as role_name');
    console.log('FROM profiles p');
    console.log('LEFT JOIN roles r ON p.role_id = r.id');
    console.log('WHERE r.name = \'franchisee\'');
    console.log('LIMIT 10;\n');
    console.log('='.repeat(80));

    // First, get the franchisee role_id
    const { data: franchiseeRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'franchisee')
      .single();

    if (!franchiseeRole) {
      console.error('❌ Franchisee role not found in roles table');
      process.exit(1);
    }

    console.log(`\nFranchisee role_id: ${franchiseeRole.id}\n`);

    // Query the profiles table joined with roles table to find all franchisees
    const { data: franchiseeUsers, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        franchisee_id,
        created_at,
        roles (
          id,
          name,
          description
        )
      `)
      .eq('role_id', franchiseeRole.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching franchisee users:', error);
      process.exit(1);
    }

    console.log(`\n✅ Found ${franchiseeUsers?.length || 0} users with franchisee role:\n`);

    if (franchiseeUsers && franchiseeUsers.length > 0) {
      // Display results in a table format
      console.log('ID'.padEnd(38) + 'Email'.padEnd(35) + 'Full Name'.padEnd(25) + 'Franchisee ID'.padEnd(38) + 'Role');
      console.log('-'.repeat(160));

      franchiseeUsers.forEach((user) => {
        const id = (user.id || '').toString().substring(0, 36).padEnd(38);
        const email = (user.email || '').substring(0, 33).padEnd(35);
        const fullName = (user.full_name || '').substring(0, 23).padEnd(25);
        const franchiseeId = (user.franchisee_id || 'NULL').toString().substring(0, 36).padEnd(38);
        const role = user.roles?.name || 'unknown';

        console.log(`${id}${email}${fullName}${franchiseeId}${role}`);
      });

      console.log('\n' + '='.repeat(80));
      console.log('\nDetailed Information:\n');

      franchiseeUsers.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Full Name: ${user.full_name}`);
        console.log(`  Franchisee ID: ${user.franchisee_id || 'NULL'}`);
        console.log(`  Role Name: ${user.roles?.name || 'unknown'}`);
        console.log(`  Role Description: ${user.roles?.description || 'N/A'}`);
        console.log(`  Created At: ${user.created_at}`);
        console.log('');
      });
    } else {
      console.log('No franchisee users found.');
    }

    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the query
getFranchiseeUsers();
