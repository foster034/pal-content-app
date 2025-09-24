import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
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

    const results = [];

    // First, check what columns currently exist
    const { data: sampleData, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (sampleError) {
      return NextResponse.json({ error: 'Could not check existing schema', details: sampleError.message }, { status: 500 });
    }

    const existingColumns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
    results.push({ step: 'check_existing', existingColumns });

    // Define the address fields we need
    const addressFields = [
      { name: 'address', type: 'TEXT', description: 'Street address' },
      { name: 'city', type: 'TEXT', description: 'City name' },
      { name: 'state', type: 'TEXT', description: 'State or province' },
      { name: 'zip_code', type: 'TEXT', description: 'ZIP or postal code' },
      { name: 'country', type: 'TEXT DEFAULT \'United States\'', description: 'Country name' }
    ];

    // Add each field if it doesn't exist
    for (const field of addressFields) {
      if (!existingColumns.includes(field.name)) {
        try {
          const { error: alterError } = await supabase.rpc('execute_sql', {
            sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${field.name} ${field.type};`
          });

          if (alterError) {
            // Try alternative approach using direct SQL
            results.push({
              step: `add_${field.name}`,
              status: 'attempted_rpc',
              error: alterError.message
            });

            // Since RPC failed, we'll track what we tried to add
            results.push({
              step: `add_${field.name}`,
              status: 'needed',
              sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${field.name} ${field.type};`
            });
          } else {
            results.push({
              step: `add_${field.name}`,
              status: 'added_via_rpc'
            });
          }
        } catch (err) {
          results.push({
            step: `add_${field.name}`,
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      } else {
        results.push({
          step: `add_${field.name}`,
          status: 'already_exists'
        });
      }
    }

    // Since we can't directly execute DDL, let's provide the SQL commands
    const missingFields = addressFields.filter(field => !existingColumns.includes(field.name));

    if (missingFields.length > 0) {
      const sqlCommands = missingFields.map(field =>
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${field.name} ${field.type};`
      ).join('\n');

      results.push({
        step: 'sql_to_execute',
        sqlCommands,
        missingFields: missingFields.map(f => f.name),
        note: 'Execute these SQL commands in your Supabase SQL editor'
      });
    }

    return NextResponse.json({
      success: true,
      results,
      existingColumns,
      totalFields: addressFields.length,
      missingCount: missingFields.length
    });

  } catch (error) {
    console.error('Error adding address fields:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}