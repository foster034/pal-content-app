import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

test('Check and create admin user', async ({ page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Check if admin@test.ca exists
  const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
    email: 'admin@test.ca',
    password: 'test123456'
  });

  if (checkError) {
    console.log('User does not exist or wrong password, attempting to create...');

    // Try to create the user
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@test.ca',
      password: 'test123456',
      options: {
        data: {
          full_name: 'Test Admin'
        }
      }
    });

    if (signUpError) {
      console.log('Error creating user:', signUpError);
    } else {
      console.log('User created:', newUser);

      // Update the user's profile to be admin
      if (newUser.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', newUser.user.id);

        if (profileError) {
          console.log('Error updating profile:', profileError);
        } else {
          console.log('Profile updated to admin role');
        }
      }
    }
  } else {
    console.log('User exists:', existingUser.user?.email);

    // Check the user's role
    if (existingUser.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', existingUser.user.id)
        .single();

      console.log('User role:', profile?.role);

      if (profile?.role !== 'admin') {
        // Update to admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', existingUser.user.id);

        if (updateError) {
          console.log('Error updating to admin:', updateError);
        } else {
          console.log('Updated user to admin role');
        }
      }
    }
  }
});