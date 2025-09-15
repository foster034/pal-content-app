import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, testimonial, consent } = body;

    // Validate required fields
    if (!reportId || !testimonial || !consent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Here you would:
    // 1. Save testimonial to database
    // 2. Link it to the job report
    // 3. Send notification to franchisee
    // 4. Potentially trigger review request workflow

    // Mock database save
    const testimonialRecord = {
      id: Date.now(),
      reportId,
      testimonial: testimonial.trim(),
      consent,
      submittedAt: new Date().toISOString(),
      status: 'pending_review'
    };

    console.log('New testimonial submitted:', testimonialRecord);

    // In a real implementation, you might:
    // - Save to your database
    // - Send email notification to franchisee
    // - Add to marketing content queue
    // - Update job completion status

    return NextResponse.json(
      { 
        success: true, 
        message: 'Testimonial submitted successfully',
        testimonialId: testimonialRecord.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error submitting testimonial:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}