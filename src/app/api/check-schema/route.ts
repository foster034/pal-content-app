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

    // Query the information schema to get column details
    const { data, error } = await serviceSupabase
      .rpc('get_table_columns', { table_name: 'profiles' })
      .catch(async () => {
        // Fallback: try to select from profiles to see what columns exist
        const { data: sampleData, error: sampleError } = await serviceSupabase
          .from('profiles')
          .select('*')
          .limit(1);

        if (sampleError) {
          throw sampleError;
        }

        return { data: sampleData && sampleData[0] ? Object.keys(sampleData[0]) : [] };
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ columns: data });
  } catch (error) {
    console.error('Schema check error:', error);
    return NextResponse.json({
      error: 'Failed to check schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}