import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  try {
    const { accountSid, authToken, fromNumber, toNumber, message } = await request.json();

    if (!accountSid || !authToken || !fromNumber || !toNumber || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);

    const messageResult = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    });

    console.log(`📱 TWILIO TEST MESSAGE SENT`);
    console.log(`From: ${fromNumber}`);
    console.log(`To: ${toNumber}`);
    console.log(`Message: ${message}`);
    console.log(`SID: ${messageResult.sid}`);
    console.log(`Status: ${messageResult.status}`);

    return NextResponse.json({
      success: true,
      messageSid: messageResult.sid,
      status: messageResult.status,
      message: 'Test message sent successfully',
    });

  } catch (error: any) {
    console.error('Twilio test error:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error.code) {
      switch (error.code) {
        case 20003:
          errorMessage = 'Authentication failed - check your Account SID and Auth Token';
          break;
        case 21211:
          errorMessage = 'Invalid "To" phone number format';
          break;
        case 21212:
          errorMessage = 'Invalid "From" phone number format';
          break;
        case 21608:
          errorMessage = 'The "From" phone number is not a valid Twilio phone number';
          break;
        case 21614:
          errorMessage = 'The "To" phone number is not a valid mobile number';
          break;
        default:
          errorMessage = error.message || 'Failed to send message';
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        code: error.code,
        details: error.moreInfo || null,
      },
      { status: 500 }
    );
  }
}