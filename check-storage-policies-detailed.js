const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStoragePolicies() {
  console.log('🔍 Checking Supabase storage setup...\n');

  try {
    // 1. List all storage buckets
    console.log('📦 STORAGE BUCKETS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
    } else {
      if (buckets && buckets.length > 0) {
        buckets.forEach(bucket => {
          console.log(`✅ ${bucket.id}`);
          console.log(`   Name: ${bucket.name}`);
          console.log(`   Public: ${bucket.public}`);
          console.log(`   Created: ${bucket.created_at}`);
        });
      } else {
        console.log('📂 No storage buckets found');
      }
    }

    // 2. Check for job photo or tech submission buckets specifically
    console.log('\n🎯 JOB PHOTO & TECH SUBMISSION BUCKETS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const targetBuckets = ['job-photos', 'tech-photos', 'tech-submissions', 'job-submissions', 'media-uploads'];

    for (const bucketName of targetBuckets) {
      const foundBucket = buckets?.find(b => b.id === bucketName);
      if (foundBucket) {
        console.log(`✅ ${bucketName} exists`);

        // Check files in this bucket
        const { data: files, error: filesError } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 10 });

        if (!filesError && files) {
          console.log(`   Files: ${files.length} items`);
        }
      } else {
        console.log(`❌ ${bucketName} does not exist`);
      }
    }

    // 3. Try to access storage policies via direct SQL
    console.log('\n🛡️  STORAGE POLICIES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      // Try to query policies from storage.objects table
      const { data: policies, error: policyError } = await supabase
        .rpc('get_storage_policies_info');

      if (policyError) {
        console.log('❌ Custom RPC not available:', policyError.message);

        // Try alternative approach - query system catalogs
        console.log('\n🔄 Trying alternative policy check...');

        const { data: altPolicies, error: altError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'storage');

        if (altError) {
          console.log('❌ Cannot access information_schema:', altError.message);
        } else {
          console.log('✅ Storage schema tables:', altPolicies?.map(t => t.table_name).join(', '));
        }
      } else {
        console.log('✅ Storage policies:', policies);
      }
    } catch (policyError) {
      console.log('⚠️ Unable to check policies directly:', policyError.message);
    }

    // 4. Test bucket access
    console.log('\n🧪 BUCKET ACCESS TESTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const bucket of (buckets || [])) {
      console.log(`\n🔍 Testing ${bucket.id} bucket:`);

      // Test list access
      try {
        const { data: testFiles, error: testError } = await supabase.storage
          .from(bucket.id)
          .list('', { limit: 5 });

        if (testError) {
          console.log(`   ❌ List access: ${testError.message}`);
        } else {
          console.log(`   ✅ List access: ${testFiles.length} files visible`);
        }
      } catch (err) {
        console.log(`   ❌ List access: ${err.message}`);
      }

      // Test upload access (with a tiny test file)
      try {
        const testFileName = `test-access-${Date.now()}.txt`;
        const testContent = new Blob(['test'], { type: 'text/plain' });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket.id)
          .upload(testFileName, testContent);

        if (uploadError) {
          console.log(`   ❌ Upload access: ${uploadError.message}`);
        } else {
          console.log(`   ✅ Upload access: test file uploaded`);

          // Clean up test file
          await supabase.storage.from(bucket.id).remove([testFileName]);
        }
      } catch (err) {
        console.log(`   ❌ Upload access: ${err.message}`);
      }
    }

    // 5. Storage recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const hasJobPhotoBucket = buckets?.some(b =>
      ['job-photos', 'tech-photos', 'tech-submissions'].includes(b.id)
    );

    if (!hasJobPhotoBucket) {
      console.log('🚀 CREATE MISSING BUCKETS:');
      console.log('   • job-photos - for tech-submitted photos');
      console.log('   • job-reports - for generated PDF reports');
      console.log('   • tech-uploads - for tech media uploads');
    }

    console.log('\n🔐 SECURITY SETUP:');
    console.log('   • Enable RLS on storage.objects');
    console.log('   • Create policies for tech upload access');
    console.log('   • Create policies for franchisee review access');
    console.log('   • Set up public read for approved photos');

    console.log('\n⚡ PERFORMANCE OPTIMIZATION:');
    console.log('   • Migrate from base64 storage to bucket URLs');
    console.log('   • Implement image compression/optimization');
    console.log('   • Set up CDN for faster photo loading');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkStoragePolicies();