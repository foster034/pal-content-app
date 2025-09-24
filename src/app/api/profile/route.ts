import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Combine user data with profile data - only include fields that exist
    const profileData = {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'user',
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
      phone: profile?.phone || '',
      // Address fields don't exist in the table yet, use empty defaults
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'United States',
      created_at: profile?.created_at || user.created_at
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const {
      full_name,
      phone,
      address,
      city,
      state,
      zip_code,
      country,
      avatar_url,
      // Additional fields that might be added
      mobile_phone,
      work_phone,
      address_line_2,
      first_name,
      last_name,
      title,
      department,
      bio,
      website,
      timezone,
      language
    } = body;

    console.log('API: Updating profile for user:', user.id);
    console.log('API: Update data:', body);

    // First, check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    // Prepare update data - only include core fields that definitely exist
    const updateData: any = {
      id: user.id,
      full_name: full_name || null,
      role: existingProfile?.role || 'user' // Preserve existing role
    };

    // Skip address fields for now since they don't exist in the table
    // if (address !== undefined) updateData.address = address || null;
    // if (city !== undefined) updateData.city = city || null;
    // if (state !== undefined) updateData.state = state || null;
    // if (zip_code !== undefined) updateData.zip_code = zip_code || null;
    // if (country !== undefined) updateData.country = country || null;

    console.log('API: Final update data:', updateData);

    // Create service role client to bypass RLS
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    console.log('API: Attempting to update with fields...');

    // Build update object with all possible fields
    const updateFields: any = { full_name: full_name };

    // Add fields conditionally if they exist
    const fieldsToTry = {
      phone,
      address,
      city,
      state,
      zip_code,
      country,
      avatar_url,
      mobile_phone,
      work_phone,
      address_line_2,
      first_name,
      last_name,
      title,
      department,
      bio,
      website,
      timezone,
      language
    };

    // Add non-empty fields to update
    Object.entries(fieldsToTry).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        updateFields[key] = value;
      }
    });

    console.log('API: Attempting to update fields:', Object.keys(updateFields));

    // Try to update with all fields, fall back to just full_name if columns don't exist
    let data, error;

    try {
      const result = await serviceSupabase
        .from('profiles')
        .update(updateFields)
        .eq('id', user.id)
        .select()
        .single();

      data = result.data;
      error = result.error;

      // If error indicates missing columns, retry with known existing columns
      if (error && error.message.includes("Could not find the")) {
        console.log('Some columns do not exist, falling back to known existing columns');

        // Build fallback update with only columns that exist in the database
        const fallbackUpdate: any = { full_name: full_name };

        // Include known existing columns if provided
        if (avatar_url) {
          fallbackUpdate.avatar_url = avatar_url;
        }

        // Add address fields that should exist after schema update
        if (address !== undefined && address !== null && address !== '') {
          fallbackUpdate.address = address;
        }
        if (city !== undefined && city !== null && city !== '') {
          fallbackUpdate.city = city;
        }
        if (state !== undefined && state !== null && state !== '') {
          fallbackUpdate.state = state;
        }
        if (zip_code !== undefined && zip_code !== null && zip_code !== '') {
          fallbackUpdate.zip_code = zip_code;
        }
        if (country !== undefined && country !== null && country !== '') {
          fallbackUpdate.country = country;
        }

        console.log('Fallback update fields:', Object.keys(fallbackUpdate));

        const fallbackResult = await serviceSupabase
          .from('profiles')
          .update(fallbackUpdate)
          .eq('id', user.id)
          .select()
          .single();
        data = fallbackResult.data;
        error = fallbackResult.error;
      }
    } catch (err) {
      console.log('Update failed, falling back to known existing columns');

      // Build fallback update with only columns that exist in the database
      const fallbackUpdate: any = { full_name: full_name };

      // Include known existing columns if provided
      if (avatar_url) {
        fallbackUpdate.avatar_url = avatar_url;
      }

      // Add address fields that should exist after schema update
      if (address !== undefined && address !== null && address !== '') {
        fallbackUpdate.address = address;
      }
      if (city !== undefined && city !== null && city !== '') {
        fallbackUpdate.city = city;
      }
      if (state !== undefined && state !== null && state !== '') {
        fallbackUpdate.state = state;
      }
      if (zip_code !== undefined && zip_code !== null && zip_code !== '') {
        fallbackUpdate.zip_code = zip_code;
      }
      if (country !== undefined && country !== null && country !== '') {
        fallbackUpdate.country = country;
      }

      console.log('Fallback update fields:', Object.keys(fallbackUpdate));

      const fallbackResult = await serviceSupabase
        .from('profiles')
        .update(fallbackUpdate)
        .eq('id', user.id)
        .select()
        .single();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error('API: Supabase error:', error);
      return NextResponse.json({
        error: 'Failed to update profile',
        details: error.message
      }, { status: 500 });
    }

    console.log('API: Profile updated successfully:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('API: Error in profile PUT:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}