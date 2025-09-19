import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Test with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test basic connection
    const { data: tables, error: tablesError } = await supabase
      .from('technicians')
      .select('*')
      .limit(3);

    if (tablesError) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: tablesError
      }, { status: 500 });
    }

    // Test job_submissions table structure
    const { data: jobSubs, error: jobError } = await supabase
      .from('job_submissions')
      .select('*')
      .limit(1);

    return NextResponse.json({
      success: true,
      technicians: tables,
      jobSubmissions: jobSubs,
      jobError: jobError?.message || null
    });

  } catch (error) {
    return NextResponse.json({
      error: 'API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Try a simple insert with valid data from schema
    const testData = {
      technician_id: '660f9500-f39c-52e5-b827-557766551001', // Alex Rodriguez from schema
      franchisee_id: '550e8400-e29b-41d4-a716-446655440001', // Pop-A-Lock Barrie from schema
      client_name: 'Test Client',
      client_phone: '+1234567890',
      client_email: 'test@example.com',
      client_preferred_contact: 'phone',
      client_consent_contact: true,
      client_consent_share: true,
      service_category: 'Residential',
      service_type: 'Lock Installation',
      service_location: 'Test Location',
      service_date: '2025-09-16',
      service_duration: 30,
      satisfaction_rating: 5,
      description: 'Test job submission',
      before_photos: [],
      after_photos: [],
      process_photos: [],
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('job_submissions')
      .insert(testData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        error: 'Insert failed',
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      insertedData: data
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Insert test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}