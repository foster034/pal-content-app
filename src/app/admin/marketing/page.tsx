'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
    photoUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&auto=format",
    jobType: "Residential",
    techName: "John Smith",
    techId: 1,
    franchiseeName: "Pop-A-Lock Downtown",
    franchiseeId: 1,
    jobLocation: "123 Main St",
    jobDescription: "Security Upgrade",
    dateUploaded: "2024-01-15",
    dateArchived: "2024-01-20",
    tags: ["residential", "security", "upgrade"],
    category: "After" as const,
    notes: "Client requested enhanced security measures",
    archived: false
  },
  {
    id: 2,
    photoUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&auto=format",
    jobType: "Commercial",
    techName: "Sarah Wilson",
    techId: 2,
    franchiseeName: "Pop-A-Lock Business District",
    franchiseeId: 2,
    jobLocation: "500 Bay Street, Toronto",
    jobDescription: "Office Lock Installation",
    dateUploaded: "2024-01-18",
    dateArchived: "2024-01-20",
    tags: ["commercial", "installation", "office"],
    category: "Process" as const,
    notes: "High-security locks for executive offices",
    archived: false
  },
  {
    id: 3,
    photoUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&auto=format",
    jobType: "Automotive",
    techName: "Mike Rodriguez",
    techId: 3,
    franchiseeName: "Pop-A-Lock Mobile",
    franchiseeId: 3,
    jobLocation: "Yorkdale Mall Parking",
    jobDescription: "Car Lockout Service",
    dateUploaded: "2024-01-19",
    dateArchived: "2024-01-20",
    tags: ["automotive", "lockout", "emergency"],
    category: "Before" as const,
    notes: "Customer locked keys in running vehicle",
    archived: false
  }
];

const franchisees = [];

const technicians = [];

export default function MediaArchivePage() {
  const { getTableClasses } = useTable();
  const tableClasses = getTableClasses();

  const [archivedMedia, setArchivedMedia] = useState<ArchivedMedia[]>([]);

  // Load data from database and localStorage on component mount
  useEffect(() => {
    const fetchArchivedMedia = async () => {
      try {
        // First try to fetch from database
        const response = await fetch('/api/media-archive');
        if (response.ok) {
          const databaseData = await response.json();
          console.log('✅ Fetched archived media from database:', databaseData.length, 'items');
          setArchivedMedia(databaseData);
          return;
        } else {
          console.warn('⚠️ Failed to fetch from database, falling back to localStorage');
        }
      } catch (error) {
        console.error('Error fetching from database:', error);
      }

      // Fallback to localStorage if database fails
      const savedData = localStorage.getItem('marketing-archived-media');
      if (savedData) {
        try {
          setArchivedMedia(JSON.parse(savedData));
        } catch (error) {
          console.error('Error loading saved data:', error);
          setArchivedMedia(initialArchivedMedia);
        }
      } else {
        setArchivedMedia(initialArchivedMedia);
      }
    };

    fetchArchivedMedia();
  }, []);

  // Save data to localStorage whenever archivedMedia changes
  useEffect(() => {
    if (archivedMedia.length > 0 || localStorage.getItem('marketing-archived-media')) {
      localStorage.setItem('marketing-archived-media', JSON.stringify(archivedMedia));
    }
  }, [archivedMedia]);
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
  const [activeTab, setActiveTab] = useState<'approved' | 'archived' | 'generated'>('approved');
  const [editingMedia, setEditingMedia] = useState<ArchivedMedia | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [generatedContentList, setGeneratedContentList] = useState<any[]>([]);
  const [loadingGenerated, setLoadingGenerated] = useState(false);

  const filteredMedia = useMemo(() => {
    return archivedMedia.filter(media => {
      // Filter by active tab first
      if (activeTab === 'approved' && media.archived) return false;
      if (activeTab === 'archived' && !media.archived) return false;
      if (activeTab === 'generated') return false; // Generated content is handled separately

      if (selectedJobType !== 'All' && media.jobType !== selectedJobType) return false;
      if (selectedFranchisee !== 'All' && media.franchiseeName !== selectedFranchisee) return false;
      if (selectedTechnician !== 'All' && media.techName !== selectedTechnician) return false;
      if (selectedCategory !== 'All' && media.category !== selectedCategory) return false;
      if (searchTerm && !media.jobDescription.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !media.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) &&
          !media.notes?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [archivedMedia, activeTab, selectedJobType, selectedFranchisee, selectedTechnician, selectedCategory, searchTerm]);

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
    const mediaToDelete = archivedMedia.find(media => media.id === mediaId);
    if (mediaToDelete && confirm(`Are you sure you want to delete this ${mediaToDelete.jobDescription} entry? This action cannot be undone.`)) {
      setArchivedMedia(prev => prev.filter(media => media.id !== mediaId));
      console.log(`Deleted media item: ${mediaToDelete.jobDescription} (ID: ${mediaId})`);
    }
  };

  const resetDemoData = () => {
    if (confirm('Reset to original demo data? This will restore all 3 demo entries.')) {
      setArchivedMedia(initialArchivedMedia);
      localStorage.setItem('marketing-archived-media', JSON.stringify(initialArchivedMedia));
      console.log('Demo data reset to original state');
    }
  };

  const openMediaDetails = (media: ArchivedMedia) => {
    setSelectedMedia(media);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setShowModal(false);
  };

  const openEditMedia = (media: ArchivedMedia) => {
    setEditingMedia(media);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingMedia(null);
    setShowEditModal(false);
  };

  const saveMediaEdit = async (updatedMedia: ArchivedMedia) => {
    try {
      // Update the local state
      setArchivedMedia(prev => prev.map(media =>
        media.id === updatedMedia.id ? updatedMedia : media
      ));

      // You can add API call here to save to database if needed
      console.log('Media updated:', updatedMedia);

      closeEditModal();
    } catch (error) {
      console.error('Error updating media:', error);
    }
  };

  const toggleArchiveStatus = async (media: ArchivedMedia) => {
    try {
      const updatedMedia = {
        ...media,
        archived: !media.archived,
        dateArchived: !media.archived ? new Date().toISOString() : media.dateArchived
      };

      // Update the local state
      setArchivedMedia(prev => prev.map(m =>
        m.id === media.id ? updatedMedia : m
      ));

      // You can add API call here to save to database if needed
      console.log(`Media ${media.archived ? 'unarchived' : 'archived'}:`, updatedMedia);

    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  };

  const openAIMarketing = (media: ArchivedMedia) => {
    setSelectedMedia(media);
    setShowModal(false); // Close details modal if open
    setShowAIMarketing(true);
    // Initialize AI conversation with job context
    setAiConversation([{
      role: 'ai',
      message: "Hey there! I'm your AI Marketing Specialist! I see you want to create some amazing content from this " + media.jobType.toLowerCase() + " job by " + media.techName + ".\n\nAs both a social media expert AND a professional locksmith specialist, I can help you create engaging posts for:\n\n**Social Platforms:** Instagram, Facebook, LinkedIn, TikTok, Twitter, YouTube, Pinterest\n**Post Types:** Success stories, educational content, behind-the-scenes, customer testimonials, tips & tricks\n**Locksmith Expertise:** " + media.jobType + " services, tools showcase, safety tips, industry insights\n\n**Job Details I'm Working With:**\n- Service: " + media.jobDescription + "\n- Location: " + media.jobLocation + "\n- Technician: " + media.techName + "\n- Notes: " + (media.notes || 'No additional notes') + "\n\nWhat kind of post are you thinking? I can ask you a few quick questions to create the perfect content!"
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

  const fetchGeneratedContent = async () => {
    try {
      setLoadingGenerated(true);
      const response = await fetch('/api/generated-content');

      if (response.ok) {
        const data = await response.json();
        setGeneratedContentList(Array.isArray(data) ? data : []);
      } else {
        console.warn('Failed to fetch generated content');
        setGeneratedContentList([]);
      }
    } catch (error) {
      console.error('Error fetching generated content:', error);
      setGeneratedContentList([]);
    } finally {
      setLoadingGenerated(false);
    }
  };

  // Fetch generated content when the generated tab is selected
  useEffect(() => {
    if (activeTab === 'generated') {
      fetchGeneratedContent();
    }
  }, [activeTab]);

  const createMarketingContent = async (generatedContentId: number, media: ArchivedMedia, content: string, platform: string) => {
    try {
      console.log('📅 Creating marketing content for scheduling...');

      const response = await fetch('/api/marketing-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generatedContentId: generatedContentId,
          mediaArchiveId: media.id,
          title: `${media.jobType} Service - ${media.techName}`,
          content: content,
          hashtags: ['PopALock', media.jobType.toLowerCase(), 'locksmith', 'security'],
          platform: platform,
          postType: 'image_post',
          campaignName: `${media.jobType} Campaign`,
          targetAudience: `${media.jobType} customers in ${media.jobLocation}`,
          callToAction: 'Contact us for professional locksmith services!'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Marketing content created successfully:', data);
        return data;
      } else {
        const errorData = await response.json();
        console.warn('⚠️ Failed to create marketing content:', errorData);
      }
    } catch (error) {
      console.error('Error creating marketing content:', error);
    }
  };

  const handleCreateMarketingPost = async () => {
    if (!selectedMedia || !generatedContent || !selectedPlatform) {
      console.warn('Missing required data for creating marketing post');
      return;
    }

    try {
      // First save the generated content if not already saved
      const savedContent = await saveGeneratedContent(
        generatedContent,
        selectedMedia,
        selectedPlatform,
        'Generated marketing content'
      );

      if (savedContent?.data) {
        // Create marketing content for scheduling
        const marketingContent = await createMarketingContent(
          savedContent.data.id,
          selectedMedia,
          generatedContent,
          selectedPlatform
        );

        if (marketingContent?.success) {
          // Show success message and close modals
          setCopySuccess('Sent to Marketing Dashboard! 🎉');
          setTimeout(() => {
            setShowPreviewModal(false);
            closeAIMarketing();
            setCopySuccess('');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error creating marketing post:', error);
      setCopySuccess('Error creating post ❌');
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  const saveGeneratedContent = async (content: string, media: ArchivedMedia, platform: string, prompt: string) => {
    try {
      console.log('💾 Saving generated content to database...');

      const response = await fetch('/api/generated-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photo_id: media.id,
          media_archive_id: media.id,
          content: content,
          content_type: 'social_media_post',
          platform: platform || 'general',
          status: 'draft',
          metadata: {
            jobType: media.jobType,
            techName: media.techName,
            franchiseeName: media.franchiseeName,
            jobLocation: media.jobLocation,
            generatedAt: new Date().toISOString(),
            promptUsed: prompt
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Generated content saved successfully:', data);
        return data;
      } else {
        const errorData = await response.json();
        console.warn('⚠️ Failed to save generated content:', errorData);

        // If table doesn't exist, show the SQL creation message
        if (errorData.sql) {
          console.log('📋 To create the generated_content table, run this SQL:');
          console.log(errorData.sql);
        }
      }
    } catch (error) {
      console.error('Error saving generated content:', error);
    }
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
      
      // If this looks like generated content, store it for preview and save to database
      if (data.response && (userMessage.toLowerCase().includes('create') || userMessage.toLowerCase().includes('generate'))) {
        setGeneratedContent(data.response);
        setShowPreview(true);

        // Save the generated content to the database
        if (selectedMedia) {
          const savedContent = await saveGeneratedContent(
            data.response,
            selectedMedia,
            selectedPlatform || 'general',
            userMessage
          );

          // Content saved to generated_content table
          if (savedContent?.data) {
            console.log('✨ Generated content saved to database with ID:', savedContent.data.id);
          }
        }
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
                <div className="font-semibold text-sm">{selectedMedia?.franchiseeName.toLowerCase().split(' ').join('')}</div>
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
                <span className="font-semibold">{selectedMedia?.franchiseeName.toLowerCase().split(' ').join('')}</span>
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
                  {timeAgo} - Web
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
                <div className="text-xs text-gray-500">{selectedMedia?.techName} - Locksmith Professional</div>
                <div className="text-xs text-gray-500">{timeAgo} - Web</div>
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

  // EditMediaForm component
  const EditMediaForm = ({ media, onSave, onCancel }: {
    media: ArchivedMedia;
    onSave: (media: ArchivedMedia) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      jobType: media.jobType,
      jobLocation: media.jobLocation,
      techName: media.techName,
      franchiseeName: media.franchiseeName,
      notes: media.notes || '',
      tags: media.tags.join(', '),
      category: media.category || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const updatedMedia: ArchivedMedia = {
        ...media,
        jobType: formData.jobType as ArchivedMedia['jobType'],
        jobLocation: formData.jobLocation,
        techName: formData.techName,
        franchiseeName: formData.franchiseeName,
        notes: formData.notes,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        category: formData.category
      };

      onSave(updatedMedia);
    };

    const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jobType">Job Type</Label>
            <select
              id="jobType"
              value={formData.jobType}
              onChange={(e) => handleChange('jobType', e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="Commercial">Commercial</option>
              <option value="Residential">Residential</option>
              <option value="Automotive">Automotive</option>
              <option value="Roadside">Roadside</option>
            </select>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g., before, after, process"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="jobLocation">Job Location</Label>
          <Input
            id="jobLocation"
            value={formData.jobLocation}
            onChange={(e) => handleChange('jobLocation', e.target.value)}
            placeholder="Enter job location"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="techName">Technician Name</Label>
            <Input
              id="techName"
              value={formData.techName}
              onChange={(e) => handleChange('techName', e.target.value)}
              placeholder="Enter technician name"
            />
          </div>

          <div>
            <Label htmlFor="franchiseeName">Franchise Name</Label>
            <Input
              id="franchiseeName"
              value={formData.franchiseeName}
              onChange={(e) => handleChange('franchiseeName', e.target.value)}
              placeholder="Enter franchise name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="Enter tags separated by commas"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Enter any additional notes"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
          >
            Save Changes
          </Button>
        </div>
      </form>
    );
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
          <Button onClick={resetDemoData} variant="outline">
            Reset Demo Data
          </Button>
          <Button
            onClick={() => {
              const approvedItems = archivedMedia.filter(m => !m.archived);
              if (approvedItems.length > 0) {
                // Archive all approved items
                setArchivedMedia(prev => prev.map(media =>
                  !media.archived ? { ...media, archived: true, dateArchived: new Date().toISOString() } : media
                ));
                console.log(`Archived ${approvedItems.length} approved items`);
              }
            }}
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
            </svg>
            Archive All Approved
          </Button>
          <Button>
            Export Archive
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('approved')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'approved'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approved
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                activeTab === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {archivedMedia.filter(m => !m.archived).length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'archived'
                ? 'border-gray-500 text-gray-600 dark:text-gray-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
              </svg>
              Archived
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                activeTab === 'archived' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {archivedMedia.filter(m => m.archived).length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('generated')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'generated'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generated Content
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                activeTab === 'generated' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {generatedContentList.length}
              </span>
            </div>
          </button>
        </nav>
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
          <CardTitle>
            {activeTab === 'approved' && 'Approved Submissions'}
            {activeTab === 'archived' && 'Archived Submissions'}
            {activeTab === 'generated' && 'Generated Content'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'approved'
              ? `Managing approved photo submissions from technicians. Showing ${filteredMedia.length} photo${filteredMedia.length !== 1 ? 's' : ''}.`
              : activeTab === 'archived'
              ? `Managing archived photo submissions from technicians. Showing ${filteredMedia.length} photo${filteredMedia.length !== 1 ? 's' : ''}.`
              : `AI-generated content ready for review and scheduling. Showing ${generatedContentList.length} item${generatedContentList.length !== 1 ? 's' : ''}.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTab !== 'generated' ? (
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
                  {filteredMedia.map((media) => (
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
                        {media.jobType} Service
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        📍 {media.jobLocation}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {media.category && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {media.category}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          media.archived
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {media.archived ? 'Archived' : 'Approved'}
                        </span>
                      </div>
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
                          onClick={() => openEditMedia(media)}
                          className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleArchiveStatus(media)}
                          className={`p-2 rounded-full transition-colors ${
                            media.archived
                              ? 'text-yellow-600 dark:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                              : 'text-gray-600 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20'
                          }`}
                          title={media.archived ? "Unarchive" : "Archive"}
                        >
                          {media.archived ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
                            </svg>
                          )}
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
          ) : (
            /* Generated Content Section */
            <div className="space-y-4">
              {loadingGenerated ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading generated content...</p>
                  </div>
                </div>
              ) : generatedContentList.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Generated Content</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Generate AI content from approved photos to see it here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedContentList.map((content) => (
                    <div key={content.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${
                              content.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                              content.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              content.status === 'published' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                            </Badge>
                            {content.platform && (
                              <Badge variant="outline">
                                {content.platform.charAt(0).toUpperCase() + content.platform.slice(1)}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(content.generated_at || content.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-3">
                            <p className="text-sm whitespace-pre-line">
                              {content.content.length > 200 ?
                                content.content.substring(0, 200) + '...' :
                                content.content
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {content.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                createMarketingContent(
                                  content.id,
                                  archivedMedia.find(m => m.id === content.photo_id) || archivedMedia[0],
                                  content.content,
                                  content.platform || 'general'
                                );
                              }}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Send to Marketing
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchGeneratedContent()}
                          >
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Details Modal */}
      {showModal && selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      selectedMedia.jobType === 'Commercial' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                      selectedMedia.jobType === 'Residential' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' :
                      selectedMedia.jobType === 'Automotive' ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white' :
                      selectedMedia.jobType === 'Roadside' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                      'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                    }`}>
                      {selectedMedia.jobType}
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approved
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="rounded-full p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 max-h-[75vh] overflow-hidden">
                {/* Image Section */}
                <div className="lg:col-span-3 bg-gray-50 relative">
                  <div className="aspect-[4/3] flex items-center justify-center p-8">
                    <img
                      src={selectedMedia.photoUrl}
                      alt={selectedMedia.jobDescription}
                      className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                    />
                  </div>
                  <button
                    className="absolute top-4 right-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium rounded-lg hover:bg-white transition-all duration-200 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Full Size
                  </button>
                </div>

                {/* Details Section */}
                <div className="lg:col-span-2 bg-white flex flex-col max-h-[75vh]">
                  <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-900">Job Information</h3>

                    {/* Job Details */}
                    <div className="space-y-4">
                      {/* Location */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">LOCATION</p>
                          <p className="text-sm font-medium text-gray-900">{selectedMedia.jobLocation}</p>
                        </div>
                      </div>

                      {/* Date Uploaded */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">DATE UPLOADED</p>
                          <p className="text-sm font-medium text-gray-900">{selectedMedia.dateUploaded}</p>
                        </div>
                      </div>

                      {/* Technician */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">TECHNICIAN</p>
                          <p className="text-sm font-medium text-gray-900">{selectedMedia.techName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Service Description */}
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-gray-900">Service Description</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900 font-medium mb-3">{selectedMedia.jobDescription}</p>
                        {selectedMedia.notes && (
                          <p className="text-sm text-gray-600 italic">"{selectedMedia.notes}"</p>
                        )}

                        {/* Tags */}
                        {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {selectedMedia.tags.map((tag: string) => (
                                <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 border border-gray-200">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Original Button */}
                    <div className="flex justify-center pt-4">
                      <button
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm border border-gray-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Original
                      </button>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t border-gray-100 bg-gray-50/50 px-8 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAIMarketing(selectedMedia)}
                        className="text-xs"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Content
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Details
                      </Button>
                    </div>
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
                    <span className="text-gray-400">-</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedMedia.techName}</span>
                    <span className="text-gray-400">-</span>
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
                            {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} • {selectedPostType.split('-').join(' ')}
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
                  onClick={handleCreateMarketingPost}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Create Marketing Post
                </button>
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

      {/* Edit Media Modal */}
      {showEditModal && editingMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Edit Media Details</h2>
                    <p className="text-white/90 text-sm">Update information for this archived media</p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <EditMediaForm
                media={editingMedia}
                onSave={saveMediaEdit}
                onCancel={closeEditModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}