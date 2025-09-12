'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TechProfile {
  id: number;
  name: string;
  avatar: string;
  title: string;
  location: string;
  loginCode: string;
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

const currentTech: TechProfile = {
  id: 1,
  name: 'Alex Rodriguez',
  avatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg',
  title: 'Senior Locksmith',
  location: 'Dallas, TX',
  loginCode: generateLoginCode(),
  stats: {
    level: 15,
    totalJobs: 156,
    approvedPics: 142,
    streak: 12,
    badges: ['🏆 Master Tech', '🔥 Hot Streak', '📸 Photo Pro', '⚡ Speed Demon']
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
    sharePhotos: false,
    autoLoginEnabled: true
  }
};

// Sample job templates for demo
const jobTemplates = [
  {
    type: 'commercial',
    templates: [
      'Just completed a master key installation at {location}! 🏢 All access points secured and tested.',
      'Finished upgrading the access control system at {location}. Security level: Enhanced! 🔒',
      'Commercial rekey completed at {location}. Building security is now up to date! ✅'
    ]
  },
  {
    type: 'residential',
    templates: [
      'Home rekey completed for a customer in {location}! 🏠 Fresh keys, fresh peace of mind.',
      'Smart lock installation finished at {location}! Welcome to the future of home security! 🚪🔐',
      'Lock repair completed in {location}. Another satisfied homeowner! 😊'
    ]
  },
  {
    type: 'automotive',
    templates: [
      'Car lockout resolved in {location}! 🚗 Customer back on the road in under 30 minutes.',
      'Key fob programming completed for {vehicle} in {location}. Technology at work! 🔑',
      'Ignition repair finished in {location}. Smooth start every time! 🚗✨'
    ]
  },
  {
    type: 'roadside',
    templates: [
      'Emergency roadside assistance completed in {location}! 🚨 Another driver saved!',
      'Lockout service provided in {location}. Fast response, happy customer! ⚡',
      'Roadside emergency resolved in {location}. Always here when you need us! 💪'
    ]
  }
];

export default function TechProfile() {
  const [profile, setProfile] = useState<TechProfile>(currentTech);
  const [showPreview, setShowPreview] = useState(false);

  const refreshLoginCode = () => {
    const newCode = generateLoginCode();
    setProfile(prev => ({
      ...prev,
      loginCode: newCode
    }));
  };

  const copyLoginCode = () => {
    navigator.clipboard.writeText(profile.loginCode);
    alert('Login code copied to clipboard!');
  };

  // Auto-refresh login code every 24 hours if enabled
  useEffect(() => {
    if (!profile.settings.autoLoginEnabled) return;

    const interval = setInterval(() => {
      refreshLoginCode();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    return () => clearInterval(interval);
  }, [profile.settings.autoLoginEnabled]);

  const updateSetting = (key: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const updateJobTypeSetting = (jobType: string, value: boolean) => {
    setProfile(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        shareJobTypes: {
          ...prev.settings.shareJobTypes,
          [jobType]: value
        }
      }
    }));
  };

  const generateJobPost = (jobType: string, location = 'Dallas, TX', vehicle = '') => {
    const typeTemplates = jobTemplates.find(t => t.type === jobType)?.templates || [];
    const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
    return template
      .replace('{location}', location)
      .replace('{vehicle}', vehicle || 'customer vehicle');
  };

  const simulateJobCompletion = () => {
    const jobTypes = ['commercial', 'residential', 'automotive', 'roadside'];
    const enabledJobTypes = jobTypes.filter(type => 
      profile.settings.shareJobTypes[type as keyof typeof profile.settings.shareJobTypes]
    );
    
    if (enabledJobTypes.length === 0) {
      alert('No job types enabled for sharing. Please enable at least one job type.');
      return;
    }
    
    const randomJobType = enabledJobTypes[Math.floor(Math.random() * enabledJobTypes.length)];
    const locations = ['Downtown Dallas', 'North Dallas', 'East Dallas', 'West Dallas', 'Uptown Dallas'];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    const jobPost = generateJobPost(randomJobType, randomLocation);
    
    // This would normally send to the chat API
    console.log('Job completed! Auto-sharing to group chat:', jobPost);
    alert(`Job shared to group chat:\n\n"${jobPost}"\n\nIn a real implementation, this would appear in the Tech Hub group chat automatically.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tech Profile Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your profile and sharing preferences</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => window.open('/tech-hub', '_blank')}
              variant="outline"
              size="sm"
            >
              💬 Tech Hub
            </Button>
            <Button 
              onClick={() => window.history.back()}
              variant="default"
              size="sm"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{profile.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{profile.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{profile.location}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">L{profile.stats.level}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Level</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{profile.stats.totalJobs}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Jobs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{profile.stats.streak}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{Math.round((profile.stats.approvedPics / profile.stats.totalJobs) * 100)}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Approval</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Badges</h4>
                <div className="space-y-1">
                  {profile.stats.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary" className="text-xs mr-1">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Login Code Section */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Auto Login Code</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={profile.settings.autoLoginEnabled}
                      onChange={(e) => updateSetting('autoLoginEnabled', e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {profile.settings.autoLoginEnabled && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use this code for quick login on mobile devices or shared terminals
                    </p>
                    
                    <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Code</div>
                        <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                          {profile.loginCode}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          onClick={copyLoginCode}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Copy
                        </Button>
                        <Button
                          onClick={refreshLoginCode}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          New
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      💡 Code expires every 24 hours for security. Click "New" to generate a fresh code anytime.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Auto-Share Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Job Sharing Settings</CardTitle>
              <CardDescription>
                Configure what gets automatically shared to the team group chat when you complete jobs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Auto-Share Job Completions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically post to group chat when you finish a job
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={profile.settings.autoShareJobs}
                    onChange={(e) => updateSetting('autoShareJobs', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {profile.settings.autoShareJobs && (
                <>
                  {/* Job Types */}
                  <div>
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Share These Job Types</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(profile.settings.shareJobTypes).map(([jobType, enabled]) => (
                        <label key={jobType} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => updateJobTypeSetting(jobType, e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {jobType} {jobType === 'commercial' && '🏢'} 
                            {jobType === 'residential' && '🏠'}
                            {jobType === 'automotive' && '🚗'}
                            {jobType === 'roadside' && '🚨'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div>
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Additional Options</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.settings.shareJobDetails}
                          onChange={(e) => updateSetting('shareJobDetails', e.target.checked)}
                          className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Include job details in posts
                        </span>
                      </label>

                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.settings.sharePhotos}
                          onChange={(e) => updateSetting('sharePhotos', e.target.checked)}
                          className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Share job photos (when available)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Preview</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? 'Hide' : 'Show'} Examples
                      </Button>
                    </div>

                    {showPreview && (
                      <div className="space-y-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Example auto-posts:</p>
                        {Object.entries(profile.settings.shareJobTypes)
                          .filter(([_, enabled]) => enabled)
                          .map(([jobType]) => (
                            <div key={jobType} className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 p-2 rounded">
                              "{generateJobPost(jobType)}"
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>

                  {/* Test Button */}
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={simulateJobCompletion}
                      className="w-full"
                      disabled={!Object.values(profile.settings.shareJobTypes).some(Boolean)}
                    >
                      🧪 Test Job Completion Share
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Simulates completing a job and sharing it to the group chat
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}