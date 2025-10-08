import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendFranchiseeInvite } from '@/lib/email-helper';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET all franchisees
export async function GET() {
  try {
    // First, try selecting with all columns including new ones
    let { data, error } = await supabase
      .from('franchisees')
      .select(`
        id,
        business_name,
        phone,
        email,
        website,
        google_review_url,
        created_at,
        updated_at,
        country,
        username,
        territory,
        status,
        image,
        owners,
        owner_id,
        notification_preferences
      `)
      .order('created_at', { ascending: false });

    // If that fails due to missing columns, fallback to basic columns
    if (error && error.message.includes('column') && error.message.includes('does not exist')) {
      console.warn('Some columns missing, falling back to basic schema:', error.message);

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('franchisees')
        .select(`
          id,
          business_name,
          phone,
          email,
          website,
          google_review_url,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 400 });
      }

      // Add default values for missing columns
      data = fallbackData?.map(item => ({
        ...item,
        country: 'United States',
        username: item.business_name?.toLowerCase().replace(/\s+/g, '') || '',
        territory: '',
        status: 'Active',
        image: '',
        owners: [],
        owner_id: null,
        notification_preferences: {
          newTechSubmissions: { email: true, sms: false, app: true },
          mediaArchival: { email: true, sms: false, app: false },
          systemUpdates: { email: true, sms: false, app: true },
          marketingReports: { email: true, sms: false, app: false },
          emergencyAlerts: { email: true, sms: true, app: true },
          weeklyDigest: { email: true, sms: false, app: false }
        }
      })) || [];
    } else if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Franchisees GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch franchisees' }, { status: 500 });
  }
}

// POST new franchisee with improved auth integration
export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/franchisees called');
  try {
    const body = await request.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));

    // Extract the franchisee data and auth options
    const {
      name,
      username,
      email,
      phone,
      territory,
      country,
      status,
      image,
      parentFranchiseeId,
      createAuth,
      authMethod,
      tempPassword,
      ownerName,
      businessName,
      fullName,
      website,
      googleReviewUrl
    } = body;

    let authUserId = null;
    let emailSent = false;
    let magicLinkUrl = null;

    // Create auth user if requested
    if (createAuth) {
      try {
        if (authMethod === 'magic_link') {
          // First, create the user if they don't exist
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
          if (listError) throw listError;

          let user = users.find(u => u.email === email);

          if (!user) {
            // Create user first if doesn't exist
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
              email: email,
              email_confirm: true,
              user_metadata: {
                full_name: ownerName || name,
                role: 'franchisee'  // This will be used by the trigger to set the correct role
              }
            });
            if (createError) throw createError;
            user = newUser.user;
          }

          authUserId = user.id;

          // Send invitation using helper
          const inviteResult = await sendFranchiseeInvite(
            email,
            ownerName || name,
            name,
            'magic_link'
          );

          if (inviteResult.success) {
            emailSent = inviteResult.method === 'email_sent';
            if (inviteResult.link) {
              magicLinkUrl = inviteResult.link;
              console.log('='.repeat(60));
              console.log('🔗 MAGIC LINK GENERATED');
              console.log('Email:', email);
              console.log('Link:', magicLinkUrl);
              console.log('='.repeat(60));
            } else {
              console.log('✅ Magic link email sent to:', email);
            }
          } else {
            console.error('Failed to send invitation:', inviteResult.error);
          }

        } else if (authMethod === 'temp_password') {
          // Create user with temporary password
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              full_name: ownerName || name,
              role: 'franchisee'  // This will be used by the trigger to set the correct role
            }
          });

          if (authError) {
            // User might already exist
            if (authError.message.includes('already registered')) {
              const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
              if (listError) throw listError;
              const existingUser = users.find(u => u.email === email);
              if (existingUser) {
                authUserId = existingUser.id;
                // Update password for existing user
                const { error: updateError } = await supabase.auth.admin.updateUserById(
                  existingUser.id,
                  { password: tempPassword }
                );
                if (updateError) console.error('Failed to update password:', updateError);
              }
            } else {
              throw authError;
            }
          } else {
            authUserId = authData.user.id;
          }
        }
      } catch (authError: any) {
        console.error('Auth creation error:', authError);
        console.error('Auth error details:', JSON.stringify(authError, null, 2));
        console.error('Auth error message:', authError?.message);
        console.error('Auth error stack:', authError?.stack);
        // Continue with franchisee creation even if auth fails
      }
    }

    // Validate required fields
    const finalBusinessName = businessName || name;
    const finalFullName = fullName || ownerName || finalBusinessName;

    if (!email || !finalBusinessName || !phone) {
      return NextResponse.json(
        { error: 'Email, business name, and phone are required' },
        { status: 400 }
      );
    }

    // Insert the franchisee - try with all columns first, fallback to basic columns if needed
    let insertData = {
      business_name: finalBusinessName,
      email,
      phone,
      website: website || '',
      google_review_url: googleReviewUrl || ''
    };

    // Try to add extended columns if they exist
    const fullInsertData = {
      ...insertData,
      username: username || finalBusinessName.toLowerCase().replace(/\s+/g, ''),
      territory,
      country: country || 'Canada',
      status: status || 'Active',
      image,
      owner_id: authUserId,
      parent_franchisee_id: parentFranchiseeId || null,
      notification_preferences: {
        newTechSubmissions: { email: true, sms: false, app: true },
        mediaArchival: { email: true, sms: false, app: false },
        systemUpdates: { email: true, sms: false, app: true },
        marketingReports: { email: true, sms: false, app: false },
        emergencyAlerts: { email: true, sms: true, app: true },
        weeklyDigest: { email: true, sms: false, app: false },
      }
    };

    console.log('💾 Attempting franchisee insert with data:', JSON.stringify(fullInsertData, null, 2));

    let { data, error } = await supabase
      .from('franchisees')
      .insert([fullInsertData])
      .select()
      .single();

    console.log('📊 Insert result - error:', error, 'data:', data);

    // If insert failed due to missing columns, try with basic schema
    if (error && error.message.includes('column') && error.message.includes('does not exist')) {
      console.warn('Insert failed due to missing columns, falling back to basic schema:', error.message);

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('franchisees')
        .insert([insertData])
        .select()
        .single();

      if (fallbackError) {
        console.error('Supabase error:', fallbackError);
        return NextResponse.json({ error: fallbackError.message }, { status: 400 });
      }

      data = {
        ...fallbackData,
        username: username || '',
        territory: territory || '',
        country: country || 'United States',
        status: status || 'Active',
        image: image || '',
        owners: owners || [],
        owner_id: authUserId,
        notification_preferences: {
          newTechSubmissions: { email: true, sms: false, app: true },
          mediaArchival: { email: true, sms: false, app: false },
          systemUpdates: { email: true, sms: false, app: true },
          marketingReports: { email: true, sms: false, app: false },
          emergencyAlerts: { email: true, sms: true, app: true },
          weeklyDigest: { email: true, sms: false, app: false },
        }
      };
    }

    // Create profile record if auth user was created
    // We handle this manually instead of relying on the trigger
    if (authUserId) {
      // Get the franchisee role_id from roles table
      const { data: franchiseeRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'franchisee')
        .single();

      console.log('📝 Creating profile for auth user:', authUserId);
      console.log('Franchisee role_id:', franchiseeRole?.id);

      // Try to insert the profile first
      const { error: profileInsertError } = await supabase
        .from('profiles')
        .insert({
          id: authUserId,
          email: email,
          full_name: finalFullName,
          role_id: franchiseeRole?.id || 3, // Default to 3 if query fails
          franchisee_id: data.id
        });

      if (profileInsertError) {
        console.error('Profile insert error:', profileInsertError);
        console.error('Profile insert error details:', JSON.stringify(profileInsertError, null, 2));

        // If insert failed because profile already exists (from trigger), try update instead
        if (profileInsertError.code === '23505') { // Unique violation
          console.log('Profile already exists, updating instead...');
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({
              franchisee_id: data.id,
              role_id: franchiseeRole?.id || 3
            })
            .eq('id', authUserId);

          if (profileUpdateError) {
            console.error('Profile update error:', profileUpdateError);
          } else {
            console.log('✅ Profile updated with franchisee_id:', data.id);
          }
        }
      } else {
        console.log('✅ Profile created successfully for user:', authUserId);
      }
    }

    const responseData = {
      ...data,
      authCreated: !!authUserId,
      authMethod: createAuth ? authMethod : null,
      emailSent: emailSent,
      magicLinkUrl: magicLinkUrl // Include for development/debugging
    };

    console.log('✅ Returning response:', JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to create franchisee' }, { status: 500 });
  }
}

// PUT update franchisee
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Map the frontend field names to database column names
    const mappedData: any = {};
    if (updateData.name !== undefined) mappedData.business_name = updateData.name;
    if (updateData.username !== undefined) mappedData.username = updateData.username;
    if (updateData.email !== undefined) mappedData.email = updateData.email;
    if (updateData.phone !== undefined) mappedData.phone = updateData.phone;
    if (updateData.territory !== undefined) mappedData.territory = updateData.territory;
    if (updateData.country !== undefined) mappedData.country = updateData.country;
    if (updateData.status !== undefined) mappedData.status = updateData.status;
    if (updateData.image !== undefined) mappedData.image = updateData.image;
    if (updateData.owners !== undefined) mappedData.owners = updateData.owners;

    const { data, error } = await supabase
      .from('franchisees')
      .update(mappedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update franchisee' }, { status: 500 });
  }
}

// DELETE franchisee
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('franchisees')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete franchisee' }, { status: 500 });
  }
}