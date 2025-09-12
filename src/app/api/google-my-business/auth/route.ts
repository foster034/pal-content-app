import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const franchiseeId = searchParams.get('franchisee_id');
    
    if (!franchiseeId) {
      return NextResponse.json(
        { error: 'Franchisee ID is required' },
        { status: 400 }
      );
    }

    // Google OAuth 2.0 configuration
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/google-my-business/callback`;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Google OAuth not configured' },
        { status: 500 }
      );
    }

    // Google My Business API scopes
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');

    // Build OAuth authorization URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', franchiseeId); // Store franchisee ID in state

    console.log('Redirecting to Google OAuth:', authUrl.toString());
    
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('GMB Auth Error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google authorization' },
      { status: 500 }
    );
  }
}