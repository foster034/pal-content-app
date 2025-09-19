'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import JobSubmissionForm from '@/components/JobSubmissionForm';
import { useTable } from '@/contexts/table-context';
import ImageModal from '@/components/ImageModal';

interface TechPhoto {
  id: string;
  photoUrl: string;
  jobType: 'Commercial' | 'Residential' | 'Automotive' | 'Roadside';
  jobDescription: string;
  dateUploaded: string;
  jobLocation: string;
  tags: string[];
  franchiseeApproved: boolean;
  adminOverride?: boolean;
  technicianName?: string;
  photoStatus?: 'pending' | 'approved' | 'denied' | 'flagged';
  reviewNotes?: string;
  reviewedAt?: string;
}

const serviceCategories: { [key: string]: string[] } = {
  'Residential': [
    'Lock Installation',
    'Lock Repair',
    'Lock Rekeying',
    'Security Upgrade',
    'Smart Lock Installation',
    'Door Repair',
    'Safe Opening',
    'Emergency Lockout'
  ],
  'Automotive': [
    'Car Lockout',
    'Key Replacement',
    'Ignition Repair',
    'Key Programming',
    'Key Duplication',
    'Remote Programming',
    'Transponder Keys',
    'Emergency Service'
  ],
  'Commercial': [
    'Office Lockout',
    'Master Key System',
    'Access Control Installation',
    'High Security Locks',
    'Panic Hardware',
    'File Cabinet Service',
    'Keypad Installation',
    'Business Rekey'
  ],
  'Roadside': [
    'Emergency Lockout',
    'Mobile Key Service',
    '24/7 Assistance',
    'Trunk Lockout',
    'Motorcycle Assistance',
    'Fleet Vehicle Service',
    'Emergency Key Making',
    'Mobile Locksmith'
  ]
};

export default function TechPhotosPage() {
  const router = useRouter();
  const { getTableClasses } = useTable();
  const tableClasses = getTableClasses();
  const [photos, setPhotos] = useState<TechPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobType, setSelectedJobType] = useState<string>('All');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string>('All');
  const [photoStatuses, setPhotoStatuses] = useState<{ [key: string]: any }>({});
  const [editingPhoto, setEditingPhoto] = useState<TechPhoto | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<TechPhoto | null>(null);
  const [editForm, setEditForm] = useState<Partial<TechPhoto>>({});
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [jobForm, setJobForm] = useState({
    category: '',
    service: '',
    location: '',
    description: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerPermission: false,
    photos: [] as string[],
    photoTypes: [] as string[]
  });

  // Fetch job submissions and transform them into photos
  useEffect(() => {
    const fetchJobSubmissionsAndStatuses = async () => {
      try {
        setLoading(true);

        // Fetch job submissions
        const response = await fetch('/api/job-submissions');
        if (!response.ok) {
          throw new Error('Failed to fetch job submissions');
        }

        const jobSubmissions = await response.json();

        // Fetch photo statuses from franchisee_photos table
        const statusResponse = await fetch('/api/franchisee-photos?technicianId=52e1e11e-3200-4ae5-ab8e-60722788ec51');
        let photoStatusMap: { [key: string]: any } = {};

        if (statusResponse.ok) {
          const photoStatuses = await statusResponse.json();
          setPhotoStatuses(photoStatuses);

          // Create a map for quick lookup
          photoStatuses.forEach((status: any) => {
            const key = `${status.job_submission_id}-${status.photo_url}`;
            photoStatusMap[key] = status;
          });
        }

        // Transform job submissions into TechPhoto format
        const transformedPhotos: TechPhoto[] = [];

        jobSubmissions.forEach((job: any) => {
          // Extract all photos from the job submission
          const allPhotos = [
            ...(job.media.beforePhotos || []).map((url: string) => ({ url, type: 'before' })),
            ...(job.media.afterPhotos || []).map((url: string) => ({ url, type: 'after' })),
            ...(job.media.processPhotos || []).map((url: string) => ({ url, type: 'process' }))
          ];

          allPhotos.forEach((photo: any, index: number) => {
            if (photo.url && photo.url.trim()) {
              const photoKey = `${job.id}-${photo.url}`;
              const statusData = photoStatusMap[photoKey];

              transformedPhotos.push({
                id: `${job.id}__${index}`,
                photoUrl: photo.url,
                jobType: job.service.category as TechPhoto['jobType'],
                jobDescription: job.service.description || `${job.service.type} - ${job.service.category}`,
                dateUploaded: new Date(job.submittedAt).toLocaleDateString(),
                jobLocation: job.service.location,
                tags: [job.service.type, job.service.category, photo.type].filter(Boolean),
                franchiseeApproved: job.status === 'approved',
                adminOverride: job.status === 'admin_approved',
                technicianName: job.technician.name,
                photoStatus: statusData?.status || 'pending',
                reviewNotes: statusData?.review_notes,
                reviewedAt: statusData?.reviewed_at
              });
            }
          });
        });

        setPhotos(transformedPhotos);
      } catch (error) {
        console.error('Error fetching job submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobSubmissionsAndStatuses();
  }, []);

  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      if (selectedJobType !== 'All' && photo.jobType !== selectedJobType) return false;
      if (selectedApprovalStatus !== 'All') {
        if (selectedApprovalStatus === 'Franchisee Approved' && !photo.franchiseeApproved) return false;
        if (selectedApprovalStatus === 'Franchisee Denied' && photo.franchiseeApproved) return false;
        if (selectedApprovalStatus === 'Admin Override' && !photo.adminOverride) return false;
      }
      return true;
    });
  }, [photos, selectedJobType, selectedApprovalStatus]);

  const deletePhoto = async (photoId: string) => {
    try {
      // Find the photo to check if it can be deleted
      const photo = photos.find(p => p.id === photoId);
      if (!photo) {
        alert('Photo not found');
        return;
      }

      // Check if the photo can be deleted
      if (!canDeletePhoto(photo)) {
        alert('Cannot delete this job submission. Once a job has been reviewed or approved by your franchisee, it cannot be deleted. Only pending jobs can be removed.');
        return;
      }

      // Extract job ID from photo ID (format: jobId__photoIndex)
      const jobId = photoId.split('__')[0];

      // Show confirmation dialog
      if (!confirm('Are you sure you want to delete this job submission? This will remove all photos associated with this job.')) {
        return;
      }

      // Delete from database
      const response = await fetch(`/api/job-submissions?id=${jobId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete job submission');
      }

      // Remove all photos for this job from local state
      setPhotos(prev => prev.filter(photo => !photo.id.startsWith(jobId + '__')));

      alert('Job submission deleted successfully');
    } catch (error) {
      console.error('Error deleting job submission:', error);
      alert('Failed to delete job submission. Please try again.');
    }
  };

  const openEditModal = (photo: TechPhoto) => {
    setEditingPhoto(photo);
    setEditForm({
      jobDescription: photo.jobDescription,
      jobLocation: photo.jobLocation,
      jobType: photo.jobType,
      tags: [...photo.tags],
    });
  };

  const closeEditModal = () => {
    setEditingPhoto(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editingPhoto) return;
    
    setPhotos(prev => prev.map(photo => 
      photo.id === editingPhoto.id 
        ? { 
            ...photo, 
            jobDescription: editForm.jobDescription || photo.jobDescription,
            jobLocation: editForm.jobLocation || photo.jobLocation,
            jobType: (editForm.jobType as TechPhoto['jobType']) || photo.jobType,
            tags: editForm.tags || photo.tags,
          }
        : photo
    ));
    closeEditModal();
  };

  const updateTags = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setEditForm(prev => ({ ...prev, tags }));
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

  const getStatusVariant = (photo: TechPhoto): "default" | "secondary" | "destructive" | "outline" => {
    switch (photo.photoStatus) {
      case 'approved':
        return 'default';
      case 'denied':
        return 'destructive';
      case 'flagged':
        return 'secondary';
      case 'pending':
      default:
        return 'outline';
    }
  };

  const getStatusText = (photo: TechPhoto): string => {
    switch (photo.photoStatus) {
      case 'approved':
        return 'Approved';
      case 'denied':
        return 'Denied';
      case 'flagged':
        return 'Flagged';
      case 'pending':
      default:
        return 'Pending Review';
    }
  };

  const canDeletePhoto = (photo: TechPhoto): boolean => {
    // Only allow deletion if the job is still pending
    return photo.photoStatus === 'pending' || !photo.photoStatus;
  };

  const handleSubmitJob = () => {
    router.push('/tech/dashboard?openForm=true');
  };

  const handleJobFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobForm.category || !jobForm.service) {
      alert('Please select both category and service');
      return;
    }

    try {
      setSubmitting(true);

      // Transform to API format
      const jobSubmissionData = {
        technicianId: '52e1e11e-3200-4ae5-ab8e-60722788ec51', // John Smith from actual database
        franchiseeId: 'bd452dd2-aade-4c4b-a112-5ad3a07f4013', // Pop-A-Lock Simcoe County from actual database
        client: {
          name: jobForm.customerName || 'Not provided',
          phone: jobForm.customerPhone || '',
          email: jobForm.customerEmail || '',
          preferredContactMethod: 'phone',
          consentToContact: jobForm.customerPermission,
          consentToShare: jobForm.customerPermission
        },
        service: {
          category: jobForm.category,
          type: jobForm.service,
          location: jobForm.location,
          date: new Date().toISOString().split('T')[0],
          duration: 30,
          satisfaction: 5,
          description: jobForm.description
        },
        media: {
          beforePhotos: jobForm.photos.filter((_, i) => jobForm.photoTypes[i] === 'before'),
          afterPhotos: jobForm.photos.filter((_, i) => jobForm.photoTypes[i] === 'after'),
          processPhotos: jobForm.photos.filter((_, i) => !jobForm.photoTypes[i] || jobForm.photoTypes[i] === 'process')
        }
      };

      const response = await fetch('/api/job-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobSubmissionData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit job');
      }

      alert('Job submitted successfully!');
      setShowSubmitForm(false);

      // Reload photos to show new submission
      const fetchResponse = await fetch('/api/job-submissions');
      if (fetchResponse.ok) {
        const jobSubmissions = await fetchResponse.json();
        const transformedPhotos: TechPhoto[] = [];
        jobSubmissions.forEach((job: any) => {
          const allPhotos = [
            ...(job.media.beforePhotos || []),
            ...(job.media.afterPhotos || []),
            ...(job.media.processPhotos || [])
          ];
          allPhotos.forEach((photo: string, index: number) => {
            if (photo && photo.trim()) {
              transformedPhotos.push({
                id: `${job.id}-${index}`,
                photoUrl: photo,
                jobType: job.service.category as TechPhoto['jobType'],
                jobDescription: job.service.description || `${job.service.type} - ${job.service.category}`,
                dateUploaded: new Date(job.submittedAt).toLocaleDateString(),
                jobLocation: job.service.location,
                tags: [job.service.type, job.service.category].filter(Boolean),
                franchiseeApproved: job.status === 'approved',
                adminOverride: job.status === 'admin_approved',
                technicianName: job.technician.name
              });
            }
          });
        });
        setPhotos(transformedPhotos);
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      alert('Failed to submit job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setJobForm(prev => ({
            ...prev,
            photos: [...prev.photos, reader.result as string],
            photoTypes: [...prev.photoTypes, 'process']
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Marketing Photos</h1>
          <p className="text-muted-foreground">Manage your job photos for marketing approval</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSubmitJob} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Submit Job
          </Button>
          <Button variant="outline" onClick={handleSubmitJob}>
            <Camera className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <select
            value={selectedApprovalStatus}
            onChange={(e) => setSelectedApprovalStatus(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Franchisee Approved">Pending Review</option>
            <option value="Franchisee Denied">Franchisee Denied</option>
            <option value="Admin Override">Admin Override</option>
          </select>
        </div>
      </div>

      <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle>My Marketing Photos</CardTitle>
          <CardDescription>
            {photos.length === 0
              ? "No photos uploaded yet. Start by uploading your first job photo for marketing approval."
              : `Photos submitted for marketing approval. Showing ${filteredPhotos.length} of ${photos.length} photos.`
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
                    Status
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
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading your photos...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPhotos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No photos yet</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                            Submit jobs from the dashboard to see your photos here for marketing approval.
                          </p>
                        </div>
                        <Button onClick={handleSubmitJob} className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Submit Your First Job
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPhotos.map((photo, index) => (
                    <tr
                      key={photo.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => setViewingPhoto(photo)}>
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
                            src={photo.photoUrl}
                            alt={photo.jobDescription}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <th scope="row" className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          📍 {photo.jobLocation}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getStatusVariant(photo)} className="text-xs">
                            {getStatusText(photo)}
                          </Badge>
                          {photo.tags && photo.tags.length > 0 && (
                            <span className="text-xs text-gray-600 dark:text-gray-300 italic">
                              {photo.tags.join(', ')}
                            </span>
                          )}
                        </div>
                        {photo.reviewNotes && (
                          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Note: {photo.reviewNotes}
                          </div>
                        )}
                      </th>
                      <td className="px-6 py-3 text-sm">
                        {photo.technicianName || 'Unknown Tech'}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        Pop-A-Lock Franchise
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getJobTypeVariant(photo.jobType)}`}>
                          {photo.jobType}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={getStatusVariant(photo)} className="text-xs">
                          {getStatusText(photo)}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {photo.dateUploaded}
                      </td>
                      <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingPhoto(photo)}
                            className="p-2 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(photo)}
                            className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deletePhoto(photo.id)}
                            disabled={!canDeletePhoto(photo)}
                            className={`p-2 rounded-full transition-colors ${
                              canDeletePhoto(photo)
                                ? 'text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                            }`}
                            title={canDeletePhoto(photo) ? "Delete" : "Cannot delete - job has been reviewed"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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

      {/* Edit Modal */}
      <Dialog open={!!editingPhoto} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>Edit Photo Details</DialogTitle>
            <DialogDescription>
              Update the information for this job photo submission.
            </DialogDescription>
          </DialogHeader>
          
          {editingPhoto && (
            <div className="space-y-6">
              {/* Photo Preview */}
              <div className="flex gap-4">
                <div className="w-32 h-32 relative rounded-full overflow-hidden shrink-0">
                  <img
                    src={editingPhoto.photoUrl}
                    alt={editingPhoto.jobDescription}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Photo uploaded: {editingPhoto.dateUploaded}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={getStatusVariant(editingPhoto)}>
                      {getStatusText(editingPhoto)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type</Label>
                  <select
                    id="jobType"
                    value={editForm.jobType || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, jobType: e.target.value as TechPhoto['jobType'] }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Roadside">Roadside</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobLocation">Location</Label>
                  <Input
                    id="jobLocation"
                    value={editForm.jobLocation || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, jobLocation: e.target.value }))}
                    placeholder="Job location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  value={editForm.jobDescription || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, jobDescription: e.target.value }))}
                  placeholder="Describe the work performed"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={(editForm.tags || []).join(', ')}
                  onChange={(e) => updateTags(e.target.value)}
                  placeholder="Enter tags separated by commas (e.g., lock repair, emergency, commercial)"
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple tags with commas
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Image Modal */}
      <ImageModal
        isOpen={!!viewingPhoto}
        onClose={() => setViewingPhoto(null)}
        imageUrl={viewingPhoto?.photoUrl || ''}
        altText={viewingPhoto?.jobDescription || ''}
        jobDetails={viewingPhoto ? {
          imageUrl: viewingPhoto.photoUrl,
          jobType: viewingPhoto.jobType,
          location: viewingPhoto.jobLocation,
          dateUploaded: viewingPhoto.dateUploaded,
          status: getStatusText(viewingPhoto),
          serviceDescription: viewingPhoto.jobDescription,
          tags: viewingPhoto.tags,
          technicianName: viewingPhoto.technicianName
        } : undefined}
      />

      {/* Job Submission Modal */}
      <Dialog open={showSubmitForm} onOpenChange={setShowSubmitForm}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit New Job</DialogTitle>
            <DialogDescription>
              Fill in the job details and upload photos for marketing approval
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJobFormSubmit} className="space-y-6">
            {/* Category and Service */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={jobForm.category}
                  onChange={(e) => setJobForm(prev => ({ ...prev, category: e.target.value, service: '' }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Residential">Residential</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Roadside">Roadside</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service Type *</Label>
                <select
                  id="service"
                  value={jobForm.service}
                  onChange={(e) => setJobForm(prev => ({ ...prev, service: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={!jobForm.category}
                  required
                >
                  <option value="">Select Service</option>
                  {jobForm.category && serviceCategories[jobForm.category]?.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={jobForm.location}
                onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter job location"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={jobForm.description}
                onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the work performed"
                rows={3}
              />
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <Label htmlFor="photos">Photos</Label>
              <Input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="cursor-pointer"
              />
              {jobForm.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {jobForm.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-24 object-cover rounded" />
                      <select
                        value={jobForm.photoTypes[index] || 'process'}
                        onChange={(e) => {
                          const newTypes = [...jobForm.photoTypes];
                          newTypes[index] = e.target.value;
                          setJobForm(prev => ({ ...prev, photoTypes: newTypes }));
                        }}
                        className="absolute bottom-1 left-1 right-1 text-xs px-1 py-0.5 bg-white/90 dark:bg-gray-800/90 rounded"
                      >
                        <option value="before">Before</option>
                        <option value="process">Process</option>
                        <option value="after">After</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setJobForm(prev => ({
                            ...prev,
                            photos: prev.photos.filter((_, i) => i !== index),
                            photoTypes: prev.photoTypes.filter((_, i) => i !== index)
                          }));
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Customer Information (Optional)</h4>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="permission"
                  checked={jobForm.customerPermission}
                  onChange={(e) => setJobForm(prev => ({ ...prev, customerPermission: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="permission" className="cursor-pointer">
                  Customer consents to contact and sharing
                </Label>
              </div>

              {jobForm.customerPermission && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={jobForm.customerName}
                      onChange={(e) => setJobForm(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      value={jobForm.customerPhone}
                      onChange={(e) => setJobForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={jobForm.customerEmail}
                      onChange={(e) => setJobForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowSubmitForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Submit Job
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}