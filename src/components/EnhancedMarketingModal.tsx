'use client';

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Target,
  MessageSquare,
  Share2,
  Zap,
  FileText,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube
} from 'lucide-react';

// Import our enhanced components
import { EnhancedStepIndicator, StepNavigation } from '@/components/ui/enhanced-step-indicator';
import { EnhancedCard, SelectionCard, PhotoUploadCard } from '@/components/ui/enhanced-card';
import { EnhancedInput, EnhancedTextarea } from '@/components/ui/enhanced-form';
import { EnhancedButton, LoadingButton } from '@/components/ui/enhanced-button';
import { LoadingSpinner, ProgressBar } from '@/components/ui/loading-states';
import { Heading, Text } from '@/components/ui/enhanced-typography';
import { FadeIn, Stagger, ScaleOnHover } from '@/components/ui/animations';
import { FocusTrap, ScreenReaderOnly, TouchTarget } from '@/components/ui/accessibility';
import { SocialMediaPreview } from '@/components/SocialMediaPreview';

interface EnhancedMarketingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const STEPS = [
  {
    id: 1,
    title: "Content Type",
    subtitle: "What do you want to create?",
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 2,
    title: "Platform Selection",
    subtitle: "Where will you share this?",
    icon: <Share2 className="w-5 h-5" />
  },
  {
    id: 3,
    title: "Content Details",
    subtitle: "Tell us about your content",
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 4,
    title: "Generate & Review",
    subtitle: "Create your content",
    icon: <Sparkles className="w-5 h-5" />
  }
];

const CONTENT_TYPES = [
  {
    id: 'social-post',
    title: 'Social Media Post',
    description: 'Create engaging posts for social platforms',
    icon: MessageSquare,
    badge: 'Popular'
  },
  {
    id: 'blog-article',
    title: 'Blog Article',
    description: 'Write detailed articles and guides',
    icon: FileText,
    badge: null
  },
  {
    id: 'email-campaign',
    title: 'Email Campaign',
    description: 'Design email marketing content',
    icon: Zap,
    badge: 'New'
  }
];

const PLATFORMS = [
  {
    id: 'facebook',
    title: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    limits: { chars: 63206, hashtags: 30 }
  },
  {
    id: 'instagram',
    title: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
    limits: { chars: 2200, hashtags: 30 }
  },
  {
    id: 'twitter',
    title: 'Twitter',
    icon: Twitter,
    color: '#1DA1F2',
    limits: { chars: 280, hashtags: 10 }
  },
  {
    id: 'linkedin',
    title: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2',
    limits: { chars: 3000, hashtags: 5 }
  },
  {
    id: 'youtube',
    title: 'YouTube',
    icon: Youtube,
    color: '#FF0000',
    limits: { chars: 5000, hashtags: 15 }
  }
];

export default function EnhancedMarketingModal({
  isOpen,
  onClose,
  onSubmit
}: EnhancedMarketingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    contentType: '',
    platforms: [] as string[],
    title: '',
    description: '',
    tone: 'professional',
    targetAudience: '',
    keywords: '',
    callToAction: '',
    includeHashtags: true,
    includeEmojis: false,
    photos: [] as File[]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      contentType: '',
      platforms: [],
      title: '',
      description: '',
      tone: 'professional',
      targetAudience: '',
      keywords: '',
      callToAction: '',
      includeHashtags: true,
      includeEmojis: false,
      photos: []
    });
    setGeneratedContent('');
    setProgress(0);
    setIsSubmitting(false);
    setIsGenerating(false);
  };

  const handleClose = () => {
    if (!isSubmitting && !isGenerating) {
      resetForm();
      onClose();
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.contentType !== '';
      case 2:
        return formData.platforms.length > 0;
      case 3:
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const simulateGeneration = async () => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate AI content generation with progress
    const steps = [
      { progress: 20, message: 'Analyzing your requirements...' },
      { progress: 40, message: 'Researching best practices...' },
      { progress: 60, message: 'Crafting your content...' },
      { progress: 80, message: 'Optimizing for platforms...' },
      { progress: 100, message: 'Content ready!' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(step.progress);
    }

    // Mock generated content
    setGeneratedContent(`🔒 Need a locksmith? Pop-A-Lock is here to help!

Whether you're locked out of your car, home, or office, our certified technicians provide fast, reliable service 24/7.

✅ Licensed & Bonded
✅ 24/7 Emergency Service
✅ Upfront Pricing
✅ Damage-Free Solutions

Don't let a lockout ruin your day. Call Pop-A-Lock today!

#Locksmith #PopALock #24HourService #Emergency #Automotive #Residential #Commercial #Security #LockOut #KeyService`);

    setIsGenerating(false);
  };

  const handleGenerate = () => {
    if (currentStep === 4) {
      simulateGeneration();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        generatedContent
      });
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepConfig = STEPS[currentStep - 1];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white border-0 shadow-2xl rounded-3xl p-0">
        <FocusTrap active={isOpen}>
          <div className="relative">
            {/* Header */}
            <DialogHeader className="relative px-8 pt-8 pb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      AI Content Creator
                    </DialogTitle>
                    <Text variant="subtle" size="sm">
                      Create engaging marketing content in minutes
                    </Text>
                  </div>
                </div>

                <TouchTarget
                  as="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2"
                  disabled={isSubmitting || isGenerating}
                >
                  <X className="w-6 h-6" />
                  <ScreenReaderOnly>Close modal</ScreenReaderOnly>
                </TouchTarget>
              </div>

              {/* Enhanced Step Indicator */}
              <EnhancedStepIndicator
                steps={STEPS}
                currentStep={currentStep}
                variant="default"
                animated={true}
              />
            </DialogHeader>

            {/* Content */}
            <div className="px-8 py-6 max-h-[50vh] overflow-y-auto">
              <FadeIn key={currentStep} duration={300}>

                {/* Step 1: Content Type Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Heading size="lg" className="mb-2">
                        What type of content do you want to create?
                      </Heading>
                      <Text variant="muted">
                        Choose the content format that best fits your marketing goals
                      </Text>
                    </div>

                    <Stagger staggerDelay={100} animation="slideUp">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {CONTENT_TYPES.map((type) => (
                          <ScaleOnHover key={type.id} scale={1.02}>
                            <SelectionCard
                              title={type.title}
                              description={type.description}
                              icon={type.icon}
                              selected={formData.contentType === type.id}
                              onSelect={() => setFormData(prev => ({ ...prev, contentType: type.id }))}
                              variant="feature"
                              badge={type.badge || undefined}
                            />
                          </ScaleOnHover>
                        ))}
                      </div>
                    </Stagger>
                  </div>
                )}

                {/* Step 2: Platform Selection */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Heading size="lg" className="mb-2">
                        Select your target platforms
                      </Heading>
                      <Text variant="muted">
                        Choose where you'll share your content (you can select multiple)
                      </Text>
                    </div>

                    <Stagger staggerDelay={80} animation="slideUp">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {PLATFORMS.map((platform) => {
                          const Icon = platform.icon;
                          const isSelected = formData.platforms.includes(platform.id);

                          return (
                            <ScaleOnHover key={platform.id} scale={1.05}>
                              <TouchTarget
                                as="button"
                                onClick={() => handlePlatformToggle(platform.id)}
                                className={`relative p-4 rounded-xl border-2 transition-all duration-200 group ${
                                  isSelected
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}

                                <div className="flex flex-col items-center space-y-2">
                                  <Icon
                                    className="w-8 h-8 transition-colors duration-200"
                                    style={{ color: isSelected ? platform.color : '#6B7280' }}
                                  />
                                  <Text size="sm" weight="medium" className="text-center">
                                    {platform.title}
                                  </Text>
                                  <Text size="xs" variant="subtle">
                                    {platform.limits.chars} chars
                                  </Text>
                                </div>
                              </TouchTarget>
                            </ScaleOnHover>
                          );
                        })}
                      </div>
                    </Stagger>
                  </div>
                )}

                {/* Step 3: Content Details */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Heading size="lg" className="mb-2">
                        Tell us about your content
                      </Heading>
                      <Text variant="muted">
                        Provide details to help our AI create the perfect content for you
                      </Text>
                    </div>

                    <div className="space-y-6">
                      <EnhancedInput
                        label="Content Title"
                        placeholder="Enter a catchy title for your content..."
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                        variant="filled"
                        size="lg"
                      />

                      <EnhancedTextarea
                        label="Content Description"
                        placeholder="Describe what you want to communicate to your audience..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        required
                        variant="filled"
                        rows={4}
                        charCount
                        maxLength={500}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EnhancedInput
                          label="Target Audience"
                          placeholder="e.g., homeowners, car owners, business owners"
                          value={formData.targetAudience}
                          onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                          variant="filled"
                        />

                        <EnhancedInput
                          label="Keywords"
                          placeholder="e.g., locksmith, emergency, 24/7 service"
                          value={formData.keywords}
                          onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                          variant="filled"
                        />
                      </div>

                      <EnhancedInput
                        label="Call to Action"
                        placeholder="e.g., Call now, Visit our website, Book online"
                        value={formData.callToAction}
                        onChange={(e) => setFormData(prev => ({ ...prev, callToAction: e.target.value }))}
                        variant="filled"
                      />

                      <div className="flex space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.includeHashtags}
                            onChange={(e) => setFormData(prev => ({ ...prev, includeHashtags: e.target.checked }))}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <Text size="sm">Include hashtags</Text>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.includeEmojis}
                            onChange={(e) => setFormData(prev => ({ ...prev, includeEmojis: e.target.checked }))}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <Text size="sm">Include emojis</Text>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Generate & Review */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Heading size="lg" className="mb-2">
                        Generate your content
                      </Heading>
                      <Text variant="muted">
                        Review your settings and generate AI-powered content
                      </Text>
                    </div>

                    {/* Content Summary */}
                    <EnhancedCard variant="glass" className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Text size="sm" weight="medium" variant="muted" className="mb-2">
                            Content Type
                          </Text>
                          <Text>
                            {CONTENT_TYPES.find(t => t.id === formData.contentType)?.title}
                          </Text>
                        </div>
                        <div>
                          <Text size="sm" weight="medium" variant="muted" className="mb-2">
                            Platforms
                          </Text>
                          <div className="flex flex-wrap gap-2">
                            {formData.platforms.map(platformId => {
                              const platform = PLATFORMS.find(p => p.id === platformId);
                              return platform ? (
                                <span
                                  key={platformId}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                                >
                                  {platform.title}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <Text size="sm" weight="medium" variant="muted" className="mb-2">
                            Title
                          </Text>
                          <Text>{formData.title}</Text>
                        </div>
                      </div>
                    </EnhancedCard>

                    {/* Generation Progress */}
                    {isGenerating && (
                      <EnhancedCard variant="elevated" className="p-6">
                        <div className="text-center space-y-4">
                          <LoadingSpinner size="lg" variant="default" />
                          <div>
                            <Text weight="medium" className="mb-2">
                              Creating your content...
                            </Text>
                            <ProgressBar
                              value={progress}
                              variant="gradient"
                              color="primary"
                              showLabel
                              label="Generation Progress"
                            />
                          </div>
                        </div>
                      </EnhancedCard>
                    )}

                    {/* Generated Content */}
                    {generatedContent && !isGenerating && (
                      <div className="space-y-6">
                        {/* Platform Preview */}
                        <EnhancedCard variant="elevated" className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Heading size="md">Preview as {formData.platforms[0] ? formData.platforms[0].charAt(0).toUpperCase() + formData.platforms[0].slice(1) : 'Social Media'} Post</Heading>
                              <EnhancedButton
                                size="sm"
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(generatedContent)}
                              >
                                Copy to Clipboard
                              </EnhancedButton>
                            </div>

                            {/* Social Media Preview */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8">
                              <SocialMediaPreview
                                platform={formData.platforms[0] || 'general'}
                                content={generatedContent}
                                mediaUrl={formData.photos[0] ? URL.createObjectURL(formData.photos[0]) : undefined}
                                brandName="Pop-A-Lock"
                              />
                            </div>
                          </div>
                        </EnhancedCard>

                        {/* Raw Content Text */}
                        <EnhancedCard variant="glass" className="p-6">
                          <div className="space-y-4">
                            <Heading size="sm">Post Content (Raw Text)</Heading>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200">
                              <Text size="sm" className="whitespace-pre-wrap leading-relaxed">
                                {generatedContent}
                              </Text>
                            </div>
                            <Text size="xs" variant="muted">
                              ✏️ You can edit the content above before saving
                            </Text>
                          </div>
                        </EnhancedCard>
                      </div>
                    )}

                    {/* Generate Button */}
                    {!generatedContent && !isGenerating && (
                      <div className="text-center">
                        <EnhancedButton
                          onClick={handleGenerate}
                          size="lg"
                          variant="gradient"
                          glow
                          icon={Sparkles}
                        >
                          Generate Content with AI
                        </EnhancedButton>
                      </div>
                    )}
                  </div>
                )}

              </FadeIn>
            </div>

            {/* Footer Navigation */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <StepNavigation
                currentStep={currentStep}
                totalSteps={STEPS.length}
                onNext={handleNext}
                onPrev={handlePrev}
                onSubmit={handleSubmit}
                canProceed={canProceedToNext()}
                isSubmitting={isSubmitting}
                nextLabel={currentStep === 4 && !generatedContent && !isGenerating ? "Generate" : "Continue"}
                submitLabel="Use This Content"
                showSkip={currentStep === 4 && generatedContent}
              />
            </div>
          </div>
        </FocusTrap>
      </DialogContent>
    </Dialog>
  );
}