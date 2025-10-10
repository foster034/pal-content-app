import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fix all published posts that are missing franchisee_id
export async function GET() {
  try {
    // Get all published posts that don't have a franchisee_id but have a media_archive_id
    const { data: posts, error: fetchError } = await supabase
      .from('published_posts')
      .select('id, media_archive_id')
      .is('franchisee_id', null)
      .not('media_archive_id', 'is', null);

    if (fetchError) {
      console.error('❌ Error fetching posts:', fetchError);
      throw fetchError;
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        message: 'No posts need fixing',
        updated: 0
      });
    }

    console.log(`📝 Found ${posts.length} posts to fix`);

    // Fix each post
    const updates = [];
    for (const post of posts) {
      // Get franchisee_id from media archive
      const { data: mediaData } = await supabase
        .from('media_archive')
        .select('franchisee_id')
        .eq('id', post.media_archive_id)
        .single();

      if (mediaData?.franchisee_id) {
        // Update the post
        const { error: updateError } = await supabase
          .from('published_posts')
          .update({ franchisee_id: mediaData.franchisee_id })
          .eq('id', post.id);

        if (updateError) {
          console.error(`❌ Error updating post ${post.id}:`, updateError);
        } else {
          console.log(`✅ Updated post ${post.id} with franchisee_id ${mediaData.franchisee_id}`);
          updates.push({
            post_id: post.id,
            franchisee_id: mediaData.franchisee_id
          });
        }
      }
    }

    return NextResponse.json({
      message: `Successfully fixed ${updates.length} published posts`,
      updated: updates.length,
      details: updates
    });
  } catch (error: any) {
    console.error('❌ Error fixing published posts:', error);
    return NextResponse.json(
      { error: 'Failed to fix published posts', details: error?.message || error },
      { status: 500 }
    );
  }
}
