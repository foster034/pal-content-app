import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('Creating admin_settings table...');

    // Create the table using service role (bypasses RLS)
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.admin_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // We'll use direct table operations since we can't execute raw SQL through PostgREST
    // First, try to insert a test record to see if table exists
    const { error: testError } = await supabase
      .from('admin_settings')
      .select('id')
      .limit(1);

    if (testError && testError.code === 'PGRST205') {
      // Table doesn't exist, we need to create it via SQL
      return NextResponse.json({
        success: false,
        message: 'Please create the admin_settings table manually in Supabase',
        sql: createTableQuery
      }, { status: 500 });
    }

    // Table exists, ensure default Twilio settings
    const twilioSettings = [
      { setting_key: 'twilio_account_sid', setting_value: '' },
      { setting_key: 'twilio_auth_token', setting_value: '' },
      { setting_key: 'twilio_phone_number', setting_value: '' },
      { setting_key: 'twilio_enabled', setting_value: 'false' },
      { setting_key: 'twilio_test_mode', setting_value: 'true' },
    ];

    for (const setting of twilioSettings) {
      await supabase
        .from('admin_settings')
        .upsert(setting, {
          onConflict: 'setting_key'
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin settings initialized successfully'
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error.message || 'Migration failed' },
      { status: 500 }
    );
  }
}
