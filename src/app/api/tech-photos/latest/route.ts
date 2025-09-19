import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5');

    // Fetch latest tech job photos from the database
    const { data: photos, error } = await supabase
      .from('job_submissions')
      .select('photos, created_at, tech_id')
      .not('photos', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    // Extract and flatten all photo URLs
    const photoUrls: string[] = [];
    if (photos) {
      photos.forEach(submission => {
        if (submission.photos && Array.isArray(submission.photos)) {
          photoUrls.push(...submission.photos);
        }
      });
    }

    // Return only the requested number of photos
    return NextResponse.json({
      photos: photoUrls.slice(0, limit)
    });
  } catch (error) {
    console.error('Error fetching latest tech photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos', photos: [] },
      { status: 500 }
    );
  }
}