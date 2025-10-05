import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client with service role key
// This bypasses RLS policies and should only be used server-side
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Execute a SQL query using the Supabase admin client
 * This is useful for migrations and admin operations
 */
export async function executeSql(query: string) {
  try {
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { query });

    if (error) {
      console.error('SQL execution error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('SQL execution error:', error);
    return { success: false, error };
  }
}
