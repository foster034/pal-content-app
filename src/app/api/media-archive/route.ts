import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ArchivedMedia {
  id: number;
  photoUrl: string;
  jobType: 'Commercial' | 'Residential' | 'Automotive' | 'Roadside';
  techName: string;
  techId: string;
  franchiseeName: string;
  franchiseeId: string;
  jobDescription: string;
  dateUploaded: string;
  dateArchived: string;
  jobLocation: string;
  tags: string[];
  category: 'Before' | 'After' | 'Process' | 'Tools' | 'Documentation';
  notes?: string;
  archived: boolean;
  franchisee_photo_id?: string;
  aiReport?: string;
  aiReportGeneratedAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('📸 Fetching approved photos for media archive...');

    // Fetch all approved franchisee photos with related job submissions for AI reports
    const { data: approvedPhotos, error } = await supabase
      .from('franchisee_photos')
      .select(`
        *,
        technicians (
          name
        ),
        franchisees (
          business_name,
          territory
        ),
        job_submissions (
          ai_report,
          ai_report_generated_at
        )
      `)
      .eq('status', 'approved')
      .order('reviewed_at', { ascending: false });

    if (error) {
      console.error('Error fetching approved photos:', error);
      return NextResponse.json([]);
    }

    // Transform approved photos into media archive format
    const mediaArchiveData = approvedPhotos?.map((photo, index) => {
      // Generate a consistent ID based on the franchisee photo ID
      const id = parseInt(photo.id.replace(/-/g, '').substring(0, 8), 16) || index + 1000;

      // Get AI report data from the related job submission (if any)
      const jobSubmission = Array.isArray(photo.job_submissions) ? photo.job_submissions[0] : photo.job_submissions;
      const aiReport = jobSubmission?.ai_report;
      const aiReportGeneratedAt = jobSubmission?.ai_report_generated_at;

      // Get franchisee name from business_name and territory
      const franchiseeName = photo.franchisees?.business_name ||
                            (photo.franchisees?.territory ? `Pop-A-Lock ${photo.franchisees.territory}` : null) ||
                            `Franchisee ${photo.franchisee_id.substring(0, 8)}`;

      return {
        id,
        photoUrl: photo.photo_url,
        jobType: photo.service_category,
        techName: photo.technicians?.name || 'Unknown Tech',
        techId: photo.technician_id,
        franchiseeName,
        franchiseeId: photo.franchisee_id,
        jobDescription: photo.job_description || 'No description available',
        dateUploaded: photo.created_at,
        dateArchived: photo.reviewed_at || photo.created_at,
        jobLocation: photo.service_location || 'Location not specified',
        tags: [
          photo.service_category?.toLowerCase() || 'general',
          photo.service_type?.toLowerCase() || 'service',
          photo.photo_type || 'photo'
        ],
        category: (
          photo.photo_type === 'before' ? 'Before' :
          photo.photo_type === 'after' ? 'After' :
          photo.photo_type === 'process' ? 'Process' : 'After'
        ),
        notes: photo.review_notes || `Approved by franchisee on ${new Date(photo.reviewed_at || photo.created_at).toLocaleDateString()}`,
        archived: false,
        franchisee_photo_id: photo.id,
        aiReport,
        aiReportGeneratedAt
      };
    }) || [];

    console.log(`✅ Returning ${mediaArchiveData.length} approved photos for media archive`);
    return NextResponse.json(mediaArchiveData);

  } catch (error) {
    console.error('Error in media archive API:', error);
    return NextResponse.json([]);
  }
}

// POST endpoint removed - media archive now automatically pulls from approved franchisee_photos

export async function PATCH(request: NextRequest) {
  try {
    const { mediaId, franchiseePhotoId, franchiseePhotoIds, archived } = await request.json();

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Bulk archive multiple photos
    if (franchiseePhotoIds && Array.isArray(franchiseePhotoIds)) {
      console.log(`📝 Bulk updating ${franchiseePhotoIds.length} photos to archived`);

      const { data, error } = await supabase
        .from('franchisee_photos')
        .update({
          status: archived ? 'archived' : 'approved',
          updated_at: new Date().toISOString()
        })
        .in('id', franchiseePhotoIds);

      if (error) {
        console.error('Error bulk updating photo status:', error);
        return NextResponse.json(
          { error: 'Failed to bulk update photo status' },
          { status: 500 }
        );
      }

      console.log(`✅ ${franchiseePhotoIds.length} photos status updated successfully`);
      return NextResponse.json({ success: true, count: franchiseePhotoIds.length, data });
    }

    // Single photo archive
    if (!franchiseePhotoId) {
      return NextResponse.json(
        { error: 'franchiseePhotoId or franchiseePhotoIds is required' },
        { status: 400 }
      );
    }

    console.log(`📝 Updating franchisee_photo status to archived:`, franchiseePhotoId);

    // Update the franchisee_photos status to 'archived' so it won't show in approved anymore
    const { data, error } = await supabase
      .from('franchisee_photos')
      .update({
        status: archived ? 'archived' : 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', franchiseePhotoId);

    if (error) {
      console.error('Error updating photo status:', error);
      return NextResponse.json(
        { error: 'Failed to update photo status' },
        { status: 500 }
      );
    }

    console.log('✅ Photo status updated successfully');
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error in media archive PATCH:', error);
    return NextResponse.json(
      { error: 'Failed to update media archive' },
      { status: 500 }
    );
  }
}