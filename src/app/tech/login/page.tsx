'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, LogIn, Loader2, Wrench } from "lucide-react";
import { setTechSession } from '@/lib/tech-auth';

export default function TechLogin() {
  const [loginCode, setLoginCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check if user is already logged in with regular auth
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Get user profile to determine role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          // Redirect based on role
          switch (profile.role) {
            case 'admin':
              router.push('/admin');
              break;
            case 'franchisee':
              router.push('/franchisee');
              break;
            case 'tech':
              router.push('/tech/dashboard');
              break;
            default:
              // Stay on tech login page
              break;
          }
        }
      }
    };

    checkAuth();
  }, [router, supabase]);

  const handleLoginCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCode.trim()) {
      setError('Please enter your login code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tech-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginCode: loginCode.trim() }),
      });

      const data = await response.json();

      if (data.success && data.technician) {
        // Set tech session in localStorage
        setTechSession({
          id: data.technician.id,
          name: data.technician.name,
          email: data.technician.email,
          phone: data.technician.phone,
          avatar_url: data.technician.image_url,
          franchisee: data.technician.franchisee,
          loginTime: new Date().toISOString()
        });

        // Set a cookie to help with server-side middleware
        document.cookie = `tech_session=${data.technician.id}; path=/; max-age=86400`; // 24 hours

        // Redirect to tech dashboard
        router.push('/tech/dashboard');
      } else {
        setError(data.error || 'Invalid login code');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Technician Login
          </h1>
          <p className="text-gray-600 mt-2">
            Enter your login code to access the tech dashboard
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
              <Key className="h-5 w-5 text-orange-600" />
              Quick Access
            </CardTitle>
            <CardDescription>
              Use your technician login code for instant access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginCode" className="text-sm font-medium">
                  Login Code
                </Label>
                <Input
                  id="loginCode"
                  type="text"
                  placeholder="Enter your 6-digit code"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={6}
                  autoComplete="off"
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg"
                disabled={loading || !loginCode.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Access Dashboard
                  </>
                )}
              </Button>
            </form>

            {/* Info Section */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-blue-900 text-sm">
                    Need your login code?
                  </h4>
                  <p className="text-blue-700 text-xs mt-1">
                    Contact your franchise manager or check your email for your 6-digit technician access code.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Pop-A-Lock • Technician Portal
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Secure access for authorized technicians only
          </p>
        </div>
      </div>
    </div>
  );
}