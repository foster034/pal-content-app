const { createClient } = require('@supabase/supabase-js');

async function checkJobSummariesData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Checking job summaries and AI-generated content...');

  // Check job_submissions table for AI summaries
  const { data: jobSubmissions, error: jobError } = await supabase
    .from('job_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (jobError) {
    console.error('❌ Error fetching job submissions:', jobError);
  } else {
    console.log(`📝 Recent job_submissions (${jobSubmissions?.length || 0}):`);
    if (jobSubmissions && jobSubmissions.length > 0) {
      jobSubmissions.forEach(job => {
        console.log(`\n  Job ID: ${job.id}`);
        console.log(`  Description: ${job.description?.substring(0, 100)}...`);
        console.log(`  AI Summary: ${job.ai_generated_summary || 'No AI summary'}`.substring(0, 200));
        console.log(`  Client Info: ${job.client_name || 'No client'} | ${job.client_phone || 'No phone'}`);
        console.log(`  Service: ${job.service_category} - ${job.service_type}`);
        console.log(`  Location: ${job.service_location}`);
        console.log(`  Created: ${job.created_at}`);
      });
    }
  }

  // Check franchisee_photos table to see what data is available
  const { data: franchiseePhotos, error: photoError } = await supabase
    .from('franchisee_photos')
    .select('*')
    .limit(5);

  if (photoError) {
    console.error('❌ Error fetching franchisee photos:', photoError);
  } else {
    console.log(`\n📸 Franchisee_photos records (${franchiseePhotos?.length || 0}):`);
    if (franchiseePhotos && franchiseePhotos.length > 0) {
      franchiseePhotos.forEach(photo => {
        console.log(`\n  Photo ID: ${photo.id}`);
        console.log(`  Job Submission ID: ${photo.job_submission_id}`);
        console.log(`  Job Description: ${photo.job_description || 'No description'}`.substring(0, 100));
        console.log(`  Service: ${photo.service_category} - ${photo.service_type}`);
        console.log(`  Location: ${photo.service_location}`);
        console.log(`  Status: ${photo.status}`);
      });
    }
  }

  // Check if we need to join job_submissions to get AI summaries
  const { data: joinedData, error: joinError } = await supabase
    .from('franchisee_photos')
    .select(`
      *,
      job_submissions!inner(
        ai_generated_summary,
        client_name,
        client_phone,
        client_email,
        description
      )
    `)
    .limit(3);

  if (joinError) {
    console.error('❌ Error with joined query:', joinError);
  } else {
    console.log(`\n🔗 Joined data (photos with job summaries) (${joinedData?.length || 0}):`);
    if (joinedData && joinedData.length > 0) {
      joinedData.forEach(record => {
        console.log(`\n  Photo ID: ${record.id}`);
        console.log(`  AI Summary from job_submissions: ${record.job_submissions?.ai_generated_summary || 'No AI summary'}`.substring(0, 200));
        console.log(`  Client: ${record.job_submissions?.client_name || 'No client'}`);
        console.log(`  Original job desc: ${record.job_submissions?.description || 'No desc'}`.substring(0, 100));
      });
    }
  }
}

checkJobSummariesData().catch(console.error);