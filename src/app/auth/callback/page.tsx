'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase-client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Processing authentication...');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from the URL
        const code = new URLSearchParams(window.location.search).get('code');

        if (code) {
          // Exchange the code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('Error exchanging code for session:', error);
            setMessage('Authentication failed. Please try again.');
            setTimeout(() => router.push('/auth/login'), 3000);
            return;
          }

          // Get the user to check their role
          const { data: { user }, error: userError } = await supabase.auth.getUser();

          if (userError || !user) {
            setMessage('Failed to get user information.');
            setTimeout(() => router.push('/auth/login'), 3000);
            return;
          }

          // Get user profile to determine role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }

          setMessage('Authentication successful! Redirecting...');

          // Redirect based on role
          setTimeout(() => {
            if (profile?.role === 'admin') {
              router.push('/admin');
            } else if (profile?.role === 'franchisee') {
              router.push('/franchisee');
            } else if (profile?.role === 'tech') {
              router.push('/tech');
            } else {
              router.push('/');
            }
          }, 1500);
        } else {
          setMessage('No authentication code found.');
          setTimeout(() => router.push('/auth/login'), 3000);
        }
      } catch (error) {
        console.error('Callback error:', error);
        setMessage('An error occurred during authentication.');
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    };

    handleCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">{message}</h1>
        <p className="text-gray-400">Please wait...</p>
      </div>
    </div>
  );
}