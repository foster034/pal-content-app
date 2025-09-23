import { test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

test('Fix jenafoster.popalock@gmail.com admin role', async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const userId = '964725b2-41c5-43c5-b2e2-bec9c237758e';
  const userEmail = 'jenafoster.popalock@gmail.com';

  console.log('Checking user:', userEmail);

  // Check their profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.log('Profile not found, creating admin profile...');

    // Create admin profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: userEmail,
        full_name: 'Jena Foster',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
    } else {
      console.log('✅ Admin profile created successfully');
    }
  } else {
    console.log('Current profile:', {
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name
    });

    if (profile.role !== 'admin') {
      console.log('Updating role from', profile.role, 'to admin...');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating role:', updateError);
      } else {
        console.log('✅ Role updated to admin successfully');
      }
    } else {
      console.log('✅ User is already an admin');
    }
  }

  // Also check brentfoster.popalock@gmail.com
  const brentUserId = 'e0d11f60-031b-45d6-a0d2-030861f89f35';
  const brentEmail = 'brentfoster.popalock@gmail.com';

  console.log('\nChecking user:', brentEmail);

  const { data: brentProfile, error: brentProfileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', brentUserId)
    .single();

  if (brentProfileError) {
    console.log('Profile not found, creating admin profile...');

    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: brentUserId,
        email: brentEmail,
        full_name: 'Brent Foster',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
    } else {
      console.log('✅ Admin profile created successfully');
    }
  } else {
    console.log('Current profile:', {
      email: brentProfile.email,
      role: brentProfile.role,
      full_name: brentProfile.full_name
    });

    if (brentProfile.role !== 'admin') {
      console.log('Updating role from', brentProfile.role, 'to admin...');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', brentUserId);

      if (updateError) {
        console.error('Error updating role:', updateError);
      } else {
        console.log('✅ Role updated to admin successfully');
      }
    } else {
      console.log('✅ User is already an admin');
    }
  }
});