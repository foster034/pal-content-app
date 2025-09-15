'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { useLogo } from '@/contexts/logo-context';
import { useTable } from '@/contexts/table-context';
import Image from 'next/image';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { mainLogo, setMainLogo, resetLogo } = useLogo();
  const { tableStyle, updateTableStyleProperty } = useTable();
  const [settings, setSettings] = useState({
    siteName: 'PAL Content App',
    siteDescription: 'Your amazing content platform',
    maintenanceMode: false,
    emailNotifications: true,
    pushNotifications: false,
  });

  const [twilioSettings, setTwilioSettings] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
    enabled: false,
    testMode: true,
  });

  const [twilioTesting, setTwilioTesting] = useState({
    testPhoneNumber: '',
    testMessage: 'Test message from Pop-A-Lock Management Portal',
    isSending: false,
  });

  const [consentRecords, setConsentRecords] = useState([]);
  const [loadingConsent, setLoadingConsent] = useState(false);

  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing Twilio configuration on component mount
  useEffect(() => {
    const loadTwilioConfig = async () => {
      try {
        const response = await fetch('/api/twilio/config');
        const data = await response.json();
        
        if (data.success && data.config) {
          setTwilioSettings(prev => ({
            ...prev,
            enabled: data.config.enabled,
            testMode: data.config.testMode,
            phoneNumber: data.config.phoneNumber,
            accountSid: data.config.accountSid,
            // Don't load auth token for security
          }));
        }
      } catch (error) {
        console.error('Error loading Twilio config:', error);
      }
    };

    loadTwilioConfig();
  }, []);

  const loadConsentRecords = async () => {
    setLoadingConsent(true);
    try {
      const response = await fetch('/api/consent');
      const data = await response.json();
      
      if (data.success) {
        setConsentRecords(data.records);
      }
    } catch (error) {
      console.error('Error loading consent records:', error);
    } finally {
      setLoadingConsent(false);
    }
  };

  const handleChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleTwilioChange = (key: string, value: string | boolean) => {
    setTwilioSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleTwilioTestChange = (key: string, value: string | boolean) => {
    setTwilioTesting(prev => ({ ...prev, [key]: value }));
  };


  const testTwilioConnection = async () => {
    if (!twilioSettings.accountSid || !twilioSettings.authToken || !twilioSettings.phoneNumber) {
      alert('Please fill in all Twilio credentials first.');
      return;
    }

    if (!twilioTesting.testPhoneNumber) {
      alert('Please enter a test phone number.');
      return;
    }

    setTwilioTesting(prev => ({ ...prev, isSending: true }));

    try {
      const response = await fetch('/api/twilio/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountSid: twilioSettings.accountSid,
          authToken: twilioSettings.authToken,
          fromNumber: twilioSettings.phoneNumber,
          toNumber: twilioTesting.testPhoneNumber,
          message: twilioTesting.testMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Test message sent successfully! Message SID: ${data.messageSid}`);
      } else {
        alert(`❌ Failed to send test message: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Error testing Twilio connection. Please check your settings.');
    } finally {
      setTwilioTesting(prev => ({ ...prev, isSending: false }));
    }
  };

  const saveTwilioSettings = async () => {
    try {
      const response = await fetch('/api/twilio/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(twilioSettings),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Twilio settings saved successfully!');
      } else {
        alert(`❌ Failed to save Twilio settings: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Error saving Twilio settings.');
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
        setMainLogo(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefault = () => {
    resetLogo();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Main Logo
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                      {mainLogo ? (
                        <Image
                          src={mainLogo}
                          alt="Main Logo Preview"
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
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Upload Logo
                      </button>
                      <button
                        type="button"
                        onClick={resetToDefault}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Reset to Default
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      SVG, PNG, or JPEG. Max 5MB. Recommended: 200x80px
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Description
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maintenance Mode
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enable to temporarily disable site access
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Notifications
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive email notifications for important events
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Push Notifications
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive push notifications on your device
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Table Appearance</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Border Style
              </label>
              <select
                value={tableStyle.borderStyle}
                onChange={(e) => updateTableStyleProperty('borderStyle', e.target.value as any)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No Border</option>
                <option value="minimal">Minimal Border</option>
                <option value="border">Standard Border</option>
                <option value="shadow">Shadow Border</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Corner Radius
              </label>
              <select
                value={tableStyle.cornerRadius}
                onChange={(e) => updateTableStyleProperty('cornerRadius', e.target.value as any)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">Square</option>
                <option value="sm">Small Radius</option>
                <option value="md">Medium Radius</option>
                <option value="lg">Large Radius</option>
                <option value="xl">Extra Large Radius</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background Style
              </label>
              <select
                value={tableStyle.backgroundColor}
                onChange={(e) => updateTableStyleProperty('backgroundColor', e.target.value as any)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="white">White Background</option>
                <option value="gray">Gray Background</option>
                <option value="transparent">Transparent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Header Style
              </label>
              <select
                value={tableStyle.headerStyle}
                onChange={(e) => updateTableStyleProperty('headerStyle', e.target.value as any)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gray">Gray Header</option>
                <option value="dark">Dark Header</option>
                <option value="primary">Primary Color Header</option>
                <option value="minimal">Minimal Header</option>
              </select>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Table style changes apply to all admin tables and are saved automatically.
              </p>
              <button
                onClick={() => {
                  updateTableStyleProperty('borderStyle', 'minimal');
                  updateTableStyleProperty('cornerRadius', 'lg');
                  updateTableStyleProperty('backgroundColor', 'white');
                  updateTableStyleProperty('headerStyle', 'gray');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Twilio SMS Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable SMS Notifications
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Send SMS notifications to franchisees and technicians
              </p>
            </div>
            <input
              type="checkbox"
              checked={twilioSettings.enabled}
              onChange={(e) => handleTwilioChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account SID
              </label>
              <input
                type="text"
                value={twilioSettings.accountSid}
                onChange={(e) => handleTwilioChange('accountSid', e.target.value)}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auth Token
              </label>
              <input
                type="password"
                value={twilioSettings.authToken}
                onChange={(e) => handleTwilioChange('authToken', e.target.value)}
                placeholder="Enter your Auth Token"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Phone Number
              </label>
              <input
                type="tel"
                value={twilioSettings.phoneNumber}
                onChange={(e) => handleTwilioChange('phoneNumber', e.target.value)}
                placeholder="+1234567890"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Test Mode
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enable for testing (logs only)
                </p>
              </div>
              <input
                type="checkbox"
                checked={twilioSettings.testMode}
                onChange={(e) => handleTwilioChange('testMode', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Test SMS Connection</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Phone Number
                </label>
                <input
                  type="tel"
                  value={twilioTesting.testPhoneNumber}
                  onChange={(e) => handleTwilioTestChange('testPhoneNumber', e.target.value)}
                  placeholder="+1234567890"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Message
                </label>
                <input
                  type="text"
                  value={twilioTesting.testMessage}
                  onChange={(e) => handleTwilioTestChange('testMessage', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={testTwilioConnection}
                disabled={twilioTesting.isSending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
              >
                {twilioTesting.isSending ? 'Sending...' : '📱 Send Test SMS'}
              </button>
              <button
                type="button"
                onClick={saveTwilioSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                💾 Save Twilio Settings
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              💡 Tip: Get your credentials from the Twilio Console at console.twilio.com
            </p>
          </div>
        </div>
      </div>

      {/* Consent Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Privacy & Consent Management</h3>
          <button
            onClick={loadConsentRecords}
            disabled={loadingConsent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {loadingConsent ? 'Loading...' : '🔄 Refresh Records'}
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {consentRecords.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {consentRecords.filter((record: any) => record.consentToContact).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Contact Consent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {consentRecords.filter((record: any) => record.consentToShare).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sharing Consent</div>
            </div>
          </div>

          {consentRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">Client</th>
                    <th className="px-4 py-2 text-left">Contact</th>
                    <th className="px-4 py-2 text-center">Consents</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Job ID</th>
                  </tr>
                </thead>
                <tbody>
                  {consentRecords.slice(0, 10).map((record: any) => (
                    <tr key={record.id} className="border-b border-gray-200 dark:border-gray-600">
                      <td className="px-4 py-2 font-medium">{record.clientName}</td>
                      <td className="px-4 py-2 text-xs">
                        {record.clientEmail && <div>{record.clientEmail}</div>}
                        {record.clientPhone && <div>{record.clientPhone}</div>}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center space-x-1">
                          {record.consentToContact && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded" title="Contact Consent">📞</span>
                          )}
                          {record.consentToShare && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded" title="Sharing Consent">📤</span>
                          )}
                          {record.consentToMarketing && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded" title="Marketing Consent">📧</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs">{new Date(record.timestamp).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-xs">{record.jobId || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {consentRecords.length > 10 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Showing first 10 of {consentRecords.length} records
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No consent records found. Records will appear here when clients submit jobs with consent.
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
            <a 
              href="/privacy-policy" 
              target="_blank"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm underline"
            >
              📋 View Privacy Policy
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All consent records are stored securely and can be deleted upon client request for GDPR compliance.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Danger Zone</h3>
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-400">Reset All Settings</h4>
              <p className="text-sm text-red-600 dark:text-red-300">
                This will reset all settings to their default values.
              </p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}