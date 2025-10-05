// Direct PostgreSQL migration to add selected_location_name column
const { Client } = require('pg');
require('dotenv').config();

async function applyMigration() {
  // Construct the connection string from environment variables
  const projectRef = 'hagfscurfkqfsjkczjyi';
  const connectionString = `postgresql://postgres.${projectRef}:${process.env.SUPABASE_SERVICE_ROLE_KEY?.split('.')[2] || 'popalock2025'}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`;

  console.log('\n=== Applying Migration ===');
  console.log('Connecting to database...\n');

  const client = new Client({
    host: `aws-0-us-east-1.pooler.supabase.com`,
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: 'popalock2025',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database successfully!\n');

    // Check current table structure
    console.log('1. Checking current table structure...');
    const checkQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'gmb_oauth_tokens'
      ORDER BY ordinal_position;
    `;

    const checkResult = await client.query(checkQuery);
    console.log('Current columns:');
    checkResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    // Check if selected_location_name exists
    const hasColumn = checkResult.rows.some(row => row.column_name === 'selected_location_name');

    if (hasColumn) {
      console.log('\n✅ Column "selected_location_name" already exists!\n');
    } else {
      console.log('\n2. Adding selected_location_name column...');

      const addColumnQuery = `
        ALTER TABLE gmb_oauth_tokens
        ADD COLUMN selected_location_name TEXT;
      `;

      await client.query(addColumnQuery);
      console.log('✅ Column added successfully!\n');

      // Add comment
      const commentQuery = `
        COMMENT ON COLUMN gmb_oauth_tokens.selected_location_name
        IS 'Default GMB location name for posting (e.g., accounts/123/locations/456)';
      `;

      await client.query(commentQuery);
      console.log('✅ Column comment added!\n');
    }

    // Verify the column exists now
    console.log('3. Verifying column exists...');
    const verifyResult = await client.query(checkQuery);
    const columnExists = verifyResult.rows.some(row => row.column_name === 'selected_location_name');

    if (columnExists) {
      console.log('✅ Verification successful - column exists!\n');

      // Test an update
      console.log('4. Testing update operation...');
      const updateQuery = `
        UPDATE gmb_oauth_tokens
        SET selected_location_name = 'accounts/demo123456/locations/demo789012'
        WHERE franchisee_id = '4c8b70f3-797b-4384-869e-e1fb3919f615'
        AND is_active = true
        RETURNING *;
      `;

      const updateResult = await client.query(updateQuery);
      console.log('✅ Update test successful!');
      console.log(`Updated ${updateResult.rowCount} row(s)\n`);

      if (updateResult.rows.length > 0) {
        console.log('Updated record:');
        console.log(`  - Franchisee ID: ${updateResult.rows[0].franchisee_id}`);
        console.log(`  - Selected Location: ${updateResult.rows[0].selected_location_name}`);
        console.log(`  - Email: ${updateResult.rows[0].google_email}\n`);
      }

      console.log('🎉 Migration completed successfully!\n');
    } else {
      console.log('❌ Verification failed - column still does not exist!\n');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    await client.end();
    process.exit(1);
  }
}

applyMigration();
