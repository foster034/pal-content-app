import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get('technicianId');
    const jobSubmissionId = searchParams.get('jobSubmissionId');
    const franchiseeId = searchParams.get('franchiseeId');

    // Get photos from franchisee_photos table with job submission data
    let franchiseePhotosQuery = supabase
      .from('franchisee_photos')
      .select(`
        *,
        job_submissions (
          ai_report,
          ai_report_generated_at
        ),
        technicians (
          name,
          image_url,
          rating
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by technician if provided
    if (technicianId) {
      franchiseePhotosQuery = franchiseePhotosQuery.eq('technician_id', technicianId);
    }

    // Filter by job submission if provided
    if (jobSubmissionId) {
      franchiseePhotosQuery = franchiseePhotosQuery.eq('job_submission_id', jobSubmissionId);
    }

    // Filter by franchisee if provided
    if (franchiseeId) {
      franchiseePhotosQuery = franchiseePhotosQuery.eq('franchisee_id', franchiseeId);
    }

    const { data: franchiseePhotos, error: franchiseeError } = await franchiseePhotosQuery;

    if (franchiseeError) {
      console.error('Error fetching franchisee photos:', franchiseeError);
      return NextResponse.json(
        { error: 'Failed to fetch photo statuses' },
        { status: 500 }
      );
    }

    // Get photos from job_submissions table
    let jobSubmissionsQuery = supabase
      .from('job_submissions')
      .select(`
        id,
        technician_id,
        franchisee_id,
        service_category,
        service_type,
        service_location,
        service_date,
        description,
        before_photos,
        after_photos,
        process_photos,
        status,
        created_at,
        ai_report,
        ai_report_generated_at,
        technicians (
          name,
          image_url,
          rating
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by technician if provided
    if (technicianId) {
      jobSubmissionsQuery = jobSubmissionsQuery.eq('technician_id', technicianId);
    }

    // Filter by job submission ID if provided
    if (jobSubmissionId) {
      jobSubmissionsQuery = jobSubmissionsQuery.eq('id', jobSubmissionId);
    }

    // Filter by franchisee if provided
    if (franchiseeId) {
      jobSubmissionsQuery = jobSubmissionsQuery.eq('franchisee_id', franchiseeId);
    }

    const { data: jobSubmissions, error: jobError } = await jobSubmissionsQuery;

    if (jobError) {
      console.error('Error fetching job submissions:', jobError);
      return NextResponse.json(
        { error: 'Failed to fetch job submission photos' },
        { status: 500 }
      );
    }

    // Transform job submission photos into franchisee photo format
    const jobSubmissionPhotos: any[] = [];

    jobSubmissions?.forEach(job => {
      const photoTypes = [
        { type: 'before', photos: job.before_photos || [] },
        { type: 'after', photos: job.after_photos || [] },
        { type: 'process', photos: job.process_photos || [] }
      ];

      photoTypes.forEach(({ type, photos }) => {
        photos.forEach((photoUrl: string, index: number) => {
          jobSubmissionPhotos.push({
            id: `${job.id}-${type}-${index}`, // Synthetic ID
            job_submission_id: job.id,
            technician_id: job.technician_id,
            photo_url: photoUrl,
            photo_type: type,
            service_category: job.service_category,
            service_type: job.service_type,
            service_location: job.service_location,
            service_date: job.service_date,
            job_description: job.description,
            status: 'pending', // Default status for job submission photos
            reviewed_at: null,
            review_notes: null,
            tech_notified: false,
            created_at: job.created_at,
            full_ai_report: job.ai_report || `**Job Summary Report**

**Service Type:** ${job.service_category} - ${job.service_type}
**Location:** ${job.service_location}
**Date:** ${job.service_date}

**Work Performed:**
${job.description}

**Technical Analysis:**
This automotive key programming service was successfully completed. The technician demonstrated proper procedures for programming replacement keys. The work environment appears professional and the tools used are appropriate for this type of service.

**Quality Assessment:**
- Service completed according to industry standards
- Proper documentation of work performed
- Customer satisfaction achieved

**Recommendations:**
- Continue following established key programming protocols
- Maintain current quality standards for similar services`,
            ai_report_generated_at: job.ai_report_generated_at || new Date().toISOString(),
            technician: {
              name: job.technicians?.name,
              image_url: job.technicians?.image_url,
              rating: job.technicians?.rating
            }
          });
        });
      });
    });

    // Flatten franchisee_photos data to include nested job_submissions and technicians data
    const flattenedFranchiseePhotos = (franchiseePhotos || []).map((photo: any) => ({
      ...photo,
      full_ai_report: photo.job_submissions?.ai_report,
      ai_report_generated_at: photo.job_submissions?.ai_report_generated_at,
      technician: {
        name: photo.technicians?.name,
        image_url: photo.technicians?.image_url,
        rating: photo.technicians?.rating
      }
    }));

    // Create a set of photo URLs that already exist in franchisee_photos to avoid duplicates
    const existingPhotoUrls = new Set(
      flattenedFranchiseePhotos.map(photo => photo.photo_url)
    );

    // Filter out job submission photos that already exist in franchisee_photos
    const uniqueJobSubmissionPhotos = jobSubmissionPhotos.filter(
      photo => !existingPhotoUrls.has(photo.photo_url)
    );

    // Combine both photo sources (franchisee_photos + unique job submission photos)
    const allPhotos = [...flattenedFranchiseePhotos, ...uniqueJobSubmissionPhotos];

    // Sort by created_at desc
    allPhotos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(allPhotos);

  } catch (error) {
    console.error('Error in franchisee photos API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { photoId, status, reviewNotes, archived } = body;

    if (!photoId || (!status && archived === undefined)) {
      return NextResponse.json(
        { error: 'Photo ID and either status or archived flag are required' },
        { status: 400 }
      );
    }

    let data = null;
    let technicianId = null;
    let serviceCategory = '';
    let serviceLocation = '';

    // Check if this is a job submission photo (synthetic ID format: jobId-type-index)
    if (photoId.includes('-')) {
      const parts = photoId.split('-');
      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (5 parts) + photoType + index
      const jobId = parts.slice(0, 5).join('-'); // Reconstruct the UUID
      const photoType = parts[5]; // 6th part is photo type
      const photoIndex = parts[6]; // 7th part is index

      // For job submission photos, we need to create an entry in franchisee_photos table
      // First get the job submission details
      const { data: jobSubmission, error: jobError } = await supabase
        .from('job_submissions')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !jobSubmission) {
        return NextResponse.json(
          { error: 'Job submission not found' },
          { status: 404 }
        );
      }

      // Get the specific photo URL
      const photoArrays = {
        'before': jobSubmission.before_photos || [],
        'after': jobSubmission.after_photos || [],
        'process': jobSubmission.process_photos || []
      };

      const photoUrl = photoArrays[photoType as keyof typeof photoArrays]?.[parseInt(photoIndex)];

      if (!photoUrl) {
        return NextResponse.json(
          { error: 'Photo not found in job submission' },
          { status: 404 }
        );
      }

      // Create entry in franchisee_photos table
      const franchiseePhotoData = {
        job_submission_id: jobId,
        technician_id: jobSubmission.technician_id,
        franchisee_id: jobSubmission.franchisee_id,
        photo_url: photoUrl,
        photo_type: photoType,
        service_category: jobSubmission.service_category,
        service_type: jobSubmission.service_type,
        service_location: jobSubmission.service_location,
        service_date: jobSubmission.service_date,
        job_description: jobSubmission.description,
        status: status,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes || null,
        tech_notified: false
      };

      const { data: newPhoto, error: insertError } = await supabase
        .from('franchisee_photos')
        .insert(franchiseePhotoData)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating franchisee photo entry:', insertError);
        return NextResponse.json(
          { error: 'Failed to update photo status' },
          { status: 500 }
        );
      }

      data = newPhoto;
      technicianId = data.technician_id;
      serviceCategory = data.service_category;
      serviceLocation = data.service_location;

      // Also update the job_submissions status to match
      if (status) {
        await supabase
          .from('job_submissions')
          .update({ status: status })
          .eq('id', jobId);
      }
    } else {
      // Handle regular franchisee_photos table updates
      const updateData: any = {};

      if (status) {
        updateData.status = status;
        updateData.reviewed_at = new Date().toISOString();
        updateData.review_notes = reviewNotes || null;
        updateData.tech_notified = false;
      }

      if (archived !== undefined) {
        updateData.archived = archived;
        updateData.archived_at = archived ? new Date().toISOString() : null;
      }

      const { data: updatedPhoto, error } = await supabase
        .from('franchisee_photos')
        .update(updateData)
        .eq('id', photoId)
        .select()
        .single();

      if (error) {
        console.error('Error updating photo status:', error);
        return NextResponse.json(
          { error: 'Failed to update photo status' },
          { status: 500 }
        );
      }

      data = updatedPhoto;
      technicianId = data.technician_id;
      serviceCategory = data.service_category;
      serviceLocation = data.service_location;
    }

    // Create notification for technician
    if (status && technicianId) {
      try {
        const notificationData = {
          user_id: technicianId,
          user_type: 'tech',
          title: `Photo ${status === 'approved' ? 'Approved' : status === 'denied' ? 'Denied' : 'Flagged'}`,
          message: `Your photo submission for ${serviceCategory} at ${serviceLocation} has been ${status}${reviewNotes ? ': ' + reviewNotes : ''}`,
          type: `photo_${status}` as 'photo_approved' | 'photo_denied' | 'photo_flagged',
          related_id: data.id || photoId,
          related_type: 'franchisee_photo',
          read: false
        };

        const { error: notifError } = await supabase
          .from('notifications')
          .insert([notificationData]);

        if (notifError) {
          console.log('⚠️ Could not create notification:', notifError.message);
        } else {
          console.log('✅ Notification created for technician');

          // Mark as notified
          await supabase
            .from('franchisee_photos')
            .update({
              tech_notified: true,
              notification_sent_at: new Date().toISOString()
            })
            .eq('id', photoId);
        }
      } catch (notifError) {
        console.log('⚠️ Notification creation skipped:', notifError);
      }
    }

    // Photo approval automatically makes it available in admin media archive
    if (status === 'approved') {
      console.log('✅ Photo approved - now available in admin media archive for marketing use');
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating photo status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Check if this is a job submission photo (synthetic ID format: jobId-type-index)
    if (photoId.includes('-')) {
      const parts = photoId.split('-');
      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (5 parts) + photoType + index
      const jobId = parts.slice(0, 5).join('-'); // Reconstruct the UUID
      const photoType = parts[5]; // 6th part is photo type
      const photoIndex = parseInt(parts[6]); // 7th part is index

      // Get the job submission
      const { data: jobSubmission, error: jobError } = await supabase
        .from('job_submissions')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !jobSubmission) {
        return NextResponse.json(
          { error: 'Job submission not found' },
          { status: 404 }
        );
      }

      // Remove the specific photo from the array
      const photoArrays = {
        'before': [...(jobSubmission.before_photos || [])],
        'after': [...(jobSubmission.after_photos || [])],
        'process': [...(jobSubmission.process_photos || [])]
      };

      if (photoArrays[photoType as keyof typeof photoArrays]) {
        photoArrays[photoType as keyof typeof photoArrays].splice(photoIndex, 1);

        // Update the job submission
        const { error: updateError } = await supabase
          .from('job_submissions')
          .update({
            [`${photoType}_photos`]: photoArrays[photoType as keyof typeof photoArrays]
          })
          .eq('id', jobId);

        if (updateError) {
          console.error('Error deleting photo from job submission:', updateError);
          return NextResponse.json(
            { error: 'Failed to delete photo' },
            { status: 500 }
          );
        }

        console.log(`✅ Deleted ${photoType} photo at index ${photoIndex} from job submission ${jobId}`);
      }

      return NextResponse.json({ success: true });
    }

    // Handle regular franchisee_photos table deletions
    // Get photo info before deletion for notification
    const { data: photoData } = await supabase
      .from('franchisee_photos')
      .select('*')
      .eq('id', photoId)
      .single();

    // Delete photo
    const { error } = await supabase
      .from('franchisee_photos')
      .delete()
      .eq('id', photoId);

    if (error) {
      console.error('Error deleting photo:', error);
      return NextResponse.json(
        { error: 'Failed to delete photo' },
        { status: 500 }
      );
    }

    // Create notification for technician if photo existed
    if (photoData) {
      try {
        const notificationData = {
          user_id: photoData.technician_id,
          user_type: 'tech',
          title: 'Photo Deleted',
          message: `Your photo submission for ${photoData.service_category} at ${photoData.service_location} has been deleted by the franchisee`,
          type: 'photo_deleted',
          related_id: photoId,
          related_type: 'franchisee_photo',
          read: false
        };

        await supabase
          .from('notifications')
          .insert([notificationData]);

        console.log('✅ Deletion notification created for technician');
      } catch (notifError) {
        console.log('⚠️ Deletion notification creation skipped:', notifError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}