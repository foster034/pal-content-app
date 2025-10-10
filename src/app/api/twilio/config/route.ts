import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

async function saveTwilioSetting(key: string, value: string) {
  await supabase
    .from('admin_settings')
    .upsert({
      setting_key: key,
      setting_value: value.trim(), // Trim whitespace to prevent auth issues
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'setting_key'
    });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { accountSid, authToken, phoneNumber, enabled, testMode } = body;

    // Get existing config to check if authToken exists
    const existingConfig = await getTwilioConfig();
    const hasExistingAuthToken = !!existingConfig.authToken;

    // If SMS is enabled, require accountSid and phoneNumber
    // For authToken, only require if it's not already set in DB and not provided in request
    if (enabled && (!accountSid || !phoneNumber || (!authToken && !hasExistingAuthToken))) {
      return NextResponse.json(
        { error: 'Account SID, Auth Token, and Phone Number are required when SMS is enabled' },
        { status: 400 }
      );
    }

    // Save to database (trim is also applied in saveTwilioSetting, but doing it here too for clarity)
    await saveTwilioSetting('twilio_account_sid', (accountSid || '').trim());
    // Only update authToken if a new one is provided
    if (authToken) {
      await saveTwilioSetting('twilio_auth_token', authToken.trim());
    }
    await saveTwilioSetting('twilio_phone_number', (phoneNumber || '').trim());
    await saveTwilioSetting('twilio_enabled', enabled ? 'true' : 'false');
    await saveTwilioSetting('twilio_test_mode', testMode ? 'true' : 'false');

    console.log(`🔧 TWILIO CONFIG UPDATED`);
    console.log(`Enabled: ${enabled} (type: ${typeof enabled})`);
    console.log(`Test Mode: ${testMode} (type: ${typeof testMode})`);
    console.log(`Saving Test Mode as: '${testMode ? 'true' : 'false'}'`);
    console.log(`Phone Number: ${phoneNumber}`);
    console.log(`Account SID: ${accountSid ? accountSid.substring(0, 10) + '...' : 'Not set'}`);

    return NextResponse.json({
      success: true,
      message: 'Twilio configuration saved successfully',
      config: {
        enabled: !!enabled,
        testMode: !!testMode,
        phoneNumber: phoneNumber || '',
        hasAccountSid: !!accountSid,
        hasAuthToken: !!authToken,
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
  try {
    const config = await getTwilioConfig();

    console.log(`📖 LOADING TWILIO CONFIG:`);
    console.log(`  Enabled: ${config.enabled}`);
    console.log(`  Test Mode: ${config.testMode}`);

    return NextResponse.json({
      success: true,
      config: {
        enabled: config.enabled,
        testMode: config.testMode,
        phoneNumber: config.phoneNumber,
        accountSid: config.accountSid ? config.accountSid.substring(0, 10) + '...' : '',
        hasAccountSid: !!config.accountSid,
        hasAuthToken: !!config.authToken,
      }
    });
  } catch (error) {
    console.error('Error loading Twilio config:', error);
    return NextResponse.json(
      { error: 'Failed to load Twilio configuration' },
      { status: 500 }
    );
  }
}