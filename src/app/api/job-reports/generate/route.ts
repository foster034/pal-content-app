import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobSubmissionId, franchiseeId } = body;

    // Validate required fields
    if (!jobSubmissionId || !franchiseeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique report ID
    const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Fetch job submission data with related technician and franchisee info
    const { data: jobData, error: jobError } = await supabase
      .from('job_submissions')
      .select(`
        *,
        technicians (
          name,
          role,
          image_url
        ),
        franchisees (
          business_name,
          phone,
          website,
          google_review_url
        )
      `)
      .eq('id', jobSubmissionId)
      .eq('franchisee_id', franchiseeId)
      .single();

    if (jobError || !jobData) {
      return NextResponse.json(
        { error: 'Job submission not found' },
        { status: 404 }
      );
    }

    // Transform data to match the expected format
    const transformedJobData = {
      id: jobData.id,
      technician: {
        name: jobData.technicians.name,
        role: jobData.technicians.role || "Senior Locksmith Technician",
        image: jobData.technicians.image_url
      },
      client: {
        name: jobData.client_name,
        phone: jobData.client_phone,
        email: jobData.client_email,
        preferredContactMethod: jobData.client_preferred_contact
      },
      service: {
        category: jobData.service_category,
        type: jobData.service_type,
        location: jobData.service_location,
        date: new Date(jobData.service_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        duration: `${jobData.service_duration} minutes`,
        satisfaction: jobData.satisfaction_rating,
        description: jobData.description
      },
      media: {
        beforePhotos: jobData.before_photos || [],
        afterPhotos: jobData.after_photos || [],
        processPhotos: jobData.process_photos || []
      }
    };

    const franchiseeData = {
      businessName: jobData.franchisees.business_name,
      googleReviewUrl: jobData.franchisees.google_review_url,
      phone: jobData.franchisees.phone,
      website: jobData.franchisees.website
    };

    const shareableUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/job-report/${reportId}`;

    // Create report record in database
    const { data: reportRecord, error: reportError } = await supabase
      .from('job_reports')
      .insert({
        job_submission_id: jobSubmissionId,
        report_id: reportId,
        shareable_url: shareableUrl,
        sent_to_client: false
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report record:', reportError);
      return NextResponse.json(
        { error: 'Failed to create report record' },
        { status: 500 }
      );
    }

    // Update job submission with report info
    const { error: updateError } = await supabase
      .from('job_submissions')
      .update({
        report_id: reportId,
        report_url: shareableUrl,
        status: 'approved'
      })
      .eq('id', jobSubmissionId);

    if (updateError) {
      console.error('Error updating job submission:', updateError);
      // Continue anyway as report was created successfully
    }

    return NextResponse.json(
      {
        success: true,
        reportId,
        shareableUrl,
        clientInfo: transformedJobData.client,
        message: 'Job report generated successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error generating job report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}