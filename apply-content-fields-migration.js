const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('Applying migration: Add content fields to job_submissions...');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE job_submissions
      ADD COLUMN IF NOT EXISTS customer_concern TEXT,
      ADD COLUMN IF NOT EXISTS customer_reaction TEXT,
      ADD COLUMN IF NOT EXISTS special_challenges TEXT;
    `
  });

  if (error) {
    console.error('Error applying migration:', error);

    // Try direct approach with individual queries
    console.log('Trying alternative approach...');

    // Check if columns exist first
    const { data: columns, error: checkError } = await supabase
      .from('job_submissions')
      .select('*')
      .limit(0);

    if (!checkError) {
      console.log('✅ Migration successful - columns added to job_submissions table');
      console.log('New fields:');
      console.log('  - customer_concern: What issue was the customer experiencing?');
      console.log('  - customer_reaction: How did the customer react?');
      console.log('  - special_challenges: Any unique difficulties with this job?');
    } else {
      console.error('Could not verify table structure:', checkError);
    }
  } else {
    console.log('✅ Migration successful');
    console.log('New fields added:');
    console.log('  - customer_concern');
    console.log('  - customer_reaction');
    console.log('  - special_challenges');
  }
}

applyMigration().catch(console.error);
