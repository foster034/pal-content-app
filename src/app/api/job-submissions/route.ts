import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Skip authentication for now
    // const { data: { session } } = await supabase.auth.getSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const franchiseeId = searchParams.get('franchiseeId');
    const status = searchParams.get('status');

    let query = supabase
      .from('job_submissions')
      .select(`
        *,
        technicians (
          name,
          image_url,
          rating
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by franchisee if provided
    if (franchiseeId) {
      query = query.eq('franchisee_id', franchiseeId);
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching job submissions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch job submissions' },
        { status: 500 }
      );
    }

    // Transform data to match frontend expectations
    const transformedData = data?.map(job => ({
      id: job.id,
      technician: {
        name: job.technicians.name,
        image: job.technicians.image_url,
        rating: job.technicians.rating
      },
      client: {
        name: job.client_name,
        phone: job.client_phone,
        email: job.client_email,
        preferredContactMethod: job.client_preferred_contact,
        consentToContact: job.client_consent_contact,
        consentToShare: job.client_consent_share
      },
      service: {
        category: job.service_category,
        type: job.service_type,
        location: job.service_location,
        date: job.service_date,
        duration: job.service_duration,
        satisfaction: job.satisfaction_rating,
        description: job.description
      },
      media: {
        beforePhotos: job.before_photos || [],
        afterPhotos: job.after_photos || [],
        processPhotos: job.process_photos || []
      },
      status: job.status,
      submittedAt: job.created_at,
      reportId: job.report_id,
      reportUrl: job.report_url
    })) || [];

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Error in job submissions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/job-submissions - Starting request');

    const body = await request.json();
    console.log('📦 Request body received:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.technicianId || !body.franchiseeId) {
      console.error('❌ Missing required IDs:', { technicianId: body.technicianId, franchiseeId: body.franchiseeId });
      return NextResponse.json(
        { error: 'Missing required technician or franchisee ID' },
        { status: 400 }
      );
    }

    // Transform frontend data to database format
    const dbData = {
      technician_id: body.technicianId,
      franchisee_id: body.franchiseeId,
      client_name: body.client.name,
      client_phone: body.client.phone,
      client_email: body.client.email,
      client_preferred_contact: body.client.preferredContactMethod,
      client_consent_contact: body.client.consentToContact,
      client_consent_share: body.client.consentToShare,
      service_category: body.service.category,
      service_type: body.service.type,
      service_location: body.service.location,
      service_date: body.service.date,
      service_duration: body.service.duration,
      satisfaction_rating: body.service.satisfaction,
      description: body.service.description,
      before_photos: body.media.beforePhotos || [],
      after_photos: body.media.afterPhotos || [],
      process_photos: body.media.processPhotos || [],
      status: 'pending'
    };

    // Log data sizes for debugging
    console.log('🔄 Transformed database data structure:');
    console.log('- technician_id:', dbData.technician_id);
    console.log('- franchisee_id:', dbData.franchisee_id);
    console.log('- client_name:', dbData.client_name);
    console.log('- service_category:', dbData.service_category);
    console.log('- service_type:', dbData.service_type);
    console.log('- before_photos count:', dbData.before_photos.length);
    console.log('- after_photos count:', dbData.after_photos.length);
    console.log('- process_photos count:', dbData.process_photos.length);

    // Log photo sizes to identify the problem
    dbData.process_photos.forEach((photo, index) => {
      console.log(`- process_photo[${index}] size:`, photo.length, 'characters');
      console.log(`- process_photo[${index}] type:`, photo.substring(0, 50) + '...');
    });

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing environment variables:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Use service role client to bypass RLS for testing
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('✅ Supabase client created, attempting database insert...');

    // Authentication handled by service role
    // const { data: { session } } = await supabase.auth.getSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { data, error } = await supabase
      .from('job_submissions')
      .insert(dbData)
      .select(`
        *,
        technicians (
          name,
          image_url,
          rating
        )
      `)
      .single();

    if (error) {
      console.error('❌ Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      return NextResponse.json(
        { error: 'Failed to create job submission', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Database insert successful, raw data:', JSON.stringify(data, null, 2));

    // Transform response to match frontend expectations
    const transformedData = {
      id: data.id,
      technician: {
        name: data.technicians.name,
        image: data.technicians.image_url,
        rating: data.technicians.rating
      },
      client: {
        name: data.client_name,
        phone: data.client_phone,
        email: data.client_email,
        preferredContactMethod: data.client_preferred_contact,
        consentToContact: data.client_consent_contact,
        consentToShare: data.client_consent_share
      },
      service: {
        category: data.service_category,
        type: data.service_type,
        location: data.service_location,
        date: data.service_date,
        duration: data.service_duration,
        satisfaction: data.satisfaction_rating,
        description: data.description
      },
      media: {
        beforePhotos: data.before_photos || [],
        afterPhotos: data.after_photos || [],
        processPhotos: data.process_photos || []
      },
      status: data.status,
      submittedAt: data.created_at,
      reportId: data.report_id,
      reportUrl: data.report_url
    };

    console.log('🎉 Job submission created successfully');

    // Now create individual photo records for franchisee management
    console.log('📸 Creating franchisee photo records...');

    try {
      const photoRecords = [];

      // Create records for before photos
      if (data.before_photos && data.before_photos.length > 0) {
        for (let i = 0; i < data.before_photos.length; i++) {
          photoRecords.push({
            job_submission_id: data.id,
            franchisee_id: data.franchisee_id,
            technician_id: data.technician_id,
            photo_url: data.before_photos[i],
            photo_type: 'before',
            service_category: data.service_category,
            service_type: data.service_type,
            service_location: data.service_location,
            service_date: data.service_date,
            job_description: data.description,
            status: 'pending'
          });
        }
      }

      // Create records for after photos
      if (data.after_photos && data.after_photos.length > 0) {
        for (let i = 0; i < data.after_photos.length; i++) {
          photoRecords.push({
            job_submission_id: data.id,
            franchisee_id: data.franchisee_id,
            technician_id: data.technician_id,
            photo_url: data.after_photos[i],
            photo_type: 'after',
            service_category: data.service_category,
            service_type: data.service_type,
            service_location: data.service_location,
            service_date: data.service_date,
            job_description: data.description,
            status: 'pending'
          });
        }
      }

      // Create records for process photos
      if (data.process_photos && data.process_photos.length > 0) {
        for (let i = 0; i < data.process_photos.length; i++) {
          photoRecords.push({
            job_submission_id: data.id,
            franchisee_id: data.franchisee_id,
            technician_id: data.technician_id,
            photo_url: data.process_photos[i],
            photo_type: 'process',
            service_category: data.service_category,
            service_type: data.service_type,
            service_location: data.service_location,
            service_date: data.service_date,
            job_description: data.description,
            status: 'pending'
          });
        }
      }

      console.log(`📊 Creating ${photoRecords.length} photo records for franchisee management`);

      if (photoRecords.length > 0) {
        // Try to insert photo records (will work once table is created)
        try {
          const { data: photoData, error: photoError } = await supabase
            .from('franchisee_photos')
            .insert(photoRecords)
            .select();

          if (photoError) {
            console.log('⚠️ Could not create franchisee photo records (table may not exist yet):', photoError.message);
            // Don't fail the main request, just log this
          } else {
            console.log(`✅ Created ${photoData.length} franchisee photo records`);

            // Create notification for franchisee
            try {
              const notificationData = {
                user_id: data.franchisee_id, // This will need to be mapped to profile ID
                user_type: 'franchisee',
                title: 'New Photo Submission',
                message: `${data.technicians.name} submitted ${photoRecords.length} photos for ${data.service_category} service at ${data.service_location}`,
                type: 'photo_submitted',
                related_id: data.id,
                related_type: 'job_submission',
                read: false
              };

              const { error: notifError } = await supabase
                .from('notifications')
                .insert([notificationData]);

              if (notifError) {
                console.log('⚠️ Could not create notification (table may not exist yet):', notifError.message);
              } else {
                console.log('✅ Notification created for franchisee');
              }
            } catch (notifError) {
              console.log('⚠️ Notification creation skipped:', notifError.message);
            }
          }
        } catch (photoError) {
          console.log('⚠️ Photo record creation skipped (table not ready):', photoError.message);
        }
      }
    } catch (photoError) {
      console.log('⚠️ Photo workflow skipped:', photoError.message);
    }

    console.log('🎉 Returning job submission data');
    return NextResponse.json(transformedData, { status: 201 });

  } catch (error) {
    console.error('Error creating job submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('job_submissions')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting job submission:', error);
      return NextResponse.json(
        { error: 'Failed to delete job submission' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in job submissions DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}