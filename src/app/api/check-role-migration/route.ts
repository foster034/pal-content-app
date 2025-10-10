import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get all profiles with their roles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role_id,
        roles (
          id,
          name,
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: error.message },
        { status: 500 }
      );
    }

    // Get role counts
    const roleCounts = profiles?.reduce((acc: any, profile: any) => {
      const roleName = profile.roles?.name || 'unknown';
      acc[roleName] = (acc[roleName] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      message: '✅ Role migration successful!',
      totalUsers: profiles?.length || 0,
      roleCounts,
      users: profiles?.map((p: any) => ({
        email: p.email,
        name: p.full_name,
        role_id: p.role_id,
        role_name: p.roles?.name,
        role_description: p.roles?.description
      }))
    });

  } catch (error: any) {
    console.error('Error checking role migration:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || error },
      { status: 500 }
    );
  }
}
