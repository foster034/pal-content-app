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
  franchiseeApproved: boolean;
  adminOverride?: boolean;
}

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
    franchiseeApproved: true,
  },
  {
    id: 2,
    photoUrl: 'https://images.unsplash.com/photo-1544860565-d4c4d73cb237?w=400&h=300&fit=crop',
    jobType: 'Residential',
    techName: 'Sofia Martinez',
    techId: 2,
    franchiseeName: 'Austin Central',
    franchiseeId: 2,
    jobDescription: 'Smart lock installation and setup',
    dateUploaded: '2024-09-07',
    jobLocation: 'Austin, TX',
    tags: ['smart lock', 'residential', 'installation'],
    franchiseeApproved: true,
  },
  {
    id: 3,
    photoUrl: 'https://images.unsplash.com/photo-1571974599782-87624638275e?w=400&h=300&fit=crop',
    jobType: 'Automotive',
    techName: 'David Chen',
    techId: 3,
    franchiseeName: 'Houston West',
    franchiseeId: 3,
    jobDescription: 'Car lockout service - key extraction',
    dateUploaded: '2024-09-06',
    jobLocation: 'Houston, TX',
    tags: ['car lockout', 'key extraction', 'emergency'],
    franchiseeApproved: false,
  },
  {
    id: 4,
    photoUrl: 'https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=400&h=300&fit=crop',
    jobType: 'Roadside',
    techName: 'Jennifer Walsh',
    techId: 4,
    franchiseeName: 'San Antonio North',
    franchiseeId: 4,
    jobDescription: 'Emergency roadside assistance - broken key removal',
    dateUploaded: '2024-09-05',
    jobLocation: 'San Antonio, TX',
    tags: ['roadside', 'emergency', 'key repair'],
    franchiseeApproved: true,
  },
  {
    id: 5,
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
    franchiseeApproved: true,
  },
  {
    id: 6,
    photoUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    jobType: 'Residential',
    techName: 'Sofia Martinez',
    techId: 2,
    franchiseeName: 'Austin Central',
    franchiseeId: 2,
    jobDescription: 'Lock rekey service for new homeowner',
    dateUploaded: '2024-09-03',
    jobLocation: 'Austin, TX',
    tags: ['rekey', 'residential', 'new home'],
    franchiseeApproved: true,
  },
];

const franchisees = [
  { id: 1, name: 'Dallas Downtown' },
  { id: 2, name: 'Austin Central' },
  { id: 3, name: 'Houston West' },
  { id: 4, name: 'San Antonio North' },
];

const technicians = [
  { id: 1, name: 'Alex Rodriguez' },
  { id: 2, name: 'Sofia Martinez' },
  { id: 3, name: 'David Chen' },
  { id: 4, name: 'Jennifer Walsh' },
];

export default function MarketingPage() {
  const [photos, setPhotos] = useState<TechPhoto[]>(initialPhotos);
  const [selectedJobType, setSelectedJobType] = useState<string>('All');
  const [selectedFranchisee, setSelectedFranchisee] = useState<string>('All');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('All');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string>('Franchisee Approved');
  const [viewMode, setViewMode] = useState<'gallery' | 'table'>('table');

  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      if (selectedJobType !== 'All' && photo.jobType !== selectedJobType) return false;
      if (selectedFranchisee !== 'All' && photo.franchiseeName !== selectedFranchisee) return false;
      if (selectedTechnician !== 'All' && photo.techName !== selectedTechnician) return false;
      if (selectedApprovalStatus !== 'All') {
        if (selectedApprovalStatus === 'Franchisee Approved' && !photo.franchiseeApproved) return false;
        if (selectedApprovalStatus === 'Franchisee Denied' && photo.franchiseeApproved) return false;
        if (selectedApprovalStatus === 'Admin Override' && !photo.adminOverride) return false;
      }
      return true;
    });
  }, [photos, selectedJobType, selectedFranchisee, selectedTechnician, selectedApprovalStatus]);

  const toggleAdminOverride = (photoId: number) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { 
        ...photo, 
        adminOverride: !photo.adminOverride 
      } : photo
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
    if (photo.adminOverride === true) return 'default'; // Admin approved override
    if (photo.adminOverride === false) return 'destructive'; // Admin denied override
    if (photo.franchiseeApproved) return 'secondary'; // Franchisee approved, awaiting admin review
    return 'outline'; // Franchisee denied
  };

  const getStatusText = (photo: TechPhoto): string => {
    if (photo.adminOverride === true) return 'Admin Approved';
    if (photo.adminOverride === false) return 'Admin Denied';
    if (photo.franchiseeApproved) return 'Pending Review';
    return 'Franchisee Denied';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Marketing Gallery</h1>
          <p className="text-muted-foreground">Manage technician photos and job documentation</p>
        </div>
        <Button>
          Upload Photo
        </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Marketing Photos</CardTitle>
          <CardDescription>Manage technician photos and job documentation. Showing {filteredPhotos.length} of {photos.length} photos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Photo</TableHead>
                <TableHead>Job Details</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Franchisee</TableHead>
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
                  <TableCell>{photo.franchiseeName}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(photo)}>
                      {getStatusText(photo)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {photo.franchiseeApproved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAdminOverride(photo.id)}
                          className={photo.adminOverride === true ? 'text-orange-600 hover:text-orange-700' : 'text-blue-600 hover:text-blue-700'}
                        >
                          {photo.adminOverride === true ? 'Unapprove' : 'Approve'}
                        </Button>
                      )}
                      {photo.franchiseeApproved && photo.adminOverride === undefined && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAdminOverride(photo.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Deny
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