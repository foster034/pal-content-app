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
import { getTechSession } from '@/lib/tech-auth';

interface JobSubmissionDisplay {
  id: string;
  photos: string[];
  jobType: 'Commercial' | 'Residential' | 'Automotive' | 'Roadside';
  jobDescription: string;
  dateUploaded: string;
  jobLocation: string;
  tags: string[];
  technicianName?: string;
  photoCount: number;
  aiReport?: string;
  aiReportGeneratedAt?: string;
  status?: string;
  // Store full job data for modal
  fullJobData?: any;
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
  const [jobs, setJobs] = useState<JobSubmissionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobType, setSelectedJobType] = useState<string>('All');
  const [editingJob, setEditingJob] = useState<JobSubmissionDisplay | null>(null);
  const [viewingJob, setViewingJob] = useState<JobSubmissionDisplay | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<{ imageUrl: string; jobDetails: any; } | null>(null);
  const [editForm, setEditForm] = useState<Partial<JobSubmissionDisplay>>({});
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pollingIntervals, setPollingIntervals] = useState<Map<string, NodeJS.Timeout>>(new Map());
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
    const fetchJobSubmissions = async () => {
      try {
        setLoading(true);

        // Get current tech session to filter by technician
        const session = await getTechSession();
        if (!session) {
          console.warn('⚠️ No tech session found, cannot load job submissions');
          setLoading(false);
          return;
        }

        // Fetch job submissions filtered by technician ID
        const response = await fetch(`/api/job-submissions?technicianId=${session.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job submissions');
        }

        const jobSubmissions = await response.json();


        // Transform job submissions into JobSubmissionDisplay format (grouped by job)
        const transformedJobs: JobSubmissionDisplay[] = [];

        jobSubmissions.forEach((job: any) => {
          // Extract all photos from the job submission
          const allPhotos = [
            ...(job.media.beforePhotos || []),
            ...(job.media.afterPhotos || []),
            ...(job.media.processPhotos || [])
          ].filter(url => url && url.trim());

          // Only show jobs that have photos
          if (allPhotos.length > 0) {
            transformedJobs.push({
              id: job.id,
              photos: allPhotos,
              jobType: job.service.category as JobSubmissionDisplay['jobType'],
              jobDescription: job.service.description || `${job.service.type} - ${job.service.category}`,
              dateUploaded: new Date(job.submittedAt).toLocaleDateString(),
              jobLocation: job.service.location,
              tags: [job.service.type, job.service.category].filter(Boolean),
              technicianName: job.technician.name,
              photoCount: allPhotos.length,
              aiReport: job.aiReport,
              aiReportGeneratedAt: job.aiReportGeneratedAt,
              status: job.status,
              fullJobData: job // Store the full job data for the modal
            });
          }
        });

        setJobs(transformedJobs);
      } catch (error) {
        console.error('Error fetching job submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobSubmissions();
  }, []);

  // Function to poll for AI report updates
  const pollForAIReport = async (jobId: string) => {
    try {
      const response = await fetch('/api/job-submissions');
      if (response.ok) {
        const data = await response.json();
        const updatedJob = data.find((job: any) => job.id === jobId);

        if (updatedJob && updatedJob.aiReport) {
          // Update the job in state with the AI report
          setJobs(prevJobs => prevJobs.map(job => {
            if (job.id === jobId) {
              return {
                ...job,
                aiReport: updatedJob.aiReport,
                aiReportGeneratedAt: updatedJob.aiReportGeneratedAt
              };
            }
            return job;
          }));

          // Update the modal if it's currently showing this job
          if (selectedImageModal && selectedImageModal.jobDetails.id === jobId) {
            setSelectedImageModal(prev => prev ? {
              ...prev,
              jobDetails: {
                ...prev.jobDetails,
                aiReport: updatedJob.aiReport,
                aiReportGeneratedAt: updatedJob.aiReportGeneratedAt
              }
            } : null);
          }

          // Clear the polling interval for this job
          const interval = pollingIntervals.get(jobId);
          if (interval) {
            clearInterval(interval);
            setPollingIntervals(prev => {
              const newMap = new Map(prev);
              newMap.delete(jobId);
              return newMap;
            });
          }
        }
      }
    } catch (error) {
      console.error('Error polling for AI report:', error);
    }
  };

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      pollingIntervals.forEach(interval => clearInterval(interval));
    };
  }, [pollingIntervals]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (selectedJobType !== 'All' && job.jobType !== selectedJobType) return false;
      return true;
    });
  }, [jobs, selectedJobType]);

  const deleteJob = async (jobId: string) => {
    try {
      // Find the job to check if it can be deleted
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        alert('Job not found');
        return;
      }

      // Prevent deletion of approved jobs
      if (job.status === 'approved') {
        alert('❌ Cannot delete approved job submissions. Approved posts can only be managed by your franchisee.');
        return;
      }

      // Show confirmation dialog
      if (!confirm(`Are you sure you want to delete this job submission? This will remove all ${job.photoCount} photos associated with this job.`)) {
        return;
      }

      // Delete from database
      const response = await fetch(`/api/job-submissions?id=${jobId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete job submission');
      }

      // Remove job from local state
      setJobs(prev => prev.filter(job => job.id !== jobId));

      alert('Job submission deleted successfully');
    } catch (error) {
      console.error('Error deleting job submission:', error);
      alert('Failed to delete job submission. Please try again.');
    }
  };

  const openEditModal = (job: JobSubmissionDisplay) => {
    setEditingJob(job);
    setEditForm({
      jobDescription: job.jobDescription,
      jobLocation: job.jobLocation,
      jobType: job.jobType,
      tags: [...job.tags],
    });
  };

  const closeEditModal = () => {
    setEditingJob(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editingJob) return;

    setJobs(prev => prev.map(job =>
      job.id === editingJob.id
        ? {
            ...job,
            jobDescription: editForm.jobDescription || job.jobDescription,
            jobLocation: editForm.jobLocation || job.jobLocation,
            jobType: (editForm.jobType as JobSubmissionDisplay['jobType']) || job.jobType,
            tags: editForm.tags || job.tags,
          }
        : job
    ));
    closeEditModal();
  };

  const updateTags = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setEditForm(prev => ({ ...prev, tags }));
  };

  const convertToImageModalData = (job: JobSubmissionDisplay) => {
    // Map status to display format
    const statusMap: { [key: string]: 'Approved' | 'Denied' | 'Pending Review' } = {
      'approved': 'Approved',
      'denied': 'Denied',
      'pending': 'Pending Review'
    };

    const fullJob = job.fullJobData;

    return {
      jobType: job.jobType,
      location: job.jobLocation,
      dateUploaded: job.dateUploaded,
      status: statusMap[job.status || 'pending'] || 'Pending Review',
      serviceDescription: job.jobDescription,
      tags: job.tags,
      technicianName: job.technicianName || 'Unknown Tech',
      allImages: job.photos,
      aiReport: job.aiReport,
      aiReportGeneratedAt: job.aiReportGeneratedAt,
      // Additional service fields
      serviceType: fullJob?.service?.type,
      serviceDate: fullJob?.service?.date,
      serviceDuration: fullJob?.service?.duration,
      satisfactionRating: fullJob?.service?.satisfaction,
      // Client fields
      clientName: fullJob?.client?.name,
      clientPhone: fullJob?.client?.phone,
      clientEmail: fullJob?.client?.email,
      // Vehicle fields (for Automotive)
      vehicleYear: fullJob?.vehicle?.year,
      vehicleMake: fullJob?.vehicle?.make,
      vehicleModel: fullJob?.vehicle?.model,
      vehicleColor: fullJob?.vehicle?.color,
      vehicleVin: fullJob?.vehicle?.vin,
      // Content fields
      customerConcern: fullJob?.contentFields?.customerConcern,
      customerReaction: fullJob?.contentFields?.customerReaction,
      specialChallenges: fullJob?.contentFields?.specialChallenges
    };
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


  const handleSubmitJob = () => {
    // Use setTimeout to avoid router navigation conflicts
    setTimeout(() => {
      router.push('/tech/dashboard?openForm=true');
    }, 0);
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
        technicianId: 'f95f54d7-51be-4f55-a081-2d3b692ff5d9', // brent foster from actual database
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

      const newJob = await response.json();
      alert('Job submitted successfully!');
      setShowSubmitForm(false);

      // Reload jobs to show new submission
      const fetchResponse = await fetch('/api/job-submissions');
      if (fetchResponse.ok) {
        const jobSubmissions = await fetchResponse.json();
        const transformedJobs: JobSubmissionDisplay[] = [];
        jobSubmissions.forEach((job: any) => {
          const allPhotos = [
            ...(job.media.beforePhotos || []),
            ...(job.media.afterPhotos || []),
            ...(job.media.processPhotos || [])
          ].filter(url => url && url.trim());

          if (allPhotos.length > 0) {
            transformedJobs.push({
              id: job.id,
              photos: allPhotos,
              jobType: job.service.category as JobSubmissionDisplay['jobType'],
              jobDescription: job.service.description || `${job.service.type} - ${job.service.category}`,
              dateUploaded: new Date(job.submittedAt).toLocaleDateString(),
              jobLocation: job.service.location,
              tags: [job.service.type, job.service.category].filter(Boolean),
              technicianName: job.technician.name,
              photoCount: allPhotos.length,
              aiReport: job.aiReport,
              aiReportGeneratedAt: job.aiReportGeneratedAt
            });
          }
        });
        setJobs(transformedJobs);

        // Start polling for AI report if the new job doesn't have one yet
        if (newJob && newJob.id && !newJob.aiReport) {
          const interval = setInterval(() => {
            pollForAIReport(newJob.id);
          }, 3000); // Poll every 3 seconds

          // Store the interval to clean up later
          setPollingIntervals(prev => {
            const newMap = new Map(prev);
            newMap.set(newJob.id, interval);
            return newMap;
          });

          // Stop polling after 30 seconds if report still not generated
          setTimeout(() => {
            const existingInterval = pollingIntervals.get(newJob.id);
            if (existingInterval) {
              clearInterval(existingInterval);
              setPollingIntervals(prev => {
                const newMap = new Map(prev);
                newMap.delete(newJob.id);
                return newMap;
              });
            }
          }, 30000);
        }
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Marketing Photos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your job photos for marketing approval</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={handleSubmitJob} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 min-h-[44px] touch-manipulation w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Submit Job
          </Button>
          <Button variant="outline" onClick={handleSubmitJob} className="min-h-[44px] touch-manipulation w-full sm:w-auto">
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
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 min-h-[44px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
            <option value="All">All Job Types</option>
            <option value="Commercial">Commercial</option>
            <option value="Residential">Residential</option>
            <option value="Automotive">Automotive</option>
            <option value="Roadside">Roadside</option>
          </select>
        </div>

      </div>

      <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle>My Marketing Photos</CardTitle>
          <CardDescription>
            {jobs.length === 0
              ? "No jobs uploaded yet. Start by submitting your first job for marketing approval."
              : `Job submissions for marketing approval. Showing ${filteredJobs.length} of ${jobs.length} jobs.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading your photos...</p>
                </div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No jobs yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm px-4">
                      Submit jobs from the dashboard to see your job submissions here for marketing approval.
                    </p>
                  </div>
                  <Button onClick={handleSubmitJob} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 min-h-[44px]">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Your First Job
                  </Button>
                </div>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 touch-manipulation"
                  onClick={() => {
                    setSelectedImageModal({
                      imageUrl: job.photos[0],
                      jobDetails: convertToImageModalData(job)
                    });
                  }}
                >
                  {/* Photo Preview */}
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={job.photos[0]}
                        alt={job.jobDescription}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getJobTypeVariant(job.jobType)}`}>
                          {job.jobType}
                        </span>
                        {job.photoCount > 1 && (
                          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium px-2 py-0.5 rounded-full">
                            +{job.photoCount - 1} photos
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        📍 {job.jobLocation}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {job.tags && job.tags.length > 0 && job.tags.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Job Info */}
                  <div className="text-sm space-y-1">
                    <div className="text-gray-700 dark:text-gray-300">
                      <strong>Tech:</strong> {job.technicianName || 'Unknown Tech'}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      <strong>Date:</strong> {job.dateUploaded}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedImageModal({
                        imageUrl: job.photos[0],
                        jobDetails: convertToImageModalData(job)
                      })}
                      className="flex-1 min-h-[44px] p-2 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium text-sm"
                    >
                      👁 View
                    </button>
                    <button
                      onClick={() => openEditModal(job)}
                      className="flex-1 min-h-[44px] p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors font-medium text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteJob(job.id)}
                      disabled={job.status === 'approved'}
                      className={`flex-1 min-h-[44px] p-2 rounded-lg transition-colors font-medium text-sm ${
                        job.status === 'approved'
                          ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                          : 'text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
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
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading your photos...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No jobs yet</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                            Submit jobs from the dashboard to see your job submissions here for marketing approval.
                          </p>
                        </div>
                        <Button onClick={handleSubmitJob} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-900">
                          <Plus className="w-4 h-4 mr-2" />
                          Submit Your First Job
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, index) => (
                    <tr
                      key={job.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => {
                        setSelectedImageModal({
                          imageUrl: job.photos[0],
                          jobDetails: convertToImageModalData(job)
                        });
                      }}>
                      <td className="w-4 p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center">
                          <input
                            id={`checkbox-table-${job.id}`}
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor={`checkbox-table-${job.id}`} className="sr-only">checkbox</label>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {/* First photo as preview */}
                          <div className="w-12 h-12 relative rounded-full overflow-hidden">
                            <img
                              src={job.photos[0]}
                              alt={job.jobDescription}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Photo count badge */}
                          {job.photoCount > 1 && (
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
                              +{job.photoCount - 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <th scope="row" className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          📍 {job.jobLocation}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {job.tags && job.tags.length > 0 && (
                            <span className="text-xs text-gray-600 dark:text-gray-300 italic">
                              {job.tags.join(', ')}
                            </span>
                          )}
                        </div>
                      </th>
                      <td className="px-6 py-3 text-sm">
                        {job.technicianName || 'Unknown Tech'}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        Pop-A-Lock Franchise
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getJobTypeVariant(job.jobType)}`}>
                          {job.jobType}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {job.dateUploaded}
                      </td>
                      <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedImageModal({
                              imageUrl: job.photos[0],
                              jobDetails: convertToImageModalData(job)
                            })}
                            className="p-2 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(job)}
                            className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteJob(job.id)}
                            disabled={job.status === 'approved'}
                            className={`p-2 rounded-full transition-colors ${
                              job.status === 'approved'
                                ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                                : 'text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                            title={job.status === 'approved' ? 'Cannot delete approved posts' : 'Delete'}
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
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingJob} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>Edit Job Details</DialogTitle>
            <DialogDescription>
              Update the information for this job submission.
            </DialogDescription>
          </DialogHeader>

          {editingJob && (
            <div className="space-y-6">
              {/* Photos Preview */}
              <div className="flex gap-4">
                <div className="flex gap-2 flex-wrap">
                  {editingJob.photos.slice(0, 4).map((photo, index) => (
                    <div key={index} className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {editingJob.photoCount > 4 && (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs">
                      +{editingJob.photoCount - 4}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Job submitted: {editingJob.dateUploaded}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Photos: {editingJob.photoCount}
                  </p>
                </div>
              </div>

              {/* Edit Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type</Label>
                  <select
                    id="jobType"
                    value={editForm.jobType || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, jobType: e.target.value as JobSubmissionDisplay['jobType'] }))}
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

      {/* Job Details Modal using ImageModal */}
      {selectedImageModal && (
        <ImageModal
          imageUrl={selectedImageModal.imageUrl}
          altText="Job photo"
          isOpen={true}
          onClose={() => setSelectedImageModal(null)}
          jobDetails={selectedImageModal.jobDetails}
        />
      )}

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
              <Button type="submit" disabled={submitting} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-900">
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
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