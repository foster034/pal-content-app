const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStoragePolicies() {
  console.log('🔍 Checking storage policies for avatars bucket...\n');

  try {
    // Query storage policies for avatars bucket
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('*')
      .ilike('tablename', '%objects%')
      .ilike('policyname', '%avatar%');

    if (error) {
      console.error('❌ Error querying policies:', error);

      // Try direct SQL query instead
      console.log('\n🔄 Trying direct SQL query...');
      const { data: sqlPolicies, error: sqlError } = await supabase.rpc('get_storage_policies');

      if (sqlError) {
        console.error('❌ SQL query also failed:', sqlError);

        // Try querying without filters
        console.log('\n🔄 Trying to query all policies...');
        const { data: allPolicies, error: allError } = await supabase
          .from('pg_policies')
          .select('*')
          .limit(50);

        if (allError) {
          console.error('❌ Could not query policies at all:', allError);
        } else {
          console.log('✅ Found policies (showing first 10):');
          allPolicies.slice(0, 10).forEach(policy => {
            console.log(`  - ${policy.policyname} on ${policy.tablename} (${policy.cmd})`);
          });
        }
      } else {
        console.log('✅ Storage policies:', sqlPolicies);
      }
    } else {
      console.log('✅ Found avatar-related policies:');
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname}`);
        console.log(`    Table: ${policy.tablename}`);
        console.log(`    Command: ${policy.cmd}`);
        console.log(`    Role: ${policy.roles}`);
        console.log(`    Expression: ${policy.qual || policy.with_check || 'None'}`);
        console.log('');
      });
    }

    // Check if avatars bucket exists
    console.log('📂 Checking avatars bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
    } else {
      const avatarsBucket = buckets.find(b => b.id === 'avatars');
      if (avatarsBucket) {
        console.log('✅ Avatars bucket exists:');
        console.log(`  - ID: ${avatarsBucket.id}`);
        console.log(`  - Name: ${avatarsBucket.name}`);
        console.log(`  - Public: ${avatarsBucket.public}`);
        console.log(`  - Created: ${avatarsBucket.created_at}`);
      } else {
        console.log('❌ Avatars bucket not found');
      }
    }

    // Test upload for specific technician ID
    console.log('\n🧪 Testing storage access for technician f95f54d7-51be-4f55-a081-2d3b692ff5d9...');

    // Find the technician first
    const { data: tech, error: techError } = await supabase
      .from('technicians')
      .select('id, user_id, name, email')
      .eq('id', 'f95f54d7-51be-4f55-a081-2d3b692ff5d9')
      .single();

    if (techError) {
      console.log('❌ Technician not found:', techError.message);
    } else {
      console.log('✅ Found technician:');
      console.log(`  - Name: ${tech.name}`);
      console.log(`  - Email: ${tech.email}`);
      console.log(`  - User ID: ${tech.user_id || 'Not linked'}`);

      if (tech.user_id) {
        // Check if user exists in auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(tech.user_id);

        if (authError) {
          console.log('❌ Auth user not found:', authError.message);
        } else {
          console.log('✅ Auth user exists:');
          console.log(`  - Email: ${authUser.user.email}`);
          console.log(`  - Created: ${authUser.user.created_at}`);
          console.log(`  - Role: ${authUser.user.role || 'authenticated'}`);
        }
      }
    }

    // Check current storage objects in avatars bucket
    console.log('\n📁 Checking current files in avatars bucket...');
    const { data: files, error: filesError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 20 });

    if (filesError) {
      console.log('❌ Error listing files:', filesError.message);
    } else {
      console.log(`✅ Found ${files.length} items in avatars bucket:`);
      files.forEach(file => {
        console.log(`  - ${file.name} (${file.metadata?.size || 'unknown size'})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkStoragePolicies();