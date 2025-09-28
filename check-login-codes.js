const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLoginCodes() {
  console.log('🔍 Checking existing technician login codes...');

  try {
    // Check who has the login code 8D0LS9
    const { data: existingTech, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('login_code', '8D0LS9');

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('📋 Technicians with login code 8D0LS9:');
    existingTech?.forEach(tech => {
      console.log(`  - ID: ${tech.id}`);
      console.log(`  - Name: ${tech.name}`);
      console.log(`  - Email: ${tech.email}`);
      console.log(`  ---`);
    });

    // Check all technicians
    const { data: allTechs } = await supabase
      .from('technicians')
      .select('id, name, login_code');

    console.log(`\n📊 Found ${allTechs?.length || 0} total technicians:`);
    allTechs?.forEach(tech => {
      console.log(`  ${tech.name} (${tech.id}) - Code: ${tech.login_code}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkLoginCodes();