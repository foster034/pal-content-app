import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

    // Check current table schema
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' })
      .select();

    if (error) {
      console.error('Error checking schema:', error);
      // Fallback: try to query the table directly to see what columns exist
      const { data: sampleData, error: sampleError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (sampleError) {
        return NextResponse.json({ error: 'Could not check schema', details: sampleError.message }, { status: 500 });
      }

      const availableColumns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [];

      return NextResponse.json({
        method: 'fallback',
        columns: availableColumns,
        hasAddressFields: {
          address: availableColumns.includes('address'),
          city: availableColumns.includes('city'),
          state: availableColumns.includes('state'),
          zip_code: availableColumns.includes('zip_code'),
          country: availableColumns.includes('country')
        }
      });
    }

    return NextResponse.json({
      method: 'rpc',
      columns: columns,
      error: null
    });

  } catch (error) {
    console.error('Error in schema check:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}