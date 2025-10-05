const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPhotoStorage() {
  console.log('📸 Analyzing current photo storage setup...\n');

  try {
    // Check if franchisee_photos table exists
    console.log('🔍 Checking franchisee_photos table...');
    const { data: franchiseePhotos, error: franchiseeError } = await supabase
      .from('franchisee_photos')
      .select('*')
      .limit(5);

    if (franchiseeError) {
      console.log('❌ franchisee_photos table:', franchiseeError.message);
    } else {
      console.log(`✅ franchisee_photos table exists with ${franchiseePhotos.length} sample records`);
      if (franchiseePhotos.length > 0) {
        console.log('   Columns:', Object.keys(franchiseePhotos[0]).join(', '));
        console.log('   Sample photo_url:', franchiseePhotos[0].photo_url?.substring(0, 50) + '...');
      }
    }

    // Check job_submissions table for photo storage
    console.log('\n🔍 Checking job_submissions table photo arrays...');
    const { data: jobSubmissions, error: jobError } = await supabase
      .from('job_submissions')
      .select('id, before_photos, after_photos, process_photos')
      .limit(5);

    if (jobError) {
      console.log('❌ job_submissions table:', jobError.message);
    } else {
      console.log(`✅ job_submissions table exists with ${jobSubmissions.length} sample records`);
      if (jobSubmissions.length > 0) {
        const totalPhotos = jobSubmissions.reduce((total, job) => {
          const before = (job.before_photos || []).length;
          const after = (job.after_photos || []).length;
          const process = (job.process_photos || []).length;
          return total + before + after + process;
        }, 0);
        console.log(`   Total photos across all jobs: ${totalPhotos}`);

        // Show photo storage method
        const sampleJob = jobSubmissions.find(job =>
          (job.before_photos && job.before_photos.length > 0) ||
          (job.after_photos && job.after_photos.length > 0) ||
          (job.process_photos && job.process_photos.length > 0)
        );

        if (sampleJob) {
          console.log('   Sample photo storage format:');
          if (sampleJob.before_photos && sampleJob.before_photos.length > 0) {
            console.log(`     before_photos[0]: ${sampleJob.before_photos[0].substring(0, 50)}...`);
          }
          if (sampleJob.after_photos && sampleJob.after_photos.length > 0) {
            console.log(`     after_photos[0]: ${sampleJob.after_photos[0].substring(0, 50)}...`);
          }
          if (sampleJob.process_photos && sampleJob.process_photos.length > 0) {
            console.log(`     process_photos[0]: ${sampleJob.process_photos[0].substring(0, 50)}...`);
          }
        }
      }
    }

    // Check for any other photo-related tables
    console.log('\n🔍 Checking for other photo-related tables...');
    const photoRelatedTables = ['media_archive', 'job_photos', 'tech_photos', 'customer_photos'];

    for (const tableName of photoRelatedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: exists (${data.length} sample records)`);
          if (data.length > 0) {
            console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
          }
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }

    // Analyze photo storage patterns
    console.log('\n📊 Photo Storage Analysis:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check if photos are stored as base64 data URLs or as storage bucket URLs
    if (jobSubmissions && jobSubmissions.length > 0) {
      const allPhotos = [];
      jobSubmissions.forEach(job => {
        if (job.before_photos) allPhotos.push(...job.before_photos);
        if (job.after_photos) allPhotos.push(...job.after_photos);
        if (job.process_photos) allPhotos.push(...job.process_photos);
      });

      if (allPhotos.length > 0) {
        const base64Photos = allPhotos.filter(photo => photo.startsWith('data:'));
        const urlPhotos = allPhotos.filter(photo => photo.startsWith('http'));
        const blobPhotos = allPhotos.filter(photo => photo.startsWith('blob:'));
        const storagePhotos = allPhotos.filter(photo => photo.includes('supabase'));

        console.log(`📈 Photo Storage Methods:`);
        console.log(`   📄 Base64 data URLs: ${base64Photos.length}`);
        console.log(`   🌐 HTTP URLs: ${urlPhotos.length}`);
        console.log(`   🔗 Blob URLs: ${blobPhotos.length}`);
        console.log(`   🗄️  Supabase Storage URLs: ${storagePhotos.length}`);
        console.log(`   📊 Total photos: ${allPhotos.length}`);

        if (base64Photos.length > 0) {
          const avgSize = base64Photos.reduce((sum, photo) => sum + photo.length, 0) / base64Photos.length;
          console.log(`   📏 Average base64 size: ${Math.round(avgSize).toLocaleString()} characters`);
        }
      }
    }

    console.log('\n🎯 Recommendations:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (franchiseeError && franchiseeError.message.includes('relation') && franchiseeError.message.includes('does not exist')) {
      console.log('⚠️  The franchisee_photos table does not exist yet');
      console.log('   → Run the table creation script to enable photo management workflow');
    }

    // Suggest creating dedicated storage buckets for job photos
    console.log('💡 Storage Bucket Recommendations:');
    console.log('   → Create "job-photos" bucket for tech-submitted photos');
    console.log('   → Create "job-reports" bucket for generated PDF reports');
    console.log('   → Set up proper RLS policies for tech/franchisee access');
    console.log('   → Consider migrating from base64 to storage buckets for better performance');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkPhotoStorage();