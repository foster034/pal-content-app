import { NextRequest, NextResponse } from 'next/server';
import { disconnectGMB } from '@/lib/gmb-tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { franchisee_id } = body;

    if (!franchisee_id) {
      return NextResponse.json(
        { success: false, error: 'Franchisee ID is required' },
        { status: 400 }
      );
    }

    const result = await disconnectGMB(franchisee_id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'GMB account disconnected successfully',
    });
  } catch (error: any) {
    console.error('GMB disconnect error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
