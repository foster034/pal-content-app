'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Settings, Volume2, Play, Pause, Download, RefreshCw, Save, TestTube, Image, Upload, Monitor, Sparkles, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { ElevenLabsVoice, ELEVEN_LABS_MODELS } from '@/lib/eleven-labs';

export default function AdminSettingsPage() {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

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
    imageType: 'static', // 'static' or 'dynamic'
    staticImageUrl: '/login-image.jpg',
    showLatestJobs: false,
    jobPhotoCount: 5,
    // Text customization
    headerTitle: 'Welcome back to Pop-A-Lock',
    headerSubtitle: 'Build your business efficiently with our powerful management platform.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginButtonText: 'Log in',
    forgotPasswordText: 'Forgot password?',
    signupText: "Don't have an account?",
    signupLinkText: 'Sign up',
    googleButtonText: 'Continue with Google',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const [testText, setTestText] = useState(
    "Welcome to Pop-A-Lock! We're here to help with all your locksmith needs."
  );

  useEffect(() => {
    fetchVoices();
    fetchLoginSettings();
  }, []);

  const fetchLoginSettings = async () => {
    try {
      const response = await fetch('/api/login-settings');

      if (!response.ok) {
        console.error('Failed to fetch login settings:', response.status);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return;
      }

      const data = await response.json();
      setLoginConfig(data);
    } catch (error) {
      console.error('Error fetching login settings:', error);
    }
  };

  const fetchVoices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tts/voices');
      const data = await response.json();

      if (response.ok) {
        setVoices(data.voices);
        if (data.voices.length > 0 && !ttsConfig.defaultVoiceId) {
          setTtsConfig(prev => ({ ...prev, defaultVoiceId: data.voices[0].voice_id }));
        }
      } else {
        toast.error('Failed to fetch voices');
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
      // Save login settings
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

  const getVoiceCategory = (voiceId: string) => {
    const voice = voices.find(v => v.voice_id === voiceId);
    return voice ? voice.category : '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and integrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVoices}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={saveSettings}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tts">Text-to-Speech</TabsTrigger>
          <TabsTrigger value="login">Login Screen</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        {/* Text-to-Speech Settings */}
        <TabsContent value="tts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Eleven Labs Configuration
              </CardTitle>
              <CardDescription>
                Configure text-to-speech settings using Eleven Labs API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable TTS */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Text-to-Speech</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to generate audio from text content
                  </p>
                </div>
                <Switch
                  checked={ttsConfig.enabled}
                  onCheckedChange={(checked) => setTtsConfig(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <Separator />

              {/* Voice Selection */}
              <div className="space-y-3">
                <Label className="text-base">Default Voice</Label>
                <Select
                  value={ttsConfig.defaultVoiceId}
                  onValueChange={(value) => setTtsConfig(prev => ({ ...prev, defaultVoiceId: value }))}
                  disabled={loading || !ttsConfig.enabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.voice_id} value={voice.voice_id}>
                        <div className="flex items-center gap-2">
                          <span>{voice.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {voice.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {ttsConfig.defaultVoiceId && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {getVoiceName(ttsConfig.defaultVoiceId)} ({getVoiceCategory(ttsConfig.defaultVoiceId)})
                  </p>
                )}
              </div>

              {/* Model Selection */}
              <div className="space-y-3">
                <Label className="text-base">AI Model</Label>
                <Select
                  value={ttsConfig.model}
                  onValueChange={(value) => setTtsConfig(prev => ({ ...prev, model: value as any }))}
                  disabled={!ttsConfig.enabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ELEVEN_LABS_MODELS.MULTILINGUAL_V2}>
                      Multilingual V2 (Recommended)
                    </SelectItem>
                    <SelectItem value={ELEVEN_LABS_MODELS.MULTILINGUAL_V1}>
                      Multilingual V1
                    </SelectItem>
                    <SelectItem value={ELEVEN_LABS_MODELS.MONOLINGUAL_V1}>
                      Monolingual V1
                    </SelectItem>
                    <SelectItem value={ELEVEN_LABS_MODELS.TURBO_V2}>
                      Turbo V2 (Fastest)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Settings */}
              <div className="space-y-6">
                <Label className="text-base">Voice Settings</Label>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Stability</Label>
                      <span className="text-sm text-muted-foreground">{ttsConfig.stability}</span>
                    </div>
                    <Slider
                      value={[ttsConfig.stability]}
                      onValueChange={([value]) => setTtsConfig(prev => ({ ...prev, stability: value }))}
                      max={1}
                      min={0}
                      step={0.01}
                      disabled={!ttsConfig.enabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values make output more stable but less expressive
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Similarity Boost</Label>
                      <span className="text-sm text-muted-foreground">{ttsConfig.similarityBoost}</span>
                    </div>
                    <Slider
                      value={[ttsConfig.similarityBoost]}
                      onValueChange={([value]) => setTtsConfig(prev => ({ ...prev, similarityBoost: value }))}
                      max={1}
                      min={0}
                      step={0.01}
                      disabled={!ttsConfig.enabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enhances similarity to the original voice
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Style</Label>
                      <span className="text-sm text-muted-foreground">{ttsConfig.style}</span>
                    </div>
                    <Slider
                      value={[ttsConfig.style]}
                      onValueChange={([value]) => setTtsConfig(prev => ({ ...prev, style: value }))}
                      max={1}
                      min={0}
                      step={0.01}
                      disabled={!ttsConfig.enabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      Controls the stylistic expression of the voice
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Speaker Boost</Label>
                      <p className="text-xs text-muted-foreground">
                        Enhances speaker similarity for better voice cloning
                      </p>
                    </div>
                    <Switch
                      checked={ttsConfig.useSpeakerBoost}
                      onCheckedChange={(checked) => setTtsConfig(prev => ({ ...prev, useSpeakerBoost: checked }))}
                      disabled={!ttsConfig.enabled}
                    />
                  </div>
                </div>
              </div>

              {/* Voice Testing */}
              <Separator />

              <div className="space-y-4">
                <Label className="text-base">Voice Testing</Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="test-text" className="text-sm">Test Text</Label>
                    <textarea
                      id="test-text"
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      className="w-full mt-1 p-3 border rounded-md resize-none"
                      rows={3}
                      maxLength={500}
                      disabled={!ttsConfig.enabled}
                      placeholder="Enter text to test the voice..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {testText.length}/500 characters
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={testVoice}
                      disabled={testing || !ttsConfig.enabled || !ttsConfig.defaultVoiceId || !testText.trim()}
                      size="sm"
                    >
                      {testing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-4 w-4 mr-2" />
                          Test Voice
                        </>
                      )}
                    </Button>

                    {playing && (
                      <Button
                        onClick={stopAudio}
                        variant="outline"
                        size="sm"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login Screen Settings */}
        <TabsContent value="login" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Monitor className="h-5 w-5 text-blue-600" />
                    </div>
                    Login Screen Configuration
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Customize the appearance of the login page
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/auth/login', '_blank')}
                  className="gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Image Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Login Screen Display</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label
                    htmlFor="static-image"
                    className={`relative flex cursor-pointer rounded-lg border-2 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                      loginConfig.imageType === 'static'
                        ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      id="static-image"
                      name="imageType"
                      value="static"
                      checked={loginConfig.imageType === 'static'}
                      onChange={(e) => setLoginConfig(prev => ({ ...prev, imageType: e.target.value }))}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                        <Image className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">
                          Static Image
                        </span>
                        <span className="block text-sm text-gray-500">
                          Use a single custom image
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    htmlFor="dynamic-photos"
                    className={`relative flex cursor-pointer rounded-lg border-2 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                      loginConfig.imageType === 'dynamic'
                        ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      id="dynamic-photos"
                      name="imageType"
                      value="dynamic"
                      checked={loginConfig.imageType === 'dynamic'}
                      onChange={(e) => setLoginConfig(prev => ({ ...prev, imageType: e.target.value }))}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">
                          Dynamic Slideshow
                        </span>
                        <span className="block text-sm text-gray-500">
                          Latest tech job photos
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <Separator />

              {/* Static Image Upload */}
              {loginConfig.imageType === 'static' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Camera className="h-5 w-5 text-gray-600" />
                    <Label className="text-base font-semibold">Login Screen Image</Label>
                  </div>
                  <div className="space-y-4">
                    {/* Current Image Preview */}
                    <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden shadow-inner border-2 border-dashed border-gray-300">
                      {loginConfig.staticImageUrl ? (
                        <>
                          <img
                            src={loginConfig.staticImageUrl}
                            alt="Login screen"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setLoginConfig(prev => ({ ...prev, staticImageUrl: '' }))}
                              className="bg-white/90 backdrop-blur-sm hover:bg-white"
                            >
                              Remove
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <Upload className="h-16 w-16 mb-4 text-gray-300" />
                          <p className="text-lg font-medium text-gray-600">No image uploaded</p>
                          <p className="text-sm text-gray-500 mt-1">Choose a file or drag and drop</p>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label
                          htmlFor="image-upload"
                          className="flex items-center justify-center px-6 py-3 border-2 border-blue-500 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
                        >
                          <Upload className="h-5 w-5 mr-2" />
                          Choose Image
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingImage(true);
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setLoginConfig(prev => ({
                                    ...prev,
                                    staticImageUrl: event.target?.result as string
                                  }));
                                  setUploadingImage(false);
                                  toast.success('Image uploaded successfully');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            disabled={uploadingImage}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      {uploadingImage && (
                        <div className="flex items-center text-sm text-gray-500">
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900">
                        <strong>Tip:</strong> Use a high-quality image (1920x1080 pixels) that represents your brand.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Photos Settings */}
              {loginConfig.imageType === 'dynamic' && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <Label className="text-base font-semibold">Dynamic Photo Settings</Label>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Number of Photos</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-purple-600">{loginConfig.jobPhotoCount}</span>
                            <span className="text-sm text-gray-500">photos</span>
                          </div>
                        </div>
                        <Slider
                          value={[loginConfig.jobPhotoCount]}
                          onValueChange={([value]) => setLoginConfig(prev => ({ ...prev, jobPhotoCount: value }))}
                          max={20}
                          min={3}
                          step={1}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>3</span>
                          <span>20</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-600">
                          Display the latest <strong>{loginConfig.jobPhotoCount}</strong> job photos from technicians
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">i</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-purple-900 font-medium">How it works</p>
                        <p className="text-sm text-purple-800 mt-1">
                          The login page will showcase recent work from your technicians with an automatic slideshow that rotates every 5 seconds.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Text Customization */}
              <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                    <span className="text-2xl">✏️</span>
                  </div>
                  <Label className="text-base font-semibold">Text Customization</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Header Title */}
                  <div className="space-y-2">
                    <Label htmlFor="headerTitle" className="text-sm font-medium">Main Title</Label>
                    <Input
                      id="headerTitle"
                      value={loginConfig.headerTitle}
                      onChange={(e) => setLoginConfig(prev => ({ ...prev, headerTitle: e.target.value }))}
                      placeholder="Welcome back to Pop-A-Lock"
                      className="bg-white"
                    />
                  </div>

                  {/* Header Subtitle */}
                  <div className="space-y-2">
                    <Label htmlFor="headerSubtitle" className="text-sm font-medium">Subtitle</Label>
                    <Input
                      id="headerSubtitle"
                      value={loginConfig.headerSubtitle}
                      onChange={(e) => setLoginConfig(prev => ({ ...prev, headerSubtitle: e.target.value }))}
                      placeholder="Build your business efficiently..."
                      className="bg-white"
                    />
                  </div>

                  {/* Email Label */}
                  <div className="space-y-2">
                    <Label htmlFor="emailLabel" className="text-sm font-medium">Email Field Label</Label>
                    <Input
                      id="emailLabel"
                      value={loginConfig.emailLabel}
                      onChange={(e) => setLoginConfig(prev => ({ ...prev, emailLabel: e.target.value }))}
                      placeholder="Email"
                      className="bg-white"
                    />
                  </div>

                  {/* Password Label */}
                  <div className="space-y-2">
                    <Label htmlFor="passwordLabel" className="text-sm font-medium">Password Field Label</Label>
                    <Input
                      id="passwordLabel"
                      value={loginConfig.passwordLabel}
                      onChange={(e) => setLoginConfig(prev => ({ ...prev, passwordLabel: e.target.value }))}
                      placeholder="Password"
                      className="bg-white"
                    />
                  </div>

                  {/* Login Button Text */}
                  <div className="space-y-2">
                    <Label htmlFor="loginButtonText" className="text-sm font-medium">Login Button Text</Label>
                    <Input
                      id="loginButtonText"
                      value={loginConfig.loginButtonText}
                      onChange={(e) => setLoginConfig(prev => ({ ...prev, loginButtonText: e.target.value }))}
                      placeholder="Log in"
                      className="bg-white"
                    />
                  </div>

                  {/* Forgot Password Text */}
                  <div className="space-y-2">
                    <Label htmlFor="forgotPasswordText" className="text-sm font-medium">Forgot Password Link</Label>
                    <Input
                      id="forgotPasswordText"
                      value={loginConfig.forgotPasswordText}
                      onChange={(e) => setLoginConfig(prev => ({ ...prev, forgotPasswordText: e.target.value }))}
                      placeholder="Forgot password?"
                      className="bg-white"
                    />
                  </div>

                  {/* Google Button Text */}
                  <div className="space-y-2">
                    <Label htmlFor="googleButtonText" className="text-sm font-medium">Google Button Text</Label>
                    <Input
                      id="googleButtonText"
                      value={loginConfig.googleButtonText}
                      onChange={(e) => setLoginConfig(prev => ({ ...prev, googleButtonText: e.target.value }))}
                      placeholder="Continue with Google"
                      className="bg-white"
                    />
                  </div>

                  {/* Signup Text */}
                  <div className="space-y-2">
                    <Label htmlFor="signupText" className="text-sm font-medium">Signup Prompt Text</Label>
                    <Input
                      id="signupText"
                      value={loginConfig.signupText}
                      onChange={(e) => setLoginConfig(prev => ({ ...prev, signupText: e.target.value }))}
                      placeholder="Don't have an account?"
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-green-900">
                    <strong>💡 Tip:</strong> Customize the login page text to match your brand voice and messaging. Changes will be reflected immediately after saving.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Save Button for Login Settings */}
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Changes will be applied after saving
                </p>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/login-settings', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(loginConfig),
                      });

                      if (!response.ok) {
                        console.error('Save failed with status:', response.status);
                        toast.error(`Failed to save login settings (${response.status})`);
                        return;
                      }

                      const contentType = response.headers.get('content-type');
                      if (contentType && contentType.includes('application/json')) {
                        const result = await response.json();
                        if (result.success) {
                          toast.success('Login settings saved successfully');
                        } else {
                          toast.error('Failed to save login settings');
                        }
                      } else {
                        toast.success('Login settings saved successfully');
                      }
                    } catch (error) {
                      console.error('Save error:', error);
                      toast.error('Failed to save login settings');
                    }
                  }}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Login Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would go here */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email notifications and SMTP settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Email configuration will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage system-wide notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic application configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">General settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}