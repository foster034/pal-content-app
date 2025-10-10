require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkAuthUsers() {
  try {
    // Query auth.users using the admin API
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    console.log(`\nTotal users found: ${data.users.length}\n`);

    if (data.users.length > 0) {
      console.log('Email addresses of existing users:');
      console.log('================================');
      data.users.slice(0, 10).forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
      });
    } else {
      console.log('No users found in the authentication system.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAuthUsers();
