const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listStorageBuckets() {
  console.log('🗃️ Listing all Supabase storage buckets...\n');

  try {
    // List all storage buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Error listing buckets:', error);
      return;
    }

    if (!buckets || buckets.length === 0) {
      console.log('📂 No storage buckets found');
      return;
    }

    console.log(`✅ Found ${buckets.length} storage bucket(s):\n`);

    for (const bucket of buckets) {
      console.log(`📦 Bucket: ${bucket.id}`);
      console.log(`   Name: ${bucket.name}`);
      console.log(`   Public: ${bucket.public}`);
      console.log(`   Created: ${bucket.created_at}`);
      console.log(`   Updated: ${bucket.updated_at}`);

      // List files in this bucket
      try {
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket.id)
          .list('', { limit: 10 });

        if (filesError) {
          console.log(`   Files: Error listing files - ${filesError.message}`);
        } else {
          console.log(`   Files: ${files.length} items`);
          if (files.length > 0) {
            files.slice(0, 5).forEach(file => {
              console.log(`     - ${file.name} (${file.metadata?.size || 'unknown size'})`);
            });
            if (files.length > 5) {
              console.log(`     ... and ${files.length - 5} more`);
            }
          }
        }
      } catch (fileError) {
        console.log(`   Files: Error - ${fileError.message}`);
      }

      console.log('');
    }

    // Check for storage policies
    console.log('🔐 Checking storage policies...\n');

    for (const bucket of buckets) {
      console.log(`🛡️ Policies for bucket '${bucket.id}':`);

      try {
        // Try to get policies using RPC call
        const { data: policies, error: policyError } = await supabase
          .rpc('get_storage_policies', { bucket_name: bucket.id });

        if (policyError) {
          console.log(`   Could not retrieve policies: ${policyError.message}`);
        } else if (policies && policies.length > 0) {
          policies.forEach(policy => {
            console.log(`   - ${policy.policyname} (${policy.cmd})`);
          });
        } else {
          console.log(`   No policies found`);
        }
      } catch (error) {
        console.log(`   Could not check policies: ${error.message}`);
      }

      console.log('');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

listStorageBuckets();