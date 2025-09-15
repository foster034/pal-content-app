import { NextRequest, NextResponse } from 'next/server';

interface ConsentRecord {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  consentToContact: boolean;
  consentToShare: boolean;
  consentToMarketing: boolean;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  jobId?: string;
  franchiseeId: string;
}

// In a real application, you would store this in a database
// This is a mock in-memory storage for demonstration
let consentRecords: ConsentRecord[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      clientName, 
      clientPhone, 
      clientEmail, 
      consentToContact, 
      consentToShare, 
      consentToMarketing = false,
      jobId,
      franchiseeId
    } = body;

    // Validate required fields
    if (!clientName || !franchiseeId) {
      return NextResponse.json(
        { error: 'Client name and franchisee ID are required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for audit trail
    const ipAddress = request.ip || 
      request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create consent record
    const consentRecord: ConsentRecord = {
      id: `CONSENT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      clientName,
      clientPhone: clientPhone || '',
      clientEmail: clientEmail || '',
      consentToContact: !!consentToContact,
      consentToShare: !!consentToShare,
      consentToMarketing: !!consentToMarketing,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
      jobId,
      franchiseeId: franchiseeId.toString()
    };

    // Store consent record (in real app, save to database)
    consentRecords.push(consentRecord);

    console.log('📋 CONSENT RECORD CREATED:', {
      id: consentRecord.id,
      client: clientName,
      consentToContact: consentToContact,
      consentToShare: consentToShare,
      consentToMarketing: consentToMarketing,
      timestamp: consentRecord.timestamp
    });

    return NextResponse.json({
      success: true,
      consentId: consentRecord.id,
      message: 'Consent preferences recorded successfully',
      timestamp: consentRecord.timestamp
    });

  } catch (error) {
    console.error('Error recording consent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientEmail = searchParams.get('email');
    const clientPhone = searchParams.get('phone');
    const franchiseeId = searchParams.get('franchiseeId');

    let filteredRecords = consentRecords;

    // Filter by client contact info if provided
    if (clientEmail) {
      filteredRecords = filteredRecords.filter(record => 
        record.clientEmail.toLowerCase() === clientEmail.toLowerCase()
      );
    }

    if (clientPhone) {
      filteredRecords = filteredRecords.filter(record => 
        record.clientPhone === clientPhone
      );
    }

    if (franchiseeId) {
      filteredRecords = filteredRecords.filter(record => 
        record.franchiseeId === franchiseeId
      );
    }

    // Sort by timestamp (most recent first)
    filteredRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      records: filteredRecords,
      total: filteredRecords.length
    });

  } catch (error) {
    console.error('Error retrieving consent records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint for GDPR compliance (right to be forgotten)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const consentId = searchParams.get('id');
    const clientEmail = searchParams.get('email');

    if (!consentId && !clientEmail) {
      return NextResponse.json(
        { error: 'Consent ID or client email is required' },
        { status: 400 }
      );
    }

    let deletedCount = 0;

    if (consentId) {
      // Delete specific consent record
      const initialLength = consentRecords.length;
      consentRecords = consentRecords.filter(record => record.id !== consentId);
      deletedCount = initialLength - consentRecords.length;
    } else if (clientEmail) {
      // Delete all consent records for a client (GDPR right to be forgotten)
      const initialLength = consentRecords.length;
      consentRecords = consentRecords.filter(record => 
        record.clientEmail.toLowerCase() !== clientEmail.toLowerCase()
      );
      deletedCount = initialLength - consentRecords.length;
    }

    console.log(`🗑️ CONSENT RECORDS DELETED: ${deletedCount} records removed`);

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `${deletedCount} consent record(s) deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting consent records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}