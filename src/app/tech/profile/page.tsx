'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BlurFade from "@/components/ui/blur-fade";
import NumberTicker from "@/components/ui/number-ticker";
import { Settings, Award, TrendingUp, Users, MapPin, Mail, Phone, Star, Shield, Zap, Target, Trophy, Calendar, Clock, CheckCircle2, Sparkles } from "lucide-react";

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
    <div className="relative">
      {/* Background Effects - Simple like dashboard */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/20 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />

      {/* Simple Header like dashboard */}
      <BlurFade delay={0.1}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-6">
            {/* Simple Profile Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-2 border-muted shadow-lg overflow-hidden bg-muted">
                <img
                  src={profile.avatar || `https://i.pravatar.cc/150?u=${profile.name}`}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-background rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {profile.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {profile.title}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>Level {profile.stats.level}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  <span>{profile.stats.streak} Day Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="shadow-lg"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </BlurFade>

      {/* Alert for users without technician records */}
      {profile.location === 'Contact administrator for full setup' && (
        <div className="mb-8">
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

      {/* Simple Stats Cards like dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Level", value: profile.stats.level, icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
          { title: "Total Jobs", value: profile.stats.totalJobs, icon: Target, color: "from-emerald-500 to-teal-500" },
          { title: "Approved Pics", value: profile.stats.approvedPics, icon: Star, color: "from-purple-500 to-pink-500" },
          { title: "Streak", value: profile.stats.streak, icon: Zap, color: "from-orange-500 to-red-500", suffix: " days" }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <BlurFade key={stat.title} delay={0.2 + index * 0.1}>
              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm group">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                     style={{backgroundImage: `linear-gradient(135deg, ${stat.color.split(' ')[1]}, ${stat.color.split(' ')[3]})`}} />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">
                        <NumberTicker value={stat.value} delay={index * 0.1} />
                        {stat.suffix && <span className="text-lg ml-1">{stat.suffix}</span>}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          );
        })}
      </div>

      {/* Simple Grid Layout like dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Contact Information */}
        <BlurFade delay={0.3}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5" />
            <CardHeader className="relative">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{profile.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Achievements */}
        <BlurFade delay={0.4}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
            <CardHeader className="relative">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-3">
              {profile.stats.badges.map((badge, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{badge}</p>
                    <p className="text-sm text-muted-foreground">Achievement Unlocked</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </BlurFade>

        {/* Performance & Login Code */}
        <BlurFade delay={0.5}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
            <CardHeader className="relative">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-6">
              {/* Approval Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Approval Rate</span>
                  <span className="font-bold text-xl">
                    {Math.round((profile.stats.approvedPics / profile.stats.totalJobs) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{width: `${(profile.stats.approvedPics / profile.stats.totalJobs) * 100}%`}}
                  ></div>
                </div>
              </div>

              {/* Current Streak */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Streak</span>
                  <span className="font-bold text-xl">
                    {profile.stats.streak} days
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                    style={{width: `${Math.min(profile.stats.streak * 10, 100)}%`}}
                  ></div>
                </div>
              </div>

              {/* Login Code */}
              <div className="pt-4 border-t border-muted">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Your Login Code</p>
                  </div>
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                    <p className="text-2xl font-bold tracking-wider font-mono">{profile.loginCode}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </BlurFade>
      </div>
    </div>
  );
}