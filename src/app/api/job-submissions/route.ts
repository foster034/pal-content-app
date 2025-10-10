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

    const { searchParams } = new URL(request.url);
    const franchiseeId = searchParams.get('franchiseeId');
    const technicianId = searchParams.get('technicianId');
    const status = searchParams.get('status');

    let query = supabase
      .from('job_submissions')
      .select(`
        *,
        technicians (
          name,
          image_url,
          rating
        ),
        franchisee_photos (
          job_description
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by franchisee if provided
    if (franchiseeId) {
      query = query.eq('franchisee_id', franchiseeId);
    }

    // Filter by technician if provided
    if (technicianId) {
      query = query.eq('technician_id', technicianId);
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
    const transformedData = data?.map(job => {
      // Use AI-generated summary from franchisee_photos if available, otherwise use original description
      const aiGeneratedSummary = job.franchisee_photos?.[0]?.job_description;
      const jobDescription = aiGeneratedSummary || job.description;

      return {
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
          description: jobDescription
        },
        vehicle: {
          year: job.vehicle_year,
          make: job.vehicle_make,
          model: job.vehicle_model,
          color: job.vehicle_color,
          vin: job.vehicle_vin
        },
        contentFields: {
          customerConcern: job.customer_concern,
          customerReaction: job.customer_reaction,
          specialChallenges: job.special_challenges
        },
        media: {
          beforePhotos: job.before_photos || [],
          afterPhotos: job.after_photos || [],
          processPhotos: job.process_photos || []
        },
        status: job.status,
        submittedAt: job.created_at,
        reportId: job.report_id,
        reportUrl: job.report_url,
        aiReport: job.ai_report,
        aiReportGeneratedAt: job.ai_report_generated_at
      };
    }) || [];

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
      // Vehicle fields (for automotive services)
      vehicle_year: body.vehicleYear || body.vehicle?.year || null,
      vehicle_make: body.vehicleMake || body.vehicle?.make || null,
      vehicle_model: body.vehicleModel || body.vehicle?.model || null,
      vehicle_color: body.vehicleColor || body.vehicle?.color || null,
      vehicle_vin: body.vehicleVin || body.vehicle?.vin || null,
      // New content-focused fields
      customer_concern: body.customerConcern || null,
      customer_reaction: body.customerReaction || null,
      special_challenges: body.specialChallenges || null,
      before_photos: body.media?.beforePhotos || [],
      after_photos: body.media?.afterPhotos || [],
      process_photos: body.media?.processPhotos || [],
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
      vehicle: {
        year: data.vehicle_year,
        make: data.vehicle_make,
        model: data.vehicle_model,
        color: data.vehicle_color,
        vin: data.vehicle_vin
      },
      contentFields: {
        customerConcern: data.customer_concern,
        customerReaction: data.customer_reaction,
        specialChallenges: data.special_challenges
      },
      media: {
        beforePhotos: data.before_photos || [],
        afterPhotos: data.after_photos || [],
        processPhotos: data.process_photos || []
      },
      status: data.status,
      submittedAt: data.created_at,
      reportId: data.report_id,
      reportUrl: data.report_url,
      aiReport: data.ai_report,
      aiReportGeneratedAt: data.ai_report_generated_at
    };

    console.log('🎉 Job submission created successfully');

    // Generate AI report asynchronously in the background (don't await)
    generateAIReportAsync(data, supabase).catch(error => {
      console.error('Background AI report generation failed:', error);
    });

    // Return immediately to user without waiting for AI report
    console.log('✅ Returning job submission immediately');
    return NextResponse.json(transformedData, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/job-submissions:', error);
    return NextResponse.json(
      { error: 'Failed to create job submission' },
      { status: 500 }
    );
  }
}

// Async function to generate AI report in background
async function generateAIReportAsync(data: any, supabase: any) {
  console.log('🤖 Background: Starting AI report generation...');

  try {
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

    // Generate comprehensive AI job report in background
    console.log('🤖 Background: Auto-generating comprehensive job report...');
    const allPhotos = [
      ...(data.before_photos || []),
      ...(data.after_photos || []),
      ...(data.process_photos || [])
    ];

    // Include vehicle information for automotive jobs
    let vehicleInfo = '';
    if (data.service_category === 'Automotive') {
      const vehicleDetails = [];
      if (data.vehicle_year) vehicleDetails.push(`Year: ${data.vehicle_year}`);
      if (data.vehicle_make) vehicleDetails.push(`Make: ${data.vehicle_make}`);
      if (data.vehicle_model) vehicleDetails.push(`Model: ${data.vehicle_model}`);
      if (data.vehicle_color) vehicleDetails.push(`Color: ${data.vehicle_color}`);
      if (data.vehicle_vin) vehicleDetails.push(`VIN: ${data.vehicle_vin}`);

      if (vehicleDetails.length > 0) {
        vehicleInfo = `
VEHICLE INFORMATION:
${vehicleDetails.join('\n')}`;
      }
    }

    // Build content fields section if any are provided
    let contentFieldsInfo = '';
    if (data.customer_concern || data.customer_reaction || data.special_challenges) {
      const contentParts = [];
      if (data.customer_concern) contentParts.push(`Customer's Issue: ${data.customer_concern}`);
      if (data.customer_reaction) contentParts.push(`Customer Reaction: ${data.customer_reaction}`);
      if (data.special_challenges) contentParts.push(`Special Challenges: ${data.special_challenges}`);

      if (contentParts.length > 0) {
        contentFieldsInfo = `
ADDITIONAL CONTEXT:
${contentParts.join('\n')}`;
      }
    }

    // Generate AI report directly (avoid authentication issues with internal fetch)
    const prompt = `Create a comprehensive, engaging report of this locksmith service. Use ALL the information provided below to tell the full story.

JOB INFORMATION:
Date: ${data.service_date}
Location: ${data.service_location}
Technician: ${data.technicians?.name || 'Not specified'}
Service Category: ${data.service_category}
Service Type: ${data.service_type}
${vehicleInfo}${contentFieldsInfo}
TECHNICIAN'S BASIC NOTES:
"${data.description}"

CUSTOMER INFO (if provided):
- Name: ${data.client_name || 'Not provided'}
- Phone: ${data.client_phone || 'Not provided'}
- Email: ${data.client_email || 'Not provided'}
- Consent to Contact: ${data.client_consent_contact ? 'Yes' : 'No'}
- Consent to Share: ${data.client_consent_share ? 'Yes' : 'No'}

PHOTOS TAKEN:
- Before: ${(data.before_photos || []).length}
- During: ${(data.process_photos || []).length}
- After: ${(data.after_photos || []).length}

YOUR TASK: Write a comprehensive 2-3 paragraph report that captures the full story of this service call.

PARAGRAPH 1 - THE SITUATION:
- Start with: "[Technician name] was in [location] on [date] to help a customer"
- For automotive jobs: ALWAYS include complete vehicle information: "[year] [make] [model]" (e.g., "2019 Ford F-150")
- Describe the customer's situation using "Customer's Issue" from ADDITIONAL CONTEXT
- If no Customer's Issue is provided, use the service type to describe what was needed
- Example: "Brent Foster was in Springwater on 2025-09-27 to help a customer with a 2019 Ford F-150 who had locked their keys inside the vehicle"

PARAGRAPH 2 - THE SERVICE:
- Describe what service was performed based on the technician's notes and service type
- If "Special Challenges" are mentioned in ADDITIONAL CONTEXT, incorporate them here to show the complexity
- Include relevant details about the process if provided
- Example: "Brent accessed the vehicle using specialized lockout tools, taking care to avoid damage to the door seals"

PARAGRAPH 3 - THE OUTCOME (if info available):
- Include "Customer Reaction" from ADDITIONAL CONTEXT if provided
- Mention photo documentation if photos were taken (before/after transformation is particularly good for storytelling)
- End with a satisfying conclusion about the completed service
- Example: "The customer was relieved to regain access to their vehicle quickly. Before and after photos were taken to document the successful service"

CRITICAL REQUIREMENTS:
1. **PRIORITIZE ADDITIONAL CONTEXT FIELDS**: The "Customer's Issue", "Customer Reaction", and "Special Challenges" from ADDITIONAL CONTEXT contain the most valuable storytelling information - use them prominently
2. **VEHICLE INFORMATION IS MANDATORY**: For automotive jobs, ALWAYS include year, make, and model in the first sentence if provided
3. **USE ALL PROVIDED INFORMATION**: Don't skip any details from VEHICLE INFORMATION or ADDITIONAL CONTEXT sections
4. **IGNORE GENERIC TEST DATA**: If the technician's basic notes are just "test" or similar, rely entirely on the other fields
5. **TELL A COMPLETE STORY**: Use all three sections (VEHICLE INFORMATION, ADDITIONAL CONTEXT, and basic notes) to create a full narrative
6. **BE FACTUAL BUT ENGAGING**: Use the provided information to create an interesting, readable report that a franchisee would be proud to share

WHAT NOT TO DO:
- Don't add information that wasn't provided
- NEVER mention duration or time taken for the service
- NEVER mention star ratings or satisfaction scores
- Don't write a generic report if specific context is available in ADDITIONAL CONTEXT fields`;

    // Call OpenAI API directly
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional service report writer for a locksmith business. Your job is to create comprehensive, engaging reports that tell the complete story of each service call. Use ALL provided information - especially the "ADDITIONAL CONTEXT" fields (Customer\'s Issue, Customer Reaction, Special Challenges) and "VEHICLE INFORMATION" - to create a detailed narrative. Be factual but compelling. When generic placeholder text like "test" appears in the basic notes, rely on the detailed context fields instead. Your reports should be something the business owner would be proud to share with clients or use for marketing.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.5,
      }),
    });

    if (openaiResponse.ok) {
      const aiResponse = await openaiResponse.json();
      const report = aiResponse.choices[0].message.content;
      const generatedAt = new Date().toISOString();
      console.log('✅ Background: Comprehensive job report generated:', report.substring(0, 100) + '...');

      // Update the job submission with the AI-generated report
      console.log('🔄 Background: Updating job submission with AI-generated report...');
      const { error: reportUpdateError } = await supabase
        .from('job_submissions')
        .update({
          ai_report: report,
          ai_report_generated_at: generatedAt
        })
        .eq('id', data.id);

      if (reportUpdateError) {
        console.log('⚠️ Background: Could not update job submission with AI report:', reportUpdateError.message);
        throw reportUpdateError;
      } else {
        console.log('✅ Background: Job submission updated with AI-generated report');
      }

      // Note: We no longer update franchisee_photos.job_description with AI report
      // The job_description field should keep the original description entered by the tech
      // The AI report is stored separately in job_submissions.ai_report and displayed in its own section
      console.log('ℹ️ Background: Keeping original job description in franchisee_photos, AI report stored separately');
    } else {
      console.log('⚠️ Background: Failed to generate job report:', openaiResponse.statusText);
      throw new Error('OpenAI API call failed');
    }
  } catch (reportError) {
    console.log('⚠️ Background: AI report generation failed:', reportError.message);
    throw reportError;
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

    console.log(`🗑️ Starting deletion process for job submission ID: ${jobId}`);

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete all related content in the correct order (foreign key dependencies)

    // 1. Delete related franchisee_photos records
    console.log('📸 Deleting related franchisee_photos records...');
    const { error: photosError } = await supabase
      .from('franchisee_photos')
      .delete()
      .eq('job_submission_id', jobId);

    if (photosError) {
      console.error('⚠️ Error deleting franchisee_photos (may not exist):', photosError.message);
      // Don't fail the deletion if this table doesn't exist or has no records
    } else {
      console.log('✅ Franchisee_photos records deleted');
    }

    // 2. Delete related notifications
    console.log('🔔 Deleting related notifications...');
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .eq('related_id', jobId)
      .eq('related_type', 'job_submission');

    if (notificationsError) {
      console.error('⚠️ Error deleting notifications (may not exist):', notificationsError.message);
      // Don't fail the deletion if this table doesn't exist or has no records
    } else {
      console.log('✅ Notifications deleted');
    }

    // 3. Finally, delete the main job_submissions record
    console.log('📋 Deleting main job_submissions record...');
    const { error: jobError } = await supabase
      .from('job_submissions')
      .delete()
      .eq('id', jobId);

    if (jobError) {
      console.error('❌ Error deleting job submission:', jobError);
      return NextResponse.json(
        { error: 'Failed to delete job submission', details: jobError.message },
        { status: 500 }
      );
    }

    console.log('✅ Job submission and all related content deleted successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Error in job submissions DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}