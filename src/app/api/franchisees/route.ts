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
  try {
    const body = await request.json();

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
      owners,
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
                role: 'franchisee'
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
              role: 'franchisee'
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
      } catch (authError) {
        console.error('Auth creation error:', authError);
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
    let { data, error } = await supabase
      .from('franchisees')
      .insert([
        {
          ...insertData,
          username: username || finalBusinessName.toLowerCase().replace(/\s+/g, ''),
          territory,
          country: country || 'Canada',
          status: status || 'Active',
          image,
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
        }
      ])
      .select()
      .single();

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
    if (authUserId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUserId,
          email: email,
          full_name: finalFullName,
          role: 'franchisee',
          franchisee_id: data.id
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    return NextResponse.json({
      ...data,
      authCreated: !!authUserId,
      authMethod: createAuth ? authMethod : null,
      emailSent: emailSent,
      magicLinkUrl: magicLinkUrl // Include for development/debugging
    });
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