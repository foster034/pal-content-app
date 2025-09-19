'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Award, TrendingUp, Users, MapPin, Mail, Phone, Star } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TechProfile {
  id: number;
  name: string;
  avatar: string;
  title: string;
  location: string;
  loginCode: string;
  email?: string;
  phone?: string;
  stats: {
    level: number;
    totalJobs: number;
    approvedPics: number;
    streak: number;
    badges: string[];
  };
  settings: {
    autoShareJobs: boolean;
    shareJobTypes: {
      commercial: boolean;
      residential: boolean;
      automotive: boolean;
      roadside: boolean;
    };
    shareJobDetails: boolean;
    sharePhotos: boolean;
    autoLoginEnabled: boolean;
  };
}

const generateLoginCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const defaultTechProfile: TechProfile = {
  id: 0,
  name: 'Loading...',
  avatar: '',
  title: 'Pop-A-Lock Technician',
  location: 'Your Location',
  loginCode: generateLoginCode(),
  email: 'tech@popalock.com',
  phone: '+1 (555) 123-4567',
  stats: {
    level: 3,
    totalJobs: 47,
    approvedPics: 42,
    streak: 7,
    badges: ['Top Performer', 'Quality Pro', 'Team Player']
  },
  settings: {
    autoShareJobs: true,
    shareJobTypes: {
      commercial: true,
      residential: true,
      automotive: false,
      roadside: true
    },
    shareJobDetails: true,
    sharePhotos: true,
    autoLoginEnabled: true
  }
};

export default function TechProfile() {
  const [profile, setProfile] = useState<TechProfile>(defaultTechProfile);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load current technician's profile data
  useEffect(() => {
    const loadTechProfile = async () => {
      try {
        setLoading(true);

        // First check for tech session (login code auth)
        const techSessionData = localStorage.getItem('tech_session');
        if (techSessionData) {
          try {
            const techSession = JSON.parse(techSessionData);
            console.log('Found tech session:', techSession);

            // Validate session is still valid (less than 24 hours old)
            const loginTime = new Date(techSession.loginTime);
            const now = new Date();
            const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

            if (hoursDiff < 24) {
              // Use tech session data
              setProfile({
                ...profile,
                id: techSession.id,
                name: techSession.name,
                avatar: profile.avatar,
                email: techSession.email,
                phone: techSession.phone,
                title: 'Pop-A-Lock Technician',
                location: techSession.franchisee?.business_name || profile.location,
                loginCode: 'AUTHENTICATED'
              });
              setLoading(false);
              return;
            } else {
              // Session expired, clear it
              localStorage.removeItem('tech_session');
              document.cookie = 'tech_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
          } catch (error) {
            console.error('Error parsing tech session:', error);
            localStorage.removeItem('tech_session');
          }
        }

        // Fallback to Supabase session (email/password auth)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('No session found - redirecting to auth');
          router.push('/tech-auth');
          return;
        }

        const userId = session.user.id;
        const userEmail = session.user.email;
        console.log('Current user ID:', userId, 'Email:', userEmail);

        // Fetch technician data based on user ID
        const techResponse = await fetch(`/api/technicians`);
        if (techResponse.ok) {
          let techData;
          try {
            techData = await techResponse.json();
          } catch (error) {
            console.error('Failed to parse technicians response:', error);
            setLoading(false);
            return;
          }

          const currentTech = techData.find((tech: any) => tech.userId === userId || tech.email === userEmail);

          if (currentTech) {
            setProfile({
              ...profile,
              id: currentTech.id,
              name: currentTech.name,
              avatar: currentTech.image || profile.avatar,
              email: currentTech.email,
              phone: currentTech.phone,
              title: 'Pop-A-Lock Technician',
              location: currentTech.franchiseeName || profile.location,
              loginCode: currentTech.loginCode || generateLoginCode()
            });
          } else {
            console.log('No technician found for this user');
            // Get user profile for basic info since we know they're authenticated
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();

            setProfile({
              ...profile,
              name: userProfile?.name || session.user.email || 'Tech User',
              email: session.user.email || 'No email',
              title: 'Pop-A-Lock Technician',
              location: 'Contact administrator for full setup'
            });
          }
        } else {
          console.error('Failed to fetch technicians');
        }
      } catch (error) {
        console.error('Error loading tech profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTechProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* Hero Section with Cover */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-end gap-6">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                <img
                  src={profile.avatar || `https://i.pravatar.cc/150?u=${profile.name}`}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            {/* Profile Info */}
            <div className="flex-1 text-white pb-2">
              <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
              <p className="text-blue-100 text-lg mb-2">{profile.title}</p>
              <div className="flex items-center gap-4 text-blue-200 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Level {profile.stats.level}
                </div>
              </div>
            </div>
            {/* Action Button */}
            <Button
              onClick={() => window.history.back()}
              variant="secondary"
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 mb-2"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        {/* Alert for users without technician records */}
        {profile.location === 'Contact administrator for full setup' && (
          <div className="mb-6">
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200">Technician Profile Setup Required</h3>
                    <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                      Your account is authenticated but needs to be linked to a technician profile. Please contact your administrator to complete the setup.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Level</p>
                    <p className="text-3xl font-bold">{profile.stats.level}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-400/30 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Jobs</p>
                    <p className="text-3xl font-bold">{profile.stats.totalJobs}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-400/30 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Approved Pics</p>
                    <p className="text-3xl font-bold">{profile.stats.approvedPics}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-400/30 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Streak</p>
                    <p className="text-3xl font-bold">{profile.stats.streak}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-400/30 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Contact Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                  <p className="font-medium">{profile.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges & Achievements */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.stats.badges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">{badge}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Achievement unlocked</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Approval Rate</span>
                  <span className="font-bold text-green-600">{Math.round((profile.stats.approvedPics / profile.stats.totalJobs) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${(profile.stats.approvedPics / profile.stats.totalJobs) * 100}%`}}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                  <span className="font-bold text-orange-600">{profile.stats.streak} days</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: `${Math.min(profile.stats.streak * 10, 100)}%`}}></div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Login Code</p>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold tracking-wider">{profile.loginCode}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}