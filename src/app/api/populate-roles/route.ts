import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    console.log('📝 Populating roles table...');

    // Check current roles
    const { data: existingRoles, error: checkError } = await supabase
      .from('roles')
      .select('*');

    console.log('Existing roles:', existingRoles);

    if (checkError) {
      console.error('Error checking roles:', checkError);
      return NextResponse.json(
        { error: 'Failed to check roles', details: checkError.message },
        { status: 500 }
      );
    }

    // Define the roles to insert
    const rolesToInsert = [
      { name: 'super_admin', description: 'Super Administrator - Full system access, can manage all admins, franchisees, and technicians' },
      { name: 'admin', description: 'Administrator - Can manage franchisees and technicians, access all features' },
      { name: 'franchisee', description: 'Franchisee Owner - Manages their franchise, technicians, and job submissions' },
      { name: 'tech', description: 'Technician - Submits jobs and photos, views their own submissions' }
    ];

    const insertedRoles = [];
    const skippedRoles = [];

    for (const role of rolesToInsert) {
      // Check if role already exists
      const exists = existingRoles?.find(r => r.name === role.name);

      if (exists) {
        skippedRoles.push(role.name);
        console.log(`⏭️ Role '${role.name}' already exists, skipping`);
      } else {
        // Insert the role
        const { data, error } = await supabase
          .from('roles')
          .insert(role)
          .select()
          .single();

        if (error) {
          console.error(`Error inserting role '${role.name}':`, error);
        } else {
          insertedRoles.push(data);
          console.log(`✅ Inserted role '${role.name}' with id ${data.id}`);
        }
      }
    }

    // Get final list of all roles
    const { data: allRoles } = await supabase
      .from('roles')
      .select('*')
      .order('id');

    return NextResponse.json({
      success: true,
      message: `✅ Roles populated successfully`,
      inserted: insertedRoles.length,
      skipped: skippedRoles.length,
      insertedRoles: insertedRoles.map(r => ({ id: r.id, name: r.name })),
      skippedRoles,
      allRoles: allRoles?.map(r => ({ id: r.id, name: r.name, description: r.description }))
    });

  } catch (error: any) {
    console.error('Error populating roles:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Just show current roles
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('id');

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch roles', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      totalRoles: roles?.length || 0,
      roles: roles?.map(r => ({ id: r.id, name: r.name, description: r.description })),
      message: roles?.length === 0 ? 'No roles found. Use POST to populate.' : `Found ${roles.length} roles`
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || error },
      { status: 500 }
    );
  }
}
