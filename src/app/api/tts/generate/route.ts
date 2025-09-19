import { NextRequest, NextResponse } from 'next/server';
import { createElevenLabsClient, getDefaultVoiceId, ELEVEN_LABS_MODELS } from '@/lib/eleven-labs';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
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

    const body = await request.json();
    const {
      text,
      voiceId,
      model = ELEVEN_LABS_MODELS.MULTILINGUAL_V2,
      voice_settings
    } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: 'Text must be less than 5000 characters' }, { status: 400 });
    }

    try {
      const client = createElevenLabsClient();
      const selectedVoiceId = voiceId || getDefaultVoiceId();

      const audioBuffer = await client.generateSpeech(text, selectedVoiceId, {
        model,
        voice_settings,
      });

      // Convert ArrayBuffer to Buffer for response
      const buffer = Buffer.from(audioBuffer);

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });

    } catch (elevenLabsError: any) {
      console.error('ElevenLabs API error:', elevenLabsError);
      return NextResponse.json(
        { error: 'Text-to-speech generation failed', details: elevenLabsError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('TTS generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate speech.' },
    { status: 405 }
  );
}