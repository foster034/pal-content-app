'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobPicModal, JobPicData } from "@/components/ui/job-pic-modal";

interface TechPhoto {
  id: number;
  photoUrl: string;
  jobType: 'Commercial' | 'Residential' | 'Automotive' | 'Roadside';
  techName: string;
  techId: number;
  franchiseeName: string;
  franchiseeId: number;
  jobDescription: string;
  dateUploaded: string;
  jobLocation: string;
  tags: string[];
  franchiseeApproved?: boolean; // undefined = pending, true = approved, false = denied
}

// Sample photos for the current franchisee (Dallas Downtown)
const initialPhotos: TechPhoto[] = [
  {
    id: 1,
    photoUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    jobType: 'Commercial',
    techName: 'Alex Rodriguez',
    techId: 1,
    franchiseeName: 'Dallas Downtown',
    franchiseeId: 1,
    jobDescription: 'Office building master key system installation',
    dateUploaded: '2024-09-08',
    jobLocation: 'Downtown Dallas, TX',
    tags: ['master key', 'office building', 'installation'],
    franchiseeApproved: undefined, // Pending approval
  },
  {
    id: 2,
    photoUrl: 'https://images.unsplash.com/photo-1566471307885-a33cd0d7c6af?w=400&h=300&fit=crop',
    jobType: 'Commercial',
    techName: 'Alex Rodriguez',
    techId: 1,
    franchiseeName: 'Dallas Downtown',
    franchiseeId: 1,
    jobDescription: 'Access control system upgrade',
    dateUploaded: '2024-09-04',
    jobLocation: 'Dallas, TX',
    tags: ['access control', 'commercial', 'upgrade'],
    franchiseeApproved: true, // Already approved
  },
  {
    id: 3,
    photoUrl: 'https://images.unsplash.com/photo-1571974599782-87624638275e?w=400&h=300&fit=crop',
    jobType: 'Automotive',
    techName: 'Mike Johnson',
    techId: 5,
    franchiseeName: 'Dallas Downtown',
    franchiseeId: 1,
    jobDescription: 'Emergency car lockout service',
    dateUploaded: '2024-09-07',
    jobLocation: 'Dallas, TX',
    tags: ['car lockout', 'emergency', 'quick response'],
    franchiseeApproved: undefined, // Pending approval
  },
  {
    id: 4,
    photoUrl: 'https://images.unsplash.com/photo-1544860565-d4c4d73cb237?w=400&h=300&fit=crop',
    jobType: 'Residential',
    techName: 'Sarah Wilson',
    techId: 6,
    franchiseeName: 'Dallas Downtown',
    franchiseeId: 1,
    jobDescription: 'Smart lock installation for apartment complex',
    dateUploaded: '2024-09-06',
    jobLocation: 'Dallas, TX',
    tags: ['smart lock', 'residential', 'apartment'],
    franchiseeApproved: false, // Denied
  },
];

const technicians = [
  { id: 1, name: 'Alex Rodriguez' },
  { id: 5, name: 'Mike Johnson' },
  { id: 6, name: 'Sarah Wilson' },
];

export default function FranchiseeMarketingPage() {
  const [photos, setPhotos] = useState<TechPhoto[]>(initialPhotos);
  const [selectedJobType, setSelectedJobType] = useState<string>('All');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('All');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string>('Pending');
  const [selectedPhoto, setSelectedPhoto] = useState<TechPhoto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Google My Business states
  const [gmbConnected, setGmbConnected] = useState(false);
  const [gmbLocations, setGmbLocations] = useState<any[]>([]);
  const [gmbLoading, setGmbLoading] = useState(false);
  const [gmbError, setGmbError] = useState<string | null>(null);

  // Check for GMB connection status on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gmbConnected = urlParams.get('gmb_connected');
    const gmbError = urlParams.get('gmb_error');
    
    if (gmbConnected === 'true') {
      setGmbConnected(true);
      setGmbError(null);
      // Load GMB locations
      loadGMBLocations();
    }
    
    if (gmbError) {
      setGmbError(gmbError);
    }
  }, []);

  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      if (selectedJobType !== 'All' && photo.jobType !== selectedJobType) return false;
      if (selectedTechnician !== 'All' && photo.techName !== selectedTechnician) return false;
      if (selectedApprovalStatus !== 'All') {
        if (selectedApprovalStatus === 'Pending' && photo.franchiseeApproved !== undefined) return false;
        if (selectedApprovalStatus === 'Approved' && photo.franchiseeApproved !== true) return false;
        if (selectedApprovalStatus === 'Denied' && photo.franchiseeApproved !== false) return false;
      }
      return true;
    });
  }, [photos, selectedJobType, selectedTechnician, selectedApprovalStatus]);

  const approvePhoto = (photoId: number) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, franchiseeApproved: true } : photo
    ));
  };

  const denyPhoto = (photoId: number) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, franchiseeApproved: false } : photo
    ));
  };

  const resetApproval = (photoId: number) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, franchiseeApproved: undefined } : photo
    ));
  };

  const deletePhoto = (photoId: number) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const openJobModal = (photo: TechPhoto) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const closeJobModal = () => {
    setSelectedPhoto(null);
    setIsModalOpen(false);
  };

  const convertToJobPicData = (photo: TechPhoto): JobPicData => {
    return {
      id: photo.id,
      customer: `${photo.jobType} Client`, // We'll use a generic customer name
      technician: photo.techName,
      service: photo.jobDescription,
      status: photo.franchiseeApproved === undefined ? 'Pending' : 
              photo.franchiseeApproved ? 'Approved' : 'Denied',
      submittedDate: photo.dateUploaded,
      location: photo.jobLocation,
      description: photo.jobDescription,
      images: [photo.photoUrl], // Convert single photo to array
      workPerformed: `${photo.jobType} locksmith service completed successfully.`,
      materials: photo.tags,
      timeSpent: '2-3 hours',
      cost: '$150-300',
      notes: `Job completed at ${photo.jobLocation}. All work performed to industry standards.`,
      customerPhone: '(555) 123-4567',
      techPhone: '(555) 987-6543'
    };
  };

  // Google My Business functions
  const connectToGMB = async () => {
    const franchiseeId = 1; // TODO: Get from auth context
    setGmbLoading(true);
    setGmbError(null);
    
    try {
      window.location.href = `/api/google-my-business/auth?franchisee_id=${franchiseeId}`;
    } catch (error) {
      console.error('GMB connection error:', error);
      setGmbError('Failed to connect to Google My Business');
      setGmbLoading(false);
    }
  };

  const loadGMBLocations = async () => {
    const franchiseeId = 1; // TODO: Get from auth context
    setGmbLoading(true);
    
    try {
      const response = await fetch(`/api/google-my-business/locations?franchisee_id=${franchiseeId}`);
      const data = await response.json();
      
      if (data.success) {
        setGmbLocations(data.locations);
      } else {
        setGmbError(data.error || 'Failed to load locations');
      }
    } catch (error) {
      console.error('Error loading GMB locations:', error);
      setGmbError('Failed to load GMB locations');
    } finally {
      setGmbLoading(false);
    }
  };

  const postToGMB = async (photo: TechPhoto, locationName: string, content: string) => {
    const franchiseeId = 1; // TODO: Get from auth context
    
    try {
      const response = await fetch('/api/google-my-business/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          franchiseeId,
          locationName,
          postContent: content,
          mediaUrl: photo.photoUrl
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Post created successfully on Google My Business!');
      } else {
        alert('Failed to create GMB post: ' + result.error);
      }
    } catch (error) {
      console.error('Error posting to GMB:', error);
      alert('Failed to post to Google My Business');
    }
  };

  const getJobTypeVariant = (jobType: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (jobType) {
      case 'Commercial': return 'default';
      case 'Residential': return 'secondary';
      case 'Automotive': return 'destructive';
      case 'Roadside': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusVariant = (photo: TechPhoto): "default" | "secondary" | "destructive" | "outline" => {
    if (photo.franchiseeApproved === true) return 'default'; // Approved
    if (photo.franchiseeApproved === false) return 'destructive'; // Denied
    return 'secondary'; // Pending
  };

  const getStatusText = (photo: TechPhoto): string => {
    if (photo.franchiseeApproved === true) return 'Approved';
    if (photo.franchiseeApproved === false) return 'Denied';
    return 'Pending Review';
  };

  const pendingCount = photos.filter(p => p.franchiseeApproved === undefined).length;
  const approvedCount = photos.filter(p => p.franchiseeApproved === true).length;
  const deniedCount = photos.filter(p => p.franchiseeApproved === false).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Marketing Photos</h1>
          <p className="text-muted-foreground">Review and approve technician photos for marketing use</p>
        </div>
        <Button>
          Upload Photo
        </Button>
      </div>

      {/* Google My Business Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            Google My Business Integration
          </CardTitle>
          <CardDescription>
            Connect your Google My Business account to automatically post approved photos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gmbError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              Error: {gmbError}
            </div>
          )}
          
          {!gmbConnected ? (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Connect your Google My Business account to enable automatic posting of approved marketing photos.
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  You'll be redirected to Google to authorize this app to manage your business posts.
                </div>
              </div>
              <Button
                onClick={connectToGMB}
                disabled={gmbLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {gmbLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Connect Google My Business
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Connected to Google My Business</span>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Your Business Locations:</h4>
                <div className="space-y-2">
                  {gmbLocations.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {gmbLoading ? 'Loading locations...' : 'No locations found'}
                    </div>
                  ) : (
                    gmbLocations.map((location, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{location.locationName || location.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-500">
                You can now post approved photos directly to your Google My Business locations.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{deniedCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Denied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{photos.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Photos</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <select
            value={selectedApprovalStatus}
            onChange={(e) => setSelectedApprovalStatus(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Denied">Denied</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photo Review</CardTitle>
          <CardDescription>Review technician photos from your franchise. Showing {filteredPhotos.length} of {photos.length} photos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Photo</TableHead>
                <TableHead>Job Details</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPhotos.map((photo) => (
                <TableRow key={photo.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => openJobModal(photo)}>
                  <TableCell>
                    <div className="w-20 h-16 relative rounded overflow-hidden">
                      <img
                        src={photo.photoUrl}
                        alt={photo.jobDescription}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {photo.jobDescription}
                      </div>
                      <div className="flex gap-1 mb-1">
                        <Badge variant={getJobTypeVariant(photo.jobType)} className="text-xs">
                          {photo.jobType}
                        </Badge>
                        {photo.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {photo.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{photo.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {photo.jobLocation} • {photo.dateUploaded}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{photo.techName}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(photo)}>
                      {getStatusText(photo)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {photo.franchiseeApproved === undefined && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              approvePhoto(photo.id);
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              denyPhoto(photo.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            Deny
                          </Button>
                        </>
                      )}
                      {photo.franchiseeApproved !== undefined && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetApproval(photo.id);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Reset
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePhoto(photo.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Job Pic Modal */}
      <JobPicModal
        isOpen={isModalOpen}
        onClose={closeJobModal}
        jobData={selectedPhoto ? convertToJobPicData(selectedPhoto) : null}
        onApprove={(id) => {
          approvePhoto(id);
          closeJobModal();
        }}
        onDeny={(id) => {
          denyPhoto(id);
          closeJobModal();
        }}
      />
    </div>
  );
}