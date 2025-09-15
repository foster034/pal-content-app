'use client';

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PhotoSubmission {
  id: number;
  photoUrl: string;
  jobType: 'Commercial' | 'Residential' | 'Automotive' | 'Roadside';
  serviceType: 'Lockout' | 'Rekey' | 'Installation' | 'Repair' | 'Emergency';
  techName: string;
  techId: number;
  customerName: string;
  jobLocation: string;
  jobDescription: string;
  submissionDate: string;
  tags: string[];
  franchiseeApproved?: boolean; // undefined = pending, true = approved, false = denied
  notes?: string;
  reportGenerated?: boolean;
}

const initialPhotoSubmissions: PhotoSubmission[] = [
  {
    id: 1,
    photoUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    jobType: 'Commercial',
    serviceType: 'Installation',
    techName: 'Alex Rodriguez',
    techId: 1,
    customerName: 'Dallas Office Complex',
    jobLocation: '500 Commerce St, Dallas, TX',
    jobDescription: 'Office building master key system installation - completed successfully',
    submissionDate: '2024-09-08',
    tags: ['master key', 'office building', 'installation'],
    franchiseeApproved: undefined, // Pending review
    notes: 'High-quality installation work, customer very satisfied',
    reportGenerated: false
  },
  {
    id: 2,
    photoUrl: 'https://images.unsplash.com/photo-1544860565-d4c4d73cb237?w=400&h=300&fit=crop',
    jobType: 'Residential',
    serviceType: 'Rekey',
    techName: 'Sarah Wilson',
    techId: 6,
    customerName: 'Maria Garcia',
    jobLocation: '789 Oak Ave, Dallas, TX',
    jobDescription: 'Complete home rekey service for new homeowner',
    submissionDate: '2024-09-07',
    tags: ['rekey', 'residential', 'new home'],
    franchiseeApproved: true, // Approved
    notes: 'Professional work, great before/after shots',
    reportGenerated: true
  },
  {
    id: 3,
    photoUrl: 'https://images.unsplash.com/photo-1571974599782-87624638275e?w=400&h=300&fit=crop',
    jobType: 'Automotive',
    serviceType: 'Lockout',
    techName: 'Mike Johnson',
    techId: 5,
    customerName: 'John Davis',
    jobLocation: 'I-35 & Main St, Dallas, TX',
    jobDescription: 'Emergency car lockout service - quick response',
    submissionDate: '2024-09-06',
    tags: ['car lockout', 'emergency', 'quick response'],
    franchiseeApproved: undefined, // Pending review
    notes: 'Fast response time, good customer service example',
    reportGenerated: false
  },
  {
    id: 4,
    photoUrl: 'https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=400&h=300&fit=crop',
    jobType: 'Roadside',
    serviceType: 'Emergency',
    techName: 'Alex Rodriguez',
    techId: 1,
    customerName: 'Emergency Call',
    jobLocation: 'Highway 75, Dallas, TX',
    jobDescription: 'Roadside assistance - broken key extraction',
    submissionDate: '2024-09-05',
    tags: ['roadside', 'emergency', 'key repair'],
    franchiseeApproved: false, // Denied - poor image quality
    notes: 'Image quality too low for marketing use',
    reportGenerated: false
  },
];

const technicians = [
  { id: 1, name: 'Alex Rodriguez' },
  { id: 5, name: 'Mike Johnson' },
  { id: 6, name: 'Sarah Wilson' },
];

export default function PhotoSubmissionsPage() {
  const [photos, setPhotos] = useState<PhotoSubmission[]>(initialPhotoSubmissions);
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string>('Pending');
  const [selectedJobType, setSelectedJobType] = useState<string>('All');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('All');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('All');
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [editedPhoto, setEditedPhoto] = useState<PhotoSubmission | null>(null);

  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      if (selectedApprovalStatus !== 'All') {
        if (selectedApprovalStatus === 'Pending' && photo.franchiseeApproved !== undefined) return false;
        if (selectedApprovalStatus === 'Approved' && photo.franchiseeApproved !== true) return false;
        if (selectedApprovalStatus === 'Denied' && photo.franchiseeApproved !== false) return false;
      }
      if (selectedJobType !== 'All' && photo.jobType !== selectedJobType) return false;
      if (selectedTechnician !== 'All' && photo.techName !== selectedTechnician) return false;
      if (selectedServiceType !== 'All' && photo.serviceType !== selectedServiceType) return false;
      return true;
    });
  }, [photos, selectedApprovalStatus, selectedJobType, selectedTechnician, selectedServiceType]);

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

  const generateReport = (photoId: number) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, reportGenerated: true } : photo
    ));
    // Here you would generate and download a report
    alert('Report generated and downloaded!');
  };

  const resetApproval = (photoId: number) => {
    setPhotos(prev => prev.map(photo =>
      photo.id === photoId ? { ...photo, franchiseeApproved: undefined } : photo
    ));
  };

  const handleStartEdit = (photo: PhotoSubmission) => {
    setEditingPhotoId(photo.id);
    setEditedPhoto({ ...photo });
  };

  const handleCancelEdit = () => {
    setEditingPhotoId(null);
    setEditedPhoto(null);
  };

  const handleSaveEdit = () => {
    if (!editedPhoto) return;
    setPhotos(prev =>
      prev.map(photo =>
        photo.id === editedPhoto.id ? editedPhoto : photo
      )
    );
    setEditingPhotoId(null);
    setEditedPhoto(null);
  };

  const updateEditedPhoto = (field: keyof PhotoSubmission, value: any) => {
    if (!editedPhoto) return;
    setEditedPhoto({ ...editedPhoto, [field]: value });
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

  const getServiceTypeVariant = (serviceType: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (serviceType) {
      case 'Installation': return 'default';
      case 'Repair': return 'secondary';
      case 'Rekey': return 'outline';
      case 'Lockout': return 'destructive';
      case 'Emergency': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusVariant = (photo: PhotoSubmission): "default" | "secondary" | "destructive" | "outline" => {
    if (photo.franchiseeApproved === true) return 'default'; // Approved
    if (photo.franchiseeApproved === false) return 'destructive'; // Denied
    return 'secondary'; // Pending
  };

  const getStatusText = (photo: PhotoSubmission): string => {
    if (photo.franchiseeApproved === true) return 'Approved';
    if (photo.franchiseeApproved === false) return 'Denied';
    return 'Pending Review';
  };

  const pendingCount = photos.filter(p => p.franchiseeApproved === undefined).length;
  const approvedCount = photos.filter(p => p.franchiseeApproved === true).length;
  const deniedCount = photos.filter(p => p.franchiseeApproved === false).length;
  const reportCount = photos.filter(p => p.reportGenerated).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Photo Submissions</h1>
          <p className="text-muted-foreground">Review marketing photos submitted by your technicians</p>
        </div>
      </div>

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
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reportCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Reports Generated</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Type</label>
          <select
            value={selectedServiceType}
            onChange={(e) => setSelectedServiceType(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Services</option>
            <option value="Installation">Installation</option>
            <option value="Repair">Repair</option>
            <option value="Rekey">Rekey</option>
            <option value="Lockout">Lockout</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketing Photo Review</CardTitle>
          <CardDescription>Review and approve technician photo submissions. Showing {filteredPhotos.length} of {photos.length} submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Photo</TableHead>
                <TableHead>Job Details</TableHead>
                <TableHead>Service Info</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPhotos.map((photo) => (
                <TableRow key={photo.id}>
                  <TableCell>
                    <div className="w-20 h-20 relative rounded-full overflow-hidden">
                      <img
                        src={photo.photoUrl}
                        alt={photo.jobDescription}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(photo.photoUrl, '_blank')}
                        title="Click to view full size"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {editingPhotoId === photo.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editedPhoto?.jobDescription || ''}
                            onChange={(e) => updateEditedPhoto('jobDescription', e.target.value)}
                            placeholder="Job Description"
                            className="min-h-[60px]"
                          />
                          <Select
                            value={editedPhoto?.jobType || ''}
                            onValueChange={(value) => updateEditedPhoto('jobType', value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Job Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Commercial">Commercial</SelectItem>
                              <SelectItem value="Residential">Residential</SelectItem>
                              <SelectItem value="Automotive">Automotive</SelectItem>
                              <SelectItem value="Roadside">Roadside</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={editedPhoto?.jobLocation || ''}
                            onChange={(e) => updateEditedPhoto('jobLocation', e.target.value)}
                            placeholder="Job Location"
                            className="h-8"
                          />
                          <Input
                            value={editedPhoto?.customerName || ''}
                            onChange={(e) => updateEditedPhoto('customerName', e.target.value)}
                            placeholder="Customer Name"
                            className="h-8"
                          />
                        </div>
                      ) : (
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
                            {photo.jobLocation} • {photo.submissionDate}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Customer: {photo.customerName}
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingPhotoId === photo.id ? (
                      <div className="space-y-2">
                        <Select
                          value={editedPhoto?.serviceType || ''}
                          onValueChange={(value) => updateEditedPhoto('serviceType', value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Service Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Installation">Installation</SelectItem>
                            <SelectItem value="Repair">Repair</SelectItem>
                            <SelectItem value="Rekey">Rekey</SelectItem>
                            <SelectItem value="Lockout">Lockout</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea
                          value={editedPhoto?.notes || ''}
                          onChange={(e) => updateEditedPhoto('notes', e.target.value)}
                          placeholder="Notes"
                          className="min-h-[50px]"
                        />
                      </div>
                    ) : (
                      <div>
                        <Badge variant={getServiceTypeVariant(photo.serviceType)} className="text-xs mb-1">
                          {photo.serviceType}
                        </Badge>
                        {photo.notes && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {photo.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingPhotoId === photo.id ? (
                      <Select
                        value={editedPhoto?.techName || ''}
                        onValueChange={(value) => updateEditedPhoto('techName', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Technician" />
                        </SelectTrigger>
                        <SelectContent>
                          {technicians.map(tech => (
                            <SelectItem key={tech.id} value={tech.name}>
                              {tech.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="font-medium">{photo.techName}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={getStatusVariant(photo)}>
                        {getStatusText(photo)}
                      </Badge>
                      {photo.reportGenerated && (
                        <div>
                          <Badge variant="outline" className="text-xs">
                            Report Generated
                          </Badge>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingPhotoId === photo.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-700"
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(photo)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </Button>
                          {photo.franchiseeApproved === undefined && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => approvePhoto(photo.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => denyPhoto(photo.id)}
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
                              onClick={() => resetApproval(photo.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Reset
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateReport(photo.id)}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            Report
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}