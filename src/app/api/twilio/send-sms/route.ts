import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

interface SMSRequest {
  to: string;
  message: string;
  userType?: 'franchisee' | 'technician';
  userId?: number;
  userName?: string;
}

// Mock configuration - in real app, load from database
const getTwilioConfig = () => ({
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  enabled: process.env.TWILIO_ENABLED === 'true',
  testMode: process.env.TWILIO_TEST_MODE === 'true',
});

export async function POST(request: NextRequest) {
  try {
    const { to, message, userType, userId, userName }: SMSRequest = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    const config = getTwilioConfig();

    if (!config.enabled) {
      console.log(`📱 SMS DISABLED - Would send to ${to}: ${message}`);
      return NextResponse.json({
        success: true,
        message: 'SMS is disabled - message logged only',
        testMode: true,
      });
    }

    if (!config.accountSid || !config.authToken || !config.phoneNumber) {
      return NextResponse.json(
        { error: 'Twilio is not properly configured' },
        { status: 500 }
      );
    }

    // In test mode, just log the message
    if (config.testMode) {
      console.log(`📱 SMS TEST MODE - Would send:`);
      console.log(`From: ${config.phoneNumber}`);
      console.log(`To: ${to}`);
      console.log(`User: ${userName || 'Unknown'} (${userType || 'unknown'} #${userId || 'N/A'})`);
      console.log(`Message: ${message}`);
      
      return NextResponse.json({
        success: true,
        message: 'SMS sent in test mode (logged only)',
        testMode: true,
        simulatedSid: `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      });
    }

    // Send actual SMS
    const client = twilio(config.accountSid, config.authToken);

    const messageResult = await client.messages.create({
      body: message,
      from: config.phoneNumber,
      to: to,
    });

    console.log(`📱 SMS SENT SUCCESSFULLY`);
    console.log(`From: ${config.phoneNumber}`);
    console.log(`To: ${to}`);
    console.log(`User: ${userName || 'Unknown'} (${userType || 'unknown'} #${userId || 'N/A'})`);
    console.log(`Message: ${message}`);
    console.log(`SID: ${messageResult.sid}`);
    console.log(`Status: ${messageResult.status}`);

    return NextResponse.json({
      success: true,
      messageSid: messageResult.sid,
      status: messageResult.status,
      message: 'SMS sent successfully',
      testMode: false,
    });

  } catch (error: any) {
    console.error('SMS sending error:', error);
    
    let errorMessage = 'Failed to send SMS';
    if (error.code) {
      switch (error.code) {
        case 20003:
          errorMessage = 'Twilio authentication failed';
          break;
        case 21211:
          errorMessage = 'Invalid recipient phone number';
          break;
        case 21614:
          errorMessage = 'Recipient phone number is not mobile-capable';
          break;
        default:
          errorMessage = error.message || 'Failed to send SMS';
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        code: error.code,
      },
      { status: 500 }
    );
  }
}