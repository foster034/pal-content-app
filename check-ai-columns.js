const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAIColumns() {
  console.log('🔍 Checking if AI report columns exist in job_submissions table...');

  try {
    // Try to select the AI report columns to see if they exist
    const { data, error } = await supabase
      .from('job_submissions')
      .select('id, ai_report, ai_report_generated_at')
      .limit(1);

    if (error) {
      if (error.code === '42703') { // Column does not exist error
        console.log('❌ AI report columns do NOT exist in database!');
        console.log('Error:', error.message);
        console.log('🔧 Need to run: add_ai_report_columns.sql');
      } else {
        console.log('❌ Database error:', error);
      }
      return false;
    } else {
      console.log('✅ AI report columns exist in database');
      console.log(`📊 Found ${data?.length || 0} job submission records`);
      return true;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

async function checkOpenAIKey() {
  console.log('\n🔍 Checking OpenAI API key...');

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('❌ OPENAI_API_KEY environment variable is NOT set');
    return false;
  }

  if (apiKey.startsWith('sk-') && apiKey.length > 20) {
    console.log('✅ OPENAI_API_KEY appears to be valid format');
    return true;
  } else {
    console.log('⚠️ OPENAI_API_KEY exists but format looks suspicious');
    console.log(`Key starts with: ${apiKey.substring(0, 10)}...`);
    return false;
  }
}

async function main() {
  console.log('🚀 Diagnosing AI report generation issues...\n');

  const columnsExist = await checkAIColumns();
  const apiKeyValid = await checkOpenAIKey();

  console.log('\n📋 DIAGNOSIS SUMMARY:');
  console.log(`✅ AI report columns: ${columnsExist ? 'EXISTS' : 'MISSING'}`);
  console.log(`✅ OpenAI API key: ${apiKeyValid ? 'VALID' : 'INVALID/MISSING'}`);

  if (!columnsExist) {
    console.log('\n🔧 REQUIRED FIX: Run the AI column migration');
    console.log('File: add_ai_report_columns.sql');
  }

  if (!apiKeyValid) {
    console.log('\n🔧 REQUIRED FIX: Set valid OPENAI_API_KEY in .env file');
  }

  if (columnsExist && apiKeyValid) {
    console.log('\n✅ Basic requirements met - issue may be elsewhere');
  }
}

main();