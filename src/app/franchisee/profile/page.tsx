'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientComponentClient } from '@/lib/supabase-client';
import {
  User, Mail, Phone, MapPin, Calendar, Save, Edit, Camera,
  Building2, Shield, Settings, Home, Clock, Star,
  Loader2, Award, TrendingUp, Users
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const supabase = createClientComponentClient();

interface FranchiseeProfile {
  id: string;
  email: string;
  full_name: string;
  business_name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  territory?: string;
  created_at?: string;
  status?: string;
  stats: {
    totalTechs: number;
    activeJobs: number;
    completedJobs: number;
    rating: number;
  };
}

export default function FranchiseeProfilePage() {
  const searchParams = useSearchParams();
  const franchiseeId = searchParams.get('id');
  const [userProfile, setUserProfile] = useState<FranchiseeProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    business_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    territory: '',
    avatar_url: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    jobAlerts: true,
    techUpdates: true,
    systemAlerts: true,
    marketingEmails: false,
    photoApprovals: true,
    weeklyReports: true,
    criticalAlerts: true,
    browserNotifications: false
  });

  useEffect(() => {
    fetchUserProfile();
    loadNotificationSettings();
  }, [franchiseeId]);

  const loadNotificationSettings = () => {
    try {
      const savedSettings = localStorage.getItem('franchisee_notification_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setNotificationSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const fetchUserProfile = async () => {
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
        console.error('Franchisee error:', franchiseeError?.message || 'Unknown error');
        toast({
          title: "Error loading profile",
          description: franchiseeError?.message || "Could not load franchisee profile. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Fetch real statistics for this franchisee
      let realStats = {
        totalTechs: 0,
        activeJobs: 0,
        completedJobs: 0,
        rating: 0
      };

      try {
        // Fetch technician count
        const techResponse = await fetch(`/api/technicians?franchiseeId=${targetFranchiseeId}`);
        if (techResponse.ok) {
          const techData = await techResponse.json();
          realStats.totalTechs = Array.isArray(techData) ? techData.length : 0;
        }

        // Fetch job submissions for job counts
        const jobResponse = await fetch(`/api/job-submissions?franchiseeId=${targetFranchiseeId}`);
        if (jobResponse.ok) {
          const jobData = await jobResponse.json();
          if (Array.isArray(jobData)) {
            // Count active jobs (not completed) and completed jobs
            realStats.activeJobs = jobData.filter(job =>
              job.status && !['completed', 'cancelled'].includes(job.status.toLowerCase())
            ).length;
            realStats.completedJobs = jobData.filter(job =>
              job.status && job.status.toLowerCase() === 'completed'
            ).length;

            // Calculate average rating from completed jobs with ratings
            const ratedJobs = jobData.filter(job =>
              job.rating && typeof job.rating === 'number' && job.rating > 0
            );
            if (ratedJobs.length > 0) {
              const totalRating = ratedJobs.reduce((sum, job) => sum + job.rating, 0);
              realStats.rating = Math.round((totalRating / ratedJobs.length) * 10) / 10;
            }
          }
        }
      } catch (statsError) {
        console.error('Error fetching real statistics:', statsError);
        // Fall back to demo data if there's an error
        realStats = {
          totalTechs: 5,
          activeJobs: 12,
          completedJobs: 150,
          rating: 4.8
        };
      }

      // Build profile data
      const profileData = {
        id: franchisee.id,
        email: franchisee.email || franchisee.contact_email || '',
        full_name: ownerName || franchisee.contact_name || 'Franchise Owner',
        business_name: franchisee.business_name || franchisee.territory || 'Pop-A-Lock Franchise',
        role: 'franchisee',
        avatar_url: franchisee.image || '',
        phone: franchisee.phone || franchisee.contact_phone || '',
        address: franchisee.address || '',
        city: franchisee.city || '',
        state: franchisee.state || '',
        zip_code: franchisee.zip_code || '',
        country: franchisee.country || 'United States',
        territory: franchisee.territory || '',
        created_at: franchisee.created_at || new Date().toISOString(),
        status: franchisee.status || 'Active',
        stats: realStats
      };

      setUserProfile(profileData);
      setFormData({
        full_name: profileData.full_name,
        business_name: profileData.business_name,
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zip_code: profileData.zip_code || '',
        country: profileData.country || 'United States',
        territory: profileData.territory || '',
        avatar_url: profileData.avatar_url || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      setUploadingAvatar(true);

      // Get current user for authentication check
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Determine which user ID to use for the avatar
      // If viewing a specific franchisee (admin viewing), use the franchisee ID
      // Otherwise use the current user's ID (franchisee viewing their own profile)
      const targetUserId = userProfile?.id || user.id;

      // Create FormData for server-side upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', targetUserId);
      formData.append('userType', 'franchisee');

      // Upload via server-side API
      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return result.avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload profile photo. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const uploadedUrl = await uploadAvatar(file);
    if (uploadedUrl) {
      // Update local state
      setFormData(prev => ({ ...prev, avatar_url: uploadedUrl }));
      setUserProfile(prev => prev ? { ...prev, avatar_url: uploadedUrl } : null);

      // Auto-save the new avatar URL to the franchisee profile
      try {
        const targetUserId = userProfile?.id;
        if (targetUserId) {
          // Update the franchisee's image field via API
          const response = await fetch(`/api/franchisees/${targetUserId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: uploadedUrl }),
          });

          const result = await response.json();

          if (!response.ok) {
            console.error('Error updating franchisee image:', result.error);
            toast({
              title: "Upload successful but save failed",
              description: "The photo was uploaded but couldn't be saved to your profile. Please click Save Changes.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Photo updated",
              description: "Your profile photo has been updated successfully"
            });
          }
        } else {
          toast({
            title: "Photo uploaded",
            description: "Your profile photo has been uploaded successfully"
          });
        }
      } catch (error) {
        console.error('Error saving avatar:', error);
        toast({
          title: "Upload successful but save failed",
          description: "The photo was uploaded but couldn't be saved to your profile. Please click Save Changes.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSave = async () => {
    if (!userProfile) return;

    setSaving(true);
    try {
      // Save notification settings to localStorage
      localStorage.setItem('franchisee_notification_settings', JSON.stringify(notificationSettings));

      // Always update the franchisee data since we're on the franchisee profile page
      // userProfile.id contains the franchisee ID we're viewing
      if (userProfile.id) {
        // Update franchisee data via franchisee API
        const franchiseeUpdateData = {
          name: formData.business_name,
          territory: formData.territory,
          phone: formData.phone,
          country: formData.country,
          image: formData.avatar_url
        };

        const response = await fetch(`/api/franchisees/${userProfile.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(franchiseeUpdateData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update franchisee profile');
        }
      }

      setUserProfile(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Save failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name,
        business_name: userProfile.business_name,
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        zip_code: userProfile.zip_code || '',
        country: userProfile.country || 'United States',
        territory: userProfile.territory || '',
        avatar_url: userProfile.avatar_url || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Profile not found.</div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'business', label: 'Business Info', icon: Building2 },
    { id: 'address', label: 'Address', icon: Home },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const memberSince = userProfile.created_at
    ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="relative">
        {/* Simple header background */}
        <div className="h-32 bg-white dark:bg-gray-800 border-b"></div>

        {/* Profile Header Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                {/* Avatar Section */}
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-xl">
                    <AvatarImage
                      src={isEditing ? formData.avatar_url : userProfile.avatar_url}
                      className="object-contain"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white text-3xl font-bold">
                      {userProfile.business_name?.charAt(0) || userProfile.full_name?.charAt(0) || 'F'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const fileInput = document.getElementById('avatar-upload-input') as HTMLInputElement;
                          fileInput?.click();
                        }}
                        disabled={uploadingAvatar}
                        className="rounded-full shadow-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-900"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {userProfile.business_name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {userProfile.full_name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 mt-1">
                    {userProfile.email}
                  </p>
                  <div className="mt-2 flex items-center gap-3 justify-center sm:justify-start">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {userProfile.role}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {userProfile.stats.rating} Rating
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Member since {memberSince}
                  </p>
                </div>

                {/* Edit Button */}
                <div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-900">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="bg-white hover:bg-gray-50 border-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-900"
                        disabled={saving}
                      >
                        {saving ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors
                      ${activeTab === tab.id
                        ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Manage your personal details
                  </p>
                </div>

                {isEditing && (
                  <div className="mb-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Profile Picture</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Upload a new profile photo</p>
                      </div>

                      {formData.avatar_url && (
                        <div className="flex justify-center">
                          <img
                            src={formData.avatar_url}
                            alt="Profile preview"
                            className="w-24 h-24 rounded-full object-contain border-2 border-gray-200"
                          />
                        </div>
                      )}

                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const fileInput = document.getElementById('avatar-upload-input') as HTMLInputElement;
                            fileInput?.click();
                          }}
                          disabled={uploadingAvatar}
                        >
                          {uploadingAvatar ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Camera className="h-4 w-4 mr-2" />
                              Choose Photo
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <input
                      id="avatar-upload-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          await handleAvatarUpload(e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="fullName"
                          value={formData.full_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white py-2">
                          {userProfile.full_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white py-2">
                          {userProfile.phone || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Business Info Tab */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Business Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Manage your business details and franchise information
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="businessName"
                          value={formData.business_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                          placeholder="Enter your business name"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white py-2">
                          {userProfile.business_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="territory">Territory</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="territory"
                          value={formData.territory}
                          onChange={(e) => setFormData(prev => ({ ...prev, territory: e.target.value }))}
                          placeholder="Enter your territory"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white py-2">
                          {userProfile.territory || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Franchise Stats */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Franchise Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-2">
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.stats.totalTechs}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Technicians</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-2">
                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.stats.activeJobs}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-2">
                        <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.stats.completedJobs}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full mx-auto mb-2">
                        <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.stats.rating}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Update your location details
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter your street address"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white py-2">
                          {userProfile.address || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Enter your city"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white py-2">
                          {userProfile.city || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="Enter your state"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white py-2">
                          {userProfile.state || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="zipCode"
                          value={formData.zip_code}
                          onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                          placeholder="Enter ZIP code"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white py-2">
                          {userProfile.zip_code || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="Enter your country"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white py-2">
                          {userProfile.country || 'United States'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Your account details and franchise status
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Email Address</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{userProfile.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Account Role</p>
                          <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {userProfile.role}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Account Created</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(userProfile.created_at || '').toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Franchise Status</p>
                          <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {userProfile.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Profile Completion</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Profile Status</span>
                        <span className="font-medium text-gray-900 dark:text-white">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Complete your profile to unlock all features
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Notification Settings
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Configure how you receive notifications
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Notifications
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Job Alerts</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about new job submissions</p>
                        </div>
                        <Switch
                          checked={notificationSettings.jobAlerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, jobAlerts: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Tech Updates</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Notifications about technician activities</p>
                        </div>
                        <Switch
                          checked={notificationSettings.techUpdates}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, techUpdates: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Photo Approvals</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">When photos need your review or approval</p>
                        </div>
                        <Switch
                          checked={notificationSettings.photoApprovals}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, photoApprovals: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Weekly Reports</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Weekly summary of your franchise performance</p>
                        </div>
                        <Switch
                          checked={notificationSettings.weeklyReports}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      SMS Notifications
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Critical Alerts</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Important system and business notifications</p>
                        </div>
                        <Switch
                          checked={notificationSettings.criticalAlerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, criticalAlerts: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}