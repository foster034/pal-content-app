'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MapPin, ExternalLink, HelpCircle } from 'lucide-react';

interface GMBLocationCardProps {
  franchiseeId: string;
}

export default function GMBLocationCard({ franchiseeId }: GMBLocationCardProps) {
  const [gmbLocationId, setGmbLocationId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGMBLocation();
  }, [franchiseeId]);

  const loadGMBLocation = async () => {
    if (!franchiseeId) return;

    try {
      const response = await fetch(`/api/franchisee-gmb?franchiseeId=${franchiseeId}`);
      const data = await response.json();

      if (response.ok) {
        setGmbLocationId(data.gmb_location_id || '');
      }
    } catch (error) {
      console.error('Error loading GMB location:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGMBLocation = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/franchisee-gmb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          franchiseeId,
          gmb_location_id: gmbLocationId,
        }),
      });

      if (response.ok) {
        toast.success('GMB Location ID saved successfully!');
      } else {
        toast.error('Failed to save GMB Location ID');
      }
    } catch (error) {
      toast.error('Error saving GMB Location ID');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle>Google My Business Location</CardTitle>
            <CardDescription>Connect your GMB location for automated posting</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-2">How to find your GMB Location ID:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Go to <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="underline">business.google.com</a></li>
                <li>Select your business</li>
                <li>Look at the URL in your browser</li>
                <li>Copy the number after <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">/l/</code></li>
                <li>Example: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">business.google.com/posts/l/<strong>12345678901234567890</strong></code></li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gmb-location-id">GMB Location ID</Label>
          <Input
            id="gmb-location-id"
            value={gmbLocationId}
            onChange={(e) => setGmbLocationId(e.target.value)}
            placeholder="e.g., 12345678901234567890"
            className="font-mono"
          />
          <p className="text-xs text-gray-500">
            This allows admins to post approved content directly to your Google Business Profile
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={saveGMBLocation}
            disabled={saving || !gmbLocationId}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {saving ? 'Saving...' : 'Save Location ID'}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://business.google.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open GMB
          </Button>
        </div>

        {gmbLocationId && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-900 dark:text-green-100">
              ✅ Location ID configured! Admins can now post directly to your GMB.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
