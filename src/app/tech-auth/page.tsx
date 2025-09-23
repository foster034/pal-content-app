'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Key, LogIn, ArrowRight, Loader2 } from "lucide-react";
import { setTechSession } from '@/lib/tech-auth';

export default function TechAuth() {
  const [loginCode, setLoginCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailLogin, setShowEmailLogin] = useState(false);
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
              // Stay on tech auth page
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
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Technician Login</CardTitle>
          <CardDescription>
            Enter your login code provided by your franchise
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLoginCodeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginCode">Login Code</Label>
              <Input
                id="loginCode"
                type="text"
                placeholder="Enter your login code"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                className="text-center text-lg tracking-wider font-mono"
                maxLength={10}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login with Code
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push('/auth/login')}
            className="w-full"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Login with Email & Password
          </Button>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
            <p>Don't have a login code? Contact your franchise manager.</p>
            <p>Need to set up your account? Check your email for the setup link.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}