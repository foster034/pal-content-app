import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🔍 Fetching users with franchisee role...');

    // Query the profiles table joined with roles table to find all franchisees
    const { data: franchiseeUsers, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        franchisee_id,
        created_at,
        roles (
          id,
          name,
          description
        )
      `)
      .eq('roles.name', 'franchisee')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching franchisee users:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch franchisee users',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Format the response
    const formattedUsers = franchiseeUsers?.map((user: any) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      franchisee_id: user.franchisee_id,
      role_name: user.roles?.name,
      role_description: user.roles?.description,
      created_at: user.created_at
    })) || [];

    console.log(`✅ Found ${formattedUsers.length} franchisee users`);

    return NextResponse.json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
      query: {
        description: 'Users with franchisee role from profiles table joined with roles table',
        sql: `SELECT p.id, p.email, p.full_name, p.franchisee_id, r.name as role_name
              FROM profiles p
              LEFT JOIN roles r ON p.role_id = r.id
              WHERE r.name = 'franchisee'
              LIMIT 10;`
      }
    });

  } catch (error: any) {
    console.error('❌ Error in get-franchisee-users:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message || error
      },
      { status: 500 }
    );
  }
}
