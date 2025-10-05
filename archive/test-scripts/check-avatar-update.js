const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAvatarUpdate() {
  const technicianId = 'f95f54d7-51be-4f55-a081-2d3b692ff5d9';

  console.log('🔍 Checking avatar URL updates for technician:', technicianId);
  console.log('='.repeat(60));

  try {
    // 1. Query the technician record
    console.log('1. Checking technicians table...');
    const { data: techData, error: techError } = await supabase
      .from('technicians')
      .select('id, name, email, image_url, user_id')
      .eq('id', technicianId)
      .single();

    if (techError) {
      console.error('❌ Error querying technicians:', techError.message);
    } else if (techData) {
      console.log('✅ Technician record found:');
      console.log('   ID:', techData.id);
      console.log('   Name:', techData.name);
      console.log('   Email:', techData.email);
      console.log('   Image URL:', techData.image_url || 'NULL');
      console.log('   User ID:', techData.user_id || 'NULL');

      // 2. Query the profiles table using the user_id if it exists
      if (techData.user_id) {
        console.log('\n2. Checking profiles table for linked user...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url, role')
          .eq('id', techData.user_id)
          .single();

        if (profileError) {
          console.error('❌ Error querying profiles:', profileError.message);
        } else if (profileData) {
          console.log('✅ Profile record found:');
          console.log('   ID:', profileData.id);
          console.log('   Email:', profileData.email);
          console.log('   Full Name:', profileData.full_name || 'NULL');
          console.log('   Avatar URL:', profileData.avatar_url || 'NULL');
          console.log('   Role:', profileData.role);

          // 3. Check if avatar URLs are Supabase URLs
          console.log('\n3. Avatar URL Analysis:');

          if (techData.image_url) {
            const isSupabaseUrl = techData.image_url.includes('supabase');
            console.log(`   Technician image_url: ${isSupabaseUrl ? '✅ Supabase URL' : '❌ External URL'}`);
            console.log(`   URL: ${techData.image_url}`);
          } else {
            console.log('   Technician image_url: ❌ NULL');
          }

          if (profileData.avatar_url) {
            const isSupabaseUrl = profileData.avatar_url.includes('supabase');
            console.log(`   Profile avatar_url: ${isSupabaseUrl ? '✅ Supabase URL' : '❌ External URL'}`);
            console.log(`   URL: ${profileData.avatar_url}`);
          } else {
            console.log('   Profile avatar_url: ❌ NULL');
          }

        } else {
          console.log('❌ No profile record found for user_id:', techData.user_id);
        }
      } else {
        console.log('\n2. ❌ No user_id linked to this technician');
      }

    } else {
      console.log('❌ No technician record found with ID:', technicianId);
    }

    // 4. Also check if there's a technician with avatar_url field (in case schema was updated)
    console.log('\n4. Checking if technicians table has avatar_url column...');
    const { data: schemaCheck, error: schemaError } = await supabase
      .from('technicians')
      .select('*')
      .limit(1);

    if (schemaCheck && schemaCheck.length > 0) {
      const hasAvatarUrl = 'avatar_url' in schemaCheck[0];
      console.log(`   Technicians table has avatar_url column: ${hasAvatarUrl ? '✅ Yes' : '❌ No'}`);

      if (hasAvatarUrl) {
        // Query again with avatar_url
        const { data: techWithAvatar, error: avatarError } = await supabase
          .from('technicians')
          .select('id, name, image_url, avatar_url')
          .eq('id', technicianId)
          .single();

        if (!avatarError && techWithAvatar) {
          console.log('   Avatar URL from technicians table:', techWithAvatar.avatar_url || 'NULL');
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the check
checkAvatarUpdate().catch(console.error);