import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const franchiseeId = searchParams.get('id') || body.franchiseeId;

    if (!franchiseeId) {
      return NextResponse.json(
        { error: 'Franchisee ID is required' },
        { status: 400 }
      );
    }

    // Update the franchisee settings - map to correct database column names
    const updateData: any = {};

    if (body.businessName !== undefined) updateData.business_name = body.businessName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.location !== undefined) updateData.territory = body.location;
    if (body.logo !== undefined) updateData.image = body.logo;

    const { data, error } = await supabase
      .from('franchisees')
      .update(updateData)
      .eq('id', franchiseeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating franchisee settings:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error in franchisee settings API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseeId = searchParams.get('id');

    if (!franchiseeId) {
      return NextResponse.json(
        { error: 'Franchisee ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('franchisees')
      .select('*')
      .eq('id', franchiseeId)
      .single();

    if (error) {
      console.error('Error fetching franchisee settings:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Map database columns to frontend field names
    const mappedData = {
      businessName: data.business_name || '',
      franchiseeId: data.id || '',
      location: data.territory || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      logo: data.image || ''
    };

    return NextResponse.json({
      success: true,
      data: mappedData
    });

  } catch (error) {
    console.error('Error in franchisee settings GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}