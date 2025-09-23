const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use the service role key which has admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdminUser() {
  try {
    const email = process.env.PLAYWRIGHT_DEMO_EMAIL || 'admin@test.ca';
    const password = process.env.PLAYWRIGHT_DEMO_PASSWORD || '123456';

    console.log('Setting up admin user:', email);

    // First, check if user exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    let userId;
    const existingUser = existingUsers.users.find(u => u.email === email);

    if (existingUser) {
      console.log('User already exists, updating...');
      userId = existingUser.id;

      // Update the user to ensure they're confirmed and have the right password
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          password: password,
          email_confirm: true,
          user_metadata: { full_name: 'Test Admin' }
        }
      );

      if (updateError) {
        console.error('Error updating user:', updateError);
        return;
      }

      console.log('User updated successfully');
    } else {
      // Create the user with admin privileges (bypasses email confirmation)
      console.log('Creating new admin user...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: 'Test Admin' }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return;
      }

      userId = newUser.user.id;
      console.log('User created successfully');
    }

    // Now update the profile to be admin
    console.log('Updating profile to admin role...');

    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          full_name: 'Test Admin',
          email: email,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return;
      }
    } else {
      // Create new profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'admin',
          full_name: 'Test Admin',
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return;
      }
    }

    console.log('Profile updated to admin role successfully');

    // Test the login
    console.log('\nTesting login with credentials...');
    const { data: testLogin, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (loginError) {
      console.error('Login test failed:', loginError);
    } else {
      console.log('Login test successful!');
      console.log('User can now log in with:');
      console.log('Email:', email);
      console.log('Password:', password);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

setupAdminUser();