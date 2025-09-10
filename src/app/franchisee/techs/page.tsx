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

interface Tech {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  status: 'Active' | 'Inactive' | 'On Leave';
  hireDate: string;
  rating: number;
  completedJobs: number;
  image: string;
}

interface LoginCode {
  code: string;
  email: string;
  expiresAt: Date;
  used: boolean;
}

interface GeneratedAuth {
  email: string;
  code: string;
  magicLink: string;
  expiresAt: Date;
}

// Sample data for the current franchisee (John Smith - Downtown)
const initialTechs: Tech[] = [
  { 
    id: 1, 
    name: 'Alex Rodriguez', 
    email: 'alex@popalock.com', 
    phone: '(555) 111-2222', 
    specialties: ['Automotive Locksmith', 'Roadside Assistance'], 
    status: 'Active', 
    hireDate: '2024-01-20', 
    rating: 4.8,
    completedJobs: 156,
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg'
  },
  { 
    id: 3, 
    name: 'David Chen', 
    email: 'david@popalock.com', 
    phone: '(555) 333-4444', 
    specialties: ['Residential Locksmith', 'Key Programming'], 
    status: 'On Leave', 
    hireDate: '2024-03-01', 
    rating: 4.5,
    completedJobs: 89,
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-05_cmz0mg.jpg'
  },
];

const specialtyOptions = ['Automotive Locksmith', 'Commercial Locksmith', 'Residential Locksmith', 'Roadside Assistance', 'Key Programming', 'Safe Services', 'Access Control', 'Emergency Services'];

// Simulated database of active codes
let activeCodes: LoginCode[] = [];

export default function FranchiseeTechsPage() {
  const [techs, setTechs] = useState<Tech[]>(initialTechs);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTech, setEditingTech] = useState<Tech | null>(null);
  const [sendingMagicLink, setSendingMagicLink] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    status: 'Active' as const,
    image: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTech) {
      setTechs(prev => prev.map(t => 
        t.id === editingTech.id 
          ? { ...t, ...formData }
          : t
      ));
      setEditingTech(null);
    } else {
      const newTech: Tech = {
        id: Math.max(...techs.map(t => t.id), 0) + 1,
        ...formData,
        hireDate: new Date().toISOString().split('T')[0],
        rating: 0,
        completedJobs: 0,
      };
      setTechs(prev => [...prev, newTech]);
    }
    setFormData({ name: '', email: '', phone: '', specialties: [], status: 'Active', image: '' });
    setShowCreateForm(false);
  };

  const handleEdit = (tech: Tech) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      specialties: tech.specialties,
      status: tech.status,
      image: tech.image,
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to remove this technician?')) {
      setTechs(prev => prev.filter(t => t.id !== id));
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">My Technicians</h1>
          <p className="text-muted-foreground">Manage your team of technicians and generate login codes</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          Add New Technician
        </Button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {editingTech ? 'Edit Technician' : 'Add New Technician'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialties</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  {specialtyOptions.map(specialty => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' | 'On Leave' }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="flex-1">
                  {editingTech ? 'Update Technician' : 'Add Technician'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTech(null);
                    setFormData({ name: '', email: '', phone: '', specialties: [], status: 'Active', image: '' });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Technician Team</CardTitle>
          <CardDescription>Manage and coordinate with your skilled locksmith technicians.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Technician</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {techs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🔧</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No technicians yet</h3>
                    <p className="text-muted-foreground mb-6">Get started by adding your first technician to your team.</p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      Add Your First Technician
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                techs.map((tech) => (
                  <TableRow key={tech.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          className="rounded-full"
                          src={tech.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(tech.name)}&background=0ea5e9&color=fff`}
                          width={40}
                          height={40}
                          alt={tech.name}
                        />
                        <div>
                          <div className="font-medium">{tech.name}</div>
                          <span className="text-muted-foreground text-xs">
                            Hired {new Date(tech.hireDate).toLocaleDateString()}
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
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => sendMagicLink(tech)}
                          disabled={sendingMagicLink === tech.id}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {sendingMagicLink === tech.id ? 'Sending...' : 'Generate Login'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(tech)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tech.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}