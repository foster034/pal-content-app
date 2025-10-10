require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkAdminProfile() {
  try {
    console.log('\n=== Checking Admin User Profile ===\n');

    // Step 1: Get user from auth.users
    console.log('Step 1: Querying auth.users for admin@test.ca...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }

    const adminUser = authData.users.find(user => user.email === 'admin@test.ca');

    if (!adminUser) {
      console.log('❌ User with email admin@test.ca not found in auth.users');
      return;
    }

    console.log('✅ Found admin user in auth.users:');
    console.log('   ID:', adminUser.id);
    console.log('   Email:', adminUser.email);
    console.log('   Created:', adminUser.created_at);
    console.log('   Last Sign In:', adminUser.last_sign_in_at);

    // Step 2: Get profile from profiles table
    console.log('\nStep 2: Querying profiles table...');
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }

    if (!profileData) {
      console.log('❌ No profile found for this user');
      return;
    }

    console.log('✅ Found profile data:');
    console.log('   ID:', profileData.id);
    console.log('   Email:', profileData.email);
    console.log('   Full Name:', profileData.full_name);
    console.log('   Role ID:', profileData.role_id);
    console.log('   Franchisee ID:', profileData.franchisee_id);
    console.log('   Avatar URL:', profileData.avatar_url);
    console.log('   Phone:', profileData.phone);
    console.log('   Created At:', profileData.created_at);
    console.log('   Updated At:', profileData.updated_at);

    // Step 3: If role_id exists, get role details
    if (profileData.role_id) {
      console.log('\nStep 3: Querying roles table...');
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('roles')
        .select('*')
        .eq('id', profileData.role_id)
        .single();

      if (roleError) {
        console.error('❌ Error fetching role:', roleError);
      } else if (roleData) {
        console.log('✅ Found role data:');
        console.log('   Role ID:', roleData.id);
        console.log('   Role Name:', roleData.name);
        console.log('   Description:', roleData.description);
        console.log('   Permissions:', JSON.stringify(roleData.permissions, null, 2));
      }
    } else {
      console.log('\n⚠️  No role_id assigned to this profile');
    }

    // Step 4: If franchisee_id exists, get franchisee details
    if (profileData.franchisee_id) {
      console.log('\nStep 4: Querying franchisees table...');
      const { data: franchiseeData, error: franchiseeError } = await supabaseAdmin
        .from('franchisees')
        .select('*')
        .eq('id', profileData.franchisee_id)
        .single();

      if (franchiseeError) {
        console.error('❌ Error fetching franchisee:', franchiseeError);
      } else if (franchiseeData) {
        console.log('✅ Found franchisee data:');
        console.log('   Franchisee ID:', franchiseeData.id);
        console.log('   Business Name:', franchiseeData.business_name);
        console.log('   Email:', franchiseeData.email);
      }
    } else {
      console.log('\n⚠️  No franchisee_id assigned to this profile');
    }

    console.log('\n=== Check Complete ===\n');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAdminProfile();
