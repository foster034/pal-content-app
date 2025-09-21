import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role client to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch marketing content with filtering options
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const approvalStatus = searchParams.get('approvalStatus');
    const platform = searchParams.get('platform');
    const assignedTo = searchParams.get('assignedTo');
    const campaignName = searchParams.get('campaignName');
    const scheduled = searchParams.get('scheduled'); // 'true' for scheduled posts only

    let query = supabase
      .from('marketing_content')
      .select(`
        *,
        generated_content (
          content,
          content_type,
          metadata
        ),
        media_archive (
          photo_url,
          job_type,
          job_location,
          technician_id,
          franchisee_id
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (approvalStatus) {
      query = query.eq('approval_status', approvalStatus);
    }

    if (platform) {
      query = query.eq('platform', platform);
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    if (campaignName) {
      query = query.eq('campaign_name', campaignName);
    }

    if (scheduled === 'true') {
      query = query.not('scheduled_date', 'is', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching marketing content:', error);

      // If table doesn't exist, provide creation SQL
      if (error.code === 'PGRST106' || error.message?.includes('relation "marketing_content" does not exist')) {
        return NextResponse.json({
          error: 'Marketing content table does not exist. Please create it.',
          sql: `Please run the SQL script: create_marketing_content_table.sql`
        }, { status: 400 });
      }

      return NextResponse.json(
        { error: 'Failed to fetch marketing content' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);

  } catch (error) {
    console.error('Error in marketing content GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new marketing content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Creating marketing content:', body);

    const {
      generatedContentId,
      mediaArchiveId,
      title,
      content,
      hashtags = [],
      mentions = [],
      platform,
      postType = 'image_post',
      scheduledDate,
      assignedTo,
      createdBy,
      campaignName,
      targetAudience,
      callToAction,
      notes,
      additionalImages = [],
      videoUrl
    } = body;

    // Validate required fields
    if (!title || !content || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, and platform' },
        { status: 400 }
      );
    }

    const marketingData = {
      generated_content_id: generatedContentId,
      media_archive_id: mediaArchiveId,
      title,
      content,
      hashtags,
      mentions,
      platform,
      post_type: postType,
      scheduled_date: scheduledDate,
      assigned_to: assignedTo,
      created_by: createdBy,
      campaign_name: campaignName,
      target_audience: targetAudience,
      call_to_action: callToAction,
      notes,
      additional_images: additionalImages,
      video_url: videoUrl,
      status: 'draft',
      approval_status: 'pending'
    };

    const { data, error } = await supabase
      .from('marketing_content')
      .insert(marketingData)
      .select()
      .single();

    if (error) {
      console.error('Error creating marketing content:', error);
      return NextResponse.json(
        { error: 'Failed to create marketing content', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Marketing content created successfully:', data.id);

    return NextResponse.json({
      success: true,
      data: data
    }, { status: 201 });

  } catch (error) {
    console.error('Error in marketing content POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update marketing content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing content ID' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Handle status-specific updates
    if (updateData.status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('marketing_content')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating marketing content:', error);
      return NextResponse.json(
        { error: 'Failed to update marketing content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error in marketing content PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete marketing content
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing content ID' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('marketing_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting marketing content:', error);
      return NextResponse.json(
        { error: 'Failed to delete marketing content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Marketing content deleted successfully'
    });

  } catch (error) {
    console.error('Error in marketing content DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}