'use client';

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTable } from '@/contexts/table-context';

interface ArchivedMedia {
  id: number;
  photoUrl: string;
  jobType: 'Commercial' | 'Residential' | 'Automotive' | 'Roadside';
  techName: string;
  techId: number;
  franchiseeName: string;
  franchiseeId: number;
  jobDescription: string;
  dateUploaded: string;
  dateArchived: string;
  jobLocation: string;
  tags: string[];
  category: 'Before' | 'After' | 'Process' | 'Tools' | 'Documentation';
  notes?: string;
  archived: boolean;
}

const initialArchivedMedia: ArchivedMedia[] = [
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
    dateArchived: '2024-09-08',
    jobLocation: 'Downtown Dallas, TX',
    tags: ['master key', 'office building', 'installation'],
    category: 'After',
    notes: 'Completed installation showing new master key system',
    archived: true,
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
    dateArchived: '2024-09-07',
    jobLocation: 'Austin, TX',
    tags: ['smart lock', 'residential', 'installation'],
    category: 'Process',
    notes: 'Step-by-step smart lock setup process',
    archived: true,
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
    dateArchived: '2024-09-06',
    jobLocation: 'Houston, TX',
    tags: ['car lockout', 'key extraction', 'emergency'],
    category: 'Tools',
    notes: 'Emergency tools used for key extraction',
    archived: true,
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
    dateArchived: '2024-09-05',
    jobLocation: 'San Antonio, TX',
    tags: ['roadside', 'emergency', 'key repair'],
    category: 'Before',
    notes: 'Before photo showing broken key in lock',
    archived: true,
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
    dateArchived: '2024-09-04',
    jobLocation: 'Dallas, TX',
    tags: ['access control', 'commercial', 'upgrade'],
    category: 'Documentation',
    notes: 'System documentation and specifications',
    archived: true,
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
    dateArchived: '2024-09-03',
    jobLocation: 'Austin, TX',
    tags: ['rekey', 'residential', 'new home'],
    category: 'After',
    notes: 'Completed rekey service with new keys',
    archived: true,
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

export default function MediaArchivePage() {
  const { getTableClasses } = useTable();
  const tableClasses = getTableClasses();
  
  const [archivedMedia, setArchivedMedia] = useState<ArchivedMedia[]>(initialArchivedMedia);
  const [selectedJobType, setSelectedJobType] = useState<string>('All');
  const [selectedFranchisee, setSelectedFranchisee] = useState<string>('All');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'gallery' | 'table'>('table');

  const filteredMedia = useMemo(() => {
    return archivedMedia.filter(media => {
      if (selectedJobType !== 'All' && media.jobType !== selectedJobType) return false;
      if (selectedFranchisee !== 'All' && media.franchiseeName !== selectedFranchisee) return false;
      if (selectedTechnician !== 'All' && media.techName !== selectedTechnician) return false;
      if (selectedCategory !== 'All' && media.category !== selectedCategory) return false;
      if (searchTerm && !media.jobDescription.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !media.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) &&
          !media.notes?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [archivedMedia, selectedJobType, selectedFranchisee, selectedTechnician, selectedCategory, searchTerm]);

  const updateMediaNotes = (mediaId: number, notes: string) => {
    setArchivedMedia(prev => prev.map(media => 
      media.id === mediaId ? { ...media, notes } : media
    ));
  };

  const updateMediaCategory = (mediaId: number, category: 'Before' | 'After' | 'Process' | 'Tools' | 'Documentation') => {
    setArchivedMedia(prev => prev.map(media => 
      media.id === mediaId ? { ...media, category } : media
    ));
  };

  const deleteMedia = (mediaId: number) => {
    setArchivedMedia(prev => prev.filter(media => media.id !== mediaId));
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

  const getCategoryVariant = (category: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (category) {
      case 'Before': return 'outline';
      case 'After': return 'default';
      case 'Process': return 'secondary';
      case 'Tools': return 'destructive';
      case 'Documentation': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Media Archive</h1>
          <p className="text-muted-foreground">Browse and organize archived technician media by job type, franchisee, and category</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button>
            Export Archive
          </Button>
        </div>
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Before">Before</option>
            <option value="After">After</option>
            <option value="Process">Process</option>
            <option value="Tools">Tools</option>
            <option value="Documentation">Documentation</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archived Media</CardTitle>
          <CardDescription>Browse and organize archived technician media. Showing {filteredMedia.length} of {archivedMedia.length} items.</CardDescription>
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
                    Archive Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMedia.map((media, index) => (
                  <tr key={media.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="w-4 p-4">
                      <div className="flex items-center">
                        <input 
                          id={`checkbox-table-${media.id}`} 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor={`checkbox-table-${media.id}`} className="sr-only">checkbox</label>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-16 relative rounded overflow-hidden">
                        <img
                          src={media.photoUrl}
                          alt={media.jobDescription}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      <div>
                        <div className="mb-2">
                          {media.jobDescription}
                        </div>
                        <div className="flex gap-1 mb-1">
                          <Badge variant={getJobTypeVariant(media.jobType)} className="text-xs">
                            {media.jobType}
                          </Badge>
                          {media.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {media.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{media.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                          {media.jobLocation} • Uploaded: {media.dateUploaded}
                        </div>
                        {media.notes && (
                          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic font-normal">
                            "{media.notes}"
                          </div>
                        )}
                      </div>
                    </th>
                    <td className="px-6 py-4">
                      {media.techName}
                    </td>
                    <td className="px-6 py-4">
                      {media.franchiseeName}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getCategoryVariant(media.category)}>
                        {media.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {media.dateArchived}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">View</a>
                        <a href="#" className="font-medium text-green-600 dark:text-green-500 hover:underline">Edit</a>
                        <button 
                          onClick={() => deleteMedia(media.id)}
                          className="font-medium text-red-600 dark:text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}