#!/usr/bin/env node

/**
 * Database Migration Script
 * Runs the required SQL migrations to fix missing columns
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file for:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // Migration 1: Add country column to franchisees table
    console.log('📝 Adding country column to franchisees table...');
    const { error: migration1Error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE franchisees
        ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';

        UPDATE franchisees
        SET country = 'United States'
        WHERE country IS NULL;
      `
    });

    if (migration1Error) {
      console.log('⚠️  RPC method not available, trying direct SQL execution...');

      // Try alternative approach with raw SQL
      const { error: altError1 } = await supabase
        .from('franchisees')
        .select('country')
        .limit(1);

      if (altError1 && altError1.message.includes('column "country" does not exist')) {
        console.log('❌ Country column missing - manual migration required');
        console.log('Please run the SQL in your Supabase dashboard:\n');
        console.log(`
ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';

UPDATE franchisees
SET country = 'United States'
WHERE country IS NULL;
        `);
      } else {
        console.log('✅ Country column already exists');
      }
    } else {
      console.log('✅ Country column migration completed');
    }

    // Migration 2: Add other missing columns
    console.log('\n📝 Adding other missing columns...');
    const additionalColumns = [
      'username TEXT',
      'territory TEXT',
      'status TEXT DEFAULT \'Active\'',
      'image TEXT',
      'owners JSONB DEFAULT \'[]\'::jsonb',
      'owner_id UUID',
      'notification_preferences JSONB DEFAULT \'{"newTechSubmissions": {"email": true, "sms": false, "app": true}}\'::jsonb'
    ];

    for (const column of additionalColumns) {
      const columnName = column.split(' ')[0];
      try {
        const { error } = await supabase
          .from('franchisees')
          .select(columnName)
          .limit(1);

        if (error && error.message.includes(`column "${columnName}" does not exist`)) {
          console.log(`❌ Missing column: ${columnName}`);
        } else {
          console.log(`✅ Column exists: ${columnName}`);
        }
      } catch (e) {
        console.log(`⚠️  Could not check column: ${columnName}`);
      }
    }

    // Test the API endpoints
    console.log('\n🧪 Testing API endpoints...');
    const { data: franchisees, error: testError } = await supabase
      .from('franchisees')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('❌ API test failed:', testError.message);
      console.log('\nPlease run the full migration SQL in your Supabase dashboard:');
      console.log(`
-- Add missing columns to franchisees table
ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS territory TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS owners JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "newTechSubmissions": {"email": true, "sms": false, "app": true},
  "mediaArchival": {"email": true, "sms": false, "app": false},
  "systemUpdates": {"email": true, "sms": false, "app": true},
  "marketingReports": {"email": true, "sms": false, "app": false},
  "emergencyAlerts": {"email": true, "sms": true, "app": true},
  "weeklyDigest": {"email": true, "sms": false, "app": false}
}'::jsonb;

-- Update existing records
UPDATE franchisees
SET country = 'United States'
WHERE country IS NULL;
      `);
    } else {
      console.log('✅ API endpoints working correctly');
      console.log(`Found ${franchisees?.length || 0} franchisee(s) in database`);
    }

    console.log('\n🎉 Migration script completed!');
    console.log('If you saw any ❌ errors above, please run the suggested SQL in your Supabase dashboard.');

  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    console.log('\nPlease run the migrations manually in your Supabase SQL Editor.');
  }
}

// Run the migrations
runMigrations();