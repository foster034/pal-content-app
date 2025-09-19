'use client';

import { useState, useRef } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { useLogo } from '@/contexts/logo-context';
import Image from 'next/image';

export default function FranchiseeSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { mainLogo, setMainLogo, resetLogo } = useLogo();
  
  const [franchiseeSettings, setFranchiseeSettings] = useState({
    businessName: '',
    franchiseeId: '',
    location: '',
    phone: '',
    email: '',
    website: '',
  });

  const [clientOutreachSettings, setClientOutreachSettings] = useState({
    googleReviewUrl: '',
    businessName: '',
    autoSendReports: true,
    followUpEnabled: true,
    followUpDelay: 48, // hours
    smsTemplate: 'Hi {clientName}! Your Pop-A-Lock service is complete. View your job report: {reportUrl}\n\nWe\'d appreciate a review: {reviewUrl}\n\nReply STOP to opt out.',
    consentRequired: true,
    facebookIntegrationEnabled: false,
    reviewRequestDelay: 2, // hours after job completion
  });

  const [photoSettings, setPhotoSettings] = useState({
    autoApprovePhotos: false,
    autoForwardToAdmin: true,
    requireReview: true,
    emailOnSubmission: true,
    emailOnTechActivity: true,
    emailDailySummary: false,
    notifyPhotoSubmission: true,
    notifyUrgentItems: true,
    weekendNotifications: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    notificationEmail: '',
    phoneNotifications: false,
    notificationPhone: '',
  });

  const [brandingSettings, setBrandingSettings] = useState({
    logo: '',
    primaryColor: '#0066cc',
    secondaryColor: '#00aa44',
    accentColor: '#ff6600',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFranchiseeChange = (key: string, value: string) => {
    setFranchiseeSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleClientOutreachChange = (key: string, value: string | boolean | number) => {
    setClientOutreachSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePhotoSettingsChange = (key: string, value: string | boolean | number) => {
    setPhotoSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleBrandingChange = (key: string, value: string) => {
    setBrandingSettings(prev => ({ ...prev, [key]: value }));
  };

  const validateGoogleReviewUrl = (url: string): boolean => {
    const googleReviewPattern = /^https:\/\/maps\.google\.com\/.*\/@.*\/.*reviews/;
    const googleBusinessPattern = /^https:\/\/maps\.google\.com\/.*\/place\//;
    const googleGPattern = /^https:\/\/g\.page\//;
    
    return googleReviewPattern.test(url) || googleBusinessPattern.test(url) || googleGPattern.test(url);
  };

  const savePhotoSettings = async () => {
    try {
      const response = await fetch('/api/franchisee/photo-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoSettings),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Photo submission settings saved successfully!');
      } else {
        alert(`❌ Failed to save settings: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Error saving photo settings.');
    }
  };

  const saveClientOutreachSettings = async () => {
    if (clientOutreachSettings.googleReviewUrl && !validateGoogleReviewUrl(clientOutreachSettings.googleReviewUrl)) {
      alert('❌ Please enter a valid Google My Business review URL');
      return;
    }

    try {
      const response = await fetch('/api/franchisee/client-outreach/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientOutreachSettings),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Client outreach settings saved successfully!');
      } else {
        alert(`❌ Failed to save settings: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Error saving client outreach settings.');
    }
  };

  const testReviewUrl = () => {
    if (!clientOutreachSettings.googleReviewUrl) {
      alert('Please enter a Google Review URL first.');
      return;
    }

    if (validateGoogleReviewUrl(clientOutreachSettings.googleReviewUrl)) {
      window.open(clientOutreachSettings.googleReviewUrl, '_blank');
    } else {
      alert('❌ Invalid Google Review URL format. Please use a valid Google My Business review link.');
    }
  };

  const saveFranchiseeSettings = async () => {
    try {
      const response = await fetch('/api/franchisee/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(franchiseeSettings),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Franchisee settings saved successfully!');
      } else {
        alert(`❌ Failed to save settings: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Error saving franchisee settings.');
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (SVG, PNG, or JPEG)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setBrandingSettings(prev => ({ ...prev, logo: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Franchisee Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Franchisee Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">🏢 Business Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={franchiseeSettings.businessName}
                onChange={(e) => handleFranchiseeChange('businessName', e.target.value)}
                placeholder="Pop-A-Lock of [Your City]"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Franchisee ID
              </label>
              <input
                type="text"
                value={franchiseeSettings.franchiseeId}
                onChange={(e) => handleFranchiseeChange('franchiseeId', e.target.value)}
                placeholder="PAL-12345"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={franchiseeSettings.location}
                onChange={(e) => handleFranchiseeChange('location', e.target.value)}
                placeholder="City, State"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={franchiseeSettings.phone}
                onChange={(e) => handleFranchiseeChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={franchiseeSettings.email}
                onChange={(e) => handleFranchiseeChange('email', e.target.value)}
                placeholder="your-email@domain.com"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={franchiseeSettings.website}
                onChange={(e) => handleFranchiseeChange('website', e.target.value)}
                placeholder="https://your-website.com"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="pt-4">
              <button
                onClick={saveFranchiseeSettings}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                💾 Save Business Info
              </button>
            </div>
          </div>
        </div>

        {/* Branding Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">🎨 Branding</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                      {brandingSettings.logo ? (
                        <Image
                          src={brandingSettings.logo}
                          alt="Logo Preview"
                          width={80}
                          height={40}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No logo</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".svg,.png,.jpg,.jpeg"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upload Logo
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color
              </label>
              <input
                type="color"
                value={brandingSettings.primaryColor}
                onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secondary Color
              </label>
              <input
                type="color"
                value={brandingSettings.secondaryColor}
                onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Submission Settings - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📸 Job Submission Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure how photo submissions from your technicians are handled and forwarded to the admin marketing team
        </p>

        <div className="space-y-6">
          {/* Auto-Approval Settings */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">🔄 Approval Workflow</h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto-Approve All Photos
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically approve and forward all tech submissions to admin
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={photoSettings.autoApprovePhotos}
                    onChange={(e) => handlePhotoSettingsChange('autoApprovePhotos', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto-Forward to Admin
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically send approved photos to admin marketing team
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={photoSettings.autoForwardToAdmin}
                    onChange={(e) => handlePhotoSettingsChange('autoForwardToAdmin', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Require Manual Review
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      All submissions require your approval before forwarding
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={photoSettings.requireReview}
                    onChange={(e) => handlePhotoSettingsChange('requireReview', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Recommended Setup</h5>
                  <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                    <li>• Enable "Require Manual Review" for quality control</li>
                    <li>• Enable "Auto-Forward to Admin" for approved photos</li>
                    <li>• Keep "Auto-Approve All" disabled unless you trust all techs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">🔔 Notification Preferences</h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email on Photo Submission
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified when techs submit new photos
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={photoSettings.emailOnSubmission}
                    onChange={(e) => handlePhotoSettingsChange('emailOnSubmission', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email on Tech Activity
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified of job completions and updates
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={photoSettings.emailOnTechActivity}
                    onChange={(e) => handlePhotoSettingsChange('emailOnTechActivity', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Daily Summary Email
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive daily digest of all photo submissions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={photoSettings.emailDailySummary}
                    onChange={(e) => handlePhotoSettingsChange('emailDailySummary', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Weekend Notifications
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive notifications on weekends
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={photoSettings.weekendNotifications}
                    onChange={(e) => handlePhotoSettingsChange('weekendNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quiet Hours Start
                  </label>
                  <input
                    type="time"
                    value={photoSettings.quietHoursStart}
                    onChange={(e) => handlePhotoSettingsChange('quietHoursStart', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quiet Hours End
                  </label>
                  <input
                    type="time"
                    value={photoSettings.quietHoursEnd}
                    onChange={(e) => handlePhotoSettingsChange('quietHoursEnd', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notification Email
                  </label>
                  <input
                    type="email"
                    value={photoSettings.notificationEmail}
                    onChange={(e) => handlePhotoSettingsChange('notificationEmail', e.target.value)}
                    placeholder="your-email@domain.com"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave blank to use your account email
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={savePhotoSettings}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                💾 Save Photo Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Client Outreach & Google My Business - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">🎯 Client Outreach & Google My Business</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure automated client communication and review collection settings for your franchise
        </p>
        
        <div className="space-y-6">
          {/* Google Review URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Google My Business Review URL *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={clientOutreachSettings.googleReviewUrl}
                onChange={(e) => handleClientOutreachChange('googleReviewUrl', e.target.value)}
                placeholder="https://maps.google.com/place/[your-business]/reviews or https://g.page/[your-business]/review"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={testReviewUrl}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                🔗 Test URL
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              💡 Find this in your Google My Business dashboard or Google Maps listing
            </p>
          </div>

          {/* Automation Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">📧 Automation Settings</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto-Send Job Reports
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically send completion reports to clients
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={clientOutreachSettings.autoSendReports}
                    onChange={(e) => handleClientOutreachChange('autoSendReports', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Follow-Up Reminders
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Send reminder if no review received
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={clientOutreachSettings.followUpEnabled}
                    onChange={(e) => handleClientOutreachChange('followUpEnabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Require Client Consent
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Must get permission before messaging
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={clientOutreachSettings.consentRequired}
                    onChange={(e) => handleClientOutreachChange('consentRequired', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review Request Delay (hours)
                  </label>
                  <select
                    value={clientOutreachSettings.reviewRequestDelay}
                    onChange={(e) => handleClientOutreachChange('reviewRequestDelay', parseInt(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Immediately</option>
                    <option value={1}>1 hour after completion</option>
                    <option value={2}>2 hours after completion</option>
                    <option value={4}>4 hours after completion</option>
                    <option value={24}>24 hours after completion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Follow-Up Delay (hours)
                  </label>
                  <select
                    value={clientOutreachSettings.followUpDelay}
                    onChange={(e) => handleClientOutreachChange('followUpDelay', parseInt(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={24}>24 hours</option>
                    <option value={48}>48 hours</option>
                    <option value={72}>72 hours</option>
                    <option value={168}>1 week</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SMS Template */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">📱 SMS Message Template</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Message Template
              </label>
              <textarea
                value={clientOutreachSettings.smsTemplate}
                onChange={(e) => handleClientOutreachChange('smsTemplate', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <p className="mb-1">Available variables:</p>
                <div className="flex flex-wrap gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{"{clientName}"}</code>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{"{reportUrl}"}</code>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{"{reviewUrl}"}</code>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{"{businessName}"}</code>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{"{techName}"}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Facebook Integration (Coming Soon) */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">📘 Facebook Integration (Coming Soon)</h4>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Enable Facebook Messaging
                  </label>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Automatically find clients on Facebook and send job reports
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={clientOutreachSettings.facebookIntegrationEnabled}
                  onChange={(e) => handleClientOutreachChange('facebookIntegrationEnabled', e.target.checked)}
                  disabled={true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded opacity-50"
                />
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                🚀 Phase 2 feature: Auto-discover clients on Facebook and send professional job completion reports with review links
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={saveClientOutreachSettings}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                💾 Save Outreach Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}