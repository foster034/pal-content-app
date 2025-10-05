'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { popALockGBP } from '@/lib/gbp-agent';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Target,
  Users,
  TrendingUp,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageSquare,
  Image,
  Video,
  FileText,
  Star,
  Rocket,
  ArrowRight,
  MapPin,
  RefreshCw,
  Edit3,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react';

interface MarketingOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: GeneratedContent) => void;
  selectedMedia?: any;
}

interface GeneratedContent {
  postType: string;
  platform: string;
  content: string;
  details: string;
  status: 'draft' | 'approved' | 'regenerate';
  media?: any;
}

const STEPS = [
  {
    id: 1,
    title: "Choose Post Type",
    subtitle: "What type of GMB post do you want to create?"
  },
  {
    id: 2,
    title: "Add Details",
    subtitle: "Optional: Add specific context for better content"
  },
  {
    id: 3,
    title: "Generate & Review",
    subtitle: "AI-generated GMB post ready for review"
  }
];

const SOCIAL_PLATFORMS = [
  { id: 'google-business', name: 'Google My Business', icon: MapPin, color: 'bg-green-600', description: 'Local search & reviews' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', description: 'Connect with local customers' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-600 to-pink-600', description: 'Visual storytelling' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', description: 'Business networking' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-blue-500', description: 'Quick updates & tips' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-600', description: 'Video tutorials' },
];

const CONTENT_TYPES = [
  { id: 'success-stories', name: 'Success Story', icon: Star, description: 'Showcase completed jobs and happy customers' },
  { id: 'tips-tricks', name: 'Tips & Tricks', icon: FileText, description: 'Share locksmith expertise and advice' },
  { id: 'behind-scenes', name: 'Behind the Scenes', icon: Users, description: 'Show your team in action' },
  { id: 'before-after', name: 'Before & After', icon: Image, description: 'Visual transformations' },
  { id: 'educational', name: 'Educational', icon: MessageSquare, description: 'Teach customers about security' },
  { id: 'promotional', name: 'Promotional', icon: Sparkles, description: 'Special offers and announcements' },
];

export default function MarketingOnboardingModal({ isOpen, onClose, onComplete, selectedMedia }: MarketingOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPostType, setSelectedPostType] = useState('');
  const [selectedPlatform] = useState('google-business'); // Always Google My Business
  const [details, setDetails] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [franchiseeData, setFranchiseeData] = useState<any>(null);
  const [gbpOutput, setGbpOutput] = useState<any>(null);
  const [showTips, setShowTips] = useState(false);

  // Fetch franchisee details when modal opens
  useEffect(() => {
    if (isOpen && selectedMedia?.franchiseeId) {
      fetch(`/api/franchisees/${selectedMedia.franchiseeId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setFranchiseeData(data);
          }
        })
        .catch(err => console.error('Error fetching franchisee data:', err));
    }
  }, [isOpen, selectedMedia?.franchiseeId]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === 2) {
      handleGenerate();
    } else if (currentStep < STEPS.length) {
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
    setCurrentStep(3);

    // Use GBP specialist agent to generate content
    setTimeout(async () => {
      try {
        const output = await popALockGBP.generateGBPPost({
          serviceType: selectedMedia?.jobType || 'Residential',
          jobDescription: selectedMedia?.jobDescription || '',
          location: selectedMedia?.jobLocation || '',
          techName: selectedMedia?.techName || '',
          notes: selectedMedia?.notes,
          vehicleYear: selectedMedia?.vehicleYear,
          vehicleMake: selectedMedia?.vehicleMake,
          vehicleModel: selectedMedia?.vehicleModel,
          photoUrl: selectedMedia?.photoUrl,
          franchiseePhone: franchiseeData?.phone,
          franchiseeEmail: franchiseeData?.email,
          franchiseeWebsite: franchiseeData?.website,
          franchiseeName: franchiseeData?.business_name || selectedMedia?.franchiseeName,
        });

        // Select variant based on post type
        let variantIndex = 0;
        if (selectedPostType === 'educational' || selectedPostType === 'tips-tricks') {
          variantIndex = 1; // Educational variant
        } else if (selectedPostType === 'promotional') {
          variantIndex = 2; // Promotional variant
        }

        // Store full output for tips
        setGbpOutput({ output, variantIndex });

        const formattedContent = popALockGBP.formatForDisplay(output, variantIndex);
        setGeneratedContent(formattedContent);
      } catch (error) {
        console.error('Error generating content:', error);
        setGeneratedContent('Error generating content. Please try again.');
      }
      setIsGenerating(false);
    }, 1500);
  };


  const handleApprove = () => {
    onComplete({
      postType: selectedPostType,
      platform: selectedPlatform,
      content: generatedContent,
      details,
      status: 'approved',
      media: selectedMedia
    });
    resetModal();
  };

  const handleDraft = () => {
    onComplete({
      postType: selectedPostType,
      platform: selectedPlatform,
      content: generatedContent,
      details,
      status: 'draft',
      media: selectedMedia
    });
    resetModal();
  };

  const handleRegenerate = () => {
    setCurrentStep(2);
    setGeneratedContent('');
  };

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedPostType('');
    setDetails('');
    setGeneratedContent('');
    setIsGenerating(false);
    setGbpOutput(null);
    setShowTips(false);
    onClose();
  };

  const canProceed = () => {
    switch(currentStep) {
      case 1: return selectedPostType !== '';
      case 2: return true; // Details are optional
      default: return true;
    }
  };

  const getCurrentStepData = () => {
    return STEPS[currentStep - 1] || STEPS[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-200/20">
        {/* Compact Header */}
        <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">GMB Post Generator</h2>
                <p className="text-xs text-white/80">{getCurrentStepData().subtitle}</p>
              </div>
            </div>
            <button
              onClick={resetModal}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Compact Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Step {currentStep} of {STEPS.length}</span>
              <span className="text-xs text-white/70">{Math.round((currentStep / STEPS.length) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div
                className="bg-white rounded-full h-1.5 transition-all duration-500"
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Step 1: Post Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  What type of post do you want to create?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose the style that best fits your marketing goal
                </p>
              </div>

              {/* Job Context */}
              {selectedMedia && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">Job Context:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><strong>Service:</strong> {selectedMedia.jobDescription}</div>
                      <div><strong>Location:</strong> {selectedMedia.jobLocation}</div>
                      <div><strong>Technician:</strong> {selectedMedia.techName}</div>
                      <div><strong>Type:</strong> {selectedMedia.jobType}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CONTENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all duration-200 border-2 hover:shadow ${
                        selectedPostType === type.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedPostType(type.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            selectedPostType === type.id ? 'bg-purple-100 dark:bg-purple-800' : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              selectedPostType === type.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{type.name}</h4>
                          </div>
                          {selectedPostType === type.id && (
                            <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Add Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Add specific details
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Optional: Add extra context for better content
                </p>
              </div>

              {/* Selected Choices Summary */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-green-50 dark:from-purple-900/20 dark:to-green-900/20 rounded-lg">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                  {CONTENT_TYPES.find(t => t.id === selectedPostType)?.name}
                </Badge>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Badge variant="outline" className="border-green-500 text-green-700 text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  Google My Business
                </Badge>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Details <span className="text-gray-400">(Optional)</span>
                </label>
                <Textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={
                    selectedPostType === 'success-stories' ? 'Customer outcome, challenges, special aspects...' :
                    selectedPostType === 'tips-tricks' ? 'Specific tip or technical details...' :
                    selectedPostType === 'educational' ? 'Security concept and importance...' :
                    'Specific details, call-to-action, key messages...'
                  }
                  className="min-h-[80px] w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Generate & Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {isGenerating ? 'Generating...' : 'Review Content'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isGenerating ? 'AI is creating your post' : 'Edit and approve your content'}
                </p>
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm font-medium">Creating content...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Platform & Type Summary */}
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                      {CONTENT_TYPES.find(t => t.id === selectedPostType)?.name}
                    </Badge>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <Badge variant="outline" className="border-green-500 text-green-700 text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      Google My Business
                    </Badge>
                    <div className="ml-auto">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                  </div>

                  {/* GMB Post Preview */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
                    {/* GMB Header */}
                    <div className="bg-white border-b border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          P
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Pop-A-Lock</h3>
                          <p className="text-xs text-gray-500">Posted just now</p>
                        </div>
                        <div className="text-gray-400">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-4 bg-white">
                      <Textarea
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        className="w-full p-0 border-0 focus:ring-0 text-sm text-gray-800 leading-relaxed resize-none"
                        rows={6}
                        placeholder="Your post content will appear here..."
                      />
                    </div>

                    {/* Post Image */}
                    {selectedMedia?.photoUrl && (
                      <div className="relative bg-gray-100">
                        <img
                          src={selectedMedia.photoUrl}
                          alt="Post preview"
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}

                    {/* GMB Actions */}
                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center gap-6">
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        Like
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Comment
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Tips & Guidance Section */}
                  {gbpOutput && (
                    <div className="mt-3">
                      <button
                        onClick={() => setShowTips(!showTips)}
                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-lg hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-900/30 dark:hover:to-yellow-900/30 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            Tips & Posting Guidance
                          </span>
                        </div>
                        {showTips ? (
                          <ChevronUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        )}
                      </button>

                      {showTips && (
                        <div className="mt-2 p-4 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800 rounded-lg space-y-3">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                              📸 Suggested Image
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {popALockGBP.getTipsForPosting(gbpOutput.output, gbpOutput.variantIndex).imageStyle}
                            </p>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                              ♿ Alt Text (Accessibility)
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {popALockGBP.getTipsForPosting(gbpOutput.output, gbpOutput.variantIndex).altText}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                    ✏️ Click on the text above to edit your post
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && !isGenerating && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStep < 3 && (
                <Button
                  size="sm"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {currentStep === 2 ? (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Generate
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-3 h-3" />
                    </>
                  )}
                </Button>
              )}

              {currentStep === 3 && !isGenerating && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApprove}
                    className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <Check className="w-3 h-3" />
                    Send to Generated Content
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}