import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SMSRequest {
  to: string;
  message: string;
  userType?: 'franchisee' | 'technician';
  userId?: number;
  userName?: string;
}

async function getTwilioConfig() {
  const { data: settings } = await supabase
    .from('admin_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['twilio_account_sid', 'twilio_auth_token', 'twilio_phone_number', 'twilio_enabled', 'twilio_test_mode']);

  const config = {
    accountSid: '',
    authToken: '',
    phoneNumber: '',
    enabled: false,
    testMode: false,
  };

  settings?.forEach(setting => {
    switch (setting.setting_key) {
      case 'twilio_account_sid':
        config.accountSid = (setting.setting_value || '').trim();
        break;
      case 'twilio_auth_token':
        config.authToken = (setting.setting_value || '').trim();
        break;
      case 'twilio_phone_number':
        config.phoneNumber = (setting.setting_value || '').trim();
        break;
      case 'twilio_enabled':
        config.enabled = setting.setting_value === 'true';
        break;
      case 'twilio_test_mode':
        config.testMode = setting.setting_value === 'true';
        break;
    }
  });

  return config;
}

export async function POST(request: NextRequest) {
  try {
    const { to, message, userType, userId, userName }: SMSRequest = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    const config = await getTwilioConfig();

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
    console.log('🔍 TWILIO DEBUG INFO:');
    console.log(`  Account SID length: ${config.accountSid.length}`);
    console.log(`  Account SID starts with AC: ${config.accountSid.startsWith('AC')}`);
    console.log(`  Auth Token length: ${config.authToken.length}`);
    console.log(`  Phone Number: ${config.phoneNumber}`);
    console.log(`  Has whitespace in SID: ${config.accountSid !== config.accountSid.trim()}`);
    console.log(`  Has whitespace in Token: ${config.authToken !== config.authToken.trim()}`);

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