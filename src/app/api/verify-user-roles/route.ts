import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🔍 Verifying user roles setup...');

    // Check if redundant tables are gone
    const redundantTables = ['user_roles', 'user_with_roles', 'user_profiles'];
    const tableStatus: Record<string, boolean> = {};

    for (const table of redundantTables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      tableStatus[table] = error?.code === 'PGRST204' || error?.message?.includes('does not exist');
    }

    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at');

    if (profilesError) {
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: profilesError.message },
        { status: 500 }
      );
    }

    // Count users by role
    const roleCounts: Record<string, number> = {
      admin: 0,
      franchisee: 0,
      tech: 0
    };

    profiles?.forEach((profile: any) => {
      if (profile.role in roleCounts) {
        roleCounts[profile.role]++;
      }
    });

    return NextResponse.json({
      success: true,
      message: '✅ User roles setup verified',
      cleanup: {
        redundantTablesRemoved: Object.entries(tableStatus).every(([_, removed]) => removed),
        details: tableStatus
      },
      profiles: {
        total: profiles?.length || 0,
        byRole: roleCounts
      },
      users: profiles?.map((p: any) => ({
        email: p.email,
        name: p.full_name,
        role: p.role,
        created: p.created_at
      })) || [],
      instructions: {
        changeRole: 'UPDATE profiles SET role = \'admin\' WHERE email = \'user@example.com\';',
        availableRoles: ['admin', 'franchisee', 'tech']
      }
    });

  } catch (error: any) {
    console.error('❌ Error verifying user roles:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || error },
      { status: 500 }
    );
  }
}
