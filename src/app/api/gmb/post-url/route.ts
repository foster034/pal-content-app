import { NextRequest, NextResponse } from 'next/server';
import { getGMBTokens } from '@/lib/gmb-tokens';

export async function POST(request: NextRequest) {
  try {
    const { franchisee_id } = await request.json();

    if (!franchisee_id) {
      return NextResponse.json(
        { success: false, error: 'Franchisee ID is required' },
        { status: 400 }
      );
    }

    // Get GMB tokens and selected location
    const tokenResult = await getGMBTokens(franchisee_id);

    if (!tokenResult.success || !tokenResult.data) {
      return NextResponse.json(
        { success: false, error: 'GMB account not connected' },
        { status: 404 }
      );
    }

    const { selected_location_name, access_token } = tokenResult.data;

    if (!selected_location_name) {
      return NextResponse.json(
        { success: false, error: 'No default location selected' },
        { status: 400 }
      );
    }

    // Extract location ID from the location name (format: accounts/{accountId}/locations/{locationId})
    // Location ID can be numeric OR alphanumeric (for demo/test accounts)
    const locationIdMatch = selected_location_name.match(/locations\/([a-zA-Z0-9]+)/);
    const locationId = locationIdMatch ? locationIdMatch[1] : null;

    if (!locationId) {
      console.error('Failed to extract location ID from:', selected_location_name);
      return NextResponse.json(
        { success: false, error: 'Invalid location format. Expected: accounts/{accountId}/locations/{locationId}' },
        { status: 400 }
      );
    }

    console.log('📍 Opening GMB post URL for location:', locationId);

    // Generate the GMB Business Profile Manager URL for creating a post
    const gmbPostUrl = `https://business.google.com/posts/l/${locationId}`;

    return NextResponse.json({
      success: true,
      url: gmbPostUrl,
      accessToken: access_token,
      locationId: locationId,
    });
  } catch (error) {
    console.error('Error generating GMB post URL:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate post URL' },
      { status: 500 }
    );
  }
}
