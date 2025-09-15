'use client';

import { useState } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MessageCircle, Eye, Send, Edit, Trash2, Settings } from "lucide-react";

interface Tech {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  franchiseeId: number;
  franchiseeName: string;
  specialties: string[];
  status: 'Active' | 'Inactive' | 'On Leave';
  hireDate: string;
  rating: number;
  completedJobs: number;
  image: string;
}

const initialTechs: Tech[] = [
  { 
    id: 1, 
    name: 'Alex Rodriguez', 
    username: '@alexrodriguez',
    email: 'alex.rodriguez@popalock.com', 
    phone: '(555) 111-2222', 
    franchiseeId: 1,
    franchiseeName: 'Dallas Downtown',
    specialties: ['Automotive Locksmith', 'Roadside Assistance'], 
    status: 'Active', 
    hireDate: '2024-01-20', 
    rating: 4.8,
    completedJobs: 156,
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg'
  },
  { 
    id: 2, 
    name: 'Sofia Martinez', 
    username: '@sofiamartinez',
    email: 'sofia.martinez@popalock.com', 
    phone: '(555) 222-3333', 
    franchiseeId: 2,
    franchiseeName: 'Austin Central',
    specialties: ['Commercial Locksmith', 'Access Control'], 
    status: 'Active', 
    hireDate: '2024-02-15', 
    rating: 4.9,
    completedJobs: 203,
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg'
  },
  { 
    id: 3, 
    name: 'David Chen', 
    username: '@davidchen',
    email: 'david.chen@popalock.com', 
    phone: '(555) 333-4444', 
    franchiseeId: 3,
    franchiseeName: 'Houston West',
    specialties: ['Residential Locksmith', 'Key Programming'], 
    status: 'On Leave', 
    hireDate: '2024-03-01', 
    rating: 4.5,
    completedJobs: 89,
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-05_cmz0mg.jpg'
  },
  { 
    id: 4, 
    name: 'Jennifer Walsh', 
    username: '@jenwalsh',
    email: 'jennifer.walsh@popalock.com', 
    phone: '(555) 444-5555', 
    franchiseeId: 4,
    franchiseeName: 'San Antonio North',
    specialties: ['Safe Services', 'Emergency Services'], 
    status: 'Active', 
    hireDate: '2024-04-10', 
    rating: 4.7,
    completedJobs: 124,
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-03_dkeufx.jpg'
  },
];

const franchisees = [
  { id: 1, name: 'Dallas Downtown' },
  { id: 2, name: 'Austin Central' },
  { id: 3, name: 'Houston West' },
  { id: 4, name: 'San Antonio North' },
];

const specialtyOptions = ['Automotive Locksmith', 'Commercial Locksmith', 'Residential Locksmith', 'Roadside Assistance', 'Key Programming', 'Safe Services', 'Access Control', 'Emergency Services'];

export default function TechsPage() {
  const [techs, setTechs] = useState<Tech[]>(initialTechs);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTech, setEditingTech] = useState<Tech | null>(null);
  const [sendingMagicLink, setSendingMagicLink] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    franchiseeId: 1,
    specialties: [] as string[],
    status: 'Active' as const,
    image: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFranchisee = franchisees.find(f => f.id === formData.franchiseeId);
    
    if (editingTech) {
      setTechs(prev => prev.map(t => 
        t.id === editingTech.id 
          ? { 
              ...t, 
              ...formData,
              franchiseeName: selectedFranchisee?.name || ''
            }
          : t
      ));
      setEditingTech(null);
    } else {
      const newTech: Tech = {
        id: Math.max(...techs.map(t => t.id)) + 1,
        ...formData,
        franchiseeName: selectedFranchisee?.name || '',
        hireDate: new Date().toISOString().split('T')[0],
        rating: 0,
        completedJobs: 0,
      };
      setTechs(prev => [...prev, newTech]);
    }
    setFormData({ name: '', username: '', email: '', phone: '', franchiseeId: 1, specialties: [], status: 'Active', image: '' });
    setShowCreateForm(false);
  };

  const handleEdit = (tech: Tech) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      username: tech.username,
      email: tech.email,
      phone: tech.phone,
      franchiseeId: tech.franchiseeId,
      specialties: tech.specialties,
      status: tech.status,
      image: tech.image,
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: number) => {
    setTechs(prev => prev.filter(t => t.id !== id));
  };

  const sendMagicLink = async (tech: Tech) => {
    setSendingMagicLink(tech.id);
    try {
      const response = await fetch('/api/magic-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: tech.email,
          userType: 'technician',
          userId: tech.id,
          name: tech.name,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Magic link sent successfully to ${tech.email}!`);
      } else {
        alert(`Failed to send magic link: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to send magic link. Please try again.');
    } finally {
      setSendingMagicLink(null);
    }
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, specialties: [...prev.specialties, specialty] }));
    } else {
      setFormData(prev => ({ ...prev, specialties: prev.specialties.filter(s => s !== specialty) }));
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'destructive';
      case 'On Leave': return 'secondary';
      default: return 'outline';
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <div className="space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Technicians</h1>
          <p className="text-muted-foreground">Manage your skilled locksmith technicians</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowCreateForm(true)}>
            Add Technician
          </Button>
        </div>
      </div>


      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTech ? 'Edit Technician' : 'Create New Technician'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Franchisee</label>
                <select
                  value={formData.franchiseeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, franchiseeId: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {franchisees.map(franchisee => (
                    <option key={franchisee.id} value={franchisee.id}>
                      {franchisee.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {specialtyOptions.map(specialty => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' | 'On Leave' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTech ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTech(null);
                    setFormData({ name: '', username: '', email: '', phone: '', franchiseeId: 1, specialties: [], status: 'Active', image: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle>Skilled Technicians</CardTitle>
          <CardDescription>Professional locksmith technicians across your franchise network.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="border-0">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Franchise</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {techs.map((tech) => (
                <TableRow key={tech.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        className="rounded-full"
                        src={tech.image}
                        width={40}
                        height={40}
                        alt={tech.name}
                      />
                      <div>
                        <div className="font-medium">{tech.name}</div>
                        <span className="text-muted-foreground mt-0.5 text-xs">
                          {tech.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tech.email}</div>
                      <div className="text-muted-foreground text-xs">{tech.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{tech.franchiseeName}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tech.specialties.slice(0, 2).map(specialty => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {tech.specialties.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{tech.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(tech.status)}>
                      {tech.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-yellow-500">{renderStars(tech.rating)}</div>
                      <div className="text-xs text-muted-foreground">{tech.completedJobs} jobs</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg">
                        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          onClick={() => window.open('/tech-hub', '_blank')}
                          className="cursor-pointer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4 text-indigo-600" />
                          <span>Connect to Tech Hub</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => window.open('/tech/dashboard', '_blank')}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4 text-green-600" />
                          <span>View as Technician</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => window.open('/tech/profile', '_blank')}
                          className="cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4 text-blue-600" />
                          <span>Profile Settings</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          onClick={() => sendMagicLink(tech)}
                          disabled={sendingMagicLink === tech.id}
                          className="cursor-pointer"
                        >
                          <Send className="mr-2 h-4 w-4 text-blue-600" />
                          <span>{sendingMagicLink === tech.id ? 'Sending Magic Link...' : 'Send Magic Link'}</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          onClick={() => handleEdit(tech)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Details</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => handleDelete(tech.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Technician</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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