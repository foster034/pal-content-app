const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetTestUserPassword() {
  try {
    // First, get the user by email
    const { data: { users }, error: fetchError } = await supabase.auth.admin.listUsers();

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return;
    }

    const testUser = users.find(user => user.email === 'admin@test.ca');

    if (!testUser) {
      console.log('User admin@test.ca not found. Creating new user...');

      // Create the user if it doesn't exist
      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email: 'admin@test.ca',
        password: '123456',
        email_confirm: true
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return;
      }

      // Create the profile
      await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: 'admin@test.ca',
          full_name: 'Test Admin',
          role: 'admin',
          updated_at: new Date().toISOString()
        });

      console.log('User created successfully!');
    } else {
      // Update the password for existing user
      const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        testUser.id,
        { password: '123456' }
      );

      if (updateError) {
        console.error('Error updating password:', updateError);
        return;
      }

      console.log('Password updated successfully!');

      // Ensure the user has admin role in profiles
      await supabase
        .from('profiles')
        .upsert({
          id: testUser.id,
          email: 'admin@test.ca',
          full_name: 'Test Admin',
          role: 'admin',
          updated_at: new Date().toISOString()
        });
    }

    console.log('\n✅ Test user ready!');
    console.log('Email: admin@test.ca');
    console.log('Password: 123456');
    console.log('Role: admin');
    console.log('\nYou can now log in with these credentials.');
  } catch (error) {
    console.error('Error:', error);
  }
}

resetTestUserPassword();