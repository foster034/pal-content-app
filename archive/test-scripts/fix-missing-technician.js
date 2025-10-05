const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMissingTechnician() {
  console.log('🔧 Fixing missing technician record for job submissions...');

  const technicianId = '52e1e11e-3200-4ae5-ab8e-60722788ec51';

  try {
    // First check if the technician exists
    const { data: existingTech, error: checkError } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', technicianId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking technician:', checkError);
      return;
    }

    if (existingTech) {
      console.log('✅ Technician already exists:', existingTech.name);
      return;
    }

    console.log('⚠️ Technician not found, creating new record...');

    // First check what franchisees exist
    const { data: franchisees, error: franchiseeError } = await supabase
      .from('user_profiles')
      .select('id, name, role')
      .eq('role', 'franchisee')
      .limit(1);

    if (franchiseeError || !franchisees || franchisees.length === 0) {
      console.log('⚠️ No franchisees found, creating a default franchisee first...');

      // Create a default franchisee
      const { data: newFranchisee, error: createFranchiseeError } = await supabase
        .from('user_profiles')
        .insert({
          name: 'Default Franchisee',
          email: 'franchisee@example.com',
          role: 'franchisee'
        })
        .select()
        .single();

      if (createFranchiseeError) {
        console.error('❌ Error creating franchisee:', createFranchiseeError);
        return;
      }

      console.log('✅ Created default franchisee:', newFranchisee.id);
      var franchiseeId = newFranchisee.id;
    } else {
      var franchiseeId = franchisees[0].id;
      console.log('✅ Using existing franchisee:', franchiseeId);
    }

    // Create the missing technician record using the actual table columns
    const { data: newTech, error: insertError } = await supabase
      .from('technicians')
      .insert({
        id: technicianId,
        name: 'brent foster',
        email: 'brent@example.com',
        phone: '+1234567890',
        image_url: null,
        rating: 5,
        role: 'technician',
        franchisee_id: franchiseeId,
        user_id: null,
        login_code: '8D0LS9'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating technician:', insertError);
      return;
    }

    console.log('✅ Successfully created technician:', newTech);

    // Now check what other technician IDs might be missing
    console.log('\n🔍 Checking for other potential missing technician IDs...');

    const { data: allJobSubmissions } = await supabase
      .from('job_submissions')
      .select('technician_id');

    const { data: allTechnicians } = await supabase
      .from('technicians')
      .select('id');

    if (allJobSubmissions && allTechnicians) {
      const jobTechIds = new Set(allJobSubmissions.map(j => j.technician_id));
      const existingTechIds = new Set(allTechnicians.map(t => t.id));

      const missingIds = [...jobTechIds].filter(id => !existingTechIds.has(id));

      if (missingIds.length > 0) {
        console.log('⚠️ Found other missing technician IDs:', missingIds);
      } else {
        console.log('✅ No other missing technician IDs found');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixMissingTechnician();