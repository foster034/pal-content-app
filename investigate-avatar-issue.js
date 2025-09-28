const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigateAvatarIssue() {
  console.log('🔍 Investigating avatar upload issue for technician 8D0LS9...\n');

  try {
    // 1. Find technician with tech_code 8D0LS9
    console.log('1️⃣ Looking for technician with login_code 8D0LS9...');
    const { data: tech, error: techError } = await supabase
      .from('technicians')
      .select('*')
      .eq('login_code', '8D0LS9')
      .single();

    if (techError) {
      console.error('❌ Error finding technician:', techError);
      return;
    }

    if (!tech) {
      console.log('❌ No technician found with login_code 8D0LS9');
      return;
    }

    console.log('✅ Found technician:');
    console.log('  - ID:', tech.id);
    console.log('  - Name:', tech.name);
    console.log('  - Email:', tech.email);
    console.log('  - User ID:', tech.user_id);
    console.log('  - Image URL:', tech.image_url);
    console.log('  - Avatar URL (if exists):', tech.avatar_url || 'Not set');

    // 2. Check profiles table if user_id exists
    if (tech.user_id) {
      console.log('\n2️⃣ Checking profiles table for user_id:', tech.user_id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', tech.user_id)
        .single();

      if (profileError) {
        console.log('❌ No profile found or error:', profileError.message);
      } else {
        console.log('✅ Found profile:');
        console.log('  - Full Name:', profile.full_name);
        console.log('  - Avatar URL:', profile.avatar_url || 'Not set');
        console.log('  - Role:', profile.role);
        console.log('  - Phone:', profile.phone);
        console.log('  - Address:', profile.address);
      }
    } else {
      console.log('\n2️⃣ No user_id linked to technician - profile likely doesn\'t exist');
    }

    // 3. Check avatars storage bucket for files
    console.log('\n3️⃣ Checking avatars storage bucket...');
    const { data: files, error: storageError } = await supabase
      .storage
      .from('avatars')
      .list('profile-avatars', {
        limit: 100,
        offset: 0
      });

    if (storageError) {
      console.log('❌ Error accessing avatars bucket:', storageError.message);
    } else {
      console.log(`✅ Found ${files.length} files in avatars/profile-avatars:`);
      files.forEach(file => {
        console.log(`  - ${file.name} (size: ${file.metadata?.size || 'unknown'}, updated: ${file.updated_at})`);
      });
    }

    // 4. Show technicians table structure by getting all fields from a sample record
    console.log('\n4️⃣ Showing technicians table structure...');
    const { data: sampleTech } = await supabase
      .from('technicians')
      .select('*')
      .limit(1)
      .single();

    if (sampleTech) {
      console.log('Available fields in technicians table:');
      Object.keys(sampleTech).forEach(key => {
        console.log(`  - ${key}: ${typeof sampleTech[key]} (${sampleTech[key] !== null ? 'has value' : 'null'})`);
      });
    }

    // 5. Check if there are any files in the root of avatars bucket too
    console.log('\n5️⃣ Checking root of avatars bucket...');
    const { data: rootFiles, error: rootError } = await supabase
      .storage
      .from('avatars')
      .list('', {
        limit: 100,
        offset: 0
      });

    if (rootError) {
      console.log('❌ Error accessing avatars bucket root:', rootError.message);
    } else {
      console.log(`✅ Found ${rootFiles.length} items in avatars bucket root:`);
      rootFiles.forEach(file => {
        console.log(`  - ${file.name} (type: ${file.metadata?.mimetype || 'folder'}, updated: ${file.updated_at})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

investigateAvatarIssue();