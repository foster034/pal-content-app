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
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Key className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Tech Portal</CardTitle>
          <CardDescription className="text-base mt-2">
            Enter your 6-digit access code to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLoginCodeSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="loginCode" className="text-center block text-lg font-semibold">
                Access Code
              </Label>
              <Input
                id="loginCode"
                type="text"
                placeholder="8D0LS9"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                className="text-center text-2xl tracking-widest font-mono h-16 border-2 focus:border-blue-500"
                maxLength={10}
                disabled={loading}
                autoFocus
                autoComplete="off"
              />
              <p className="text-xs text-center text-gray-500">
                Example: 8D0LS9
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={loading || !loginCode.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying Code...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Enter Dashboard
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

          <div className="text-center space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Quick Access Instructions:
              </p>
              <ol className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1 text-left">
                <li>1. Enter your 6-digit code (e.g., 8D0LS9)</li>
                <li>2. Press "Enter Dashboard"</li>
                <li>3. Start submitting jobs immediately</li>
              </ol>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Don't have a code? Contact your franchise manager.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}