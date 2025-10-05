import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const migration = `
-- Create table for storing Google My Business OAuth tokens
CREATE TABLE IF NOT EXISTS gmb_oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisee_id UUID NOT NULL REFERENCES franchisees(id) ON DELETE CASCADE,

    -- OAuth tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Google account info
    google_account_id TEXT,
    google_email TEXT,

    -- GMB locations associated with this account
    locations JSONB DEFAULT '[]'::jsonb,

    -- Connection status
    is_active BOOLEAN DEFAULT TRUE,
    last_refreshed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_gmb_oauth_franchisee_id ON gmb_oauth_tokens(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_gmb_oauth_active ON gmb_oauth_tokens(is_active) WHERE is_active = true;
    `;

    const { error } = await supabaseAdmin.rpc('exec_sql', { query: migration });

    if (error) {
      console.error('Migration error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'GMB OAuth table created successfully' });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
