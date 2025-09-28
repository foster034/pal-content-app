import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Submission code is required', valid: false },
        { status: 400 }
      );
    }

    // Clean the code (remove spaces, make uppercase)
    const cleanCode = code.trim().toUpperCase();

    // Check if the code exists and is valid
    // You can implement different validation strategies:

    // Strategy 1: Simple format validation (e.g., TECH-XXXX or similar pattern)
    const codePattern = /^[A-Z]{3,4}-\d{4}$/;

    if (!codePattern.test(cleanCode)) {
      return NextResponse.json(
        { error: 'Invalid code format. Use format: ABC-1234', valid: false },
        { status: 400 }
      );
    }

    // Strategy 2: Database lookup for generated codes
    // First, try to find a technician by a generated code
    const { data: techData, error: techError } = await supabase
      .from('technicians')
      .select('id, name, phone')
      .eq('submit_code', cleanCode)
      .eq('active', true)
      .single();

    if (techError || !techData) {
      // Strategy 3: Fallback - Check if it's a valid technician phone-based code
      // Extract potential phone number from code (last 4 digits)
      const phoneDigits = cleanCode.split('-')[1];

      const { data: phoneMatchData, error: phoneError } = await supabase
        .from('technicians')
        .select('id, name, phone')
        .like('phone', `%${phoneDigits}`)
        .eq('active', true)
        .single();

      if (phoneError || !phoneMatchData) {
        return NextResponse.json(
          { error: 'Invalid or expired submission code', valid: false },
          { status: 400 }
        );
      }

      // Phone-based match found
      return NextResponse.json({
        valid: true,
        technicianId: phoneMatchData.id,
        technicianName: phoneMatchData.name,
        message: 'Code validated successfully'
      });
    }

    // Direct code match found
    return NextResponse.json({
      valid: true,
      technicianId: techData.id,
      technicianName: techData.name,
      message: 'Code validated successfully'
    });

  } catch (error) {
    console.error('Code validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', valid: false },
      { status: 500 }
    );
  }
}