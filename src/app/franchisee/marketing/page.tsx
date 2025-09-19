'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useTable } from '@/contexts/table-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Phone,
  Mail,
  MessageCircle,
  Star,
  MapPin,
  Calendar,
  User,
  Camera,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  CheckCheck,
  Trash2,
  Plus
} from 'lucide-react';

interface JobSubmission {
  id: string;
  technician: {
    name: string;
    image: string;
    rating: number;
  };
  client: {
    name: string;
    phone: string;
    email: string;
    preferredContactMethod: 'phone' | 'email' | 'sms';
    consentToContact: boolean;
    consentToShare: boolean;
  };
  service: {
    category: string;
    type: string;
    location: string;
    date: string;
    duration: number;
    satisfaction: number;
    description: string;
  };
  media: {
    beforePhotos: string[];
    afterPhotos: string[];
    processPhotos: string[];
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reportId?: string;
  reportUrl?: string;
}

export default function JobPicsPage() {
  const { getTableClasses } = useTable();
  const tableClasses = getTableClasses();

  const [jobSubmissions, setJobSubmissions] = useState<JobSubmission[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobSubmission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editedJob, setEditedJob] = useState<JobSubmission | null>(null);
  const [isEditingInModal, setIsEditingInModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState({ before: '', after: '', process: '' });

  // Fetch job submissions from Supabase
  useEffect(() => {
    const fetchJobSubmissions = async () => {
      try {
        // In a real app, you'd pass the actual franchisee ID
        const franchiseeId = '550e8400-e29b-41d4-a716-446655440001'; // Pop-A-Lock Barrie

        const response = await fetch(`/api/job-submissions?franchiseeId=${franchiseeId}`);
        if (response.ok) {
          const data = await response.json();
          setJobSubmissions(data);
        } else {
          console.error('Failed to fetch job submissions');
          setJobSubmissions([]);
        }
      } catch (error) {
        console.error('Error fetching job submissions:', error);
        setJobSubmissions([]);
      }
    };


    // Fetch real data from API
    fetchJobSubmissions();
  }, []);

  const handleJobReview = (job: JobSubmission) => {
    setSelectedJob(job);
    setShowReviewModal(true);
    setIsEditingInModal(false);

    // Set default message based on client's preferred contact method
    const defaultMsg = `Hi ${job.client.name}! Your Pop-A-Lock service is complete. View your job report and leave us a review at the link we're sending you. Thank you for choosing us!`;
    setCustomMessage(defaultMsg);
  };

  const handleModalEdit = () => {
    setIsEditingInModal(true);
  };

  const handleModalSave = () => {
    if (!selectedJob) return;

    setJobSubmissions(prev =>
      prev.map(job =>
        job.id === selectedJob.id ? selectedJob : job
      )
    );
    setIsEditingInModal(false);
  };

  const handleModalCancel = () => {
    if (selectedJob) {
      const originalJob = jobSubmissions.find(j => j.id === selectedJob.id);
      if (originalJob) {
        setSelectedJob(originalJob);
      }
    }
    setIsEditingInModal(false);
    setNewPhotoUrl({ before: '', after: '', process: '' });
  };

  const handleApproveJob = async (approve: boolean) => {
    if (!selectedJob) return;
    
    setIsProcessing(true);
    try {
      if (approve) {
        // Generate job report
        const reportResponse = await fetch('/api/job-reports/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobSubmissionId: selectedJob.id,
            franchiseeId: 1 // Replace with actual franchisee ID
          })
        });

        const reportData = await reportResponse.json();
        
        if (reportData.success) {
          // Send report to client
          const sendResponse = await fetch('/api/job-reports/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reportId: reportData.reportId,
              clientInfo: selectedJob.client,
              shareableUrl: reportData.shareableUrl,
              customMessage: customMessage.trim() || undefined
            })
          });

          const sendData = await sendResponse.json();
          
          if (sendData.success) {
            // Update job status
            setJobSubmissions(prev => 
              prev.map(job => 
                job.id === selectedJob.id 
                  ? { 
                      ...job, 
                      status: 'approved',
                      reportId: reportData.reportId,
                      reportUrl: reportData.shareableUrl
                    }
                  : job
              )
            );

            // Create success message with fallback info
            let successMessage = `✅ Job approved and report sent via ${sendData.method} to ${sendData.recipient}`;
            
            if (sendData.fallbackUsed) {
              successMessage += `\n\n🔄 Note: Original method (${sendData.originalMethod}) failed, automatically switched to ${sendData.method}`;
            }
            
            if (sendData.phoneNumber && sendData.method === 'phone') {
              successMessage += `\n\n📞 Manual phone call required: ${sendData.phoneNumber}`;
            }
            
            alert(successMessage);
          } else {
            alert(`❌ Job approved but failed to send report: ${sendData.error}`);
          }
        } else {
          alert(`❌ Failed to generate report: ${reportData.error}`);
        }
      } else {
        // Reject job
        setJobSubmissions(prev => 
          prev.map(job => 
            job.id === selectedJob.id 
              ? { ...job, status: 'rejected' }
              : job
          )
        );
        alert('❌ Job rejected successfully');
      }
      
      setShowReviewModal(false);
      setSelectedJob(null);
      setCustomMessage('');
      setNewPhotoUrl({ before: '', after: '', process: '' });
    } catch (error) {
      console.error('Error processing job:', error);
      alert('❌ Error processing job. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: JobSubmission['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'sms': return <MessageCircle className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const handleStartEdit = (job: JobSubmission) => {
    setEditingJobId(job.id);
    setEditedJob({ ...job });
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setEditedJob(null);
  };

  const handleSaveEdit = () => {
    if (!editedJob) return;

    setJobSubmissions(prev =>
      prev.map(job =>
        job.id === editedJob.id ? editedJob : job
      )
    );
    setEditingJobId(null);
    setEditedJob(null);
  };

  const updateEditedJob = (field: string, value: any) => {
    if (!editedJob) return;

    const fields = field.split('.');
    const updatedJob = { ...editedJob };
    let current: any = updatedJob;

    for (let i = 0; i < fields.length - 1; i++) {
      current = current[fields[i]];
    }

    current[fields[fields.length - 1]] = value;
    setEditedJob(updatedJob);
  };

  const copyToClipboard = async (text: string, jobId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(jobId);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const pendingJobs = jobSubmissions.filter(job => job.status === 'pending');
  const approvedJobs = jobSubmissions.filter(job => job.status === 'approved');
  const rejectedJobs = jobSubmissions.filter(job => job.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Job Pics & Approvals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve job submissions with photos to generate client reports
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{jobSubmissions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingJobs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedJobs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedJobs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Job Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Submissions</CardTitle>
          <CardDescription>Review and approve job submissions with photos. Showing {jobSubmissions.length} submissions.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {jobSubmissions.length === 0 ? (
            <div className="py-8 text-center">
              <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No job submissions yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Job submissions with photos will appear here for review and approval
              </p>
            </div>
          ) : (
            <div className={`${tableClasses.wrapper} w-full`}>
              <table className={`${tableClasses.table} w-full min-w-[1200px]`}>
                <thead className={tableClasses.header}>
                  <tr>
                    <th scope="col" className="p-3">
                      <div className="flex items-center">
                        <input
                          id="checkbox-all"
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-semibold min-w-[200px]">
                      JOB DETAILS
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-semibold min-w-[150px]">
                      TECHNICIAN
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-semibold min-w-[150px]">
                      CLIENT
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-semibold min-w-[120px]">
                      PHOTOS
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-semibold min-w-[120px]">
                      STATUS
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-semibold min-w-[100px]">
                      DATE
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-semibold min-w-[150px]">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobSubmissions.map((job) => {
                    const currentJob = editingJobId === job.id && editedJob ? editedJob : job;
                    return (
                    <tr key={job.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="w-4 p-3">
                        <div className="flex items-center">
                          <input
                            id={`checkbox-table-${job.id}`}
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor={`checkbox-table-${job.id}`} className="sr-only">checkbox</label>
                        </div>
                      </td>
                      
                      {/* Job Details */}
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {editingJobId === job.id ? (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={currentJob.service.category}
                                  onChange={(e) => updateEditedJob('service.category', e.target.value)}
                                  className="w-full px-1 py-0.5 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                  placeholder="Category"
                                />
                                <input
                                  type="text"
                                  value={currentJob.service.type}
                                  onChange={(e) => updateEditedJob('service.type', e.target.value)}
                                  className="w-full px-1 py-0.5 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                  placeholder="Service Type"
                                />
                              </div>
                            ) : (
                              `${currentJob.service.category} - ${currentJob.service.type}`
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {editingJobId === job.id ? (
                              <input
                                type="text"
                                value={currentJob.service.location}
                                onChange={(e) => updateEditedJob('service.location', e.target.value)}
                                className="w-full px-1 py-0.5 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none mt-1"
                                placeholder="Location"
                              />
                            ) : (
                              currentJob.service.location
                            )}
                          </div>
                          <div className="flex items-center mt-0.5">
                            <Star className="w-2.5 h-2.5 text-yellow-500 fill-current mr-1" />
                            {editingJobId === job.id ? (
                              <select
                                value={currentJob.service.satisfaction}
                                onChange={(e) => updateEditedJob('service.satisfaction', parseInt(e.target.value))}
                                className="px-1 py-0 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              >
                                <option value="1">1/5</option>
                                <option value="2">2/5</option>
                                <option value="3">3/5</option>
                                <option value="4">4/5</option>
                                <option value="5">5/5</option>
                              </select>
                            ) : (
                              <span className="text-xs text-gray-500">{currentJob.service.satisfaction}/5</span>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* Technician */}
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Avatar className="w-8 h-8 mr-2">
                            <AvatarImage src={currentJob.technician.image} alt={currentJob.technician.name} />
                            <AvatarFallback className="text-xs">{currentJob.technician.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {editingJobId === job.id ? (
                                <input
                                  type="text"
                                  value={currentJob.technician.name}
                                  onChange={(e) => updateEditedJob('technician.name', e.target.value)}
                                  className="w-full px-1 py-0.5 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                              ) : (
                                currentJob.technician.name
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                              {currentJob.technician.rating}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Client */}
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {editingJobId === job.id ? (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={currentJob.client.name}
                                  onChange={(e) => updateEditedJob('client.name', e.target.value)}
                                  className="w-full px-1 py-0.5 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                  placeholder="Name"
                                />
                                <input
                                  type="email"
                                  value={currentJob.client.email}
                                  onChange={(e) => updateEditedJob('client.email', e.target.value)}
                                  className="w-full px-1 py-0.5 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                  placeholder="Email"
                                />
                                <input
                                  type="tel"
                                  value={currentJob.client.phone}
                                  onChange={(e) => updateEditedJob('client.phone', e.target.value)}
                                  className="w-full px-1 py-0.5 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                  placeholder="Phone"
                                />
                              </div>
                            ) : (
                              currentJob.client.name
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {getContactMethodIcon(currentJob.client.preferredContactMethod)}
                            {editingJobId === job.id ? (
                              <select
                                value={currentJob.client.preferredContactMethod}
                                onChange={(e) => updateEditedJob('client.preferredContactMethod', e.target.value)}
                                className="ml-1 px-1 py-0 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              >
                                <option value="phone">phone</option>
                                <option value="email">email</option>
                                <option value="sms">sms</option>
                              </select>
                            ) : (
                              <span className="ml-1 text-xs">{currentJob.client.preferredContactMethod}</span>
                            )}
                          </div>
                          <div className="flex space-x-1 mt-0.5">
                            {currentJob.client.consentToContact && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 px-1 py-0 h-4">
                                Contact
                              </Badge>
                            )}
                            {currentJob.client.consentToShare && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 px-1 py-0 h-4">
                                Share
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* Photos */}
                      <td className="px-4 py-3">
                        <div className="flex space-x-1">
                          {job.media.beforePhotos.slice(0, 2).map((photo, idx) => (
                            <div key={idx} className="w-8 h-8 relative rounded overflow-hidden">
                              <img
                                src={photo}
                                alt={`Before ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {job.media.afterPhotos.slice(0, 1).map((photo, idx) => (
                            <div key={`after-${idx}`} className="w-8 h-8 relative rounded overflow-hidden">
                              <img
                                src={photo}
                                alt={`After ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {(job.media.beforePhotos.length + job.media.afterPhotos.length + job.media.processPhotos.length) > 3 && (
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                +{(job.media.beforePhotos.length + job.media.afterPhotos.length + job.media.processPhotos.length) - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-4 py-3">
                        {getStatusBadge(currentJob.status)}
                      </td>
                      
                      {/* Date */}
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {editingJobId === job.id ? (
                          <input
                            type="date"
                            value={currentJob.service.date}
                            onChange={(e) => updateEditedJob('service.date', e.target.value)}
                            className="px-1 py-0.5 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        ) : (
                          new Date(currentJob.service.date).toLocaleDateString()
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {editingJobId === job.id ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                className="p-1.5 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                                title="Save Changes"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                title="Cancel Edit"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleJobReview(job)}
                                className="p-1.5 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                title="Review Job"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {currentJob.status === 'approved' && currentJob.reportUrl && (
                            <>
                              <button 
                                onClick={() => window.open(currentJob.reportUrl, '_blank')}
                                className="p-1.5 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                                title="View Report"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => copyToClipboard(currentJob.reportUrl!, job.id)}
                                className="p-1.5 text-purple-600 dark:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-colors"
                                title="Copy Report Link"
                              >
                                {copySuccess === job.id ? (
                                  <CheckCheck className="w-3.5 h-3.5" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5" />
                      <span>Review Job Submission</span>
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      Review the job details and photos before approving and sending the report to the client
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2">
                    {!isEditingInModal ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleModalEdit}
                      >
                        Edit Details
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleModalSave}
                          className="bg-green-50 hover:bg-green-100 text-green-700"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleModalCancel}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Job Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Service Details</h4>
                    <div className="space-y-3 text-sm">
                      {isEditingInModal ? (
                        <>
                          <div>
                            <label className="text-gray-600 text-xs mb-1 block">Category:</label>
                            <input
                              type="text"
                              value={selectedJob.service.category}
                              onChange={(e) => setSelectedJob({...selectedJob, service: {...selectedJob.service, category: e.target.value}})}
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-600 text-xs mb-1 block">Service:</label>
                            <input
                              type="text"
                              value={selectedJob.service.type}
                              onChange={(e) => setSelectedJob({...selectedJob, service: {...selectedJob.service, type: e.target.value}})}
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-600 text-xs mb-1 block">Location:</label>
                            <input
                              type="text"
                              value={selectedJob.service.location}
                              onChange={(e) => setSelectedJob({...selectedJob, service: {...selectedJob.service, location: e.target.value}})}
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-600 text-xs mb-1 block">Date:</label>
                            <input
                              type="date"
                              value={selectedJob.service.date}
                              onChange={(e) => setSelectedJob({...selectedJob, service: {...selectedJob.service, date: e.target.value}})}
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-600 text-xs mb-1 block">Duration:</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={selectedJob.service.duration}
                                onChange={(e) => setSelectedJob({...selectedJob, service: {...selectedJob.service, duration: parseInt(e.target.value)}})}
                                className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                              <span className="text-sm">minutes</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-gray-600 text-xs mb-1 block">Satisfaction:</label>
                            <select
                              value={selectedJob.service.satisfaction}
                              onChange={(e) => setSelectedJob({...selectedJob, service: {...selectedJob.service, satisfaction: parseInt(e.target.value)}})}
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                              <option value="1">1/5 stars</option>
                              <option value="2">2/5 stars</option>
                              <option value="3">3/5 stars</option>
                              <option value="4">4/5 stars</option>
                              <option value="5">5/5 stars</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div><span className="text-gray-600">Category:</span> {selectedJob.service.category}</div>
                          <div><span className="text-gray-600">Service:</span> {selectedJob.service.type}</div>
                          <div><span className="text-gray-600">Location:</span> {selectedJob.service.location}</div>
                          <div><span className="text-gray-600">Date:</span> {new Date(selectedJob.service.date).toLocaleDateString()}</div>
                          <div><span className="text-gray-600">Duration:</span> {selectedJob.service.duration} minutes</div>
                          <div><span className="text-gray-600">Satisfaction:</span> {selectedJob.service.satisfaction}/5 stars</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Client Information</h4>
                    <div className="space-y-3 text-sm">
                      {isEditingInModal ? (
                        <>
                          <div>
                            <label className="text-gray-600 text-xs mb-1 block">Name:</label>
                            <input
                              type="text"
                              value={selectedJob.client.name}
                              onChange={(e) => setSelectedJob({...selectedJob, client: {...selectedJob.client, name: e.target.value}})}
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-600 text-xs mb-1 block">Phone:</label>
                            <input
                              type="tel"
                              value={selectedJob.client.phone}
                              onChange={(e) => setSelectedJob({...selectedJob, client: {...selectedJob.client, phone: e.target.value}})}
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-600 text-xs mb-1 block">Email:</label>
                            <input
                              type="email"
                              value={selectedJob.client.email}
                              onChange={(e) => setSelectedJob({...selectedJob, client: {...selectedJob.client, email: e.target.value}})}
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-600 text-xs mb-1 block">Preferred Contact:</label>
                            <select
                              value={selectedJob.client.preferredContactMethod}
                              onChange={(e) => setSelectedJob({...selectedJob, client: {...selectedJob.client, preferredContactMethod: e.target.value as 'phone' | 'email' | 'sms'}})}
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                              <option value="phone">Phone</option>
                              <option value="email">Email</option>
                              <option value="sms">SMS</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div><span className="text-gray-600">Name:</span> {selectedJob.client.name}</div>
                          <div><span className="text-gray-600">Phone:</span> {selectedJob.client.phone}</div>
                          <div><span className="text-gray-600">Email:</span> {selectedJob.client.email}</div>
                          <div><span className="text-gray-600">Preferred Contact:</span> <span className="capitalize">{selectedJob.client.preferredContactMethod}</span></div>
                        </>
                      )}
                      <div className="flex space-x-2 pt-2">
                        <Badge variant={selectedJob.client.consentToContact ? "default" : "secondary"} className="text-xs">
                          Contact: {selectedJob.client.consentToContact ? "Yes" : "No"}
                        </Badge>
                        <Badge variant={selectedJob.client.consentToShare ? "default" : "secondary"} className="text-xs">
                          Share: {selectedJob.client.consentToShare ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Job Description</h4>
                  {isEditingInModal ? (
                    <Textarea
                      value={selectedJob.service.description}
                      onChange={(e) => setSelectedJob({...selectedJob, service: {...selectedJob.service, description: e.target.value}})}
                      className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg w-full"
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {selectedJob.service.description}
                    </p>
                  )}
                </div>

                {/* Photos */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Job Photos</h4>

                  {/* Before Photos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-600">Before Photos ({selectedJob.media.beforePhotos.length})</h5>
                      {isEditingInModal && (
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={newPhotoUrl.before}
                            onChange={(e) => setNewPhotoUrl({...newPhotoUrl, before: e.target.value})}
                            placeholder="Enter image URL"
                            className="px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (newPhotoUrl.before) {
                                setSelectedJob({
                                  ...selectedJob,
                                  media: {
                                    ...selectedJob.media,
                                    beforePhotos: [...selectedJob.media.beforePhotos, newPhotoUrl.before]
                                  }
                                });
                                setNewPhotoUrl({...newPhotoUrl, before: ''});
                              }
                            }}
                            className="h-7 px-2"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedJob.media.beforePhotos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={photo}
                            alt={`Before ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          {isEditingInModal && (
                            <button
                              onClick={() => {
                                setSelectedJob({
                                  ...selectedJob,
                                  media: {
                                    ...selectedJob.media,
                                    beforePhotos: selectedJob.media.beforePhotos.filter((_, i) => i !== idx)
                                  }
                                });
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* After Photos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-600">After Photos ({selectedJob.media.afterPhotos.length})</h5>
                      {isEditingInModal && (
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={newPhotoUrl.after}
                            onChange={(e) => setNewPhotoUrl({...newPhotoUrl, after: e.target.value})}
                            placeholder="Enter image URL"
                            className="px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (newPhotoUrl.after) {
                                setSelectedJob({
                                  ...selectedJob,
                                  media: {
                                    ...selectedJob.media,
                                    afterPhotos: [...selectedJob.media.afterPhotos, newPhotoUrl.after]
                                  }
                                });
                                setNewPhotoUrl({...newPhotoUrl, after: ''});
                              }
                            }}
                            className="h-7 px-2"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedJob.media.afterPhotos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={photo}
                            alt={`After ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          {isEditingInModal && (
                            <button
                              onClick={() => {
                                setSelectedJob({
                                  ...selectedJob,
                                  media: {
                                    ...selectedJob.media,
                                    afterPhotos: selectedJob.media.afterPhotos.filter((_, i) => i !== idx)
                                  }
                                });
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Process Photos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-600">Process Photos ({selectedJob.media.processPhotos.length})</h5>
                      {isEditingInModal && (
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={newPhotoUrl.process}
                            onChange={(e) => setNewPhotoUrl({...newPhotoUrl, process: e.target.value})}
                            placeholder="Enter image URL"
                            className="px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (newPhotoUrl.process) {
                                setSelectedJob({
                                  ...selectedJob,
                                  media: {
                                    ...selectedJob.media,
                                    processPhotos: [...selectedJob.media.processPhotos, newPhotoUrl.process]
                                  }
                                });
                                setNewPhotoUrl({...newPhotoUrl, process: ''});
                              }
                            }}
                            className="h-7 px-2"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedJob.media.processPhotos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={photo}
                            alt={`Process ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          {isEditingInModal && (
                            <button
                              onClick={() => {
                                setSelectedJob({
                                  ...selectedJob,
                                  media: {
                                    ...selectedJob.media,
                                    processPhotos: selectedJob.media.processPhotos.filter((_, i) => i !== idx)
                                  }
                                });
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Message */}
                <div>
                  <h4 className="font-semibold mb-2">Custom Message (Optional)</h4>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personalized message to send with the job report..."
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This message will be sent to the client along with their job report link
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleApproveJob(false)}
                  disabled={isProcessing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveJob(true)}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Approve & Send Report
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}