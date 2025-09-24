import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  try {
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );

    console.log('Checking profiles table schema...');

    // Get a sample record to see what columns exist
    const { data: sampleRecord, error: sampleError } = await serviceSupabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (sampleError) {
      return NextResponse.json({
        error: 'Failed to fetch sample record',
        details: sampleError.message
      }, { status: 500 });
    }

    const columns = sampleRecord && sampleRecord.length > 0
      ? Object.keys(sampleRecord[0])
      : [];

    // Also try to get your specific user profile
    const { data: userProfile, error: userError } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('email', 'brentfoster.popalock@gmail.com')
      .single();

    return NextResponse.json({
      success: true,
      columns: columns,
      sampleRecord: sampleRecord?.[0] || null,
      yourProfile: userProfile || null,
      userError: userError?.message || null
    });

  } catch (error) {
    console.error('Error checking schema:', error);
    return NextResponse.json({
      error: 'Failed to check schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}