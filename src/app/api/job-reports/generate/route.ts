import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
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

    // In a real implementation, you would:
    // 1. Fetch job submission data from database
    // 2. Fetch franchisee info (business name, Google review URL, etc.)
    // 3. Generate report record in database
    // 4. Create shareable link

    // Mock job data (replace with database query)
    const mockJobData = {
      id: jobSubmissionId,
      technician: {
        name: "Alex Rodriguez",
        role: "Senior Locksmith Technician",
        image: "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg"
      },
      client: {
        name: "John Smith",
        phone: "+1 (705) 555-0123",
        email: "john.smith@email.com",
        preferredContactMethod: "sms"
      },
      service: {
        category: "Automotive",
        type: "Car Key Replacement",
        location: "123 Main St, Barrie, ON L4M 1A1",
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        duration: "45 minutes",
        satisfaction: 5,
        description: "Successfully cut and programmed new key fob for 2018 Ford F-150. Verified all functions including remote start, door locks, and trunk access. Customer very satisfied with prompt service."
      },
      media: {
        beforePhotos: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop"
        ],
        afterPhotos: [
          "https://images.unsplash.com/photo-1544860565-d4c4d73cb237?w=400&h=300&fit=crop"
        ],
        processPhotos: [
          "https://images.unsplash.com/photo-1571974599782-87624638275e?w=300&h=200&fit=crop",
          "https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=300&h=200&fit=crop"
        ]
      }
    };

    // Mock franchisee data (replace with database query)
    const mockFranchiseeData = {
      businessName: "Pop-A-Lock Simcoe County",
      googleReviewUrl: "https://maps.google.com/place/Pop-A-Lock-Simcoe-County/reviews",
      phone: "(705) 555-0123",
      website: "www.popalocksimcoe.com"
    };

    // Create report record
    const reportRecord = {
      id: reportId,
      jobSubmissionId,
      franchiseeId,
      jobData: mockJobData,
      franchiseeData: mockFranchiseeData,
      status: 'generated',
      createdAt: new Date().toISOString(),
      shareableUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/job-report/${reportId}`
    };

    console.log('Job report generated:', reportRecord);

    // In a real implementation:
    // 1. Save report to database
    // 2. Update job submission status to 'approved'
    // 3. Log activity for audit trail

    return NextResponse.json(
      { 
        success: true,
        reportId,
        shareableUrl: reportRecord.shareableUrl,
        clientInfo: mockJobData.client,
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