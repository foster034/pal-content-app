const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function simpleFix() {
  const technicianId = '52e1e11e-3200-4ae5-ab8e-60722788ec51';
  console.log('🔧 Quick fix: Creating missing technician record...');

  try {
    // Use a placeholder UUID for franchisee_id
    const placeholderFranchiseeId = '00000000-0000-0000-0000-000000000001';

    const { data, error } = await supabase
      .from('technicians')
      .insert({
        id: technicianId,
        name: 'brent foster',
        email: 'brent@example.com',
        phone: '+1234567890',
        image_url: null,
        rating: 5,
        role: 'technician',
        franchisee_id: placeholderFranchiseeId,
        user_id: null,
        login_code: '8D0LS9'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating technician:', error);

      // If franchisee doesn't exist, let's create one first
      if (error.code === '23503') { // Foreign key constraint error
        console.log('🔧 Creating placeholder franchisee...');

        const { data: franchiseeData, error: franchiseeError } = await supabase
          .from('user_profiles')
          .upsert({
            id: placeholderFranchiseeId,
            first_name: 'Default',
            last_name: 'Franchisee',
            email: 'franchisee@example.com',
            role: 'franchisee'
          })
          .select()
          .single();

        if (franchiseeError) {
          console.error('❌ Error creating franchisee:', franchiseeError);
          return;
        }

        console.log('✅ Created placeholder franchisee');

        // Try creating technician again
        const { data: techData, error: techError } = await supabase
          .from('technicians')
          .insert({
            id: technicianId,
            name: 'brent foster',
            email: 'brent@example.com',
            phone: '+1234567890',
            image_url: null,
            rating: 5,
            role: 'technician',
            franchisee_id: placeholderFranchiseeId,
            user_id: null,
            login_code: '8D0LS9'
          })
          .select()
          .single();

        if (techError) {
          console.error('❌ Error creating technician (second attempt):', techError);
          return;
        }

        console.log('✅ Successfully created technician:', techData.name);
      }
    } else {
      console.log('✅ Successfully created technician:', data.name);
    }

    console.log('🎉 Technician is now ready for job submissions!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

simpleFix();