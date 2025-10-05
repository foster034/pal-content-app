import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const photoId = searchParams.get('photoId');
    const mediaArchiveId = searchParams.get('mediaArchiveId');

    // First check if table exists by doing a simple query
    const { data, error } = await supabase
      .from('generated_content')
      .select('id')
      .limit(1);

    if (error && error.code === 'PGRST106') {
      // Table doesn't exist, return empty array and log instruction
      console.log('Table generated_content does not exist. Please create it manually.');
      return NextResponse.json([]);
    }

    let query = supabase
      .from('generated_content')
      .select('*')
      .order('generated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (photoId) {
      query = query.eq('photo_id', photoId);
    }
    if (mediaArchiveId) {
      query = query.eq('media_archive_id', mediaArchiveId);
    }

    const { data: contentData, error: contentError } = await query;

    if (contentError) throw contentError;

    return NextResponse.json(contentData || []);
  } catch (error) {
    console.error('Error fetching generated content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generated content', details: error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Received POST request body:', JSON.stringify(body, null, 2));

    const {
      photo_id,
      media_archive_id,
      content,
      content_type,
      platform,
      status = 'draft',
      metadata
    } = body;

    // Require either photo_id or media_archive_id, and content
    if ((!photo_id && !media_archive_id) || !content) {
      console.error('❌ Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Either photo_id or media_archive_id and content are required' },
        { status: 400 }
      );
    }

    const insertData: any = {
      content,
      content_type,
      platform,
      status,
      metadata,
      generated_at: new Date().toISOString()
    };

    // Only include photo_id if it's provided
    if (photo_id) {
      insertData.photo_id = photo_id;
    }

    // Only include media_archive_id if it's provided
    if (media_archive_id) {
      insertData.media_archive_id = media_archive_id;
    }

    console.log('📊 Insert data:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabase
      .from('generated_content')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('✅ Successfully created generated content:', data.id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Error creating generated content:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      full: error
    });
    return NextResponse.json(
      { error: 'Failed to create generated content', details: error?.message || error },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approved_by, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    let updateData: any = { ...updates };

    // Handle status changes
    if (status) {
      updateData.status = status;

      if (status === 'approved' && approved_by) {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = approved_by;
      } else if (status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('generated_content')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating generated content:', error);
    return NextResponse.json(
      { error: 'Failed to update generated content' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('generated_content')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting generated content:', error);
    return NextResponse.json(
      { error: 'Failed to delete generated content' },
      { status: 500 }
    );
  }
}// Force recompile
