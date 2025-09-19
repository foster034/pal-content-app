// Email helper for sending magic links and notifications
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function sendFranchiseeInvite(
  email: string,
  fullName: string,
  franchiseName: string,
  method: 'magic_link' | 'temp_password',
  tempPassword?: string
) {
  try {
    if (method === 'magic_link') {
      // Send magic link invitation
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          full_name: fullName,
          role: 'franchisee',
          franchise_name: franchiseName
        }
      });

      if (error) {
        console.error('Failed to send magic link:', error);

        // Fallback: Generate link manually
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
          }
        });

        if (!linkError && linkData) {
          console.log('Magic link URL (send this manually):', linkData.properties?.action_link);
          return {
            success: true,
            method: 'link_generated',
            link: linkData.properties?.action_link
          };
        }

        throw error;
      }

      return {
        success: true,
        method: 'email_sent'
      };

    } else {
      // For temp password, just return the credentials
      return {
        success: true,
        method: 'temp_password',
        credentials: {
          email,
          password: tempPassword
        }
      };
    }
  } catch (error) {
    console.error('Error in sendFranchiseeInvite:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send invitation'
    };
  }
}

// Helper to resend magic link
export async function resendMagicLink(email: string) {
  try {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error resending magic link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend magic link'
    };
  }
}