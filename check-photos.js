const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPhotos() {
  const { data: jobs } = await supabase
    .from('job_submissions')
    .select('id, before_photos, after_photos, process_photos, service_category, created_at')
    .eq('franchisee_id', '4c8b70f3-797b-4384-869e-e1fb3919f615')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('Recent job submissions:\n');
  jobs?.forEach((job, i) => {
    const totalPhotos = 
      (job.before_photos?.length || 0) + 
      (job.after_photos?.length || 0) + 
      (job.process_photos?.length || 0);
    
    console.log(`${i + 1}. Job ${job.id.substring(0, 8)}`);
    console.log(`   Category: ${job.service_category}`);
    console.log(`   Before: ${job.before_photos?.length || 0} photos`);
    console.log(`   After: ${job.after_photos?.length || 0} photos`);
    console.log(`   Process: ${job.process_photos?.length || 0} photos`);
    console.log(`   TOTAL: ${totalPhotos} photos`);
    console.log(`   Created: ${job.created_at}\n`);
  });
}

checkPhotos().then(() => process.exit(0));
