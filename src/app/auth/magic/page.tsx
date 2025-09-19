'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid magic link');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/magic-links?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setUser(data.user);
          setMessage(`Welcome ${data.user.name}! Redirecting to your dashboard...`);
          
          setTimeout(() => {
            if (data.user.userType === 'franchisee') {
              router.push('/franchisee/dashboard');
            } else if (data.user.userType === 'technician') {
              router.push('/tech/dashboard');
            } else {
              router.push('/admin');
            }
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Invalid or expired magic link');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify magic link');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Pop-A-Lock Access
          </h2>
          
          {status === 'loading' && (
            <div className="mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your access...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-8">
              <div className="rounded-full h-12 w-12 bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="mt-4 text-green-600 dark:text-green-400 font-medium">{message}</p>
              {user && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Logged in as: <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Role: <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{user.userType}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="mt-8">
              <div className="rounded-full h-12 w-12 bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="mt-4 text-red-600 dark:text-red-400 font-medium">{message}</p>
              <button
                onClick={() => router.push('/admin')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Admin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              Pop-A-Lock Access
            </h2>
            <div className="mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  );
}