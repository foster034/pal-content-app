import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    console.log('🔄 Syncing existing auth users to profiles...');

    // Get all users from auth.users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: authError.message },
        { status: 500 }
      );
    }

    console.log(`📊 Found ${users?.length || 0} users in auth`);

    // Get existing profiles
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: profilesError.message },
        { status: 500 }
      );
    }

    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || []);
    console.log(`📋 Found ${existingProfileIds.size} existing profiles`);

    // Find users without profiles
    const usersWithoutProfiles = users?.filter(user => !existingProfileIds.has(user.id)) || [];
    console.log(`⚠️ Found ${usersWithoutProfiles.length} users without profiles`);

    if (usersWithoutProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: '✅ All users already have profiles',
        totalUsers: users?.length || 0,
        existingProfiles: existingProfileIds.size,
        created: 0
      });
    }

    // Get the default 'tech' role_id
    const { data: techRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'tech')
      .single();

    const defaultRoleId = techRole?.id || 4; // Fallback to 4 if query fails

    // Create profiles for users without them
    const profilesToCreate = usersWithoutProfiles.map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      role_id: defaultRoleId, // Use role_id instead of role text
      avatar_url: user.user_metadata?.avatar_url || null
    }));

    console.log('📝 Creating profiles for users:', profilesToCreate.map(p => p.email).join(', '));

    const { data: createdProfiles, error: createError } = await supabase
      .from('profiles')
      .insert(profilesToCreate)
      .select();

    if (createError) {
      console.error('❌ Error creating profiles:', createError);
      return NextResponse.json(
        { error: 'Failed to create profiles', details: createError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully created ${createdProfiles?.length || 0} profiles`);

    return NextResponse.json({
      success: true,
      message: `✅ Created ${createdProfiles?.length || 0} profiles for existing users`,
      totalUsers: users?.length || 0,
      existingProfiles: existingProfileIds.size,
      created: createdProfiles?.length || 0,
      newProfiles: createdProfiles?.map(p => ({
        email: p.email,
        role: p.role,
        full_name: p.full_name
      }))
    });

  } catch (error: any) {
    console.error('❌ Error syncing users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || error },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Sync existing auth users to profiles table',
    usage: 'POST to this endpoint to create profiles for all users without them',
    note: 'All new profiles will get default "tech" role which you can change later'
  });
}
