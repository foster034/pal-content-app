'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Sparkles, Loader2 } from 'lucide-react';

interface SimpleMarketingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  selectedMedia: {
    id: number;
    photoUrl: string;
    jobType: string;
    jobDescription: string;
    jobLocation: string;
    techName: string;
  };
}

export default function SimpleMarketingModal({
  isOpen,
  onClose,
  onComplete,
  selectedMedia,
}: SimpleMarketingModalProps) {
  const [platform, setPlatform] = useState('facebook');
  const [postType, setPostType] = useState('promotional');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  if (!isOpen) return null;

  const generateContent = async () => {
    setGenerating(true);

    try {
      // Simulate AI content generation (you can replace this with actual AI API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const content = `🔐 ${selectedMedia.jobType} Service Complete!

${selectedMedia.jobDescription}

📍 Location: ${selectedMedia.jobLocation}
👨‍🔧 Tech: ${selectedMedia.techName}

Professional locksmith services you can trust!

#Locksmith #Security #${selectedMedia.jobType.replace(' ', '')} #PopALock`;

      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = () => {
    onComplete({
      platform,
      postType,
      content: generatedContent,
      status: 'approved',
      details: {
        jobType: selectedMedia.jobType,
        jobDescription: selectedMedia.jobDescription,
        location: selectedMedia.jobLocation,
        techName: selectedMedia.techName,
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-full">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Marketing Specialist</h2>
                <p className="text-white/90 text-sm">Generate engaging social media content</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Photo Preview */}
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={selectedMedia.photoUrl}
              alt="Job photo"
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter/X</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>

          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Post Type
            </label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="promotional">Promotional</option>
              <option value="educational">Educational</option>
              <option value="testimonial">Testimonial</option>
              <option value="showcase">Showcase</option>
            </select>
          </div>

          {/* Generate Button */}
          {!generatedContent && (
            <Button
              onClick={generateContent}
              disabled={generating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Content
                </>
              )}
            </Button>
          )}

          {/* Generated Content */}
          {generatedContent && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Generated Content
              </label>
              <textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                rows={8}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => setGeneratedContent('')}
                  variant="outline"
                  className="flex-1"
                >
                  Regenerate
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve & Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
