import { NextRequest, NextResponse } from 'next/server';
import { createElevenLabsClient } from '@/lib/eleven-labs';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (for voice management)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    try {
      const client = createElevenLabsClient();
      const voices = await client.getVoices();

      return NextResponse.json({ voices });

    } catch (elevenLabsError: any) {
      console.error('ElevenLabs API error:', elevenLabsError);
      return NextResponse.json(
        { error: 'Failed to fetch voices', details: elevenLabsError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Voices fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}