const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStoragePoliciesDirect() {
  console.log('🔍 Checking Row Level Security policies for storage.objects...\n');

  try {
    // Use raw SQL to check policies on storage.objects table
    const { data: policies, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
        ORDER BY policyname;
      `
    });

    if (error) {
      console.log('❌ Could not query via RPC, trying alternative approach...');

      // Try using a direct SQL execution if available
      const { data: altPolicies, error: altError } = await supabase
        .from('storage')
        .select('*')
        .limit(1);

      if (altError) {
        console.log('❌ Alternative approach failed:', altError.message);

        // Let's check what functions are available
        console.log('\n🔄 Checking available RPC functions...');
        const { data: functions, error: funcError } = await supabase.rpc('get_user_role', { user_id: 'test' });

        if (funcError) {
          console.log('❌ RPC functions not accessible');
        }

      } else {
        console.log('Storage table accessible:', altPolicies);
      }
    } else {
      console.log('✅ Storage policies found:');
      policies.forEach(policy => {
        console.log(`\n📋 Policy: ${policy.policyname}`);
        console.log(`   Schema: ${policy.schemaname}`);
        console.log(`   Table: ${policy.tablename}`);
        console.log(`   Command: ${policy.cmd}`);
        console.log(`   Roles: ${policy.roles ? policy.roles.join(', ') : 'None'}`);
        console.log(`   Condition (USING): ${policy.qual || 'None'}`);
        console.log(`   Check (WITH CHECK): ${policy.with_check || 'None'}`);
      });
    }

    // Test actual upload capability by simulating the issue
    console.log('\n🧪 Testing upload scenario for technician f95f54d7-51be-4f55-a081-2d3b692ff5d9...');

    // Get technician details
    const { data: tech, error: techError } = await supabase
      .from('technicians')
      .select('id, user_id, name, email')
      .eq('id', 'f95f54d7-51be-4f55-a081-2d3b692ff5d9')
      .single();

    if (techError) {
      console.log('❌ Technician not found:', techError.message);
      return;
    }

    console.log('✅ Technician found:');
    console.log(`   Name: ${tech.name}`);
    console.log(`   Email: ${tech.email}`);
    console.log(`   User ID: ${tech.user_id}`);

    if (!tech.user_id) {
      console.log('❌ Technician has no linked auth user_id - this could be the issue!');
      return;
    }

    // Check if auth user can access storage
    console.log('\n🔐 Creating client with user context...');

    // Get user session token (this is a simulation - in reality, this would come from the client)
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(tech.user_id);

    if (userError) {
      console.log('❌ Could not get user details:', userError.message);
      return;
    }

    console.log('✅ Auth user details:');
    console.log(`   Email: ${userData.user.email}`);
    console.log(`   Created: ${userData.user.created_at}`);
    console.log(`   Role: ${userData.user.role || 'authenticated'}`);

    // Try to test storage access with service role
    console.log('\n📤 Testing storage upload access...');

    // Create a small test file
    const testFileContent = 'test avatar content';
    const testFileName = `tech-avatars/${tech.user_id}-test-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testFileName, testFileContent, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message);
      console.log('   Error details:', uploadError);

      // This is likely where we'll see the RLS policy violation
      if (uploadError.message.includes('row-level security')) {
        console.log('\n🚨 ROW LEVEL SECURITY VIOLATION DETECTED!');
        console.log('   This means the storage policies are blocking the upload.');
        console.log('   The user may not have proper INSERT permissions on storage.objects');
      }
    } else {
      console.log('✅ Upload successful:', uploadData.path);

      // Clean up test file
      await supabase.storage.from('avatars').remove([testFileName]);
      console.log('🗑️  Test file cleaned up');
    }

    // Check profile record for this user
    console.log('\n👤 Checking profile record...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', tech.user_id)
      .single();

    if (profileError) {
      console.log('❌ Profile not found:', profileError.message);
      console.log('   This could indicate missing profile record which may affect RLS policies');
    } else {
      console.log('✅ Profile found:');
      console.log(`   Full name: ${profile.full_name}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Avatar URL: ${profile.avatar_url || 'None'}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkStoragePoliciesDirect();