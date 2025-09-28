'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientComponentClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import {
  User, Mail, MapPin, Save, Edit, Camera,
  Shield, Settings, Home, Smartphone,
  Download, ShieldCheck, UserCog, Key, Loader2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import ImageUploader from "@/components/ImageUploader";
import { useToast } from "@/hooks/use-toast";

interface TechProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  created_at?: string;
  loginCode?: string;
  franchisee?: string;
}

export default function TechProfilePage() {
  const [userProfile, setUserProfile] = useState<TechProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
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
  }, []);

  const loadNotificationSettings = () => {
    try {
      const savedSettings = localStorage.getItem('tech_notification_settings');
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
      // First check for tech session (login code auth)
      const techSessionData = localStorage.getItem('tech_session');
      if (techSessionData) {
        try {
          const techSession = JSON.parse(techSessionData);

          // Validate session is still valid (less than 24 hours old)
          const loginTime = new Date(techSession.loginTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

          if (hoursDiff < 24) {
            // Fetch full profile data from the tech-profile API
            try {
              const response = await fetch(`/api/tech-profile?techId=${techSession.id}`);
              if (response.ok) {
                const profileData = await response.json();
                console.log('Loaded tech profile from API:', profileData);

                setUserProfile({
                  ...profileData,
                  loginCode: 'AUTHENTICATED',
                  avatar_url: techSession.avatar_url || profileData.avatar_url
                });
                setFormData({
                  full_name: profileData.full_name || techSession.name,
                  phone: profileData.phone || techSession.phone,
                  address: profileData.address || '',
                  city: profileData.city || '',
                  state: profileData.state || '',
                  zip_code: profileData.zip_code || '',
                  country: profileData.country || 'United States',
                  avatar_url: techSession.avatar_url || profileData.avatar_url || ''
                });
                setLoading(false);
                return;
              }
            } catch (apiError) {
              console.error('Error loading tech profile from API:', apiError);
            }

            // Fallback to session data if API fails
            const profileData = {
              id: techSession.id,
              email: techSession.email || 'tech@popalock.com',
              full_name: techSession.name || 'Technician',
              role: 'tech',
              avatar_url: techSession.avatar_url || '',
              phone: techSession.phone || '',
              address: '',
              city: '',
              state: '',
              zip_code: '',
              country: 'United States',
              franchisee: techSession.franchisee?.business_name || 'Pop-A-Lock',
              loginCode: 'AUTHENTICATED',
              created_at: techSession.loginTime
            };

            setUserProfile(profileData);
            setFormData({
              full_name: profileData.full_name,
              phone: profileData.phone || '',
              address: profileData.address || '',
              city: profileData.city || '',
              state: profileData.state || '',
              zip_code: profileData.zip_code || '',
              country: profileData.country || 'United States',
              avatar_url: profileData.avatar_url || ''
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing tech session:', error);
        }
      }

      // Fallback to Supabase session (email/password auth)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const profileData = {
          id: user.id,
          email: user.email || '',
          full_name: profile?.full_name || user.user_metadata?.full_name || '',
          role: profile?.role || 'tech',
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
          phone: profile?.phone || '',
          address: profile?.address || '',
          city: profile?.city || '',
          state: profile?.state || '',
          zip_code: profile?.zip_code || '',
          country: profile?.country || 'United States',
          created_at: profile?.created_at || user.created_at
        };

        setUserProfile(profileData);
        setFormData({
          full_name: profileData.full_name,
          phone: profileData.phone || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          zip_code: profileData.zip_code || '',
          country: profileData.country || 'United States',
          avatar_url: profileData.avatar_url || ''
        });
      } else {
        router.push('/tech-auth');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      setUploadingAvatar(true);

      // Get current user ID (either from session or tech session)
      let userId = null;
      const techSessionData = localStorage.getItem('tech_session');
      if (techSessionData) {
        const techSession = JSON.parse(techSessionData);
        userId = techSession.id;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Create FormData for server-side upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('userType', 'tech');

      // Upload via server-side API (bypasses RLS issues)
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
      // Update both formData and userProfile immediately
      setFormData(prev => ({ ...prev, avatar_url: uploadedUrl }));
      setUserProfile(prev => prev ? { ...prev, avatar_url: uploadedUrl } : null);

      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been uploaded successfully"
      });
    }
  };

  const handleSave = async () => {
    if (!userProfile) return;

    setSaving(true);
    try {
      // Save notification settings to localStorage
      localStorage.setItem('tech_notification_settings', JSON.stringify(notificationSettings));

      // For tech session users, use dedicated tech-profile API
      const techSessionData = localStorage.getItem('tech_session');
      if (techSessionData) {
        const techSession = JSON.parse(techSessionData);

        // Update local storage
        techSession.name = formData.full_name;
        techSession.phone = formData.phone;
        techSession.avatar_url = formData.avatar_url;
        localStorage.setItem('tech_session', JSON.stringify(techSession));

        // Update via dedicated tech profile API
        const response = await fetch('/api/tech-profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            techId: techSession.id,
            ...formData
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update tech profile');
        }

        console.log('Tech profile updated successfully:', result);

        setUserProfile(prev => prev ? { ...prev, ...formData } : null);
        setIsEditing(false);

        // Dispatch event to notify sidebar to refresh
        window.dispatchEvent(new CustomEvent('tech-profile-updated'));

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully"
        });
      } else {
        // For regular users, update via standard API
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update profile');
        }

        setUserProfile(prev => prev ? { ...prev, ...formData } : null);
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully"
        });
      }
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
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        zip_code: userProfile.zip_code || '',
        country: userProfile.country || 'United States',
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
                    <AvatarImage src={isEditing ? formData.avatar_url : userProfile.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-3xl font-bold">
                      {userProfile.full_name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                      <Button
                        size="sm"
                        onClick={() => {
                          // Trigger the hidden file input
                          const fileInput = document.getElementById('avatar-upload-input') as HTMLInputElement;
                          fileInput?.click();
                        }}
                        disabled={uploadingAvatar}
                        className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
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
                    {userProfile.full_name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {userProfile.email}
                  </p>
                  <div className="mt-2">
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      {userProfile.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Member since {memberSince}
                  </p>
                </div>

                {/* Edit Button */}
                <div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700"
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
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
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
                          // Clear the input so the same file can be selected again if needed
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
                    Account Security
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Manage your account security settings
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Tech Login Code</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Your quick access code</p>
                      </div>
                    </div>
                    {userProfile.loginCode && (
                      <Badge className="text-lg px-4 py-2 font-mono">
                        {userProfile.loginCode}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Profile Completion</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Profile Status</span>
                        <span className="font-medium text-gray-900 dark:text-white">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
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
                          <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about new job assignments</p>
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
                          <p className="font-medium text-gray-900 dark:text-white">Photo Approvals</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Notifications when your photos are reviewed</p>
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
                          <p className="text-sm text-gray-600 dark:text-gray-400">Weekly summary of your performance</p>
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
                      <Smartphone className="h-4 w-4" />
                      SMS Notifications
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Critical Alerts</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Important system and job notifications</p>
                        </div>
                        <Switch
                          checked={notificationSettings.criticalAlerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, criticalAlerts: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Tech Updates</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Updates about tech assignments</p>
                        </div>
                        <Switch
                          checked={notificationSettings.techUpdates}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, techUpdates: checked }))
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