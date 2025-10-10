import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Query to get all tables with user/profile/role in their name
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (error) {
      console.error('Error querying tables:', error);

      // Try raw SQL query instead
      const { data: rawData, error: rawError } = await supabase.rpc('execute_sql', {
        query: `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      });

      if (rawError) {
        console.error('Error with raw SQL:', rawError);
        return NextResponse.json({ error: 'Failed to query tables', details: rawError }, { status: 500 });
      }

      return NextResponse.json({ tables: rawData });
    }

    // Filter for user/profile/role related tables
    const relevantTables = tables?.filter((t: any) =>
      t.table_name.includes('user') ||
      t.table_name.includes('profile') ||
      t.table_name.includes('role')
    );

    return NextResponse.json({
      allTables: tables,
      relevantTables
    });

  } catch (error: any) {
    console.error('Error checking tables:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || error },
      { status: 500 }
    );
  }
}
