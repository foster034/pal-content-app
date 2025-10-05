import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH - Update generated content (e.g., archive)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log('📝 Updating generated content:', id, body);

    const { data, error } = await supabase
      .from('generated_content')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Successfully updated generated content:', id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Error updating generated content:', error);
    return NextResponse.json(
      { error: 'Failed to update generated content', details: error?.message || error },
      { status: 500 }
    );
  }
}

// DELETE - Delete generated content
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('🗑️ Deleting generated content:', id);

    const { error } = await supabase
      .from('generated_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Successfully deleted generated content:', id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting generated content:', error);
    return NextResponse.json(
      { error: 'Failed to delete generated content', details: error?.message || error },
      { status: 500 }
    );
  }
}
