import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { jobId, aiReport, aiReportGeneratedAt } = await request.json();

    console.log('Updating job', jobId, 'with AI report...');

    // Update the job submission with AI report
    const { data, error } = await supabase
      .from('job_submissions')
      .update({
        ai_report: aiReport,
        ai_report_generated_at: aiReportGeneratedAt
      })
      .eq('id', jobId)
      .select();

    if (error) {
      console.error('Error updating job with AI report:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Successfully updated job with AI report');

    return NextResponse.json({
      success: true,
      message: 'Job updated with AI report successfully',
      data
    });

  } catch (error) {
    console.error('Error in update-job-ai-report API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}