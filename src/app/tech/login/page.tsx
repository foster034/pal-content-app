'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface LoginCode {
  code: string;
  email: string;
  expiresAt: Date;
  used: boolean;
}

// Simulated database of active codes
let activeCodes: LoginCode[] = [];

export default function TechLoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [magicLink, setMagicLink] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'quickcode'>('email');
  const [quickCode, setQuickCode] = useState('');
  const router = useRouter();

  const generateLoginCode = () => {
    // Generate a 6-digit code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    
    // Remove any existing codes for this email
    activeCodes = activeCodes.filter(ac => ac.email !== email);
    
    // Add new code
    activeCodes.push({
      code: newCode,
      email: email,
      expiresAt: expiresAt,
      used: false
    });
    
    return newCode;
  };

  const generateMagicLink = (email: string, code: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/tech/login/verify?email=${encodeURIComponent(email)}&code=${code}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Generate code
      const newCode = generateLoginCode();
      setGeneratedCode(newCode);
      
      // Generate magic link
      const link = generateMagicLink(email, newCode);
      setMagicLink(link);
      
      setShowCodeInput(true);
      setMessage(`Login code sent! Code: ${newCode} (expires in 15 minutes)`);
      
      // In a real app, you would send this via email
      console.log('Login code for', email, ':', newCode);
      console.log('Magic link:', link);
      
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const activeCode = activeCodes.find(ac => 
        ac.email === email && 
        ac.code === code && 
        !ac.used && 
        ac.expiresAt > new Date()
      );

      if (!activeCode) {
        throw new Error('Invalid or expired code');
      }

      // Mark code as used
      activeCode.used = true;
      
      // Store login session (in real app, use proper session management)
      localStorage.setItem('techAuth', JSON.stringify({
        email: email,
        loginTime: new Date().toISOString()
      }));

      setMessage('Login successful! Redirecting...');
      
      // Redirect to tech dashboard
      setTimeout(() => {
        router.push('/tech/dashboard');
      }, 1000);
      
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    const newCode = generateLoginCode();
    setGeneratedCode(newCode);
    const link = generateMagicLink(email, newCode);
    setMagicLink(link);
    setMessage(`New code sent! Code: ${newCode} (expires in 15 minutes)`);
    setCode('');
  };

  // Mock tech profiles with login codes (in production, this would come from database)
  const mockTechProfiles = [
    { id: 1, name: 'Alex Rodriguez', email: 'alex@popalock.com', loginCode: 'A3X9M2', autoLoginEnabled: true },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@popalock.com', loginCode: 'S7K4N8', autoLoginEnabled: true },
    { id: 3, name: 'Mike Johnson', email: 'mike@popalock.com', loginCode: 'M9P2Q5', autoLoginEnabled: true },
  ];

  const handleQuickCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (!quickCode || quickCode.length < 6) {
        throw new Error('Please enter a valid quick code');
      }

      // Find technician by quick code
      const tech = mockTechProfiles.find(t => 
        t.loginCode.toUpperCase() === quickCode.toUpperCase() && 
        t.autoLoginEnabled
      );

      if (!tech) {
        throw new Error('Invalid quick code. Check your code in Profile Settings.');
      }

      // Store login session
      localStorage.setItem('techAuth', JSON.stringify({
        email: tech.email,
        name: tech.name,
        id: tech.id,
        loginTime: new Date().toISOString(),
        loginMethod: 'quickcode'
      }));

      setMessage('Quick login successful! Redirecting...');
      
      // Redirect to tech dashboard
      setTimeout(() => {
        router.push('/tech/dashboard');
      }, 1000);
      
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Image
            src="/images/pop-a-lock-logo.svg"
            alt="Pop-A-Lock"
            width={250}
            height={100}
            className="mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-900">Technician Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            {loginMethod === 'email' 
              ? 'Enter your email to receive a secure login code'
              : 'Enter your quick login code from your profile'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Login Method Tabs */}
          <div className="mb-6">
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email');
                  setMessage('');
                  setQuickCode('');
                }}
                className={`flex-1 py-2 px-4 text-sm font-medium text-center border-b-2 ${
                  loginMethod === 'email'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📧 Email Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('quickcode');
                  setMessage('');
                  setShowCodeInput(false);
                  setCode('');
                  setGeneratedCode('');
                  setMagicLink('');
                }}
                className={`flex-1 py-2 px-4 text-sm font-medium text-center border-b-2 ${
                  loginMethod === 'quickcode'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚡ Quick Code
              </button>
            </div>
          </div>

          {loginMethod === 'quickcode' ? (
            /* Quick Code Login Form */
            <form onSubmit={handleQuickCodeLogin} className="space-y-6">
              <div>
                <label htmlFor="quickcode" className="block text-sm font-medium text-gray-700">
                  Quick Login Code
                </label>
                <div className="mt-1">
                  <input
                    id="quickcode"
                    name="quickcode"
                    type="text"
                    maxLength={6}
                    required
                    value={quickCode}
                    onChange={(e) => setQuickCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-wider font-mono"
                    placeholder="A3X9M2"
                  />
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Find your code in Profile Settings → Auto Login Code
                  </p>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || quickCode.length < 6}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isLoading ? 'Logging in...' : '⚡ Quick Login'}
                </button>
              </div>
            </form>
          ) : !showCodeInput ? (
            /* Email Login Form */
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Login Code'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Code sent to <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Enter 6-digit code
                  </label>
                  <div className="mt-1">
                    <input
                      id="code"
                      name="code"
                      type="text"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </div>
              </form>

              <div className="text-center space-y-3">
                <button
                  onClick={handleResendCode}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Resend code
                </button>
                <br />
                <button
                  onClick={() => {
                    setShowCodeInput(false);
                    setCode('');
                    setGeneratedCode('');
                    setMessage('');
                    setMagicLink('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Use different email
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.includes('successful') || message.includes('sent') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {magicLink && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700 font-medium mb-2">Magic Link:</p>
              <div className="bg-white p-2 rounded border">
                <code className="text-xs text-blue-600 break-all">{magicLink}</code>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Click this link to login instantly (for testing purposes)
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            For demo purposes, the login code is displayed above.<br />
            In production, this would be sent via email.
          </p>
          
          {/* Demo Quick Codes */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">Demo Quick Codes:</p>
            <div className="space-y-1">
              {mockTechProfiles.map(tech => (
                <div key={tech.id} className="text-xs text-gray-600">
                  <span className="font-mono font-bold">{tech.loginCode}</span> - {tech.name}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Try any of these codes in the Quick Code tab
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}