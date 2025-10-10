import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Check if profiles table exists and its structure
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    // Check for any user_* tables
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    const { data: userWithRoles, error: userWithRolesError } = await supabase
      .from('user_with_roles')
      .select('*')
      .limit(1);

    const { data: userProfiles, error: userProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    return NextResponse.json({
      tables: {
        profiles: {
          exists: !profilesError,
          error: profilesError?.message,
          sample: profiles?.[0]
        },
        user_roles: {
          exists: !userRolesError,
          error: userRolesError?.message,
          sample: userRoles?.[0]
        },
        user_with_roles: {
          exists: !userWithRolesError,
          error: userWithRolesError?.message,
          sample: userWithRoles?.[0]
        },
        user_profiles: {
          exists: !userProfilesError,
          error: userProfilesError?.message,
          sample: userProfiles?.[0]
        }
      }
    });
  } catch (error: any) {
    console.error('Error checking database structure:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || error },
      { status: 500 }
    );
  }
}
