import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Franchisee ID is required' }, { status: 400 });
    }

    // Create supabase client to check authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        franchisee_id,
        roles (
          name
        )
      `)
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
    }

    const roleName = profile.roles?.name;

    // Allow access if user is admin, or if they're accessing their own franchisee data
    const hasAccess = roleName === 'admin' ||
                     (roleName === 'franchisee' && profile.franchisee_id === id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Use admin client to fetch franchisee data (bypasses RLS)
    const { data: franchisee, error } = await supabaseAdmin
      .from('franchisees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching franchisee:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!franchisee) {
      return NextResponse.json({ error: 'Franchisee not found' }, { status: 404 });
    }

    return NextResponse.json(franchisee);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Franchisee ID is required' }, { status: 400 });
    }

    // Create supabase client to check authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        franchisee_id,
        roles (
          name
        )
      `)
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
    }

    const roleName = profile.roles?.name;

    // Allow access if user is admin, or if they're updating their own franchisee data
    const hasAccess = roleName === 'admin' ||
                     (roleName === 'franchisee' && profile.franchisee_id === id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse the request body
    const body = await request.json();

    // Support both 'logo' and 'image' fields for backward compatibility
    if (body.logo && !body.image) {
      body.image = body.logo;
      delete body.logo;
    }

    console.log('Updating franchisee:', id, 'with data:', body);

    // Use admin client to update franchisee data (bypasses RLS)
    const { data: updatedFranchisee, error } = await supabaseAdmin
      .from('franchisees')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating franchisee:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updatedFranchisee) {
      return NextResponse.json({ error: 'Franchisee not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedFranchisee,
      message: 'Franchisee updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error in PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}