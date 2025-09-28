import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const jobId = formData.get('jobId') as string;
    const technicianId = formData.get('technicianId') as string;
    const franchiseeId = formData.get('franchiseeId') as string;
    const photoType = formData.get('photoType') as string; // 'before', 'after', or 'process'

    if (!jobId || !technicianId || !franchiseeId || !photoType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    // Process all files in the form data
    const files = formData.getAll('photos') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`Uploading ${files.length} ${photoType} photos for job ${jobId}`);

    for (const file of files) {
      try {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          errors.push(`${file.name}: File too large (max 10MB)`);
          continue;
        }

        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          errors.push(`${file.name}: Invalid file type (images and videos only)`);
          continue;
        }

        // Create unique filename with proper folder structure
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const fileName = `${franchiseeId}/${jobId}/${photoType}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        console.log(`Uploading file to: job-photos/${fileName}`);

        // Convert File to ArrayBuffer for Supabase upload
        const fileBuffer = await file.arrayBuffer();

        // Upload to Supabase storage using service role (bypasses RLS)
        const { error: uploadError } = await supabase.storage
          .from('job-photos')
          .upload(fileName, fileBuffer, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          console.error(`Upload error for ${file.name}:`, uploadError);
          errors.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('job-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
        console.log(`Successfully uploaded: ${publicUrl}`);

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        errors.push(`${file.name}: Processing error`);
      }
    }

    // Update the job submission with the new photo URLs
    if (uploadedUrls.length > 0) {
      try {
        // Get existing job submission
        const { data: existingJob, error: fetchError } = await supabase
          .from('job_submissions')
          .select(`${photoType}_photos`)
          .eq('id', jobId)
          .single();

        if (fetchError) {
          console.error('Error fetching job:', fetchError);
        } else {
          // Append new URLs to existing array
          const columnName = `${photoType}_photos`;
          const existingPhotos = existingJob[columnName] || [];
          const updatedPhotos = [...existingPhotos, ...uploadedUrls];

          // Update the job submission
          const { error: updateError } = await supabase
            .from('job_submissions')
            .update({ [columnName]: updatedPhotos })
            .eq('id', jobId);

          if (updateError) {
            console.error('Error updating job submission:', updateError);
          } else {
            console.log(`Updated job ${jobId} with ${uploadedUrls.length} new ${photoType} photos`);
          }
        }
      } catch (dbError) {
        console.error('Database update error:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      uploadedUrls,
      errors: errors.length > 0 ? errors : undefined,
      message: `Uploaded ${uploadedUrls.length} of ${files.length} files`
    });

  } catch (error) {
    console.error('Error in job photo upload API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method to retrieve job photos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const franchiseeId = searchParams.get('franchiseeId');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Get job submission with photo URLs
    const { data: job, error } = await supabase
      .from('job_submissions')
      .select('before_photos, after_photos, process_photos')
      .eq('id', jobId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      beforePhotos: job.before_photos || [],
      afterPhotos: job.after_photos || [],
      processPhotos: job.process_photos || []
    });

  } catch (error) {
    console.error('Error fetching job photos:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}