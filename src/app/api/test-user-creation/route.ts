import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password, full_name, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    console.log(`📝 Creating new user: ${email}`);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || email,
        role: role || 'tech' // Default role
      }
    });

    if (authError) {
      console.error('❌ Error creating user:', authError);
      return NextResponse.json(
        { error: 'Failed to create user', details: authError.message },
        { status: 500 }
      );
    }

    console.log('✅ User created in auth.users:', authData.user.id);

    // Wait a moment for trigger to fire
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if profile was auto-created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('⚠️ Profile not found, creating manually...');

      // Manually create profile if trigger didn't work
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: full_name || email,
          role: role || 'tech'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating profile:', createError);
        return NextResponse.json(
          {
            error: 'User created but profile failed',
            userId: authData.user.id,
            details: createError.message
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: '✅ User and profile created (manual trigger)',
        user: authData.user,
        profile: newProfile
      });
    }

    console.log('✅ Profile auto-created by trigger:', profile);

    return NextResponse.json({
      success: true,
      message: '✅ User and profile auto-created successfully!',
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at
      }
    });

  } catch (error: any) {
    console.error('❌ Error in test user creation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || error },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test user creation endpoint',
    usage: 'POST with { email, password, full_name?, role? }',
    example: {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      role: 'tech'
    }
  });
}
