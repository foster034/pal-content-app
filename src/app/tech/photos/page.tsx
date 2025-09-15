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
import { X } from 'lucide-react';

interface TechPhoto {
  id: number;
  photoUrl: string;
  jobType: 'Commercial' | 'Residential' | 'Automotive' | 'Roadside';
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
    photoUrl: 'https://picsum.photos/400/300?random=1',
    jobType: 'Commercial',
    jobDescription: 'Office building master key system installation',
    dateUploaded: '2024-09-08',
    jobLocation: 'Downtown Dallas, TX',
    tags: ['master key', 'office building', 'installation'],
    franchiseeApproved: true,
  },
  {
    id: 2,
    photoUrl: 'https://picsum.photos/400/300?random=2',
    jobType: 'Residential',
    jobDescription: 'Smart lock installation and setup',
    dateUploaded: '2024-09-07',
    jobLocation: 'Austin, TX',
    tags: ['smart lock', 'residential', 'installation'],
    franchiseeApproved: true,
  },
  {
    id: 3,
    photoUrl: 'https://picsum.photos/400/300?random=3',
    jobType: 'Automotive',
    jobDescription: 'Car lockout service - key extraction',
    dateUploaded: '2024-09-06',
    jobLocation: 'Houston, TX',
    tags: ['car lockout', 'key extraction', 'emergency'],
    franchiseeApproved: false,
  },
  {
    id: 4,
    photoUrl: 'https://picsum.photos/400/300?random=4',
    jobType: 'Roadside',
    jobDescription: 'Emergency roadside assistance - broken key removal',
    dateUploaded: '2024-09-05',
    jobLocation: 'San Antonio, TX',
    tags: ['roadside', 'emergency', 'key repair'],
    franchiseeApproved: true,
  },
];

export default function TechPhotosPage() {
  const [photos, setPhotos] = useState<TechPhoto[]>(initialPhotos);
  const [selectedJobType, setSelectedJobType] = useState<string>('All');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string>('All');
  const [editingPhoto, setEditingPhoto] = useState<TechPhoto | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<TechPhoto | null>(null);
  const [editForm, setEditForm] = useState<Partial<TechPhoto>>({});

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

  const deletePhoto = (photoId: number) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
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
    if (photo.adminOverride === true) return 'default';
    if (photo.adminOverride === false) return 'destructive';
    if (photo.franchiseeApproved) return 'secondary';
    return 'outline';
  };

  const getStatusText = (photo: TechPhoto): string => {
    if (photo.adminOverride === true) return 'Admin Approved';
    if (photo.adminOverride === false) return 'Admin Denied';
    if (photo.franchiseeApproved) return 'Pending Review';
    return 'Franchisee Review';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Marketing Photos</h1>
          <p className="text-muted-foreground">Manage your job photos for marketing approval</p>
        </div>
        <Button>
          Upload Photo
        </Button>
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
          <CardDescription>Photos submitted for marketing approval. Showing {filteredPhotos.length} of {photos.length} photos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="border-0">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Photo</TableHead>
                <TableHead>Job Details</TableHead>
                <TableHead>Location & Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPhotos.map((photo) => (
                <TableRow key={photo.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <TableCell>
                    <div className="w-20 h-20 relative rounded-full overflow-hidden">
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
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {photo.jobType}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{photo.jobLocation}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{photo.dateUploaded}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(photo)}>
                      {getStatusText(photo)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingPhoto(photo)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(photo)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Edit
                      </Button>
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

      {/* View Details Modal */}
      <Dialog open={!!viewingPhoto} onOpenChange={() => setViewingPhoto(null)}>
        <DialogContent className="max-w-4xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              Complete information for this job photo submission.
            </DialogDescription>
          </DialogHeader>
          {viewingPhoto && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo */}
              <div className="space-y-4">
                <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={viewingPhoto.photoUrl}
                    alt={viewingPhoto.jobDescription}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => window.open(viewingPhoto.photoUrl, '_blank')}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Open full size image
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{viewingPhoto.jobDescription}</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Job Type:</span>
                      <span className="ml-2">{viewingPhoto.jobType}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Location:</span>
                      <span className="ml-2">{viewingPhoto.jobLocation}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Date Uploaded:</span>
                      <span className="ml-2">{viewingPhoto.dateUploaded}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="ml-2">
                        {viewingPhoto.franchiseeApproved === true ? 'Approved' : 
                         viewingPhoto.franchiseeApproved === false ? 'Denied' : 'Pending Review'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Tags:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {viewingPhoto.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}