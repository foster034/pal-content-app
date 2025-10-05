'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientComponentClient } from '@/lib/supabase-client';
import {
  User, Mail, Phone, MapPin, Calendar, Save, Edit, Camera,
  Building, Globe, FileText, Shield, Settings, ChevronRight,
  Briefcase, Home, Map, Bell, Smartphone, MessageSquare,
  AlertTriangle, CheckCircle, Clock, Users, Camera as CameraIcon,
  Loader2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
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
}

export default function AdminProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const supabase = createClientComponentClient();
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
  }, []);

  const fetchUserProfile = async () => {
    try {
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
          role: profile?.role || 'admin',
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

      // Get current user ID from session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Create FormData for server-side upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);
      formData.append('userType', 'admin');

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
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to update profile');
      }

      setUserProfile(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error instanceof Error ? `Failed to update profile: ${error.message}` : 'Failed to update profile. Please try again.');
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
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-semibold">
                      {userProfile.full_name?.charAt(0) || userProfile.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <Button
                        size="sm"
                        onClick={() => {
                          // Trigger the hidden file input
                          const fileInput = document.getElementById('avatar-upload-input') as HTMLInputElement;
                          fileInput?.click();
                        }}
                        disabled={uploadingAvatar}
                        className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 h-10 w-10 p-0"
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
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {userProfile.full_name || 'No name set'}
                    </h1>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {userProfile.role}
                    </Badge>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">{userProfile.email}</p>
                  {userProfile.created_at && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Member since {new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancel} disabled={saving}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-6 border-t pt-4">
                <nav className="flex gap-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <Card className="shadow-lg border-0">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Manage your personal details</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          {userProfile.full_name || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                          placeholder="(555) 123-4567"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          {userProfile.phone || 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <Card className="shadow-lg border-0">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Address Information
                  </CardTitle>
                  <CardDescription>Your location details</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Street Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                          placeholder="123 Main Street"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          {userProfile.address || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          City
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                            placeholder="New York"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            {userProfile.city || 'Not set'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          State/Province
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                            placeholder="NY"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            {userProfile.state || 'Not set'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          ZIP/Postal Code
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.zip_code}
                            onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                            placeholder="10001"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            {userProfile.zip_code || 'Not set'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Country
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          {userProfile.country || 'United States'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <Card className="shadow-lg border-0">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Account Information
                  </CardTitle>
                  <CardDescription>Your account security and permissions</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</p>
                        <p className="text-gray-900 dark:text-white mt-1">{userProfile.email}</p>
                      </div>
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Role</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {userProfile.role}
                        </Badge>
                      </div>
                      <Shield className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Created</p>
                        <p className="text-gray-900 dark:text-white mt-1">
                          {userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'Unknown'}
                        </p>
                      </div>
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Notification Settings */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>Choose how you want to receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Communication Methods */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Communication Methods</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 w-11 h-6 border-2"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                              <Smartphone className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Receive text messages for urgent updates</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.smsNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 w-11 h-6 border-2"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                              <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Browser Notifications</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Show desktop notifications in your browser</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.browserNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, browserNotifications: checked }))
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 w-11 h-6 border-2"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Job & Tech Related */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Job & Tech Updates</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Job Completion Alerts</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">When technicians complete jobs</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.jobAlerts}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, jobAlerts: checked }))
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 w-11 h-6 border-2"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Tech Status Updates</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">When technicians update their status</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.techUpdates}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, techUpdates: checked }))
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 w-11 h-6 border-2"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                              <CameraIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Photo Approvals</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">When photos need approval or are approved</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.photoApprovals}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, photoApprovals: checked }))
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 w-11 h-6 border-2"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* System & Reports */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">System & Reports</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Critical System Alerts</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Important system notifications</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.criticalAlerts}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, criticalAlerts: checked }))
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 w-11 h-6 border-2"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                              <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">System Alerts</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">General system updates and maintenance</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.systemAlerts}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 w-11 h-6 border-2"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                              <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Weekly Reports</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Weekly summary reports</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.weeklyReports}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 w-11 h-6 border-2"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Marketing & Promotional */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Marketing & Promotional</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                              <MessageSquare className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Marketing Emails</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Product updates and promotional content</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.marketingEmails}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 w-11 h-6 border-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Notification Settings */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={() => {
                          // Save notification settings to API
                          alert('Notification settings saved successfully!');
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Notification Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Other Settings */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      Other Settings
                    </CardTitle>
                    <CardDescription>Additional preferences and security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Language & Region</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Set your language and timezone</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Privacy & Security</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your privacy settings</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
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
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Complete your profile to unlock all features
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Hidden file input for avatar upload */}
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
    </div>
  );
}