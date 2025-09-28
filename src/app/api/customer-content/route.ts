import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const technicianId = formData.get('technicianId') as string;
    const customerName = formData.get('customerName') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const customerPhone = formData.get('customerPhone') as string;
    const jobDescription = formData.get('jobDescription') as string;
    const customerFeedback = formData.get('customerFeedback') as string;
    const rating = parseInt(formData.get('rating') as string) || 0;
    const location = formData.get('location') as string;
    const additionalComments = formData.get('additionalComments') as string;

    if (!technicianId || !customerName || !customerEmail || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify technician exists
    const { data: techData, error: techError } = await supabase
      .from('technicians')
      .select('id, name')
      .eq('id', technicianId)
      .single();

    if (techError || !techData) {
      return NextResponse.json(
        { error: 'Invalid technician ID' },
        { status: 400 }
      );
    }

    // Process uploaded files
    const photoUrls = [];
    const photoKeys = Array.from(formData.keys()).filter(key => key.startsWith('photo_'));

    for (const photoKey of photoKeys) {
      const file = formData.get(photoKey) as File;
      if (file && file.size > 0) {
        try {
          // Generate unique filename
          const fileExt = file.name.split('.').pop();
          const fileName = `customer-content/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          // Convert file to buffer
          const buffer = Buffer.from(await file.arrayBuffer());

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('job-photos')
            .upload(fileName, buffer, {
              contentType: file.type,
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('job-photos')
            .getPublicUrl(fileName);

          photoUrls.push(publicUrl);
        } catch (fileError) {
          console.error('File processing error:', fileError);
          continue;
        }
      }
    }

    // Insert customer content into database
    const contentData = {
      technician_id: technicianId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      job_description: jobDescription,
      customer_feedback: customerFeedback,
      rating,
      location,
      additional_comments: additionalComments,
      photos: photoUrls,
      submission_type: 'customer',
      status: 'submitted',
      created_at: new Date().toISOString()
    };

    // Insert into a customer_submissions table or marketing_content table with customer flag
    const { data: submissionData, error: submissionError } = await supabase
      .from('customer_submissions')
      .insert(contentData)
      .select()
      .single();

    if (submissionError) {
      // If customer_submissions table doesn't exist, try marketing_content
      const marketingContentData = {
        technician_id: technicianId,
        category: 'Customer Feedback',
        service: 'Service Review',
        description: `Customer: ${customerName}\nService: ${jobDescription}\nFeedback: ${customerFeedback}`,
        photos: photoUrls,
        location,
        status: 'Submitted',
        submission_type: 'customer',
        customer_data: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          rating,
          additionalComments
        },
        created_at: new Date().toISOString()
      };

      const { data: marketingData, error: marketingError } = await supabase
        .from('marketing_content')
        .insert(marketingContentData)
        .select()
        .single();

      if (marketingError) {
        console.error('Database insertion error:', marketingError);
        return NextResponse.json(
          { error: 'Failed to save submission' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Customer content submitted successfully',
        submissionId: marketingData.id
      });
    }

    // Optional: Send notification to technician
    try {
      // You could implement email/SMS notification here
      console.log(`Customer submission received for technician ${technicianId}`);
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the submission if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Customer content submitted successfully',
      submissionId: submissionData.id
    });

  } catch (error) {
    console.error('Customer content submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}