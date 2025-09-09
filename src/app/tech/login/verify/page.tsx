'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyLoginPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyMagicLink = async () => {
      try {
        const email = searchParams.get('email');
        const code = searchParams.get('code');

        if (!email || !code) {
          throw new Error('Invalid magic link - missing parameters');
        }

        // Simulate verification delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, you would verify the code against your backend
        // For now, we'll simulate a successful verification
        
        // Store login session
        localStorage.setItem('techAuth', JSON.stringify({
          email: email,
          loginTime: new Date().toISOString()
        }));

        setStatus('success');
        setMessage('Login successful! Redirecting to dashboard...');

        // Redirect after a short delay
        setTimeout(() => {
          router.push('/tech/dashboard');
        }, 2000);

      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Verification failed');
      }
    };

    verifyMagicLink();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'verifying' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">Verifying login...</h2>
                <p className="text-gray-600 mt-2">Please wait while we verify your magic link</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="text-green-600 text-5xl mb-4">✅</div>
                <h2 className="text-xl font-semibold text-green-900">Login Successful!</h2>
                <p className="text-green-700 mt-2">{message}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="text-red-600 text-5xl mb-4">❌</div>
                <h2 className="text-xl font-semibold text-red-900">Verification Failed</h2>
                <p className="text-red-700 mt-2">{message}</p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/tech/login')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}