import { NextRequest, NextResponse } from 'next/server';
import { getGMBTokens } from '@/lib/gmb-tokens';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const franchiseeId = searchParams.get('franchisee_id');

    if (!franchiseeId) {
      return NextResponse.json(
        { success: false, error: 'Franchisee ID is required' },
        { status: 400 }
      );
    }

    const result = await getGMBTokens(franchiseeId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    const connected = !!result.data;
    const status = connected
      ? {
          connected: true,
          email: result.data.google_email,
          locations: result.data.locations,
          selectedLocation: result.data.selected_location_name,
          lastConnected: result.data.last_refreshed_at || result.data.created_at,
        }
      : { connected: false };

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error: any) {
    console.error('GMB status error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
