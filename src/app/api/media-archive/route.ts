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

      return {
        id,
        photoUrl: photo.photo_url,
        jobType: photo.service_category,
        techName: photo.technicians?.name || 'Unknown Tech',
        techId: photo.technician_id,
        franchiseeName: `Franchisee ${photo.franchisee_id.substring(0, 8)}`,
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