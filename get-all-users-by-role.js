/**
 * Script to get all users grouped by role
 * Queries the profiles table joined with roles table
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getAllUsersByRole() {
  try {
    console.log('🔍 Fetching all users grouped by role...\n');
    console.log('='.repeat(80));

    // First, get all roles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id, name, description')
      .order('name');

    if (rolesError) {
      console.error('❌ Error fetching roles:', rolesError);
      process.exit(1);
    }

    console.log(`\n✅ Found ${roles?.length || 0} roles in the system:\n`);

    roles?.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name} (ID: ${role.id})`);
      console.log(`   ${role.description}`);
    });

    console.log('\n' + '='.repeat(80));

    // Get all profiles with their roles
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        franchisee_id,
        role_id,
        created_at,
        roles (
          id,
          name,
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      process.exit(1);
    }

    console.log(`\n✅ Found ${allUsers?.length || 0} total users\n`);

    // Group users by role
    const usersByRole = {};
    allUsers?.forEach((user) => {
      const roleName = user.roles?.name || 'unknown';
      if (!usersByRole[roleName]) {
        usersByRole[roleName] = [];
      }
      usersByRole[roleName].push(user);
    });

    // Display summary
    console.log('User count by role:');
    Object.entries(usersByRole).forEach(([roleName, users]) => {
      console.log(`  ${roleName}: ${users.length}`);
    });

    console.log('\n' + '='.repeat(80));

    // Display detailed information for each role
    Object.entries(usersByRole).forEach(([roleName, users]) => {
      console.log(`\n${roleName.toUpperCase()} USERS (${users.length}):\n`);

      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email}`);
        console.log(`     Name: ${user.full_name || 'N/A'}`);
        console.log(`     User ID: ${user.id}`);
        console.log(`     Franchisee ID: ${user.franchisee_id || 'NULL'}`);
        console.log(`     Created: ${user.created_at}`);
        console.log('');
      });
    });

    console.log('='.repeat(80));

    // Special focus on franchisee users
    const franchiseeUsers = usersByRole['franchisee'] || [];
    if (franchiseeUsers.length > 0) {
      console.log(`\n📊 FRANCHISEE USERS DETAILED REPORT:\n`);

      franchiseeUsers.forEach((user, index) => {
        console.log(`Franchisee ${index + 1}:`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Full Name: ${user.full_name}`);
        console.log(`  User ID: ${user.id}`);
        console.log(`  Franchisee ID: ${user.franchisee_id || 'NOT LINKED'}`);
        console.log(`  Role: ${user.roles?.name}`);
        console.log(`  Role Description: ${user.roles?.description}`);
        console.log(`  Created: ${user.created_at}`);
        console.log('');
      });

      console.log('='.repeat(80));
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the query
getAllUsersByRole();
