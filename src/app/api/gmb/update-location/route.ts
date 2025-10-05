import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { franchisee_id, selected_location_name } = body;

    if (!franchisee_id || !selected_location_name) {
      return NextResponse.json(
        { success: false, error: 'Franchisee ID and location name are required' },
        { status: 400 }
      );
    }

    // First check if record exists
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('gmb_oauth_tokens')
      .select('*')
      .eq('franchisee_id', franchisee_id)
      .eq('is_active', true)
      .single();

    if (fetchError) {
      console.error('Error fetching GMB token:', fetchError);
      return NextResponse.json(
        { success: false, error: `GMB connection not found: ${fetchError.message}` },
        { status: 404 }
      );
    }

    console.log('📍 Updating location for franchisee:', franchisee_id, 'to:', selected_location_name);

    // Update the selected location for this franchisee
    const { error } = await supabaseAdmin
      .from('gmb_oauth_tokens')
      .update({ selected_location_name })
      .eq('franchisee_id', franchisee_id)
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error updating location:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to update location' },
        { status: 500 }
      );
    }

    console.log('✅ Location updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Default location updated successfully',
    });
  } catch (error: any) {
    console.error('Update location error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
