import { NextRequest, NextResponse } from 'next/server';
import { saveGMBTokens } from '@/lib/gmb-tokens';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is the franchisee_id
    const error = searchParams.get('error');

    console.log('GMB OAuth callback received:', { code: !!code, state, error });

    if (error) {
      console.error('OAuth error:', error);
      const errorUrl = `/franchisee/settings?id=${state}&gmb_error=${encodeURIComponent(error)}`;
      return NextResponse.redirect(new URL(errorUrl, request.url));
    }

    if (!code || !state) {
      const errorUrl = '/franchisee/settings?gmb_error=missing_parameters';
      return NextResponse.redirect(new URL(errorUrl, request.url));
    }

    const franchiseeId = state;

    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForTokens(code);
    
    if (!tokenResponse.success) {
      const errorUrl = `/franchisee/marketing?gmb_error=${encodeURIComponent(tokenResponse.error)}`;
      return NextResponse.redirect(new URL(errorUrl, request.url));
    }

    // Get GMB accounts/locations and user info
    const [locationsResponse, userInfoResponse] = await Promise.all([
      getGMBLocations(tokenResponse.data.access_token),
      getGoogleUserInfo(tokenResponse.data.access_token)
    ]);

    const locations = locationsResponse.success ? locationsResponse.data : [];
    const userInfo = userInfoResponse.success ? userInfoResponse.data : null;

    console.log('Tokens received for franchisee:', franchiseeId);
    console.log(`Found ${locations.length} GMB locations`);
    console.log('Google email:', userInfo?.email);

    // Save tokens to database
    const saveResult = await saveGMBTokens(
      franchiseeId,
      tokenResponse.data,
      userInfo?.email,
      userInfo?.id,
      locations
    );

    if (!saveResult.success) {
      console.error('Failed to save GMB tokens:', saveResult.error);
      const errorUrl = `/franchisee/settings?id=${franchiseeId}&gmb_error=save_failed`;
      return NextResponse.redirect(new URL(errorUrl, request.url));
    }

    console.log('GMB tokens saved successfully');

    // Redirect back to settings page with success
    const successUrl = `/franchisee/settings?id=${franchiseeId}&gmb_connected=true`;
    return NextResponse.redirect(new URL(successUrl, request.url));

  } catch (error) {
    console.error('GMB Callback Error:', error);
    const errorUrl = '/franchisee/marketing?gmb_error=callback_failed';
    return NextResponse.redirect(new URL(errorUrl, request.url));
  }
}

async function exchangeCodeForTokens(code: string) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/google-my-business/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', errorText);
      return { success: false, error: 'Token exchange failed' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Token exchange error:', error);
    return { success: false, error: 'Network error during token exchange' };
  }
}

async function getGMBLocations(accessToken: string) {
  try {
    // First, get the user's accounts
    const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error('Failed to get GMB accounts:', errorText);
      return { success: false, error: 'Failed to get accounts' };
    }

    const accountsData = await accountsResponse.json();
    console.log('GMB accounts:', accountsData);

    // Get locations for the first account (you might want to handle multiple accounts)
    const accounts = accountsData.accounts || [];
    if (accounts.length === 0) {
      return { success: true, data: [] };
    }

    const accountName = accounts[0].name;
    const locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!locationsResponse.ok) {
      const errorText = await locationsResponse.text();
      console.error('Failed to get GMB locations:', errorText);
      return { success: false, error: 'Failed to get locations' };
    }

    const locationsData = await locationsResponse.json();
    const rawLocations = locationsData.locations || [];

    // Format locations for storage
    const locations = rawLocations.map((loc: any) => ({
      name: loc.name, // Resource name (e.g., "accounts/123/locations/456")
      title: loc.title || loc.locationName || 'Unnamed Location',
      address: formatAddress(loc.storefrontAddress || loc.address),
      placeId: loc.metadata?.placeId,
    }));

    return { success: true, data: locations };
  } catch (error) {
    console.error('GMB locations error:', error);
    return { success: false, error: 'Network error getting locations' };
  }
}

async function getGoogleUserInfo(accessToken: string) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get user info:', errorText);
      return { success: false, error: 'Failed to get user info' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('User info error:', error);
    return { success: false, error: 'Network error getting user info' };
  }
}

function formatAddress(address: any): string {
  if (!address) return '';

  const parts = [
    address.addressLines?.join(', '),
    address.locality,
    address.administrativeArea,
    address.postalCode,
  ].filter(Boolean);

  return parts.join(', ');
}