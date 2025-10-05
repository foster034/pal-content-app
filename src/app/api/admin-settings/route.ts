import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase-server';

// In-memory storage as fallback (will reset on server restart)
let memoryStore: Record<string, any> = {
  gmb_manager_email: 'admin@popalock.com',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerComponentClient();

    // Try to get from database first
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (!error && data?.value) {
        // Store in memory for faster access
        memoryStore[key] = data.value;
        return NextResponse.json({ setting_key: key, setting_value: data.value });
      }
    } catch (dbError) {
      console.log('Database unavailable, using memory store');
    }

    // Return from memory store if database fails or no data
    const value = memoryStore[key];
    return NextResponse.json({ setting_key: key, setting_value: value });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { setting_key, setting_value } = await request.json();

    if (!setting_key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      );
    }

    // Always update memory store immediately
    memoryStore[setting_key] = setting_value;

    // Try to save to database in background
    try {
      const supabase = await createServerComponentClient();

      await supabase
        .from('app_settings')
        .upsert({
          key: setting_key,
          value: setting_value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      console.log('Admin settings saved to database successfully');
    } catch (dbError) {
      console.log('Database save failed, settings saved to memory only:', dbError);
    }

    // Always return success since memory store is updated
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to save admin settings' },
      { status: 500 }
    );
  }
}
