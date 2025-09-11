import { NextRequest, NextResponse } from 'next/server';

// In a real application, you'd want to store these in a database
// For now, we'll just store them in memory (will be lost on restart)
let twilioConfig = {
  accountSid: '',
  authToken: '',
  phoneNumber: '',
  enabled: false,
  testMode: true,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { accountSid, authToken, phoneNumber, enabled, testMode } = body;
    
    if (enabled && (!accountSid || !authToken || !phoneNumber)) {
      return NextResponse.json(
        { error: 'Account SID, Auth Token, and Phone Number are required when SMS is enabled' },
        { status: 400 }
      );
    }

    // Store the configuration (in a real app, save to database)
    twilioConfig = {
      accountSid: accountSid || '',
      authToken: authToken || '',
      phoneNumber: phoneNumber || '',
      enabled: !!enabled,
      testMode: !!testMode,
    };

    console.log(`🔧 TWILIO CONFIG UPDATED`);
    console.log(`Enabled: ${twilioConfig.enabled}`);
    console.log(`Test Mode: ${twilioConfig.testMode}`);
    console.log(`Phone Number: ${twilioConfig.phoneNumber}`);
    console.log(`Account SID: ${twilioConfig.accountSid ? twilioConfig.accountSid.substring(0, 10) + '...' : 'Not set'}`);

    return NextResponse.json({
      success: true,
      message: 'Twilio configuration saved successfully',
      config: {
        enabled: twilioConfig.enabled,
        testMode: twilioConfig.testMode,
        phoneNumber: twilioConfig.phoneNumber,
        // Don't return sensitive data
        hasAccountSid: !!twilioConfig.accountSid,
        hasAuthToken: !!twilioConfig.authToken,
      }
    });

  } catch (error: any) {
    console.error('Error saving Twilio config:', error);
    return NextResponse.json(
      { error: 'Failed to save Twilio configuration' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    config: {
      enabled: twilioConfig.enabled,
      testMode: twilioConfig.testMode,
      phoneNumber: twilioConfig.phoneNumber,
      accountSid: twilioConfig.accountSid ? twilioConfig.accountSid.substring(0, 10) + '...' : '',
      // Don't return sensitive auth token
      hasAccountSid: !!twilioConfig.accountSid,
      hasAuthToken: !!twilioConfig.authToken,
    }
  });
}