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

    let query = supabase
      .from('franchisee_photos')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by technician if provided
    if (technicianId) {
      query = query.eq('technician_id', technicianId);
    }

    // Filter by job submission if provided
    if (jobSubmissionId) {
      query = query.eq('job_submission_id', jobSubmissionId);
    }

    // Filter by franchisee if provided
    if (franchiseeId) {
      query = query.eq('franchisee_id', franchiseeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching franchisee photos:', error);
      return NextResponse.json(
        { error: 'Failed to fetch photo statuses' },
        { status: 500 }
      );
    }

    // Return simplified data - joins can be added back later if needed
    const transformedData = data || [];

    return NextResponse.json(transformedData);

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

    // Build update object
    const updateData: any = {};

    if (status) {
      updateData.status = status;
      updateData.reviewed_at = new Date().toISOString();
      updateData.review_notes = reviewNotes || null;
      updateData.tech_notified = false; // Reset notification flag
    }

    if (archived !== undefined) {
      updateData.archived = archived;
      updateData.archived_at = archived ? new Date().toISOString() : null;
    }

    // Update photo
    const { data, error } = await supabase
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

    // Create notification for technician
    try {
      const notificationData = {
        user_id: data.technician_id,
        user_type: 'tech',
        title: `Photo ${status === 'approved' ? 'Approved' : status === 'denied' ? 'Denied' : 'Flagged'}`,
        message: `Your photo submission for ${data.service_category} at ${data.service_location} has been ${status}${reviewNotes ? ': ' + reviewNotes : ''}`,
        type: `photo_${status}` as 'photo_approved' | 'photo_denied' | 'photo_flagged',
        related_id: photoId,
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