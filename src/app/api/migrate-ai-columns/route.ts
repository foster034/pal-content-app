import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('🔍 Checking database status for AI report columns...');

    // Try to query job_submissions to see if ai_report column exists
    let hasAiReport = false;
    let hasAiReportGeneratedAt = false;
    let testError = null;

    try {
      // Try to select ai_report column - this will fail if column doesn't exist
      const { data, error } = await supabase
        .from('job_submissions')
        .select('ai_report, ai_report_generated_at')
        .limit(1);

      if (error) {
        testError = error;
        // Check error message to determine which columns are missing
        hasAiReport = !error.message.includes('ai_report');
        hasAiReportGeneratedAt = !error.message.includes('ai_report_generated_at');
      } else {
        // If query succeeded, both columns exist
        hasAiReport = true;
        hasAiReportGeneratedAt = true;
      }
    } catch (err) {
      testError = err;
    }

    const ready = hasAiReport && hasAiReportGeneratedAt;

    const migrationSQL = `
-- Add AI report columns to job_submissions table
ALTER TABLE job_submissions
ADD COLUMN IF NOT EXISTS ai_report TEXT,
ADD COLUMN IF NOT EXISTS ai_report_generated_at TIMESTAMPTZ;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_submissions_ai_report_generated_at
ON job_submissions(ai_report_generated_at)
WHERE ai_report_generated_at IS NOT NULL;
`;

    return NextResponse.json({
      status: ready ? 'READY' : 'NEEDS_MIGRATION',
      summary: {
        hasAiReport,
        hasAiReportGeneratedAt,
        ready
      },
      error: testError,
      message: ready
        ? 'AI report columns are ready'
        : 'Database migration needed - AI report columns are missing',
      migrationSQL: ready ? null : migrationSQL,
      instructions: ready ? null : 'Run the provided SQL in your Supabase SQL editor to add the missing columns'
    });

  } catch (error) {
    console.error('Error checking AI columns:', error);
    return NextResponse.json({
      status: 'ERROR',
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
}