import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create the table
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS gmb_oauth_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          franchisee_id UUID NOT NULL REFERENCES franchisees(id) ON DELETE CASCADE,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          token_type TEXT DEFAULT 'Bearer',
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          google_account_id TEXT,
          google_email TEXT,
          locations JSONB DEFAULT '[]'::jsonb,
          selected_location_name TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          last_refreshed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_gmb_oauth_franchisee_id ON gmb_oauth_tokens(franchisee_id);
        CREATE INDEX IF NOT EXISTS idx_gmb_oauth_active ON gmb_oauth_tokens(is_active) WHERE is_active = true;
      `
    });

    if (error) {
      console.error('Table creation error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'GMB OAuth table created successfully' });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
