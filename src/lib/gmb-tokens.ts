import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface GMBTokenData {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in: number; // seconds
  scope?: string;
}

export interface GMBLocation {
  name: string;
  title?: string;
  address?: string;
}

/**
 * Save or update GMB OAuth tokens for a franchisee
 */
export async function saveGMBTokens(
  franchiseeId: string,
  tokenData: GMBTokenData,
  googleEmail?: string,
  googleAccountId?: string,
  locations?: GMBLocation[]
) {
  try {
    // Calculate expiration time (typically 1 hour from now)
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // First, deactivate any existing tokens for this franchisee
    await supabaseAdmin
      .from('gmb_oauth_tokens')
      .update({ is_active: false })
      .eq('franchisee_id', franchiseeId)
      .eq('is_active', true);

    // Insert new token
    const { data, error } = await supabaseAdmin
      .from('gmb_oauth_tokens')
      .insert({
        franchisee_id: franchiseeId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_at: expiresAt.toISOString(),
        google_email: googleEmail,
        google_account_id: googleAccountId,
        locations: locations || [],
        is_active: true,
        last_refreshed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving GMB tokens:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error saving GMB tokens:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get active GMB tokens for a franchisee
 */
export async function getGMBTokens(franchiseeId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('gmb_oauth_tokens')
      .select('*')
      .eq('franchisee_id', franchiseeId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No tokens found
        return { success: true, data: null };
      }
      console.error('Error getting GMB tokens:', error);
      return { success: false, error: error.message };
    }

    // Check if token is expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    if (expiresAt <= now) {
      // Token expired, try to refresh
      return await refreshGMBToken(franchiseeId, data.refresh_token);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error getting GMB tokens:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Refresh GMB access token using refresh token
 */
export async function refreshGMBToken(franchiseeId: string, refreshToken: string) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', errorText);
      return { success: false, error: 'Failed to refresh token' };
    }

    const newTokenData = await response.json();

    // Update the tokens in database
    const expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);

    const { data, error } = await supabaseAdmin
      .from('gmb_oauth_tokens')
      .update({
        access_token: newTokenData.access_token,
        expires_at: expiresAt.toISOString(),
        last_refreshed_at: new Date().toISOString(),
      })
      .eq('franchisee_id', franchiseeId)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      console.error('Error updating refreshed tokens:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error refreshing GMB token:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Disconnect GMB account for a franchisee
 */
export async function disconnectGMB(franchiseeId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('gmb_oauth_tokens')
      .update({ is_active: false })
      .eq('franchisee_id', franchiseeId)
      .eq('is_active', true);

    if (error) {
      console.error('Error disconnecting GMB:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error disconnecting GMB:', error);
    return { success: false, error: error.message };
  }
}
