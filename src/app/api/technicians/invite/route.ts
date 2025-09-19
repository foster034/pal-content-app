import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
);

export async function POST(request: NextRequest) {
  console.log('🚀 Magic link invite API called');
  try {
    const body = await request.json();
    const { technicianId, sendEmail = true } = body;
    console.log('📋 Request data:', { technicianId, sendEmail });

    // Get technician details
    const { data: technician, error: techError } = await supabase
      .from('technicians')
      .select(`
        *,
        franchisees!inner(
          id,
          business_name,
          owner_id
        )
      `)
      .eq('id', technicianId)
      .single();

    if (techError || !technician) {
      return NextResponse.json(
        { error: 'Technician not found' },
        { status: 404 }
      );
    }

    if (!technician.email) {
      return NextResponse.json(
        { error: 'Technician must have an email address' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === technician.email);

    let userId = existingUser?.id;

    // Check if we should force recreate user (for credential recovery)
    const { forceRecreate } = body;

    if (!existingUser || forceRecreate) {
      if (forceRecreate && existingUser) {
        // Delete existing user first for credential recovery
        console.log('Deleting existing user for credential recovery...');
        const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
        if (deleteError) {
          console.warn('Could not delete existing user:', deleteError.message);
        } else {
          console.log('✅ Existing user deleted for credential recovery');
        }
      }
      // User doesn't exist, invite them - this bypasses rate limits
      console.log('Creating new user via invitation');
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        technician.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tech/setup?technician_id=${technicianId}&franchise_id=${technician.franchisee_id}`,
          data: {
            name: technician.name,
            role: 'tech',
            technician_id: technicianId,
            franchisee_id: technician.franchisee_id,
            setup_completed: false
          }
        }
      );

      if (inviteError) {
        console.error('Error inviting user:', inviteError);
        return NextResponse.json(
          { error: 'Failed to send invitation: ' + inviteError.message },
          { status: 500 }
        );
      }

      userId = inviteData.user?.id;
      console.log('✅ Invitation sent successfully to:', technician.email);

      // For new users, return success immediately since invitation email is sent
      if (userId) {
        await supabase
          .from('technicians')
          .update({ user_id: userId })
          .eq('id', technicianId);
      }

      const responseData = {
        techName: technician.name,
        techEmail: technician.email,
        franchiseName: technician.franchisees.business_name,
        setupUrl: null,
        isNewUser: true,
        invitationSent: true,
        message: `Invitation email sent to ${technician.email}. They will receive an email to set up their account.`
      };

      return NextResponse.json({
        success: true,
        data: responseData
      });
    } else {
      // User exists, just send them a magic link
      console.log('User already exists, sending magic link');
    }

    // Update the technician record with the auth user ID if we have it
    if (userId) {
      await supabase
        .from('technicians')
        .update({ user_id: userId })
        .eq('id', technicianId);
    }

    // Send magic link for existing users or those who need to re-login
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let magicLinkUrl = null;

    if (sendEmail) {
      if (existingUser) {
        // For existing users, try using admin generateLink with auto-send
        console.log('Generating admin magic link for existing user...');
        const { data: magicLinkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: technician.email,
          options: {
            redirectTo: `${baseUrl}/tech/dashboard`
          }
        });

        if (magicLinkError) {
          console.error('Error generating admin magic link:', magicLinkError);
          return NextResponse.json({
            error: 'Failed to generate magic link: ' + magicLinkError.message
          }, { status: 500 });
        } else {
          magicLinkUrl = magicLinkData.properties?.action_link;
          console.log('✅ Admin magic link generated successfully');

          // For admin-generated links, we could send via custom email service
          // But for now, let's try the OTP method with better error handling
          if (sendEmail) {
            const { error: emailError } = await supabase.auth.signInWithOtp({
              email: technician.email,
              options: {
                emailRedirectTo: `${baseUrl}/tech/dashboard`
              }
            });

            if (emailError) {
              console.error('Error sending magic link email:', emailError);
              // If email fails but we have the magic link, return it for manual sharing
              console.warn('Email failed but magic link generated. Returning link for manual sharing.');
              return NextResponse.json({
                success: true,
                data: {
                  techName: technician.name,
                  techEmail: technician.email,
                  franchiseName: technician.franchisees.business_name,
                  setupUrl: magicLinkUrl,
                  isNewUser: false,
                  invitationSent: false,
                  message: `Email rate limited, but magic link generated. Share this link with ${technician.name}: ${magicLinkUrl}`,
                  magicLinkGenerated: true
                }
              });
            } else {
              console.log('✅ Magic link email sent to:', technician.email);
            }
          }
        }
      }
    }

    // Prepare the response data
    const responseData = {
      techName: technician.name,
      techEmail: technician.email,
      franchiseName: technician.franchisees.business_name,
      setupUrl: magicLinkUrl,
      isNewUser: !existingUser,
      invitationSent: sendEmail,
      message: existingUser
        ? `Magic link sent to ${technician.email}. They can now login to their dashboard.`
        : `Invitation sent to ${technician.email}. They will receive an email to set up their account.`
    };

    // Record the invitation in the database (optional - table may not exist yet)
    try {
      const { error: inviteError } = await supabase
        .from('technician_invites')
        .insert({
          technician_id: technicianId,
          franchisee_id: technician.franchisee_id,
          invited_at: new Date().toISOString(),
          login_code: technician.login_code,
          email_sent: sendEmail,
          magic_link_sent: true,
          setup_url: magicLinkUrl
        });

      if (inviteError) {
        console.warn('Invitation tracking table not available:', inviteError.message);
      }
    } catch (err) {
      console.warn('Invitation tracking not available, continuing without it');
    }

    // Return the response
    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error sending technician invite:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}