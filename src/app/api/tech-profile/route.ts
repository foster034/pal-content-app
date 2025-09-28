import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      techId,
      full_name,
      phone,
      address,
      city,
      state,
      zip_code,
      country,
      avatar_url
    } = body;

    if (!techId) {
      return NextResponse.json({ error: 'Tech ID is required' }, { status: 400 });
    }

    console.log('Updating tech profile for ID:', techId);
    console.log('Update data:', body);

    // First, get the technician record to find the user_id
    const { data: technician, error: techError } = await supabase
      .from('technicians')
      .select('id, user_id, name, email, phone')
      .eq('id', techId)
      .single();

    if (techError || !technician) {
      console.error('Technician not found:', techError);
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    // Update the technician record with basic info
    const techUpdateData: any = {};
    if (full_name) techUpdateData.name = full_name;
    if (phone) techUpdateData.phone = phone;
    if (avatar_url) techUpdateData.image_url = avatar_url;

    if (Object.keys(techUpdateData).length > 0) {
      const { error: technicianUpdateError } = await supabase
        .from('technicians')
        .update(techUpdateData)
        .eq('id', techId);

      if (technicianUpdateError) {
        console.error('Error updating technician:', technicianUpdateError);
      } else {
        console.log('Technician record updated successfully');
      }
    }

    // If there's a linked user_id, update the profiles table
    if (technician.user_id) {
      console.log('Updating profiles table for user_id:', technician.user_id);

      // Check if profile exists and get current role
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', technician.user_id)
        .single();

      const profileData = {
        id: technician.user_id,
        full_name: full_name || technician.name,
        role: existingProfile?.role || 'tech', // Preserve existing role, default to 'tech' for new profiles
        avatar_url: avatar_url || null,
        phone: phone || technician.phone,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        country: country || 'United States'
      };

      let profileResult;
      if (existingProfile) {
        // Update existing profile
        profileResult = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', technician.user_id)
          .select()
          .single();
      } else {
        // Create new profile
        profileResult = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();
      }

      if (profileResult.error) {
        console.error('Error updating/creating profile:', profileResult.error);
      } else {
        console.log('Profile updated successfully:', profileResult.data);
      }
    } else {
      console.log('No user_id linked to technician, creating auth user...');

      // Handle auth user creation/linking
      if (technician.email) {
        try {
          let authUserId = null;

          // Try to create new auth user
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: technician.email,
            email_confirm: true,
            user_metadata: {
              full_name: full_name || technician.name,
              role: 'tech',
              technician_id: technician.id
            }
          });

          if (createError) {
            if (createError.message.includes('already been registered') || createError.code === 'email_exists') {
              console.log('User already exists, finding existing auth user...');
              // Find existing auth user by email
              const { data: users, error: listError } = await supabase.auth.admin.listUsers();
              if (!listError && users?.users) {
                const existingUser = users.users.find(u => u.email === technician.email);
                if (existingUser) {
                  authUserId = existingUser.id;
                  console.log('Found existing auth user:', authUserId);
                }
              }
            } else {
              console.error('Error creating auth user:', createError);
            }
          } else if (newUser?.user) {
            authUserId = newUser.user.id;
            console.log('Created new auth user:', authUserId);
          }

          // If we have an auth user ID, link it and create/update profile
          if (authUserId) {
            // Link the auth user to the technician record
            await supabase
              .from('technicians')
              .update({ user_id: authUserId })
              .eq('id', techId);

            console.log('Linked technician to auth user:', authUserId);

            // Check if profile already exists
            const { data: existingUserProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUserId)
              .single();

            const profileData = {
              id: authUserId,
              full_name: full_name || technician.name,
              role: existingUserProfile?.role || 'tech', // Preserve existing role, default to 'tech' for new profiles
              avatar_url: avatar_url || null,
              phone: phone || technician.phone,
              address: address || null,
              city: city || null,
              state: state || null,
              zip_code: zip_code || null,
              country: country || 'United States'
            };

            if (existingUserProfile) {
              // Update existing profile
              const { error: profileUpdateError } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', authUserId);

              if (profileUpdateError) {
                console.error('Error updating profile:', profileUpdateError);
              } else {
                console.log('Profile updated successfully for user:', authUserId);
              }
            } else {
              // Create new profile
              const { error: profileCreateError } = await supabase
                .from('profiles')
                .insert(profileData);

              if (profileCreateError) {
                console.error('Error creating profile:', profileCreateError);
              } else {
                console.log('Profile created successfully for user:', authUserId);
              }
            }
          }
        } catch (authError) {
          console.error('Auth user handling failed:', authError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tech profile updated successfully'
    });

  } catch (error) {
    console.error('Error in tech-profile PUT:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const techId = searchParams.get('techId');

    if (!techId) {
      return NextResponse.json({ error: 'Tech ID is required' }, { status: 400 });
    }

    // Get technician with linked profile data
    const { data: technician, error } = await supabase
      .from('technicians')
      .select(`
        *,
        franchisees!inner(
          id,
          business_name
        )
      `)
      .eq('id', techId)
      .single();

    if (error || !technician) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    let profileData = {
      id: technician.id,
      email: technician.email || '',
      full_name: technician.name || '',
      role: 'tech',
      avatar_url: '',
      phone: technician.phone || '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'United States',
      created_at: technician.created_at,
      franchisee: technician.franchisees?.business_name || ''
    };

    // If there's a linked user_id, get profile data
    if (technician.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', technician.user_id)
        .single();

      if (profile) {
        profileData = {
          ...profileData,
          avatar_url: profile.avatar_url || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          zip_code: profile.zip_code || '',
          country: profile.country || 'United States'
        };
      }
    }

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('Error in tech-profile GET:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}