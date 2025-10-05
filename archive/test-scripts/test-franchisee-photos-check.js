const { createClient } = require('@supabase/supabase-js');

async function checkFranchiseePhotos() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Checking franchisee_photos records...');

  // Check all franchisee_photos records
  const { data: allPhotos, error: allError } = await supabase
    .from('franchisee_photos')
    .select('*')
    .limit(10);

  if (allError) {
    console.error('❌ Error fetching all photos:', allError);
  } else {
    console.log(`📊 Total franchisee_photos records found: ${allPhotos?.length || 0}`);
    if (allPhotos && allPhotos.length > 0) {
      console.log('📋 Latest records:');
      allPhotos.forEach(photo => {
        console.log(`  - ID: ${photo.id}, Franchisee: ${photo.franchisee_id}, Tech: ${photo.technician_id}, Status: ${photo.status}, Created: ${photo.created_at}`);
      });
    }
  }

  // Check specifically for our target franchisee ID
  const targetFranchiseeId = '4c8b70f3-797b-4384-869e-e1fb3919f615';
  const { data: targetPhotos, error: targetError } = await supabase
    .from('franchisee_photos')
    .select('*')
    .eq('franchisee_id', targetFranchiseeId);

  if (targetError) {
    console.error('❌ Error fetching target franchisee photos:', targetError);
  } else {
    console.log(`🎯 Photos for franchisee ${targetFranchiseeId}: ${targetPhotos?.length || 0}`);
    if (targetPhotos && targetPhotos.length > 0) {
      targetPhotos.forEach(photo => {
        console.log(`  - ${photo.id}: ${photo.status} (Tech: ${photo.technician_id})`);
      });
    }
  }

  // Check recent job_submissions
  const { data: jobSubmissions, error: jobError } = await supabase
    .from('job_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (jobError) {
    console.error('❌ Error fetching job submissions:', jobError);
  } else {
    console.log(`📝 Recent job_submissions: ${jobSubmissions?.length || 0}`);
    if (jobSubmissions && jobSubmissions.length > 0) {
      jobSubmissions.forEach(job => {
        console.log(`  - Job ${job.id}: Franchisee ${job.franchisee_id}, Tech ${job.technician_id}, Created: ${job.created_at}`);
      });
    }
  }
}

checkFranchiseePhotos().catch(console.error);