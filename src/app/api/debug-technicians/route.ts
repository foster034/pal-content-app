import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check existing technicians
    const { data: technicians, error: techError } = await supabase
      .from('technicians')
      .select('id, name, email')
      .limit(10);

    if (techError) {
      console.error('Error fetching technicians:', techError);
      return NextResponse.json({ error: 'Failed to fetch technicians', details: techError }, { status: 500 });
    }

    // Check existing job submissions
    const { data: jobs, error: jobError } = await supabase
      .from('job_submissions')
      .select('id, technician_id')
      .limit(5);

    if (jobError) {
      console.error('Error fetching job submissions:', jobError);
    }

    return NextResponse.json({
      technicians: technicians || [],
      recentJobs: jobs || [],
      technicianCount: technicians?.length || 0
    });

  } catch (error) {
    console.error('Error in debug technicians API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create a test technician for our tests
    const testTechnician = {
      id: 'test-tech-001',
      name: 'Test Technician',
      email: 'test@example.com',
      phone: '555-0123',
      rating: 4.5,
      image_url: null,
      active: true
    };

    const { data, error } = await supabase
      .from('technicians')
      .upsert([testTechnician])
      .select()
      .single();

    if (error) {
      console.error('Error creating test technician:', error);
      return NextResponse.json({ error: 'Failed to create test technician', details: error }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Test technician created successfully',
      technician: data
    });

  } catch (error) {
    console.error('Error creating test technician:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}