import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { email, franchiseeName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('Resending magic link to:', email);

    // Check if user exists
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json({ error: 'Failed to check user' }, { status: 500 });
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      // User doesn't exist, create them first
      console.log('User not found, creating new auth user for:', email);

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          full_name: franchiseeName || email,
          role: 'franchisee'
        }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      // Update franchisee record with owner_id if needed
      const { data: franchisee } = await supabaseAdmin
        .from('franchisees')
        .select('id, owner_id')
        .eq('email', email)
        .single();

      if (franchisee && !franchisee.owner_id) {
        await supabaseAdmin
          .from('franchisees')
          .update({ owner_id: newUser.user.id })
          .eq('id', franchisee.id);
      }

      // Create profile
      await supabaseAdmin
        .from('profiles')
        .upsert({
          id: newUser.user.id,
          email: email,
          full_name: franchiseeName || email,
          role: 'franchisee',
          franchisee_id: franchisee?.id
        });
    }

    // Send magic link using inviteUserByEmail (this sends an actual email)
    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        full_name: franchiseeName || email,
        role: 'franchisee'
      }
    });

    if (inviteError) {
      console.error('Failed to send invite:', inviteError);

      // Fallback: try password reset email
      const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      });

      if (resetError) {
        console.error('Failed to send password reset:', resetError);

        // Last fallback: generate link manually
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
          }
        });

        if (linkError) {
          console.error('Failed to generate link:', linkError);
          return NextResponse.json({
            error: 'Failed to send magic link',
            details: linkError.message
          }, { status: 500 });
        }

        if (linkData?.properties?.action_link) {
          console.log('='.repeat(60));
          console.log('🔗 MAGIC LINK GENERATED (Manual)');
          console.log('Email:', email);
          console.log('Link:', linkData.properties.action_link);
          console.log('='.repeat(60));

          return NextResponse.json({
            success: true,
            message: 'Magic link generated (email not sent)',
            magicLinkUrl: linkData.properties.action_link,
            emailSent: false
          });
        }
      } else {
        console.log('✅ Password reset email sent to:', email);
        return NextResponse.json({
          success: true,
          message: 'Password reset email sent successfully',
          emailSent: true
        });
      }
    }

    console.log('✅ Magic link invitation sent to:', email);
    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully',
      emailSent: true
    });

  } catch (error) {
    console.error('Error in resend-magic-link:', error);
    return NextResponse.json({
      error: 'Failed to resend magic link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}