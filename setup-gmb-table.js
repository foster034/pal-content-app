// Simple script to create the GMB OAuth tokens table
// Run with: node setup-gmb-table.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTable() {
  const query = `
    -- Create table for storing Google My Business OAuth tokens
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

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_gmb_oauth_franchisee_id ON gmb_oauth_tokens(franchisee_id);
    CREATE INDEX IF NOT EXISTS idx_gmb_oauth_active ON gmb_oauth_tokens(is_active) WHERE is_active = true;

    -- Add comment
    COMMENT ON TABLE gmb_oauth_tokens IS 'Stores Google My Business OAuth tokens for franchisees to enable automatic posting';
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { query });

    if (error) {
      console.error('❌ Error creating table:', error);
      process.exit(1);
    }

    console.log('✅ GMB OAuth tokens table created successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Navigate to franchisee settings page');
    console.log('3. Click "Connect Google My Business"');
    process.exit(0);
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

createTable();
