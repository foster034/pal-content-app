import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET all technicians
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseeId = searchParams.get('franchiseeId');

    let query = supabase
      .from('technicians')
      .select(`
        *,
        franchisees!inner(
          id,
          business_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (franchiseeId) {
      query = query.eq('franchisee_id', franchiseeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching technicians:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Transform data to match frontend expectations
    const technicians = data?.map((tech, index) => ({
      id: tech.id,
      name: tech.name,
      email: tech.email,
      phone: tech.phone || '',
      role: tech.role || 'technician',
      rating: tech.rating || 0,
      image_url: tech.image_url || '',
      franchisee_id: tech.franchisee_id,
      franchiseeName: tech.franchisees?.business_name || 'Unknown Franchise',
      user_id: tech.user_id,
      login_code: tech.login_code || `TEMP${String(index + 1).padStart(2, '0')}`, // Generate temporary code if missing
      specialties: tech.specialties || [], // Include specialties from database
      created_at: tech.created_at,
      updated_at: tech.updated_at
    })) || [];

    return NextResponse.json(technicians);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch technicians' }, { status: 500 });
  }
}

// POST new technician
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      franchiseeId,
      role,
      image,
      createAuth,
      authMethod,
      tempPassword,
      specialties
    } = body;

    // Enhanced validation
    if (!name || !email) {
      return NextResponse.json({
        error: 'Name and email are required fields',
        details: 'Please provide both technician name and email address'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      }, { status: 400 });
    }

    // Validate franchisee ID
    if (!franchiseeId) {
      return NextResponse.json({
        error: 'Franchise association required',
        details: 'Technician must be associated with a franchise'
      }, { status: 400 });
    }

    // Check if technician with this email already exists
    const { data: existingTech } = await supabase
      .from('technicians')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (existingTech) {
      return NextResponse.json({
        error: 'Technician already exists',
        details: `A technician with email ${email} already exists: ${existingTech.name}`
      }, { status: 409 });
    }

    let userId = null;

    // Create auth user if requested
    if (createAuth) {
      try {
        if (authMethod === 'magic_link') {
          // Create user and send magic link
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            email_confirm: true,
            user_metadata: {
              full_name: name
            }
          });

          if (createError && !createError.message.includes('already registered')) {
            throw createError;
          }

          if (newUser) {
            userId = newUser.user.id;

            // Send magic link
            await supabase.auth.admin.inviteUserByEmail(email, {
              redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
              data: {
                full_name: name
              }
            });
          }
        } else if (authMethod === 'temp_password') {
          // Create user with temporary password
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              full_name: name
            }
          });

          if (authError && !authError.message.includes('already registered')) {
            throw authError;
          }

          if (authData) {
            userId = authData.user.id;
          }
        }
      } catch (authError) {
        console.error('Auth creation error:', authError);
      }
    }

    // Generate a unique login code
    const generateLoginCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    // Insert the technician
    const { data, error } = await supabase
      .from('technicians')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          franchisee_id: franchiseeId,
          role: role || 'technician',
          image_url: image || null,
          user_id: userId,
          rating: 0,
          login_code: generateLoginCode(),
          specialties: specialties || []
        }
      ])
      .select('*, franchisees(business_name)')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create profile if auth user was created
    if (userId) {
      // Get the tech role_id from roles table
      const { data: techRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'tech')
        .single();

      await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: name,
          role_id: techRole?.id || 4, // Default to 4 if query fails
          franchisee_id: franchiseeId
        });
    }

    return NextResponse.json({
      ...data,
      franchiseeName: data.franchisees?.business_name || '',
      authCreated: !!userId,
      authMethod: createAuth ? authMethod : null
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to create technician' }, { status: 500 });
  }
}

// PUT update technician
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone, role, image_url, rating, login_code, specialties } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData: any = {
      name,
      email,
      phone,
      role,
      image_url,
      rating,
      updated_at: new Date().toISOString()
    };

    // Include login_code if provided
    if (login_code !== undefined) {
      updateData.login_code = login_code;
    }

    // Include specialties if provided
    if (specialties !== undefined) {
      updateData.specialties = specialties;
    }

    const { data, error } = await supabase
      .from('technicians')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update technician' }, { status: 500 });
  }
}

// DELETE technician
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // First, get the technician to find associated user_id
    const { data: technician, error: fetchError } = await supabase
      .from('technicians')
      .select('user_id, email, name')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    // Delete the technician record
    const { error: deleteError } = await supabase
      .from('technicians')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    // If technician has an associated auth user, delete it too
    if (technician.user_id) {
      try {
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(technician.user_id);
        if (authDeleteError) {
          console.warn('Failed to delete auth user:', authDeleteError.message);
          // Don't fail the whole operation if auth user deletion fails
        }
      } catch (authError) {
        console.warn('Error deleting auth user:', authError);
        // Continue - the technician record is already deleted
      }
    }

    return NextResponse.json({
      success: true,
      message: `Technician ${technician.name} has been permanently removed`
    });
  } catch (error) {
    console.error('Error deleting technician:', error);
    return NextResponse.json({ error: 'Failed to delete technician' }, { status: 500 });
  }
}