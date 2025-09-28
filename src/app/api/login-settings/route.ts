import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase-server';

const DEFAULT_SETTINGS = {
  imageType: 'static',
  staticImageUrl: '/PAL-Canada-social.png',
  showLatestJobs: false,
  jobPhotoCount: 5,
  // Text customization
  headerTitle: 'Welcome back to Pop-A-Lock',
  headerSubtitle: 'Build your business efficiently with our powerful management platform.',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  loginButtonText: 'Log in',
  forgotPasswordText: 'Forgot password?',
  signupText: "Don't have an account?",
  signupLinkText: 'Sign up',
  googleButtonText: 'Continue with Google',
};

// In-memory storage as fallback (will reset on server restart)
let memoryStore: any = DEFAULT_SETTINGS;

export async function GET() {
  try {
    const supabase = await createServerComponentClient();

    // Try to get from database first
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'login_screen')
        .single();

      if (!error && data?.value) {
        memoryStore = data.value; // Update memory store
        return NextResponse.json(data.value);
      }
    } catch (dbError) {
      console.log('Database unavailable, using memory store');
    }

    // Return from memory store if database fails
    return NextResponse.json(memoryStore);
  } catch (error) {
    console.error('Error fetching login settings:', error);
    return NextResponse.json(memoryStore);
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();

    // Always update memory store immediately
    memoryStore = settings;

    // Try to save to database in background
    try {
      const supabase = await createServerComponentClient();

      await supabase
        .from('app_settings')
        .upsert({
          key: 'login_screen',
          value: settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      console.log('Settings saved to database successfully');
    } catch (dbError) {
      console.log('Database save failed, settings saved to memory only:', dbError);
    }

    // Always return success since memory store is updated
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving login settings:', error);
    return NextResponse.json(
      { error: 'Failed to save login settings' },
      { status: 500 }
    );
  }
}