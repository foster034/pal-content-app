'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface GMBLocation {
  name: string;
  title?: string;
  address?: string;
}

interface GMBConnectionStatus {
  connected: boolean;
  email?: string;
  locations?: GMBLocation[];
  selectedLocation?: string;
  lastConnected?: string;
}

export default function GMBConnectionCard({ franchiseeId }: { franchiseeId: string }) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<GMBConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Only load if we have a franchisee ID
    if (franchiseeId) {
      loadConnectionStatus();
    } else {
      setLoading(false);
    }

    // Check for OAuth callback success/error
    const gmbConnected = searchParams.get('gmb_connected');
    const gmbError = searchParams.get('gmb_error');

    if (gmbConnected === 'true') {
      alert('✅ Google My Business connected successfully!');
      loadConnectionStatus();
      // Clear the query param
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (gmbError) {
      alert(`❌ Failed to connect Google My Business: ${gmbError}`);
      // Clear the query param
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, franchiseeId]);

  const loadConnectionStatus = async () => {
    try {
      const response = await fetch(`/api/gmb/status?franchisee_id=${franchiseeId}`);
      const data = await response.json();

      if (data.success) {
        setStatus(data.status);
        setSelectedLocation(data.status.selectedLocation || '');
      }
    } catch (error) {
      console.error('Error loading GMB status:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectGMB = async () => {
    if (!franchiseeId) {
      alert('Franchisee ID is required');
      return;
    }

    setConnecting(true);
    try {
      // Redirect to OAuth flow
      window.location.href = `/api/google-my-business/auth?franchisee_id=${franchiseeId}`;
    } catch (error) {
      console.error('Error initiating GMB connection:', error);
      alert('Failed to initiate Google My Business connection');
      setConnecting(false);
    }
  };

  const disconnectGMB = async () => {
    if (!confirm('Are you sure you want to disconnect your Google My Business account?')) {
      return;
    }

    try {
      const response = await fetch('/api/gmb/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ franchisee_id: franchiseeId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Google My Business disconnected successfully');
        setStatus({ connected: false });
        setSelectedLocation('');
      } else {
        alert(`❌ Failed to disconnect: ${data.error}`);
      }
    } catch (error) {
      console.error('Error disconnecting GMB:', error);
      alert('Failed to disconnect Google My Business');
    }
  };

  const saveDefaultLocation = async () => {
    if (!selectedLocation) {
      alert('Please select a location');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/gmb/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          franchisee_id: franchiseeId,
          selected_location_name: selectedLocation,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Default location saved successfully!');
        setStatus((prev) => ({ ...prev, selectedLocation }));
      } else {
        alert(`❌ Failed to save: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Failed to save default location');
    } finally {
      setSaving(false);
    }
  };

  // Don't show anything if no franchisee ID
  if (!franchiseeId) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="text-2xl">🗺️</span>
          Google My Business
        </h3>
        {status.connected && (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm font-medium rounded-full">
            Connected
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Connect your Google My Business account to enable automatic posting of approved marketing content to your business locations.
      </p>

      {status.connected ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>Connected Account:</strong>
            </div>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {status.email || 'Unknown'}
            </div>
          </div>

          {status.locations && status.locations.length > 0 ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Default Posting Location ({status.locations.length} available)</strong>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Select which GMB location admins should post to by default
                </p>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a location --</option>
                  {status.locations.map((location, index) => (
                    <option key={index} value={location.name}>
                      {location.title || location.name}
                      {location.address && ` - ${location.address}`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedLocation !== status.selectedLocation && (
                <button
                  onClick={saveDefaultLocation}
                  disabled={saving || !selectedLocation}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? '💾 Saving...' : '💾 Save Default Location'}
                </button>
              )}

              {status.selectedLocation && (
                <div className="text-xs text-green-600 dark:text-green-400">
                  ✓ Current default: {status.locations.find(l => l.name === status.selectedLocation)?.title || 'Unknown'}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-4">
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ No locations loaded</strong>
                <p className="mt-1 text-xs">
                  Google API is not approved yet (quota = 0). You can manually enter your GMB Location ID to test posting:
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GMB Location ID (for testing)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Format: accounts/ACCOUNT_ID/locations/LOCATION_ID
                </p>
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  placeholder="e.g., accounts/123456789/locations/987654321"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    💡 Find your location ID at <a href="https://business.google.com" target="_blank" className="underline">business.google.com</a> (check URL when viewing your business)
                  </p>
                  <button
                    onClick={() => setSelectedLocation('accounts/demo123456/locations/demo789012')}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    🧪 Use Demo Location ID for Testing
                  </button>
                </div>
              </div>

              {selectedLocation !== status.selectedLocation && selectedLocation && (
                <button
                  onClick={saveDefaultLocation}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? '💾 Saving...' : '💾 Save Test Location ID'}
                </button>
              )}

              {status.selectedLocation && (
                <div className="text-xs text-green-600 dark:text-green-400">
                  ✓ Saved location ID: {status.selectedLocation}
                </div>
              )}
            </div>
          )}

          {status.lastConnected && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last connected: {new Date(status.lastConnected).toLocaleDateString()}
            </div>
          )}

          <button
            onClick={disconnectGMB}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🔌 Disconnect Google My Business
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Benefits of connecting:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Admins can post approved content directly to your GMB account</li>
                <li>Automated marketing content distribution</li>
                <li>Consistent branding across all locations</li>
                <li>Track posting history and engagement</li>
              </ul>
            </div>
          </div>

          <button
            onClick={connectGMB}
            disabled={connecting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {connecting ? (
              <>
                <span className="animate-spin">⏳</span>
                Connecting...
              </>
            ) : (
              <>
                🔗 Connect Google My Business
              </>
            )}
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            You'll be redirected to Google to authorize access
          </div>
        </div>
      )}
    </div>
  );
}
