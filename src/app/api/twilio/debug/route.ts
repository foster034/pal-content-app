import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch all Twilio settings from database
    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['twilio_account_sid', 'twilio_auth_token', 'twilio_phone_number', 'twilio_enabled', 'twilio_test_mode']);

    if (error) {
      return NextResponse.json({ error: 'Database error', details: error }, { status: 500 });
    }

    const diagnostics: any = {
      database_records: settings,
      analysis: {},
    };

    // Analyze each setting
    settings?.forEach(setting => {
      const key = setting.setting_key;
      const value = setting.setting_value;

      diagnostics.analysis[key] = {
        exists: !!value,
        length: value?.length || 0,
        hasWhitespace: value ? (value !== value.trim()) : false,
        startsWithWhitespace: value ? (value.startsWith(' ') || value.startsWith('\t') || value.startsWith('\n')) : false,
        endsWithWhitespace: value ? (value.endsWith(' ') || value.endsWith('\t') || value.endsWith('\n')) : false,
        firstChars: value ? value.substring(0, 5) : null,
        lastChars: value ? value.substring(value.length - 5) : null,
      };

      // Special checks for auth token
      if (key === 'twilio_auth_token') {
        diagnostics.analysis[key].containsDots = value?.includes('•') || false;
        diagnostics.analysis[key].valuePreview = value ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}` : null;
      }

      // Special checks for account SID
      if (key === 'twilio_account_sid') {
        diagnostics.analysis[key].startsWithAC = value?.startsWith('AC') || false;
        diagnostics.analysis[key].expectedLength = 34;
        diagnostics.analysis[key].actualLength = value?.length || 0;
      }

      // Special checks for phone number
      if (key === 'twilio_phone_number') {
        diagnostics.analysis[key].startsWithPlus = value?.startsWith('+') || false;
        diagnostics.analysis[key].containsOnlyDigitsAndPlus = value ? /^[+\d]+$/.test(value) : false;
      }
    });

    // Build config object exactly as it's used in send-sms route
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
          config.accountSid = setting.setting_value || '';
          break;
        case 'twilio_auth_token':
          config.authToken = setting.setting_value || '';
          break;
        case 'twilio_phone_number':
          config.phoneNumber = setting.setting_value || '';
          break;
        case 'twilio_enabled':
          config.enabled = setting.setting_value === 'true';
          break;
        case 'twilio_test_mode':
          config.testMode = setting.setting_value === 'true';
          break;
      }
    });

    diagnostics.parsed_config = {
      accountSid: config.accountSid ? `${config.accountSid.substring(0, 10)}...` : 'EMPTY',
      authToken: config.authToken ? `Set (${config.authToken.length} chars)` : 'EMPTY',
      phoneNumber: config.phoneNumber || 'EMPTY',
      enabled: config.enabled,
      testMode: config.testMode,
    };

    // Test Twilio client initialization
    let twilioClientTest = {
      canInitialize: false,
      error: null as any,
    };

    if (config.accountSid && config.authToken) {
      try {
        const client = twilio(config.accountSid, config.authToken);
        // Try to access the client to see if it initializes
        twilioClientTest.canInitialize = true;
      } catch (error: any) {
        twilioClientTest.canInitialize = false;
        twilioClientTest.error = error.message;
      }
    } else {
      twilioClientTest.error = 'Missing accountSid or authToken';
    }

    diagnostics.twilio_client_test = twilioClientTest;

    // Recommendations
    const recommendations = [];

    if (diagnostics.analysis['twilio_auth_token']?.containsDots) {
      recommendations.push({
        severity: 'CRITICAL',
        issue: 'Auth token contains placeholder dots (••••)',
        fix: 'The actual auth token is not being saved to the database. Check the save logic in /api/twilio/config'
      });
    }

    if (diagnostics.analysis['twilio_auth_token']?.hasWhitespace) {
      recommendations.push({
        severity: 'CRITICAL',
        issue: 'Auth token has leading or trailing whitespace',
        fix: 'Add .trim() when saving the auth token to remove whitespace'
      });
    }

    if (diagnostics.analysis['twilio_account_sid']?.hasWhitespace) {
      recommendations.push({
        severity: 'HIGH',
        issue: 'Account SID has leading or trailing whitespace',
        fix: 'Add .trim() when saving the account SID to remove whitespace'
      });
    }

    if (diagnostics.analysis['twilio_account_sid']?.actualLength !== 34) {
      recommendations.push({
        severity: 'HIGH',
        issue: `Account SID length is ${diagnostics.analysis['twilio_account_sid']?.actualLength}, expected 34`,
        fix: 'Verify the Account SID is correct and complete'
      });
    }

    if (!diagnostics.analysis['twilio_phone_number']?.startsWithPlus) {
      recommendations.push({
        severity: 'MEDIUM',
        issue: 'Phone number does not start with +',
        fix: 'Twilio requires E.164 format (e.g., +17053005447)'
      });
    }

    diagnostics.recommendations = recommendations;

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to run diagnostics', details: error.message },
      { status: 500 }
    );
  }
}
