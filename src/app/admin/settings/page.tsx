'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Settings, Volume2, Play, Pause, Download, RefreshCw, Save, TestTube, Image, Upload, Monitor,
  Sparkles, Camera, Mail, Bell, Shield, Database, Globe, Lock, Key, Smartphone, MessageSquare,
  AlertTriangle, CheckCircle, Info, Zap, Cloud, Wifi, HelpCircle, ChevronRight, ExternalLink,
  Activity, Server, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { ElevenLabsVoice, ELEVEN_LABS_MODELS } from '@/lib/eleven-labs';

export default function AdminSettingsPage() {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [testText, setTestText] = useState('Hello! This is a test of the text-to-speech system.');
  const [activeTab, setActiveTab] = useState('text-to-speech');

  // TTS Configuration State
  const [ttsConfig, setTtsConfig] = useState({
    defaultVoiceId: '',
    model: ELEVEN_LABS_MODELS.MULTILINGUAL_V2,
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true,
    enabled: true,
  });

  // Login Screen Configuration
  const [loginConfig, setLoginConfig] = useState({
    imageType: 'static',
    staticImageUrl: '/login-image.jpg',
    showLatestJobs: false,
    jobPhotoCount: 5,
    headerTitle: 'Welcome back to Pop-A-Lock',
    headerSubtitle: 'Build your business efficiently with our powerful management platform.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginButtonText: 'Log in',
    forgotPasswordText: 'Forgot password?',
    signupText: "Don't have an account?",
    signupLinkText: 'Sign up',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    jobAlerts: true,
    systemAlerts: true,
    weeklyReports: true,
    criticalAlerts: true,
  });

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tts/voices');
      if (response.ok) {
        const data = await response.json();
        setVoices(data.voices || []);

        if (data.voices && data.voices.length > 0 && !ttsConfig.defaultVoiceId) {
          setTtsConfig(prev => ({ ...prev, defaultVoiceId: data.voices[0].voice_id }));
        }
      } else {
        toast.error('Error fetching voices');
      }
    } catch (error) {
      toast.error('Error fetching voices');
    } finally {
      setLoading(false);
    }
  };

  const testVoice = async () => {
    if (!testText.trim()) {
      toast.error('Please enter test text');
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlaying(false);
    }

    setTesting(true);
    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText,
          voiceId: ttsConfig.defaultVoiceId,
          model: ttsConfig.model,
          voice_settings: {
            stability: ttsConfig.stability,
            similarity_boost: ttsConfig.similarityBoost,
            style: ttsConfig.style,
            use_speaker_boost: ttsConfig.useSpeakerBoost,
          },
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onplay = () => setPlaying(true);
        audio.onpause = () => setPlaying(false);
        audio.onended = () => {
          setPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
        };

        setCurrentAudio(audio);
        await audio.play();
        toast.success('Voice test generated successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate voice test');
      }
    } catch (error) {
      toast.error('Error testing voice');
    } finally {
      setTesting(false);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlaying(false);
    }
  };

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/login-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginConfig),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const getVoiceName = (voiceId: string) => {
    const voice = voices.find(v => v.voice_id === voiceId);
    return voice ? voice.name : 'Unknown Voice';
  };

  const tabs = [
    { id: 'text-to-speech', label: 'Text-to-Speech', icon: Volume2 },
    { id: 'login-screen', label: 'Login Screen', icon: Monitor },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'general', label: 'General', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section with Profile Style */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Settings
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Configure system-wide settings and integrations
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchVoices} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-6 py-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Text-to-Speech Settings */}
            {activeTab === 'text-to-speech' && (
              <>
                <Card className="shadow-lg border-0">
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle>Eleven Labs Configuration</CardTitle>
                        <CardDescription>Configure text-to-speech settings using Eleven Labs API</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="tts-enabled">Enable Text-to-Speech</Label>
                        <p className="text-sm text-gray-500">Allow users to generate audio from text content</p>
                      </div>
                      <Switch
                        id="tts-enabled"
                        checked={ttsConfig.enabled}
                        onCheckedChange={(checked) =>
                          setTtsConfig(prev => ({ ...prev, enabled: checked }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="voice-select">Default Voice</Label>
                        <Select
                          value={ttsConfig.defaultVoiceId}
                          onValueChange={(value) =>
                            setTtsConfig(prev => ({ ...prev, defaultVoiceId: value }))
                          }
                        >
                          <SelectTrigger id="voice-select" className="mt-2">
                            <SelectValue placeholder="Select a voice..." />
                          </SelectTrigger>
                          <SelectContent>
                            {voices.map((voice) => (
                              <SelectItem key={voice.voice_id} value={voice.voice_id}>
                                {voice.name} {voice.category && `(${voice.category})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {ttsConfig.defaultVoiceId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Selected: {getVoiceName(ttsConfig.defaultVoiceId)}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="model-select">AI Model</Label>
                        <Select
                          value={ttsConfig.model}
                          onValueChange={(value) =>
                            setTtsConfig(prev => ({ ...prev, model: value }))
                          }
                        >
                          <SelectTrigger id="model-select" className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ELEVEN_LABS_MODELS.MULTILINGUAL_V2}>
                              Multilingual V2 (Recommended)
                            </SelectItem>
                            <SelectItem value={ELEVEN_LABS_MODELS.MULTILINGUAL_V1}>
                              Multilingual V1
                            </SelectItem>
                            <SelectItem value={ELEVEN_LABS_MODELS.ENGLISH_V1}>
                              English V1
                            </SelectItem>
                            <SelectItem value={ELEVEN_LABS_MODELS.TURBO_V2}>
                              Turbo V2 (Fastest)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader className="border-b">
                    <CardTitle>Voice Settings</CardTitle>
                    <CardDescription>Fine-tune voice characteristics</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Stability</Label>
                        <span className="text-sm text-gray-500">{ttsConfig.stability.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[ttsConfig.stability]}
                        onValueChange={([value]) =>
                          setTtsConfig(prev => ({ ...prev, stability: value }))
                        }
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher values make output more stable but less expressive</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Similarity Boost</Label>
                        <span className="text-sm text-gray-500">{ttsConfig.similarityBoost.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[ttsConfig.similarityBoost]}
                        onValueChange={([value]) =>
                          setTtsConfig(prev => ({ ...prev, similarityBoost: value }))
                        }
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enhances similarity to the original voice</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Style</Label>
                        <span className="text-sm text-gray-500">{ttsConfig.style.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[ttsConfig.style]}
                        onValueChange={([value]) =>
                          setTtsConfig(prev => ({ ...prev, style: value }))
                        }
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Adjusts speaking style and emotion</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="speaker-boost">Speaker Boost</Label>
                        <p className="text-sm text-gray-500">Enhance audio clarity and volume</p>
                      </div>
                      <Switch
                        id="speaker-boost"
                        checked={ttsConfig.useSpeakerBoost}
                        onCheckedChange={(checked) =>
                          setTtsConfig(prev => ({ ...prev, useSpeakerBoost: checked }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader className="border-b">
                    <CardTitle>Voice Test</CardTitle>
                    <CardDescription>Test your voice settings with sample text</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor="test-text">Test Text</Label>
                      <Input
                        id="test-text"
                        value={testText}
                        onChange={(e) => setTestText(e.target.value)}
                        placeholder="Enter text to test..."
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={testVoice}
                        disabled={testing || !ttsConfig.defaultVoiceId}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {testing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Test Voice
                          </>
                        )}
                      </Button>
                      {playing && (
                        <Button variant="outline" onClick={stopAudio}>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Login Screen Settings */}
            {activeTab === 'login-screen' && (
              <Card className="shadow-lg border-0">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Monitor className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle>Login Page Configuration</CardTitle>
                      <CardDescription>Customize the login experience for your users</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <Label htmlFor="header-title">Header Title</Label>
                    <Input
                      id="header-title"
                      value={loginConfig.headerTitle}
                      onChange={(e) =>
                        setLoginConfig(prev => ({ ...prev, headerTitle: e.target.value }))
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="header-subtitle">Header Subtitle</Label>
                    <Input
                      id="header-subtitle"
                      value={loginConfig.headerSubtitle}
                      onChange={(e) =>
                        setLoginConfig(prev => ({ ...prev, headerSubtitle: e.target.value }))
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bg-image">Background Image URL</Label>
                    <Input
                      id="bg-image"
                      value={loginConfig.staticImageUrl}
                      onChange={(e) =>
                        setLoginConfig(prev => ({ ...prev, staticImageUrl: e.target.value }))
                      }
                      className="mt-2"
                      placeholder="/login-bg.jpg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-jobs">Show Latest Jobs</Label>
                      <p className="text-sm text-gray-500">Display recent job photos on login page</p>
                    </div>
                    <Switch
                      id="show-jobs"
                      checked={loginConfig.showLatestJobs}
                      onCheckedChange={(checked) =>
                        setLoginConfig(prev => ({ ...prev, showLatestJobs: checked }))
                      }
                    />
                  </div>

                  {loginConfig.showLatestJobs && (
                    <div>
                      <Label htmlFor="job-count">Number of Job Photos</Label>
                      <Input
                        id="job-count"
                        type="number"
                        value={loginConfig.jobPhotoCount}
                        onChange={(e) =>
                          setLoginConfig(prev => ({ ...prev, jobPhotoCount: parseInt(e.target.value) }))
                        }
                        className="mt-2"
                        min="1"
                        max="20"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <Card className="shadow-lg border-0">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle>Email Configuration</CardTitle>
                      <CardDescription>Configure email delivery settings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Email Settings</h3>
                    <p className="text-gray-500">Email configuration will be available in a future update.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <Card className="shadow-lg border-0">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Configure how and when notifications are sent</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">Notification Types</h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="job-alerts">Job Alerts</Label>
                          <p className="text-sm text-gray-500">New job submissions and updates</p>
                        </div>
                        <Switch
                          id="job-alerts"
                          checked={notificationSettings.jobAlerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, jobAlerts: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="system-alerts">System Alerts</Label>
                          <p className="text-sm text-gray-500">Important system notifications</p>
                        </div>
                        <Switch
                          id="system-alerts"
                          checked={notificationSettings.systemAlerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="weekly-reports">Weekly Reports</Label>
                          <p className="text-sm text-gray-500">Weekly activity summaries</p>
                        </div>
                        <Switch
                          id="weekly-reports"
                          checked={notificationSettings.weeklyReports}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="critical-alerts">Critical Alerts</Label>
                          <p className="text-sm text-gray-500">Urgent system issues only</p>
                        </div>
                        <Switch
                          id="critical-alerts"
                          checked={notificationSettings.criticalAlerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, criticalAlerts: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* General Settings */}
            {activeTab === 'general' && (
              <Card className="shadow-lg border-0">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>Configure basic system preferences</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">General Settings</h3>
                    <p className="text-gray-500">Additional system settings will be available in a future update.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Help Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check out our documentation for detailed information about each setting.
                </p>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Documentation
                </Button>
              </CardContent>
            </Card>

            {/* System Info Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Version</span>
                  <Badge variant="secondary">v2.4.1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Environment</span>
                  <Badge variant="outline">Production</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Database</span>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">API Status</span>
                  <Badge variant="outline" className="text-green-600">
                    <Activity className="w-3 h-3 mr-1" />
                    Operational
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Server className="w-4 h-4 mr-2" />
                  View Logs
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Settings
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Cloud className="w-4 h-4 mr-2" />
                  Backup Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}