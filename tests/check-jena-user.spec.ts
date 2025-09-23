import { test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

test('Check jenafoster.popalock.ca user and fix role', async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // List all users to find jenafoster.popalock.ca
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  // Find the user
  const jenaUser = users.users.find(u =>
    u.email === 'jenafoster.popalock.ca' ||
    u.email === 'jenafoster@popalock.ca'
  );

  if (!jenaUser) {
    console.log('User not found. Looking for similar emails...');
    const similarUsers = users.users.filter(u =>
      u.email?.toLowerCase().includes('jena') ||
      u.email?.toLowerCase().includes('foster')
    );
    console.log('Similar users found:', similarUsers.map(u => ({ email: u.email, id: u.id })));
    return;
  }

  console.log('Found user:', jenaUser.email);
  console.log('User ID:', jenaUser.id);

  // Check their profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', jenaUser.id)
    .single();

  if (profileError) {
    console.log('Profile not found, creating admin profile...');

    // Create admin profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: jenaUser.id,
        email: jenaUser.email,
        full_name: 'Jena Foster',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
    } else {
      console.log('Admin profile created successfully');
    }
  } else {
    console.log('Current profile role:', profile.role);

    if (profile.role !== 'admin') {
      console.log('Updating role to admin...');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', jenaUser.id);

      if (updateError) {
        console.error('Error updating role:', updateError);
      } else {
        console.log('Role updated to admin successfully');
      }
    } else {
      console.log('User is already an admin');
    }
  }
});