'use client';

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTable } from '@/contexts/table-context';

interface ArchivedMedia {
  id: number;
  photoUrl: string;
  jobType: 'Commercial' | 'Residential' | 'Automotive' | 'Roadside';
  techName: string;
  techId: number;
  franchiseeName: string;
  franchiseeId: number;
  jobDescription: string;
  dateUploaded: string;
  dateArchived: string;
  jobLocation: string;
  tags: string[];
  category: 'Before' | 'After' | 'Process' | 'Tools' | 'Documentation';
  notes?: string;
  archived: boolean;
}

const initialArchivedMedia: ArchivedMedia[] = [
  {
    id: 1,
    photoUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&auto=format',
    jobType: 'Commercial',
    techName: 'Alex Rodriguez',
    techId: 1,
    franchiseeName: 'Dallas Downtown',
    franchiseeId: 1,
    jobDescription: 'Office building master key system installation',
    dateUploaded: '2024-09-08',
    dateArchived: '2024-09-08',
    jobLocation: 'Downtown Dallas, TX',
    tags: ['master key', 'office building', 'installation'],
    category: 'After',
    notes: 'Completed installation showing new master key system',
    archived: true,
  },
  {
    id: 2,
    photoUrl: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=400&h=400&fit=crop&auto=format',
    jobType: 'Residential',
    techName: 'Sofia Martinez',
    techId: 2,
    franchiseeName: 'Austin Central',
    franchiseeId: 2,
    jobDescription: 'Smart lock installation and setup',
    dateUploaded: '2024-09-07',
    dateArchived: '2024-09-07',
    jobLocation: 'Austin, TX',
    tags: ['smart lock', 'residential', 'installation'],
    category: 'Process',
    notes: 'Step-by-step smart lock setup process',
    archived: true,
  },
  {
    id: 3,
    photoUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&auto=format',
    jobType: 'Automotive',
    techName: 'David Chen',
    techId: 3,
    franchiseeName: 'Houston West',
    franchiseeId: 3,
    jobDescription: 'Car lockout service - key extraction',
    dateUploaded: '2024-09-06',
    dateArchived: '2024-09-06',
    jobLocation: 'Houston, TX',
    tags: ['car lockout', 'key extraction', 'emergency'],
    category: 'Tools',
    notes: 'Emergency tools used for key extraction',
    archived: true,
  },
  {
    id: 4,
    photoUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&auto=format',
    jobType: 'Roadside',
    techName: 'Jennifer Walsh',
    techId: 4,
    franchiseeName: 'San Antonio North',
    franchiseeId: 4,
    jobDescription: 'Emergency roadside assistance - broken key removal',
    dateUploaded: '2024-09-05',
    dateArchived: '2024-09-05',
    jobLocation: 'San Antonio, TX',
    tags: ['roadside', 'emergency', 'key repair'],
    category: 'Before',
    notes: 'Before photo showing broken key in lock',
    archived: true,
  },
  {
    id: 5,
    photoUrl: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=400&h=400&fit=crop&auto=format',
    jobType: 'Commercial',
    techName: 'Alex Rodriguez',
    techId: 1,
    franchiseeName: 'Dallas Downtown',
    franchiseeId: 1,
    jobDescription: 'Access control system upgrade',
    dateUploaded: '2024-09-04',
    dateArchived: '2024-09-04',
    jobLocation: 'Dallas, TX',
    tags: ['access control', 'commercial', 'upgrade'],
    category: 'Documentation',
    notes: 'System documentation and specifications',
    archived: true,
  },
  {
    id: 6,
    photoUrl: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&h=400&fit=crop&auto=format',
    jobType: 'Residential',
    techName: 'Sofia Martinez',
    techId: 2,
    franchiseeName: 'Austin Central',
    franchiseeId: 2,
    jobDescription: 'Lock rekey service for new homeowner',
    dateUploaded: '2024-09-03',
    dateArchived: '2024-09-03',
    jobLocation: 'Austin, TX',
    tags: ['rekey', 'residential', 'new home'],
    category: 'After',
    notes: 'Completed rekey service with new keys',
    archived: true,
  },
];

const franchisees = [
  { id: 1, name: 'Dallas Downtown' },
  { id: 2, name: 'Austin Central' },
  { id: 3, name: 'Houston West' },
  { id: 4, name: 'San Antonio North' },
];

const technicians = [
  { id: 1, name: 'Alex Rodriguez' },
  { id: 2, name: 'Sofia Martinez' },
  { id: 3, name: 'David Chen' },
  { id: 4, name: 'Jennifer Walsh' },
];

export default function MediaArchivePage() {
  const { getTableClasses } = useTable();
  const tableClasses = getTableClasses();
  
  const [archivedMedia, setArchivedMedia] = useState<ArchivedMedia[]>(initialArchivedMedia);
  const [selectedJobType, setSelectedJobType] = useState<string>('All');
  const [selectedFranchisee, setSelectedFranchisee] = useState<string>('All');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'gallery' | 'table'>('table');
  const [selectedMedia, setSelectedMedia] = useState<ArchivedMedia | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAIMarketing, setShowAIMarketing] = useState(false);
  const [aiConversation, setAiConversation] = useState<{role: string, message: string}[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedPostType, setSelectedPostType] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<string>('');

  const filteredMedia = useMemo(() => {
    return archivedMedia.filter(media => {
      if (selectedJobType !== 'All' && media.jobType !== selectedJobType) return false;
      if (selectedFranchisee !== 'All' && media.franchiseeName !== selectedFranchisee) return false;
      if (selectedTechnician !== 'All' && media.techName !== selectedTechnician) return false;
      if (selectedCategory !== 'All' && media.category !== selectedCategory) return false;
      if (searchTerm && !media.jobDescription.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !media.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) &&
          !media.notes?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [archivedMedia, selectedJobType, selectedFranchisee, selectedTechnician, selectedCategory, searchTerm]);

  const updateMediaNotes = (mediaId: number, notes: string) => {
    setArchivedMedia(prev => prev.map(media => 
      media.id === mediaId ? { ...media, notes } : media
    ));
  };

  const updateMediaCategory = (mediaId: number, category: 'Before' | 'After' | 'Process' | 'Tools' | 'Documentation') => {
    setArchivedMedia(prev => prev.map(media => 
      media.id === mediaId ? { ...media, category } : media
    ));
  };

  const deleteMedia = (mediaId: number) => {
    setArchivedMedia(prev => prev.filter(media => media.id !== mediaId));
  };

  const openMediaDetails = (media: ArchivedMedia) => {
    setSelectedMedia(media);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setShowModal(false);
  };

  const openAIMarketing = (media: ArchivedMedia) => {
    setSelectedMedia(media);
    setShowAIMarketing(true);
    // Initialize AI conversation with job context
    setAiConversation([{
      role: 'ai',
      message: `Hey there! I'm your AI Marketing Specialist 🚀 I see you want to create some amazing content from this ${media.jobType.toLowerCase()} job by ${media.techName}.\n\nAs both a social media expert AND a professional locksmith specialist, I can help you create engaging posts for:\n\n📱 **Social Platforms:** Instagram, Facebook, LinkedIn, TikTok, Twitter, YouTube, Pinterest\n🎯 **Post Types:** Success stories, educational content, behind-the-scenes, customer testimonials, tips & tricks\n🔧 **Locksmith Expertise:** ${media.jobType} services, tools showcase, safety tips, industry insights\n\n**Job Details I'm Working With:**\n• Service: ${media.jobDescription}\n• Location: ${media.jobLocation}\n• Technician: ${media.techName}\n• Notes: ${media.notes || 'No additional notes'}\n\nWhat kind of post are you thinking? I can ask you a few quick questions to create the perfect content!`
    }]);
  };

  const closeAIMarketing = () => {
    setSelectedMedia(null);
    setShowAIMarketing(false);
    setAiConversation([]);
    setSelectedPlatform('');
    setSelectedPostType('');
    setShowPreview(false);
    setShowPreviewModal(false);
    setGeneratedContent('');
    setCopySuccess('');
  };

  const sendMessageToAI = async (userMessage: string) => {
    if (!selectedMedia) return;
    
    console.log('Sending message to AI:', userMessage);
    
    // Add user message
    const newConversation = [...aiConversation, { role: 'user', message: userMessage }];
    setAiConversation(newConversation);
    
    // Add loading message
    const loadingConversation = [...newConversation, { role: 'ai', message: 'Thinking... 🤔' }];
    setAiConversation(loadingConversation);
    
    try {
      console.log('Making API call to /api/ai-marketing');
      const response = await fetch('/api/ai-marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          mediaContext: {
            jobType: selectedMedia.jobType,
            jobDescription: selectedMedia.jobDescription,
            jobLocation: selectedMedia.jobLocation,
            techName: selectedMedia.techName,
            franchiseeName: selectedMedia.franchiseeName,
            notes: selectedMedia.notes
          },
          conversationHistory: aiConversation.map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : msg.role,
            content: msg.message
          }))
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to get AI response: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('AI Response received:', data);
      
      const updatedConversation = [...newConversation, { role: 'ai', message: data.response }];
      setAiConversation(updatedConversation);
      
      // If this looks like generated content, store it for preview
      if (data.response && (userMessage.toLowerCase().includes('create') || userMessage.toLowerCase().includes('generate'))) {
        setGeneratedContent(data.response);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error calling AI API:', error);
      const errorMessage = `Sorry, I encountered an error: ${error}. Please try again.`;
      const updatedConversation = [...newConversation, { role: 'ai', message: errorMessage }];
      setAiConversation(updatedConversation);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const PlatformPreview = ({ platform, content }: { platform: string, content: string }) => {
    const now = new Date();
    const timeAgo = "Just now";
    
    switch (platform) {
      case 'instagram':
        return (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-md mx-auto">
            {/* Instagram Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=24&h=24&fit=crop&auto=format" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{selectedMedia?.franchiseeName.toLowerCase().replace(/\s+/g, '')}</div>
                <div className="text-xs text-gray-500">{timeAgo}</div>
              </div>
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
            
            {/* Instagram Image */}
            <div className="aspect-square relative">
              <img
                src={selectedMedia?.photoUrl}
                alt="Post"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Instagram Actions */}
            <div className="p-4">
              <div className="flex items-center gap-4 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <div className="flex-1"></div>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
                </svg>
              </div>
              
              <div className="text-sm">
                <span className="font-semibold">{selectedMedia?.franchiseeName.toLowerCase().replace(/\s+/g, '')}</span>
                <span className="ml-2 whitespace-pre-line">{content}</span>
              </div>
            </div>
          </div>
        );
        
      case 'facebook':
        return (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-lg mx-auto">
            {/* Facebook Header */}
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&auto=format" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{selectedMedia?.franchiseeName}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  {timeAgo} • 🌐
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
            
            {/* Facebook Content */}
            <div className="px-4 pb-3">
              <div className="text-sm whitespace-pre-line">{content}</div>
            </div>
            
            {/* Facebook Image */}
            <div className="relative">
              <img
                src={selectedMedia?.photoUrl}
                alt="Post"
                className="w-full h-64 object-cover"
              />
            </div>
            
            {/* Facebook Actions */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-around text-gray-600">
                <div className="flex items-center gap-2 py-2 px-4 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span className="text-sm">Like</span>
                </div>
                <div className="flex items-center gap-2 py-2 px-4 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm">Comment</span>
                </div>
                <div className="flex items-center gap-2 py-2 px-4 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-sm">Share</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'linkedin':
        return (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-lg mx-auto">
            {/* LinkedIn Header */}
            <div className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&auto=format" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{selectedMedia?.franchiseeName}</div>
                <div className="text-xs text-gray-500">{selectedMedia?.techName} • Locksmith Professional</div>
                <div className="text-xs text-gray-500">{timeAgo} • 🌐</div>
              </div>
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
            
            {/* LinkedIn Content */}
            <div className="px-4 pb-3">
              <div className="text-sm whitespace-pre-line leading-relaxed">{content}</div>
            </div>
            
            {/* LinkedIn Image */}
            <div className="relative">
              <img
                src={selectedMedia?.photoUrl}
                alt="Post"
                className="w-full h-64 object-cover"
              />
            </div>
            
            {/* LinkedIn Actions */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-around text-gray-600">
                <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span className="text-xs">Like</span>
                </div>
                <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-xs">Comment</span>
                </div>
                <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-xs">Repost</span>
                </div>
                <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="text-xs">Send</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div>
                <div className="font-semibold text-sm">{selectedMedia?.franchiseeName}</div>
                <div className="text-xs text-gray-500">{timeAgo}</div>
              </div>
            </div>
            <div className="text-sm whitespace-pre-line mb-4">{content}</div>
            <img
              src={selectedMedia?.photoUrl}
              alt="Post"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        );
    }
  };

  const getJobTypeVariant = (jobType: string) => {
    switch (jobType) {
      case 'Commercial': 
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200';
      case 'Residential': 
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200';
      case 'Automotive': 
        return 'bg-gray-900 text-white dark:bg-gray-700 dark:text-gray-100 border-gray-800';
      case 'Roadside': 
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200';
    }
  };

  const getCategoryVariant = (category: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (category) {
      case 'Before': return 'outline';
      case 'After': return 'default';
      case 'Process': return 'secondary';
      case 'Tools': return 'destructive';
      case 'Documentation': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Media Archive</h1>
          <p className="text-muted-foreground">Browse and organize archived technician media by job type, franchisee, and category</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button>
            Export Archive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Type</label>
          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Job Types</option>
            <option value="Commercial">Commercial</option>
            <option value="Residential">Residential</option>
            <option value="Automotive">Automotive</option>
            <option value="Roadside">Roadside</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Franchisee</label>
          <select
            value={selectedFranchisee}
            onChange={(e) => setSelectedFranchisee(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Franchisees</option>
            {franchisees.map(franchisee => (
              <option key={franchisee.id} value={franchisee.name}>
                {franchisee.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technician</label>
          <select
            value={selectedTechnician}
            onChange={(e) => setSelectedTechnician(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Technicians</option>
            {technicians.map(tech => (
              <option key={tech.id} value={tech.name}>
                {tech.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Before">Before</option>
            <option value="After">After</option>
            <option value="Process">Process</option>
            <option value="Tools">Tools</option>
            <option value="Documentation">Documentation</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archived Media</CardTitle>
          <CardDescription>Browse and organize archived technician media. Showing {filteredMedia.length} of {archivedMedia.length} items.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={tableClasses.wrapper}>
            <table className={tableClasses.table}>
              <thead className={tableClasses.header}>
                <tr>
                  <th scope="col" className="p-4">
                    <div className="flex items-center">
                      <input 
                        id="checkbox-all" 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Media
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Job Details
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Technician
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Franchisee
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Archive Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMedia.map((media, index) => (
                  <tr key={media.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="w-4 p-4">
                      <div className="flex items-center">
                        <input 
                          id={`checkbox-table-${media.id}`} 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor={`checkbox-table-${media.id}`} className="sr-only">checkbox</label>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden">
                        <img
                          src={media.photoUrl}
                          alt={media.jobDescription}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <th scope="row" className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                      <div className="font-semibold text-sm mb-1">
                        {media.jobDescription}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        📍 {media.jobLocation}
                      </div>
                      {media.notes && (
                        <div className="text-xs text-gray-600 dark:text-gray-300 italic">
                          "{media.notes}"
                        </div>
                      )}
                    </th>
                    <td className="px-6 py-3 text-sm">
                      {media.techName}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {media.franchiseeName}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getJobTypeVariant(media.jobType)}`}>
                        {media.jobType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {media.dateArchived}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openMediaDetails(media)}
                          className="p-2 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => openAIMarketing(media)}
                          className="p-2 text-purple-600 dark:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-colors"
                          title="AI Marketing Specialist"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </button>
                        <button 
                          className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => deleteMedia(media.id)}
                          className="p-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Media Details Modal */}
      {showModal && selectedMedia && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Image */}
              <div className="flex justify-center">
                <div className="w-64 h-64 rounded-full overflow-hidden mb-4">
                  <img
                    src={selectedMedia.photoUrl}
                    alt={selectedMedia.jobDescription}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Description
                  </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {selectedMedia.jobDescription}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getJobTypeVariant(selectedMedia.jobType)}`}>
                      {selectedMedia.jobType}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {selectedMedia.category}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Technician
                  </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {selectedMedia.techName}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Franchisee
                  </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {selectedMedia.franchiseeName}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    📍 {selectedMedia.jobLocation}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Archive Date
                  </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {selectedMedia.dateArchived}
                  </p>
                </div>
                
                {selectedMedia.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg italic">
                      "{selectedMedia.notes}"
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMedia.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Marketing Specialist Modal */}
      {showAIMarketing && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur rounded-full">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Marketing Specialist</h2>
                    <p className="text-white/90 text-sm">Your Social Media & Locksmith Expert</p>
                  </div>
                </div>
                <button
                  onClick={closeAIMarketing}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Job Context Summary */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                  <img
                    src={selectedMedia.photoUrl}
                    alt={selectedMedia.jobDescription}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getJobTypeVariant(selectedMedia.jobType)}`}>
                      {selectedMedia.jobType}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedMedia.techName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{selectedMedia.franchiseeName}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{selectedMedia.jobDescription}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedMedia.jobLocation}
                  </p>
                  {selectedMedia.notes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">"{selectedMedia.notes}"</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Simple Form Interface */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                {/* Content Generation Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Content Generator</h3>
                    <p className="text-gray-600 dark:text-gray-400">Generate professional social media content for your locksmith services</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Social Platform */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        🎯 Social Platform
                      </label>
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                      >
                        <option value="">Choose platform...</option>
                        <option value="instagram">📱 Instagram</option>
                        <option value="facebook">👥 Facebook</option>
                        <option value="linkedin">💼 LinkedIn</option>
                        <option value="tiktok">🎵 TikTok</option>
                        <option value="twitter">🐦 Twitter/X</option>
                        <option value="youtube">📺 YouTube</option>
                        <option value="pinterest">📌 Pinterest</option>
                        <option value="google-business">🏢 Google My Business</option>
                      </select>
                    </div>
                    
                    {/* Content Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        📝 Content Type
                      </label>
                      <select
                        value={selectedPostType}
                        onChange={(e) => setSelectedPostType(e.target.value)}
                        className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                      >
                        <option value="">Choose content type...</option>
                        <option value="success-story">🏆 Success Story</option>
                        <option value="educational">📚 Educational Content</option>
                        <option value="behind-scenes">🎬 Behind the Scenes</option>
                        <option value="testimonial">⭐ Customer Testimonial</option>
                        <option value="tips-tricks">💡 Tips & Tricks</option>
                        <option value="tools-showcase">🔧 Tools Showcase</option>
                        <option value="before-after">📸 Before & After</option>
                        <option value="promotional">📢 Promotional</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Generate Button */}
                  <Button 
                    onClick={() => {
                      if (selectedPlatform && selectedPostType) {
                        const platformNames = {
                          instagram: 'Instagram',
                          facebook: 'Facebook', 
                          linkedin: 'LinkedIn',
                          tiktok: 'TikTok',
                          twitter: 'Twitter/X',
                          youtube: 'YouTube',
                          pinterest: 'Pinterest',
                          'google-business': 'Google My Business'
                        };
                        const postTypeNames = {
                          'success-story': 'success story',
                          'educational': 'educational content',
                          'behind-scenes': 'behind the scenes content',
                          'testimonial': 'customer testimonial style',
                          'tips-tricks': 'tips and tricks',
                          'tools-showcase': 'tools showcase',
                          'before-after': 'before and after showcase',
                          'promotional': 'promotional content'
                        };
                        sendMessageToAI(`Create a ${postTypeNames[selectedPostType as keyof typeof postTypeNames]} post for ${platformNames[selectedPlatform as keyof typeof platformNames]}`);
                      }
                    }}
                    disabled={!selectedPlatform || !selectedPostType}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl text-lg"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Content
                  </Button>
                </div>

                {/* Generated Content Display */}
                {generatedContent && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Content Generated!</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} • {selectedPostType.replace('-', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => copyToClipboard(generatedContent)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {copySuccess || 'Copy'}
                        </button>
                        <button
                          onClick={() => setShowPreviewModal(true)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center gap-2 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview
                        </button>
                        <button
                          onClick={() => {
                            setGeneratedContent('');
                            setSelectedPlatform('');
                            setSelectedPostType('');
                            setAiConversation([]);
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          New
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="whitespace-pre-line text-gray-900 dark:text-white leading-relaxed">
                        {generatedContent}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && generatedContent && selectedPlatform && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Simple Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Preview
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(generatedContent)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  {copySuccess || 'Copy'}
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Platform Preview */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preview</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 flex justify-center">
                    <PlatformPreview platform={selectedPlatform} content={generatedContent} />
                  </div>
                </div>
                
                {/* Post Content */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Post Content</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="whitespace-pre-line text-gray-900 dark:text-white text-sm leading-relaxed">
                      {generatedContent}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}