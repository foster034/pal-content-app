require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function disconnectGMB() {
  console.log('🔌 Disconnecting GMB for franchisee: 4c8b70f3-797b-4384-869e-e1fb3919f615');
  
  const { data, error } = await supabase
    .from('gmb_oauth_tokens')
    .update({ is_active: false })
    .eq('franchisee_id', '4c8b70f3-797b-4384-869e-e1fb3919f615')
    .eq('is_active', true)
    .select();

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ GMB disconnected successfully!');
    console.log('Deactivated records:', data);
  }
}

disconnectGMB();
