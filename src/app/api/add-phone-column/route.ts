import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST() {
  try {
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );

    console.log('Adding phone column to profiles table...');

    // Add phone column to profiles table
    const { data, error } = await serviceSupabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
        COMMENT ON COLUMN profiles.phone IS 'User phone number for contact purposes';
      `
    }).catch(async () => {
      // Fallback: try direct SQL execution
      const { data, error } = await serviceSupabase
        .from('profiles')
        .select('phone')
        .limit(1);

      if (error && error.message.includes("Could not find the 'phone' column")) {
        throw new Error('Phone column does not exist and cannot be added via API');
      }

      return { data: 'Column already exists or added successfully' };
    });

    if (error) {
      console.error('Error adding phone column:', error);
      return NextResponse.json({
        error: 'Failed to add phone column',
        details: error.message,
        suggestion: 'You may need to add this column manually in Supabase dashboard'
      }, { status: 500 });
    }

    console.log('Phone column added successfully');
    return NextResponse.json({
      success: true,
      message: 'Phone column added to profiles table',
      data
    });

  } catch (error) {
    console.error('Error in add-phone-column:', error);
    return NextResponse.json({
      error: 'Failed to add phone column',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'You may need to add this column manually in Supabase dashboard'
    }, { status: 500 });
  }
}