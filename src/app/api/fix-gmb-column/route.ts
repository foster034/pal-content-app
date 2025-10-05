import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('Attempting to add selected_location_name column...');

    // Try to add the column using raw SQL
    const { data, error } = await supabaseAdmin
      .rpc('exec', {
        sql: 'ALTER TABLE gmb_oauth_tokens ADD COLUMN IF NOT EXISTS selected_location_name TEXT;'
      });

    if (error) {
      console.error('Error via exec RPC:', error);

      // If RPC doesn't work, try using the REST API with a dummy update
      // First, let's check if we can manually add it via a test query
      const { error: testError } = await supabaseAdmin
        .from('gmb_oauth_tokens')
        .select('selected_location_name')
        .limit(1);

      if (testError) {
        console.error('Column does not exist:', testError);
        return NextResponse.json({
          success: false,
          error: 'Column does not exist. Please run the migration manually.',
          hint: 'Run: ALTER TABLE gmb_oauth_tokens ADD COLUMN selected_location_name TEXT;',
          testError: testError.message
        }, { status: 500 });
      } else {
        return NextResponse.json({
          success: true,
          message: 'Column already exists!'
        });
      }
    }

    console.log('Column added successfully!');
    return NextResponse.json({
      success: true,
      message: 'selected_location_name column added successfully',
      data
    });
  } catch (error: any) {
    console.error('Fix error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
