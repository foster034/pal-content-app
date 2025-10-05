const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🔧 Running franchisee linkage fix...');

  try {
    // Manually link the admin account to the franchisee
    console.log('\n🔗 Linking admin account to franchisee...');

    // Get the franchisee record
    const { data: franchiseeData, error: fetchError } = await supabase
      .from('franchisees')
      .select('id')
      .eq('email', 'brentfoster.popalock@gmail.com')
      .single();

    if (fetchError) {
      console.error('❌ Error fetching franchisee:', fetchError);
      return;
    }

    console.log(`📋 Found franchisee ID: ${franchiseeData.id}`);

    // Update the franchisee owner_id
    const { error: updateFranchiseeError } = await supabase
      .from('franchisees')
      .update({ owner_id: '1ae26392-50cc-4b73-83f5-bcba04579839' })
      .eq('email', 'brentfoster.popalock@gmail.com');

    if (updateFranchiseeError) {
      console.error('❌ Error updating franchisee:', updateFranchiseeError);
      return;
    } else {
      console.log('✅ Updated franchisee owner_id');
    }

    // Update the profile with franchisee_id and change role to franchisee
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        franchisee_id: franchiseeData.id,
        role: 'franchisee' // Change from admin to franchisee
      })
      .eq('email', 'brentfoster.popalock@gmail.com');

    if (updateProfileError) {
      console.error('❌ Error updating profile:', updateProfileError);
      return;
    } else {
      console.log('✅ Updated profile with franchisee_id and changed role to franchisee');
    }

    // Verify the linkage
    console.log('\n🔍 Verifying linkage...');

    const { data: verifyData } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, franchisee_id')
      .eq('email', 'brentfoster.popalock@gmail.com')
      .single();

    console.log('✅ Profile after update:', verifyData);

    console.log('\n🎉 Franchisee linkage completed successfully!');
    console.log('🔄 Please refresh your browser to see the changes.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();