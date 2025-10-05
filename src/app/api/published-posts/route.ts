import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all published posts (excluding archived)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseeId = searchParams.get('franchiseeId');
    const limit = searchParams.get('limit');

    let query = supabase
      .from('published_posts')
      .select('*')
      .neq('status', 'archived')  // Exclude archived posts
      .order('published_at', { ascending: false });

    // Filter by franchisee if provided
    if (franchiseeId) {
      query = query.eq('franchisee_id', franchiseeId);
    }

    // Limit results if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('❌ Error fetching published posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch published posts', details: error?.message || error },
      { status: 500 }
    );
  }
}

// POST - Create a new published post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📤 Creating published post:', JSON.stringify(body, null, 2));

    const {
      scheduled_post_id,
      generated_content_id,
      media_archive_id,
      title,
      content,
      platform,
      post_type,
      published_at,
      platform_post_id,
      platform_url,
      hashtags,
      mentions,
      metadata
    } = body;

    if (!title || !content || !platform || !published_at) {
      return NextResponse.json(
        { error: 'Title, content, platform, and published_at are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('published_posts')
      .insert({
        scheduled_post_id,
        generated_content_id,
        media_archive_id,
        title,
        content,
        platform,
        post_type,
        published_at,
        platform_post_id,
        platform_url,
        hashtags,
        mentions,
        metadata,
        status: 'published'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Successfully created published post:', data.id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Error creating published post:', error);
    return NextResponse.json(
      { error: 'Failed to create published post', details: error?.message || error },
      { status: 500 }
    );
  }
}
