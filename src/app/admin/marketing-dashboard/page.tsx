'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTable } from '@/contexts/table-context';

interface MarketingContent {
  id: number;
  generated_content_id?: number;
  media_archive_id?: number;
  title: string;
  content: string;
  hashtags: string[];
  mentions: string[];
  platform: string;
  post_type: string;
  scheduled_date?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled';
  approval_status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  assigned_to?: string;
  created_by?: string;
  approved_by?: string;
  published_at?: string;
  post_url?: string;
  engagement_metrics: any;
  campaign_name?: string;
  target_audience?: string;
  call_to_action?: string;
  notes?: string;
  additional_images: string[];
  video_url?: string;
  created_at: string;
  updated_at: string;
  generated_content?: {
    content: string;
    content_type: string;
    metadata: any;
  };
  media_archive?: {
    photo_url: string;
    job_type: string;
    job_location: string;
    technician_id: string;
    franchisee_id: string;
  };
}

export default function MarketingDashboard() {
  const { getTableClasses } = useTable();
  const tableClasses = getTableClasses();

  const [marketingContent, setMarketingContent] = useState<MarketingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'scheduled' | 'published'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingContent, setEditingContent] = useState<MarketingContent | null>(null);

  // Fetch marketing content
  const fetchMarketingContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketing-content');

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched marketing content:', data.length, 'items');
        setMarketingContent(data);
      } else {
        const errorData = await response.json();
        console.warn('⚠️ Failed to fetch marketing content:', errorData);

        // If table doesn't exist, show empty state with instructions
        if (errorData.sql) {
          setMarketingContent([]);
        }
      }
    } catch (error) {
      console.error('Error fetching marketing content:', error);
      setMarketingContent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingContent();
  }, []);

  // Filter content based on active tab and filters
  const filteredContent = useMemo(() => {
    return marketingContent.filter(content => {
      // Filter by active tab
      if (activeTab !== 'all' && content.status !== activeTab) return false;

      // Filter by platform
      if (selectedPlatform !== 'All' && content.platform !== selectedPlatform) return false;

      // Filter by status
      if (selectedStatus !== 'All' && content.approval_status !== selectedStatus) return false;

      // Filter by search term
      if (searchTerm && !content.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !content.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !content.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      return true;
    });
  }, [marketingContent, activeTab, selectedPlatform, selectedStatus, searchTerm]);

  // Get counts for tabs
  const getTabCount = (status: string) => {
    if (status === 'all') return marketingContent.length;
    return marketingContent.filter(c => c.status === status).length;
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      facebook: '📘',
      instagram: '📷',
      twitter: '🐦',
      linkedin: '💼',
      tiktok: '🎵',
      youtube: '📺',
      pinterest: '📌'
    };
    return icons[platform.toLowerCase()] || '📱';
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getApprovalBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      needs_revision: 'bg-orange-100 text-orange-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateContentStatus = async (id: number, status: string, approvalStatus?: string) => {
    try {
      const updateData: any = { status };
      if (approvalStatus) updateData.approval_status = approvalStatus;

      const response = await fetch('/api/marketing-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updateData })
      });

      if (response.ok) {
        fetchMarketingContent(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating content status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Marketing Dashboard</h1>
          <p className="text-muted-foreground">Manage and schedule AI-generated content across platforms</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowCreateModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Content
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingContent.length}</div>
            <p className="text-xs text-muted-foreground">pieces of content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTabCount('scheduled')}</div>
            <p className="text-xs text-muted-foreground">posts scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTabCount('published')}</div>
            <p className="text-xs text-muted-foreground">posts published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTabCount('draft')}</div>
            <p className="text-xs text-muted-foreground">drafts saved</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Content', count: getTabCount('all') },
            { key: 'draft', label: 'Drafts', count: getTabCount('draft') },
            { key: 'scheduled', label: 'Scheduled', count: getTabCount('scheduled') },
            { key: 'published', label: 'Published', count: getTabCount('published') }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {tab.label}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === tab.key ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {tab.count}
                </span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label>Platform</Label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>

        <div>
          <Label>Approval Status</Label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="needs_revision">Needs Revision</option>
          </select>
        </div>

        <div>
          <Label>Search</Label>
          <Input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button variant="outline" onClick={fetchMarketingContent}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Content</CardTitle>
          <CardDescription>
            Manage and schedule your AI-generated content. Showing {filteredContent.length} of {marketingContent.length} items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={tableClasses.wrapper}>
            <table className={tableClasses.table}>
              <thead className={tableClasses.header}>
                <tr>
                  <th scope="col" className="px-6 py-3">Content</th>
                  <th scope="col" className="px-6 py-3">Platform</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Approval</th>
                  <th scope="col" className="px-6 py-3">Scheduled</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading content...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredContent.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No content found</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                            Create your first marketing content or adjust your filters.
                          </p>
                        </div>
                        <Button onClick={() => setShowCreateModal(true)}>
                          Create First Content
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContent.map((content) => (
                    <tr
                      key={content.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {content.media_archive?.photo_url && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={content.media_archive.photo_url}
                                alt={content.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {content.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {content.content.substring(0, 100)}...
                            </p>
                            {content.campaign_name && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mt-1">
                                {content.campaign_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getPlatformIcon(content.platform)}</span>
                          <span className="text-sm font-medium capitalize">{content.platform}</span>
                        </div>
                        <span className="text-xs text-gray-500 capitalize">{content.post_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(content.status)}`}>
                          {content.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApprovalBadge(content.approval_status)}`}>
                          {content.approval_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(content.scheduled_date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingContent(content)}
                          >
                            Edit
                          </Button>
                          {content.approval_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateContentStatus(content.id, content.status, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateContentStatus(content.id, content.status, 'rejected')}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {content.status === 'draft' && content.approval_status === 'approved' && (
                            <Button
                              size="sm"
                              onClick={() => updateContentStatus(content.id, 'scheduled')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Schedule
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}