'use client';

import { useState, useMemo } from 'react';
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
                <TableRow key={photo.id}>
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
                        onClick={() => deletePhoto(photo.id)}
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
    </div>
  );
}