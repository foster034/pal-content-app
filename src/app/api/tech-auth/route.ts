import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { loginCode } = await request.json();

    if (!loginCode) {
      return NextResponse.json({ error: 'Login code is required' }, { status: 400 });
    }

    // Find technician with matching login code
    const { data: technician, error } = await supabase
      .from('technicians')
      .select(`
        *,
        franchisees!inner(
          id,
          business_name,
          email
        )
      `)
      .eq('login_code', loginCode.toUpperCase().trim())
      .single();

    if (error || !technician) {
      console.error('Technician not found:', error);
      return NextResponse.json({
        success: false,
        error: 'Invalid login code'
      }, { status: 401 });
    }

    // Create or get existing auth user for this technician
    let authUser = null;

    if (technician.user_id) {
      // Existing auth user
      const { data: user } = await supabase.auth.admin.getUserById(technician.user_id);
      authUser = user.user;
    } else if (technician.email) {
      // Try to find existing user by email or create one
      try {
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        authUser = existingUser.users.find(u => u.email === technician.email);

        if (!authUser) {
          // Create new auth user
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: technician.email,
            email_confirm: true,
            user_metadata: {
              full_name: technician.name,
              role: 'tech',
              technician_id: technician.id
            }
          });

          if (createError && !createError.message.includes('already registered')) {
            throw createError;
          }

          if (newUser) {
            authUser = newUser.user;

            // Link the auth user to the technician record
            await supabase
              .from('technicians')
              .update({ user_id: authUser.id })
              .eq('id', technician.id);
          }
        }
      } catch (authError) {
        console.error('Auth user creation failed:', authError);
        // Continue without auth user - we can still track the login
      }
    }

    // Log successful login
    console.log(`Technician login successful: ${technician.name} (${technician.email}) with code: ${loginCode}`);

    // Return success with technician info
    return NextResponse.json({
      success: true,
      technician: {
        id: technician.id,
        name: technician.name,
        email: technician.email,
        phone: technician.phone,
        franchisee: {
          id: technician.franchisees.id,
          business_name: technician.franchisees.business_name
        },
        auth_user_id: authUser?.id || null
      }
    });

  } catch (error) {
    console.error('Tech authentication error:', error);
    return NextResponse.json({
      error: 'Authentication failed'
    }, { status: 500 });
  }
}

// GET endpoint to validate current session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const techId = searchParams.get('techId');

    if (!techId) {
      return NextResponse.json({ error: 'Technician ID required' }, { status: 400 });
    }

    const { data: technician, error } = await supabase
      .from('technicians')
      .select(`
        *,
        franchisees!inner(
          id,
          business_name,
          email
        )
      `)
      .eq('id', techId)
      .single();

    if (error || !technician) {
      return NextResponse.json({
        success: false,
        error: 'Technician not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      technician: {
        id: technician.id,
        name: technician.name,
        email: technician.email,
        phone: technician.phone,
        franchisee: {
          id: technician.franchisees.id,
          business_name: technician.franchisees.business_name
        }
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json({
      error: 'Session validation failed'
    }, { status: 500 });
  }
}