import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all scheduled posts
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('❌ Error fetching scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled posts', details: error?.message || error },
      { status: 500 }
    );
  }
}

// POST - Create a new scheduled post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📅 Creating scheduled post:', JSON.stringify(body, null, 2));

    const {
      generated_content_id,
      media_archive_id,
      title,
      content,
      platform,
      post_type,
      scheduled_date,
      hashtags,
      mentions,
      metadata
    } = body;

    if (!title || !content || !platform || !scheduled_date) {
      return NextResponse.json(
        { error: 'Title, content, platform, and scheduled_date are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert({
        generated_content_id,
        media_archive_id,
        title,
        content,
        platform,
        post_type,
        scheduled_date,
        hashtags,
        mentions,
        metadata,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Successfully created scheduled post:', data.id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Error creating scheduled post:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled post', details: error?.message || error },
      { status: 500 }
    );
  }
}
