'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  Award,
  TrendingUp,
  Users,
  MapPin,
  Mail,
  Phone,
  Star,
  Building2,
  Clock,
  Shield,
  Calendar
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FranchiseeProfile {
  id: string;
  name: string;
  businessName: string;
  avatar: string;
  email: string;
  phone: string;
  territory: string;
  address: string;
  joinDate: string;
  status: string;
  stats: {
    totalTechs: number;
    activeJobs: number;
    completedJobs: number;
    rating: number;
    badges: string[];
  };
}

const defaultProfile: FranchiseeProfile = {
  id: '',
  name: 'Loading...',
  businessName: 'Pop-A-Lock Franchise',
  avatar: '',
  email: 'franchise@popalock.com',
  phone: '+1 (555) 123-4567',
  territory: 'Your Territory',
  address: '123 Main Street, City, State 12345',
  joinDate: '2024-01-01',
  status: 'Active',
  stats: {
    totalTechs: 5,
    activeJobs: 12,
    completedJobs: 150,
    rating: 4.8,
    badges: ['Excellence Award', 'Top Franchise', 'Community Leader']
  }
};

export default function FranchiseeProfilePage() {
  const searchParams = useSearchParams();
  const franchiseeId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [noFranchiseeFound, setNoFranchiseeFound] = useState(false);
  const [profile, setProfile] = useState<FranchiseeProfile>(defaultProfile);

  useEffect(() => {
    loadProfileData();
  }, [franchiseeId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      console.log('Loading profile data with franchiseeId:', franchiseeId);

      let targetFranchiseeId = franchiseeId;
      let ownerName = '';

      // If no franchiseeId in URL, get it from current user's profile
      if (!targetFranchiseeId) {
        console.log('No franchiseeId in URL, getting from user profile');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('No session found');
          setNoFranchiseeFound(true);
          setLoading(false);
          return;
        }

        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('franchisee_id, full_name')
          .eq('id', session.user.id)
          .single();

        if (profileError || !userProfile?.franchisee_id) {
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile error:', profileError);
          }
          setNoFranchiseeFound(true);
          setLoading(false);
          return;
        }

        targetFranchiseeId = userProfile.franchisee_id;
        ownerName = userProfile.full_name || '';
      }

      console.log('Looking for franchisee with ID:', targetFranchiseeId);

      // Get franchisee data via API route
      let franchisee = null;
      let franchiseeError = null;

      try {
        const response = await fetch(`/api/franchisees/${targetFranchiseeId}`);
        if (response.ok) {
          franchisee = await response.json();
        } else {
          const errorData = await response.json();
          franchiseeError = { message: errorData.error || `HTTP ${response.status}` };
        }
      } catch (error) {
        franchiseeError = { message: error instanceof Error ? error.message : 'Network error' };
      }

      if (franchiseeError || !franchisee) {
        console.error('Franchisee error:', franchiseeError);
        setNoFranchiseeFound(true);
        setLoading(false);
        return;
      }

      // Update profile data
      setProfile({
        id: franchisee.id,
        name: ownerName || franchisee.contact_name || 'Franchise Owner',
        businessName: franchisee.business_name || franchisee.territory,
        avatar: franchisee.logo || '',
        email: franchisee.email || franchisee.contact_email,
        phone: franchisee.phone || franchisee.contact_phone,
        territory: franchisee.territory,
        address: franchisee.address || 'Address not provided',
        joinDate: franchisee.created_at ? new Date(franchisee.created_at).toISOString().split('T')[0] : '2024-01-01',
        status: franchisee.status || 'Active',
        stats: {
          totalTechs: franchisee.tech_count || 5,
          activeJobs: franchisee.active_jobs || 12,
          completedJobs: franchisee.completed_jobs || 150,
          rating: franchisee.rating || 4.8,
          badges: ['Excellence Award', 'Top Franchise', 'Community Leader']
        }
      });

    } catch (error) {
      console.error('Error loading profile:', error);
      setNoFranchiseeFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading franchise profile...</p>
        </div>
      </div>
    );
  }

  if (noFranchiseeFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Franchise Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We couldn't find the franchise profile you're looking for.
            </p>
            <Button onClick={() => window.history.back()}>
              ← Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* Hero Section with Cover */}
      <div className="relative h-64 bg-gradient-to-r from-green-600 to-teal-600 overflow-hidden">
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
              <h1 className="text-3xl font-bold mb-1">{profile.businessName}</h1>
              <p className="text-green-100 text-lg mb-2">{profile.name}</p>
              <div className="flex items-center gap-4 text-green-200 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.territory}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {profile.stats.rating} Rating
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
        {/* Stats Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Technicians</p>
                    <p className="text-3xl font-bold">{profile.stats.totalTechs}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-400/30 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Active Jobs</p>
                    <p className="text-3xl font-bold">{profile.stats.activeJobs}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-400/30 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Completed Jobs</p>
                    <p className="text-3xl font-bold">{profile.stats.completedJobs}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-400/30 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Rating</p>
                    <p className="text-3xl font-bold">{profile.stats.rating}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-400/30 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Business Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-600" />
                Business Information
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Territory</p>
                  <p className="font-medium">{profile.territory}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Join Date</p>
                  <p className="font-medium">{new Date(profile.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
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
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">{badge}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Franchise achievement</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</span>
                  <span className="font-bold text-green-600">{profile.stats.rating}/5.0</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${(profile.stats.rating / 5) * 100}%`}}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Job Completion Rate</span>
                  <span className="font-bold text-blue-600">96%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '96%'}}></div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Status: {profile.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Franchise in good standing with excellent performance metrics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}