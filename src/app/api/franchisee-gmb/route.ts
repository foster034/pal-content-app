import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseeId = searchParams.get('franchiseeId');

    if (!franchiseeId) {
      return NextResponse.json(
        { error: 'Franchisee ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('franchisees')
      .select('gmb_location_id')
      .eq('id', franchiseeId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ gmb_location_id: data?.gmb_location_id || null });
  } catch (error) {
    console.error('Error fetching GMB location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GMB location' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { franchiseeId, gmb_location_id } = await request.json();

    if (!franchiseeId) {
      return NextResponse.json(
        { error: 'Franchisee ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('franchisees')
      .update({ gmb_location_id })
      .eq('id', franchiseeId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving GMB location:', error);
    return NextResponse.json(
      { error: 'Failed to save GMB location' },
      { status: 500 }
    );
  }
}
