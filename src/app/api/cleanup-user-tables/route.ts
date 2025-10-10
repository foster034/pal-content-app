import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🧹 Starting database cleanup...');

    const steps: { step: string; success: boolean; message?: string }[] = [];

    // Step 1: Check what tables exist
    console.log('📊 Checking for redundant tables...');
    const tablesToCheck = ['user_roles', 'user_with_roles', 'user_profiles'];
    const existingTables: string[] = [];

    for (const table of tablesToCheck) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (!error || error.code !== 'PGRST204') {
        existingTables.push(table);
        console.log(`  ⚠️ Found table: ${table}`);
      }
    }

    steps.push({
      step: 'Check redundant tables',
      success: true,
      message: `Found ${existingTables.length} redundant tables: ${existingTables.join(', ') || 'none'}`
    });

    // Step 2: Drop redundant tables (using raw SQL via RPC if available)
    if (existingTables.length > 0) {
      console.log('🗑️ Attempting to drop redundant tables...');

      // Note: This requires a custom SQL function or direct database access
      // For now, we'll document what needs to be done
      steps.push({
        step: 'Drop redundant tables',
        success: false,
        message: `Manual action required: Drop these tables from Supabase dashboard: ${existingTables.join(', ')}`
      });
    } else {
      steps.push({
        step: 'Drop redundant tables',
        success: true,
        message: 'No redundant tables found'
      });
    }

    // Step 3: Verify profiles table exists and has role column
    console.log('✅ Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(1);

    if (profilesError) {
      steps.push({
        step: 'Verify profiles table',
        success: false,
        message: `Error: ${profilesError.message}`
      });
    } else {
      steps.push({
        step: 'Verify profiles table',
        success: true,
        message: 'Profiles table exists with role column'
      });
    }

    // Step 4: Count users by role
    const { data: roleCount, error: roleError } = await supabase
      .rpc('count_users_by_role')
      .catch(() => {
        // If RPC doesn't exist, do manual count
        return supabase
          .from('profiles')
          .select('role');
      });

    if (!roleError) {
      const counts: Record<string, number> = {};
      if (Array.isArray(roleCount)) {
        roleCount.forEach((user: any) => {
          counts[user.role] = (counts[user.role] || 0) + 1;
        });
      }

      steps.push({
        step: 'Count users by role',
        success: true,
        message: `Admin: ${counts.admin || 0}, Franchisee: ${counts.franchisee || 0}, Tech: ${counts.tech || 0}`
      });
    }

    console.log('✅ Database cleanup check completed');

    return NextResponse.json({
      success: true,
      message: 'Database structure analysis complete',
      steps,
      recommendation: existingTables.length > 0
        ? `Please drop these redundant tables manually from Supabase dashboard: ${existingTables.join(', ')}`
        : 'Your database structure is clean! Only the profiles table is used for user roles.',
      instructions: existingTables.length > 0 ? [
        '1. Go to https://supabase.com/dashboard/project/hagfscurfkqfsjkczjyi/editor',
        '2. In the SQL Editor, run this command:',
        `DROP TABLE IF EXISTS ${existingTables.join(', ')} CASCADE;`,
        '3. Refresh this page to verify cleanup'
      ] : null
    });

  } catch (error: any) {
    console.error('❌ Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || error },
      { status: 500 }
    );
  }
}
