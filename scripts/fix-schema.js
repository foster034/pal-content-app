#!/usr/bin/env node

/**
 * Fix Schema Script - Forces Supabase schema cache refresh
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSchema() {
  console.log('🔧 Fixing database schema issues...\n');

  try {
    // First, let's see what the current schema looks like
    console.log('📊 Checking current franchisees table structure...');

    // Try to query the information_schema to see actual columns
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'franchisees')
      .eq('table_schema', 'public');

    if (columnError) {
      console.log('⚠️ Could not query information_schema, trying direct approach...');
    } else {
      console.log('✅ Current franchisees table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }

    // Now try to force a schema refresh by doing a describe-like operation
    console.log('\n🔄 Attempting to refresh schema cache...');

    // Method 1: Try to select with a limit to force schema reload
    const { data: testData, error: testError } = await supabase
      .from('franchisees')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('❌ Error accessing franchisees table:', testError.message);

      // Method 2: Try using a direct SQL query if the table access fails
      console.log('\n💉 Attempting direct SQL to add missing columns...');

      // We'll use the RPC method to execute raw SQL
      try {
        const { data: sqlResult, error: sqlError } = await supabase.rpc('sql', {
          query: `
            -- Add missing columns if they don't exist
            DO $$
            BEGIN
              -- Add country column
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name = 'franchisees'
                           AND column_name = 'country') THEN
                ALTER TABLE franchisees ADD COLUMN country TEXT DEFAULT 'United States';
              END IF;

              -- Add other missing columns
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name = 'franchisees'
                           AND column_name = 'username') THEN
                ALTER TABLE franchisees ADD COLUMN username TEXT;
              END IF;

              IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name = 'franchisees'
                           AND column_name = 'territory') THEN
                ALTER TABLE franchisees ADD COLUMN territory TEXT;
              END IF;

              IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name = 'franchisees'
                           AND column_name = 'status') THEN
                ALTER TABLE franchisees ADD COLUMN status TEXT DEFAULT 'Active';
              END IF;

              IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name = 'franchisees'
                           AND column_name = 'image') THEN
                ALTER TABLE franchisees ADD COLUMN image TEXT;
              END IF;

              IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name = 'franchisees'
                           AND column_name = 'owners') THEN
                ALTER TABLE franchisees ADD COLUMN owners JSONB DEFAULT '[]'::jsonb;
              END IF;

              IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name = 'franchisees'
                           AND column_name = 'owner_id') THEN
                ALTER TABLE franchisees ADD COLUMN owner_id UUID;
              END IF;

              IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name = 'franchisees'
                           AND column_name = 'notification_preferences') THEN
                ALTER TABLE franchisees ADD COLUMN notification_preferences JSONB DEFAULT '{}'::jsonb;
              END IF;
            END
            $$;

            -- Update existing records
            UPDATE franchisees SET country = 'United States' WHERE country IS NULL;

            -- Return success message
            SELECT 'Schema update completed' as result;
          `
        });

        if (sqlError) {
          console.log('❌ SQL RPC failed:', sqlError.message);
          console.log('\n📋 Please run this SQL manually in your Supabase SQL Editor:');
          console.log(`
-- Add missing columns to franchisees table
ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS territory TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS owners JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}'::jsonb;

-- Update existing records
UPDATE franchisees SET country = 'United States' WHERE country IS NULL;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';
          `);
        } else {
          console.log('✅ SQL executed successfully:', sqlResult);
        }
      } catch (rpcError) {
        console.log('❌ RPC not available, manual SQL required');
        console.log('\n📋 Please run this SQL manually in your Supabase SQL Editor:');
        console.log(`
-- Add missing columns to franchisees table
ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS territory TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS owners JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}'::jsonb;

-- Update existing records
UPDATE franchisees SET country = 'United States' WHERE country IS NULL;

-- Force schema cache refresh (if available)
NOTIFY pgrst, 'reload schema';
        `);
      }
    } else {
      console.log('✅ Table access successful, found', testData?.length || 0, 'records');

      // Test if country column exists by trying to select it specifically
      const { data: countryTest, error: countryError } = await supabase
        .from('franchisees')
        .select('country')
        .limit(1);

      if (countryError) {
        console.log('❌ Country column still missing:', countryError.message);
      } else {
        console.log('✅ Country column accessible');
      }
    }

    console.log('\n🔄 Please restart your development server after making schema changes:');
    console.log('   Ctrl+C to stop, then run: npm run dev');

  } catch (error) {
    console.error('💥 Script failed:', error.message);
  }
}

// Run the fix
fixSchema();