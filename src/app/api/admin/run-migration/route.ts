import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { migration_sql, dry_run = false } = body;

    if (!migration_sql) {
      return NextResponse.json(
        { success: false, error: 'migration_sql is required' },
        { status: 400 }
      );
    }

    console.log('Running migration SQL:', migration_sql);

    if (dry_run) {
      return NextResponse.json({
        success: true,
        message: 'Dry run mode - SQL not executed',
        sql: migration_sql
      });
    }

    // Try using the Supabase client's query method
    // Note: This will execute raw SQL through the PostgREST API
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      query: migration_sql
    });

    if (error) {
      console.error('Migration error:', error);

      // If exec_sql doesn't exist, provide helpful error
      if (error.code === 'PGRST202' || error.message.includes('Could not find the function')) {
        return NextResponse.json({
          success: false,
          error: 'exec_sql function not available',
          hint: 'Please run the SQL manually in Supabase SQL Editor',
          sql: migration_sql,
          url: `https://supabase.com/dashboard/project/hagfscurfkqfsjkczjyi/editor/sql`
        }, { status: 500 });
      }

      return NextResponse.json(
        { success: false, error: error.message, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Migration executed successfully',
      data
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Also support GET for easy browser testing
export async function GET() {
  return NextResponse.json({
    message: 'Use POST to run migrations',
    example: {
      migration_sql: 'ALTER TABLE gmb_oauth_tokens ADD COLUMN IF NOT EXISTS selected_location_name TEXT;',
      dry_run: false
    }
  });
}
