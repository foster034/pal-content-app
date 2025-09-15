'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  User
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

export default function JobApprovalsPage() {
  const [jobSubmissions, setJobSubmissions] = useState<JobSubmission[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobSubmission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // Mock data - replace with API call
  useEffect(() => {
    const mockJobs: JobSubmission[] = [
      {
        id: 'JOB-001',
        technician: {
          name: 'Alex Rodriguez',
          image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg',
          rating: 4.8
        },
        client: {
          name: 'John Smith',
          phone: '+1 (705) 555-0123',
          email: 'john.smith@email.com',
          preferredContactMethod: 'sms',
          consentToContact: true,
          consentToShare: true
        },
        service: {
          category: 'Automotive',
          type: 'Car Key Replacement',
          location: '123 Main St, Barrie, ON L4M 1A1',
          date: '2025-09-13',
          duration: 45,
          satisfaction: 5,
          description: 'Successfully cut and programmed new key fob for 2018 Ford F-150. Verified all functions including remote start, door locks, and trunk access. Customer very satisfied with prompt service.'
        },
        media: {
          beforePhotos: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'],
          afterPhotos: ['https://images.unsplash.com/photo-1544860565-d4c4d73cb237?w=400&h=300&fit=crop'],
          processPhotos: [
            'https://images.unsplash.com/photo-1571974599782-87624638275e?w=300&h=200&fit=crop',
            'https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=300&h=200&fit=crop'
          ]
        },
        status: 'pending',
        submittedAt: '2025-09-13T10:30:00Z'
      },
      {
        id: 'JOB-002',
        technician: {
          name: 'Sarah Wilson',
          image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg',
          rating: 4.9
        },
        client: {
          name: 'Mary Johnson',
          phone: '+1 (705) 555-0156',
          email: 'mary.johnson@email.com',
          preferredContactMethod: 'email',
          consentToContact: true,
          consentToShare: false
        },
        service: {
          category: 'Residential',
          type: 'Smart Lock Installation',
          location: '456 Oak Ave, Orillia, ON L3V 2K1',
          date: '2025-09-13',
          duration: 60,
          satisfaction: 5,
          description: 'Installed Yale smart lock with keypad entry. Configured mobile app access and tested all functions. Customer trained on operation and very pleased with upgrade.'
        },
        media: {
          beforePhotos: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'],
          afterPhotos: ['https://images.unsplash.com/photo-1544860565-d4c4d73cb237?w=400&h=300&fit=crop'],
          processPhotos: ['https://images.unsplash.com/photo-1571974599782-87624638275e?w=300&h=200&fit=crop']
        },
        status: 'approved',
        submittedAt: '2025-09-12T14:15:00Z',
        reportId: 'RPT-12345',
        reportUrl: '/job-report/RPT-12345'
      }
    ];
    setJobSubmissions(mockJobs);
  }, []);


  const handleReviewJob = (job: JobSubmission) => {
    setSelectedJob(job);
    setShowReviewModal(true);
    // Set default message based on client's preferred contact method
    const defaultMsg = `Hi ${job.client.name}! Your Pop-A-Lock service is complete. View your job report and leave us a review at the link we're sending you. Thank you for choosing us!`;
    setCustomMessage(defaultMsg);
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
        alert('❌ Job submission rejected');
      }
    } catch (error) {
      alert('❌ Error processing job approval');
      console.error('Job approval error:', error);
    } finally {
      setIsProcessing(false);
      setShowReviewModal(false);
      setSelectedJob(null);
      setCustomMessage('');
    }
  };

  const getStatusIcon = (status: JobSubmission['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: JobSubmission['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageCircle className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const pendingJobs = jobSubmissions.filter(job => job.status === 'pending');
  const completedJobs = jobSubmissions.filter(job => job.status !== 'pending');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Job Approvals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve job submissions from your technicians
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{pendingJobs.length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedJobs.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      {/* Pending Jobs */}
      {pendingJobs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Approval ({pendingJobs.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingJobs.map((job) => (
              <Card key={job.id} className="border-l-4 border-l-amber-400">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{job.service.type}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {job.client.name}
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {job.id}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusIcon(job.status)}
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={job.technician.image} />
                      <AvatarFallback>{job.technician.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{job.technician.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{job.technician.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{job.service.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(job.service.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getContactMethodIcon(job.client.preferredContactMethod)}
                      <span className="capitalize">{job.client.preferredContactMethod}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{job.service.satisfaction}/5 stars</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">CONSENT:</span>
                    {job.client.consentToContact && (
                      <Badge variant="outline" className="text-xs">Contact ✓</Badge>
                    )}
                    {job.client.consentToShare && (
                      <Badge variant="outline" className="text-xs">Share ✓</Badge>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <Button
                      onClick={() => handleReviewJob(job)}
                      className="w-full"
                      disabled={isProcessing}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review & Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Completions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {completedJobs.map((job) => (
              <Card key={job.id} className={`border-l-4 ${job.status === 'approved' ? 'border-l-green-400' : 'border-l-red-400'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{job.service.type}</h3>
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusIcon(job.status)}
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{job.client.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(job.submittedAt).toLocaleDateString()}
                  </p>
                  {job.reportUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => window.open(job.reportUrl, '_blank')}
                    >
                      View Report
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Review Job Submission
                </DialogTitle>
                <DialogDescription>
                  Job #{selectedJob.id} - {selectedJob.service.type}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Job Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Technician</h4>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={selectedJob.technician.image} />
                          <AvatarFallback>{selectedJob.technician.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedJob.technician.name}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{selectedJob.technician.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Service Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Category:</strong> {selectedJob.service.category}</p>
                        <p><strong>Service:</strong> {selectedJob.service.type}</p>
                        <p><strong>Location:</strong> {selectedJob.service.location}</p>
                        <p><strong>Date:</strong> {new Date(selectedJob.service.date).toLocaleDateString()}</p>
                        <p><strong>Duration:</strong> {selectedJob.service.duration} minutes</p>
                        <p><strong>Satisfaction:</strong> {selectedJob.service.satisfaction}/5 stars</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Client Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {selectedJob.client.name}</p>
                        <p><strong>Phone:</strong> {selectedJob.client.phone}</p>
                        <p><strong>Email:</strong> {selectedJob.client.email}</p>
                        <div className="flex items-center gap-2">
                          <strong>Contact Method:</strong>
                          {getContactMethodIcon(selectedJob.client.preferredContactMethod)}
                          <span className="capitalize">{selectedJob.client.preferredContactMethod}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {selectedJob.client.consentToContact && (
                            <Badge variant="outline" className="text-xs">Contact Consent ✓</Badge>
                          )}
                          {selectedJob.client.consentToShare && (
                            <Badge variant="outline" className="text-xs">Sharing Consent ✓</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <h4 className="font-semibold mb-2">Job Description</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedJob.service.description}</p>
                </div>

                {/* Photos */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Photos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedJob.media.beforePhotos.map((photo, index) => (
                      <div key={`before-${index}`} className="space-y-1">
                        <p className="text-xs font-medium text-red-600">Before</p>
                        <img src={photo} alt={`Before ${index + 1}`} className="w-full h-24 object-cover rounded border-2 border-red-200" />
                      </div>
                    ))}
                    {selectedJob.media.afterPhotos.map((photo, index) => (
                      <div key={`after-${index}`} className="space-y-1">
                        <p className="text-xs font-medium text-green-600">After</p>
                        <img src={photo} alt={`After ${index + 1}`} className="w-full h-24 object-cover rounded border-2 border-green-200" />
                      </div>
                    ))}
                    {selectedJob.media.processPhotos.map((photo, index) => (
                      <div key={`process-${index}`} className="space-y-1">
                        <p className="text-xs font-medium text-blue-600">Process</p>
                        <img src={photo} alt={`Process ${index + 1}`} className="w-full h-24 object-cover rounded border-2 border-blue-200" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Message */}
                <div>
                  <h4 className="font-semibold mb-2">
                    Message to Send ({selectedJob.client.preferredContactMethod.toUpperCase()})
                  </h4>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter custom message for the client..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This message will be sent via {selectedJob.client.preferredContactMethod} to {
                      selectedJob.client.preferredContactMethod === 'sms' ? selectedJob.client.phone : 
                      selectedJob.client.preferredContactMethod === 'email' ? selectedJob.client.email :
                      selectedJob.client.phone
                    }
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