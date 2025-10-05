'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SocialMediaPreview } from '@/components/SocialMediaPreview';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  RefreshCw,
  Download,
  Edit3,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Star,
  Users,
  FileText,
  Image,
  Video,
  MessageSquare
} from 'lucide-react';

interface ContentGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMedia?: any;
  onSave: (content: GeneratedContent) => void;
}

interface GeneratedContent {
  postType: string;
  platform: string;
  content: string;
  details: string;
  status: 'draft' | 'approved' | 'regenerate';
}

const POST_TYPES = [
  { id: 'success-story', name: 'Success Story', icon: Star, description: 'Showcase completed jobs and happy customers' },
  { id: 'tips-tricks', name: 'Tips & Tricks', icon: FileText, description: 'Share locksmith expertise and advice' },
  { id: 'behind-scenes', name: 'Behind the Scenes', icon: Users, description: 'Show your team in action' },
  { id: 'before-after', name: 'Before & After', icon: Image, description: 'Visual transformations' },
  { id: 'educational', name: 'Educational', icon: MessageSquare, description: 'Teach customers about security' },
  { id: 'promotional', name: 'Promotional', icon: Sparkles, description: 'Special offers and announcements' },
];

const PLATFORMS = [
  { id: 'google-business', name: 'Google My Business', icon: MapPin, color: 'bg-green-600' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-blue-500' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-600' },
];

export default function ContentGenerationModal({ isOpen, onClose, selectedMedia, onSave }: ContentGenerationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPostType, setSelectedPostType] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [details, setDetails] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const mockContent = `🔐 Just completed a ${selectedMedia?.jobType || 'locksmith'} service call in ${selectedMedia?.jobLocation || 'the area'}!

${selectedPostType === 'success-story' ? '✅ Successfully helped a customer with their lock situation. ' : ''}
${selectedPostType === 'tips-tricks' ? '💡 Pro tip: Regular maintenance can prevent most lock issues! ' : ''}
${selectedPostType === 'educational' ? '🎓 Did you know? Most break-ins happen through unlocked doors. ' : ''}

${details}

Contact us for all your locksmith needs! 📞

#Locksmith #Security #${selectedMedia?.jobLocation?.replace(/\s+/g, '') || 'Local'}Service #ProfessionalLocksmith`;

      setGeneratedContent(mockContent);
      setIsGenerating(false);
      setCurrentStep(4);
    }, 2000);
  };

  const handleApprove = () => {
    onSave({
      postType: selectedPostType,
      platform: selectedPlatform,
      content: generatedContent,
      details,
      status: 'approved'
    });
    onClose();
  };

  const handleDraft = () => {
    onSave({
      postType: selectedPostType,
      platform: selectedPlatform,
      content: generatedContent,
      details,
      status: 'draft'
    });
    onClose();
  };

  const handleRegenerate = () => {
    setCurrentStep(3);
    setGeneratedContent('');
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedPostType('');
    setSelectedPlatform('');
    setDetails('');
    setGeneratedContent('');
  };

  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return 'Choose Post Type';
      case 2: return 'Select Platform';
      case 3: return 'Add Details';
      case 4: return 'Review & Approve';
      default: return 'Generate Content';
    }
  };

  const canProceed = () => {
    switch(currentStep) {
      case 1: return selectedPostType !== '';
      case 2: return selectedPlatform !== '';
      case 3: return details.trim() !== '';
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-full">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Content Generator</h2>
                <p className="text-white/90 text-sm">{getStepTitle()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {currentStep} of 4</span>
              <span className="text-sm text-white/80">{Math.round((currentStep / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Post Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  What type of post do you want to create?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose the style that best fits your marketing goal
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {POST_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedPostType === type.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedPostType(type.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedPostType === type.id ? 'bg-purple-100 dark:bg-purple-800' : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              selectedPostType === type.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{type.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{type.description}</p>
                          </div>
                          {selectedPostType === type.id && (
                            <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Platform Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Which platform will you post to?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Each platform has different optimal content styles
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <Card
                      key={platform.id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedPlatform === platform.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedPlatform(platform.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${platform.color} text-white`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{platform.name}</h4>
                          </div>
                          {selectedPlatform === platform.id && (
                            <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Add Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Add specific details
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Help AI create better content with specific information
                </p>
              </div>

              {/* Job Context */}
              {selectedMedia && (
                <Card className="bg-gray-50 dark:bg-gray-800">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Job Context:</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Service:</strong> {selectedMedia.jobDescription}</p>
                      <p><strong>Location:</strong> {selectedMedia.jobLocation}</p>
                      <p><strong>Technician:</strong> {selectedMedia.techName}</p>
                      <p><strong>Type:</strong> {selectedMedia.jobType}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Details
                </label>
                <Textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={
                    selectedPostType === 'success-story' ? 'Describe the customer outcome, any challenges overcome, or special aspects of this job...' :
                    selectedPostType === 'tips-tricks' ? 'What specific tip or advice do you want to share? Any technical details or common mistakes to avoid...' :
                    selectedPostType === 'educational' ? 'What security concept do you want to explain? Why is it important for customers to know...' :
                    'Add any specific details, call-to-action, or key messages you want to include...'
                  }
                  className="min-h-[120px] w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={5}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Be specific - the more details you provide, the better the AI-generated content will be.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review & Actions */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isGenerating ? 'Generating your content...' : 'Review your content'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isGenerating ? 'AI is creating optimized content for your post' : 'Review, approve, or make changes to your generated content'}
                </p>
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Creating content...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Platform & Type Summary */}
                  <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Badge variant="secondary">{POST_TYPES.find(t => t.id === selectedPostType)?.name}</Badge>
                    <Badge variant="outline">{PLATFORMS.find(p => p.id === selectedPlatform)?.name}</Badge>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left: Editable Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Generated Content
                      </label>
                      <Textarea
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        className="min-h-[400px] w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        rows={15}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        ✏️ You can edit the content above before saving
                      </p>
                    </div>

                    {/* Right: Social Media Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preview as {PLATFORMS.find(p => p.id === selectedPlatform)?.name} Post
                      </label>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <SocialMediaPreview
                          platform={selectedPlatform}
                          content={generatedContent}
                          mediaUrl={selectedMedia?.photoUrl}
                          brandName="Pop-A-Lock"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        👆 This is how your post will appear on {PLATFORMS.find(p => p.id === selectedPlatform)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && !isGenerating && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}

              {currentStep < 4 && (
                <Button
                  onClick={currentStep === 3 ? handleGenerate : handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  {currentStep === 3 ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Content
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

            {currentStep === 4 && !isGenerating && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRegenerate}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDraft}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Save as Draft
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  Approve & Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}