'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Flag, Eye, Settings, Archive, Trash2 } from 'lucide-react';
import { useTable } from '@/contexts/table-context';
import ImageModal from '@/components/ImageModal';

interface FranchiseePhoto {
  id: string;
  job_submission_id: string;
  technician_id: string;
  photo_url: string;
  photo_type: 'before' | 'after' | 'process';
  service_category: string;
  service_type: string;
  service_location: string;
  service_date: string;
  job_description: string;
  full_ai_report?: string;
  ai_report_generated_at?: string;
  status: 'pending' | 'approved' | 'denied' | 'flagged';
  reviewed_at?: string;
  review_notes?: string;
  tech_notified: boolean;
  created_at: string;
  technician?: {
    name: string;
    image_url?: string;
    rating?: number;
  };
}

export default function FranchiseePhotosPage() {
  const { getTableClasses } = useTable();
  const tableClasses = getTableClasses();
  const [photos, setPhotos] = useState<FranchiseePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [reviewingPhoto, setReviewingPhoto] = useState<FranchiseePhoto | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<FranchiseePhoto | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'denied' | 'flagged'>('pending');

  // Fetch franchisee photos
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);

        // Get current user's franchisee ID
        const userResponse = await fetch('/api/profile');
        if (!userResponse.ok) {
          throw new Error('Failed to get user profile');
        }

        const userProfile = await userResponse.json();
        const franchiseeId = userProfile.franchisee_id;

        if (!franchiseeId) {
          console.warn('No franchisee ID found for current user');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/franchisee-photos?franchiseeId=${franchiseeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }

        const photoData = await response.json();
        setPhotos(photoData);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      // Filter by active tab first
      if (activeTab !== 'all' && photo.status !== activeTab) return false;
      if (selectedCategory !== 'All' && photo.service_category !== selectedCategory) return false;
      return true;
    });
  }, [photos, activeTab, selectedCategory]);

  const handleReviewPhoto = async (photoId: string, status: 'approved' | 'denied' | 'flagged') => {
    try {
      setProcessing(true);

      const response = await fetch('/api/franchisee-photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId,
          status,
          reviewNotes: reviewNotes.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update photo status');
      }

      const updatedPhoto = await response.json();

      // Update local state
      setPhotos(prev => prev.map(photo =>
        photo.id === photoId ? { ...photo, ...updatedPhoto } : photo
      ));

      // Close modal and reset
      setReviewingPhoto(null);
      setReviewNotes('');

      // Show success message
      const actionText = status === 'approved' ? 'approved' : status === 'denied' ? 'denied' : 'flagged';
      alert(`✅ Photo ${actionText} successfully. Technician has been notified.`);

    } catch (error) {
      console.error('Error updating photo status:', error);
      alert('❌ Failed to update photo status. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'approved': return 'default';
      case 'denied': return 'destructive';
      case 'flagged': return 'secondary';
      case 'pending':
      default: return 'outline';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'denied': return 'Denied';
      case 'flagged': return 'Flagged';
      case 'pending':
      default: return 'Pending Review';
    }
  };

  const getCategoryVariant = (category: string) => {
    switch (category) {
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

  const pendingCount = photos.filter(p => p.status === 'pending').length;
  const approvedCount = photos.filter(p => p.status === 'approved').length;
  const deniedCount = photos.filter(p => p.status === 'denied').length;
  const flaggedCount = photos.filter(p => p.status === 'flagged').length;

  // Action functions
  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/franchisee-photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      alert('✅ Photo deleted successfully.');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('❌ Failed to delete photo. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleArchivePhoto = async (photoId: string) => {
    try {
      setProcessing(true);
      const response = await fetch('/api/franchisee-photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId,
          archived: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to archive photo');
      }

      const updatedPhoto = await response.json();
      setPhotos(prev => prev.map(photo =>
        photo.id === photoId ? { ...photo, ...updatedPhoto } : photo
      ));
      alert('✅ Photo archived successfully.');
    } catch (error) {
      console.error('Error archiving photo:', error);
      alert('❌ Failed to archive photo. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Job Submissions</h1>
          <p className="text-muted-foreground">Review and manage photo submissions from your technicians</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => alert('Settings coming soon!')}>
            <Settings className="w-4 h-4 mr-2" />
            Auto-Approve Settings
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pending'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                activeTab === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {pendingCount}
              </span>
            </div>
          </button>
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
                {approvedCount}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('denied')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'denied'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Denied
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                activeTab === 'denied' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {deniedCount}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'flagged'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Flagged
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                activeTab === 'flagged' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {flaggedCount}
              </span>
            </div>
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Type</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technician</label>
          <select
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Technicians</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <select
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Before">Before</option>
            <option value="After">After</option>
            <option value="Process">Process</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search photos..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle>
            {activeTab === 'pending' && 'Pending Submissions'}
            {activeTab === 'approved' && 'Approved Submissions'}
            {activeTab === 'denied' && 'Denied Submissions'}
            {activeTab === 'flagged' && 'Flagged Submissions'}
          </CardTitle>
          <CardDescription>
            {filteredPhotos.length === 0
              ? `No ${activeTab} photo submissions found.`
              : `Managing ${activeTab} photo submissions from technicians. Showing ${filteredPhotos.length} photo${filteredPhotos.length !== 1 ? 's' : ''}.`
            }
          </CardDescription>
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
                  <th scope="col" className="px-6 py-3">Photo</th>
                  <th scope="col" className="px-6 py-3">Job Details</th>
                  <th scope="col" className="px-6 py-3">Technician</th>
                  <th scope="col" className="px-6 py-3">Category</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Submitted</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading submissions...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPhotos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No submissions found</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                            No photo submissions match your current filters.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPhotos.map((photo) => (
                    <tr
                      key={photo.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => setViewingPhoto(photo)}
                    >
                      <td className="w-4 p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center">
                          <input
                            id={`checkbox-table-${photo.id}`}
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor={`checkbox-table-${photo.id}`} className="sr-only">checkbox</label>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="w-12 h-12 relative rounded-full overflow-hidden">
                          <img
                            src={photo.photo_url}
                            alt={photo.job_description}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <th scope="row" className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                        <div className="text-sm font-medium mb-1">{photo.service_type}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          📍 {photo.service_location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {photo.photo_type}
                          </Badge>
                        </div>
                        {photo.review_notes && (
                          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Note: {photo.review_notes}
                          </div>
                        )}
                      </th>
                      <td className="px-6 py-3 text-sm">
                        {photo.technician?.name || 'Unknown Tech'}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryVariant(photo.service_category)}`}>
                          {photo.service_category}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={getStatusVariant(photo.status)}>
                          {getStatusText(photo.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(photo.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingPhoto(photo)}
                            className="p-2 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Pending tab actions */}
                          {activeTab === 'pending' && (
                            <>
                              <button
                                onClick={() => handleReviewPhoto(photo.id, 'approved')}
                                disabled={processing}
                                className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setReviewingPhoto(photo)}
                                disabled={processing}
                                className="p-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                title="Review/Deny"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setReviewingPhoto(photo)}
                                disabled={processing}
                                className="p-2 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors"
                                title="Flag"
                              >
                                <Flag className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Approved tab actions */}
                          {activeTab === 'approved' && (
                            <>
                              <button
                                onClick={() => handleArchivePhoto(photo.id)}
                                disabled={processing}
                                className="p-2 text-gray-600 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-full transition-colors"
                                title="Archive"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setReviewingPhoto(photo)}
                                disabled={processing}
                                className="p-2 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors"
                                title="Flag"
                              >
                                <Flag className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Universal delete action */}
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            disabled={processing}
                            className="p-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Review Modal */}
      <Dialog open={!!reviewingPhoto} onOpenChange={() => setReviewingPhoto(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>Review Photo Submission</DialogTitle>
            <DialogDescription>
              Review and provide feedback for this photo submission
            </DialogDescription>
          </DialogHeader>

          {reviewingPhoto && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-32 h-32 relative rounded-lg overflow-hidden shrink-0">
                  <img
                    src={reviewingPhoto.photo_url}
                    alt={reviewingPhoto.job_description}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-medium">{reviewingPhoto.service_type}</h3>
                  <p className="text-sm text-gray-600">📍 {reviewingPhoto.service_location}</p>
                  <p className="text-sm text-gray-600">👤 {reviewingPhoto.technician?.name}</p>
                  <Badge variant="outline" className="text-xs capitalize">
                    {reviewingPhoto.photo_type} Photo
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Review Notes (Optional)</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes for the technician..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewingPhoto(null)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => reviewingPhoto && handleReviewPhoto(reviewingPhoto.id, 'flagged')}
              disabled={processing}
            >
              <Flag className="w-4 h-4 mr-2" />
              Flag
            </Button>
            <Button
              variant="destructive"
              onClick={() => reviewingPhoto && handleReviewPhoto(reviewingPhoto.id, 'denied')}
              disabled={processing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Deny
            </Button>
            <Button
              onClick={() => reviewingPhoto && handleReviewPhoto(reviewingPhoto.id, 'approved')}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Image Modal */}
      <ImageModal
        isOpen={!!viewingPhoto}
        onClose={() => setViewingPhoto(null)}
        imageUrl={viewingPhoto?.photo_url || ''}
        altText={viewingPhoto?.job_description || ''}
        jobDetails={viewingPhoto ? {
          imageUrl: viewingPhoto.photo_url,
          jobType: viewingPhoto.service_category,
          location: viewingPhoto.service_location,
          dateUploaded: new Date(viewingPhoto.created_at).toLocaleDateString(),
          status: getStatusText(viewingPhoto.status),
          serviceDescription: viewingPhoto.full_ai_report || viewingPhoto.job_description,
          tags: [viewingPhoto.service_type, viewingPhoto.photo_type],
          technicianName: viewingPhoto.technician?.name,
          aiReport: viewingPhoto.full_ai_report,
          aiReportGeneratedAt: viewingPhoto.ai_report_generated_at
        } : undefined}
      />
    </div>
  );
}