import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { technicianId, customerEmail, jobDescription } = await request.json();

    if (!technicianId) {
      return NextResponse.json(
        { error: 'Technician ID is required' },
        { status: 400 }
      );
    }

    // Verify technician exists
    const { data: techData, error: techError } = await supabase
      .from('technicians')
      .select('id, name, phone')
      .eq('id', technicianId)
      .single();

    if (techError || !techData) {
      return NextResponse.json(
        { error: 'Invalid technician ID' },
        { status: 400 }
      );
    }

    // Generate customer code
    // Format: TECH-XXXX where XXXX is based on technician ID or phone
    const phoneDigits = techData.phone ? techData.phone.slice(-4) : '0000';
    const techPrefix = techData.name ? techData.name.substring(0, 3).toUpperCase() : 'PAL';
    const customerCode = `${techPrefix}-${phoneDigits}`;

    // Store or update the customer code for this technician
    const { error: updateError } = await supabase
      .from('technicians')
      .update({ submit_code: customerCode })
      .eq('id', technicianId);

    if (updateError) {
      console.error('Error updating technician code:', updateError);
      // Continue anyway - code still valid
    }

    // Optionally, store job assignment with code
    if (customerEmail && jobDescription) {
      try {
        const { error: jobError } = await supabase
          .from('customer_job_assignments')
          .insert({
            technician_id: technicianId,
            customer_email: customerEmail,
            job_description: jobDescription,
            submit_code: customerCode,
            status: 'pending',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          });

        if (jobError) {
          console.log('Job assignment table might not exist:', jobError);
          // Don't fail the code generation
        }
      } catch (jobInsertError) {
        console.log('Job assignment creation failed:', jobInsertError);
      }
    }

    // Generate customer link
    const customerLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/customer-submit?code=${customerCode}`;

    return NextResponse.json({
      success: true,
      customerCode,
      customerLink,
      technicianName: techData.name,
      message: 'Customer code generated successfully'
    });

  } catch (error) {
    console.error('Code generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method to retrieve existing codes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get('technicianId');

    if (!technicianId) {
      return NextResponse.json(
        { error: 'Technician ID is required' },
        { status: 400 }
      );
    }

    // Get technician with current code
    const { data: techData, error: techError } = await supabase
      .from('technicians')
      .select('id, name, phone, submit_code')
      .eq('id', technicianId)
      .single();

    if (techError || !techData) {
      return NextResponse.json(
        { error: 'Invalid technician ID' },
        { status: 400 }
      );
    }

    if (!techData.submit_code) {
      return NextResponse.json({
        success: false,
        message: 'No customer code generated yet'
      });
    }

    const customerLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/customer-submit?code=${techData.submit_code}`;

    return NextResponse.json({
      success: true,
      customerCode: techData.submit_code,
      customerLink,
      technicianName: techData.name
    });

  } catch (error) {
    console.error('Code retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}