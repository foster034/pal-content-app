import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH - Archive/Update a published post
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log(`📝 Updating published post ${id}:`, body);

    const { archived, ...otherUpdates } = body;

    const updateData: any = { ...otherUpdates };

    if (archived !== undefined) {
      updateData.status = archived ? 'archived' : 'published';
    }

    const { data, error } = await supabase
      .from('published_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Successfully updated published post:', data.id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Error updating published post:', error);
    return NextResponse.json(
      { error: 'Failed to update published post', details: error?.message || error },
      { status: 500 }
    );
  }
}

// DELETE - Delete a published post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`🗑️ Deleting published post ${id}`);

    const { error } = await supabase
      .from('published_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Successfully deleted published post:', id);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('❌ Error deleting published post:', error);
    return NextResponse.json(
      { error: 'Failed to delete published post', details: error?.message || error },
      { status: 500 }
    );
  }
}
