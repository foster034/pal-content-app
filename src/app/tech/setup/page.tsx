'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase-client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, CheckCircle, Key } from "lucide-react";

const supabase = createClientComponentClient();

function TechSetupContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [technicianData, setTechnicianData] = useState<any>(null);
  const [franchiseData, setFranchiseData] = useState<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadSetupData = async () => {
      const technicianId = searchParams.get('technician_id');
      const franchiseId = searchParams.get('franchise_id');

      if (technicianId && franchiseId) {
        try {
          // Get technician data
          const { data: tech } = await supabase
            .from('technicians')
            .select('*')
            .eq('id', technicianId)
            .single();

          // Get franchise data
          const { data: franchise } = await supabase
            .from('franchisees')
            .select('*')
            .eq('id', franchiseId)
            .single();

          setTechnicianData(tech);
          setFranchiseData(franchise);
        } catch (error) {
          console.error('Error loading setup data:', error);
        }
      }
    };

    loadSetupData();
  }, [searchParams]);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(pass)) return 'Password must contain a lowercase letter';
    if (!/(?=.*[A-Z])/.test(pass)) return 'Password must contain an uppercase letter';
    if (!/(?=.*\d)/.test(pass)) return 'Password must contain a number';
    if (!/(?=.*[!@#$%^&*])/.test(pass)) return 'Password must contain a special character';
    return null;
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Get current user (should be auto-logged in from magic link)
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('No authenticated user found. Please use the magic link from your email.');
        setLoading(false);
        return;
      }

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      // Update user metadata to mark setup as completed
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          setup_completed: true
        }
      });

      if (metadataError) {
        console.error('Error updating metadata:', metadataError);
      }

      // Create profile record if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          name: technicianData?.name || user.user_metadata?.name,
          role: 'tech',
          franchisee_id: searchParams.get('franchise_id')
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Update technician record with user_id
      if (technicianData) {
        await supabase
          .from('technicians')
          .update({ user_id: user.id })
          .eq('id', technicianData.id);
      }

      // Record setup completion
      const technicianId = searchParams.get('technician_id');
      if (technicianId) {
        await supabase
          .from('technician_invites')
          .update({
            setup_completed_at: new Date().toISOString(),
            first_login_at: new Date().toISOString()
          })
          .eq('technician_id', technicianId);
      }

      setSuccess(true);

      // Redirect to tech dashboard after a delay
      setTimeout(() => {
        router.push('/tech/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Setup error:', error);
      setError(error.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Setup Complete!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your account has been set up successfully. You're being redirected to your dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Pop-A-Lock!</CardTitle>
          <CardDescription>
            {franchiseData ? (
              <>Set up your account for <strong>{franchiseData.business_name}</strong></>
            ) : (
              'Complete your account setup'
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {technicianData && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Welcome, {technicianData.name}!</strong><br />
                Email: {technicianData.email}
              </p>
            </div>
          )}

          <form onSubmit={handleSetup} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be 8+ characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Setting up account...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500 dark:text-gray-400">
            <p>After setup, you can login at any time using your email and password.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TechSetup() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading setup...</div>}>
      <TechSetupContent />
    </Suspense>
  );
}