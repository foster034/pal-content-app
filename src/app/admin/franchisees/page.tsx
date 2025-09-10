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

interface Franchisee {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  territory: string;
  status: 'Active' | 'Inactive' | 'Pending';
  joinDate: string;
  revenue: string;
  image: string;
}

const initialFranchisees: Franchisee[] = [
  { 
    id: 1, 
    name: 'Alex Thompson', 
    username: '@alexthompson',
    email: 'alex.thompson@popalock.com', 
    phone: '(555) 123-4567', 
    territory: 'Dallas Downtown', 
    status: 'Active', 
    joinDate: '2024-01-15', 
    revenue: '$145,250',
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg'
  },
  { 
    id: 2, 
    name: 'Sarah Chen', 
    username: '@sarahchen',
    email: 'sarah.chen@popalock.com', 
    phone: '(555) 234-5678', 
    territory: 'Austin Central', 
    status: 'Active', 
    joinDate: '2024-02-20', 
    revenue: '$98,600',
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg'
  },
  { 
    id: 3, 
    name: 'Maria Garcia', 
    username: '@mariagarcia',
    email: 'maria.garcia@popalock.com', 
    phone: '(555) 345-6789', 
    territory: 'Houston West', 
    status: 'Active', 
    joinDate: '2024-03-10', 
    revenue: '$76,840',
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-03_dkeufx.jpg'
  },
  { 
    id: 4, 
    name: 'David Kim', 
    username: '@davidkim',
    email: 'david.kim@popalock.com', 
    phone: '(555) 456-7890', 
    territory: 'San Antonio North', 
    status: 'Pending', 
    joinDate: '2024-04-05', 
    revenue: '$32,100',
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-05_cmz0mg.jpg'
  },
];

export default function FranchiseesPage() {
  const [franchisees, setFranchisees] = useState<Franchisee[]>(initialFranchisees);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFranchisee, setEditingFranchisee] = useState<Franchisee | null>(null);
  const [sendingMagicLink, setSendingMagicLink] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    territory: '',
    status: 'Active' as const,
    image: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFranchisee) {
      setFranchisees(prev => prev.map(f => 
        f.id === editingFranchisee.id 
          ? { ...f, ...formData }
          : f
      ));
      setEditingFranchisee(null);
    } else {
      const newFranchisee: Franchisee = {
        id: Math.max(...franchisees.map(f => f.id)) + 1,
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        revenue: '$0',
      };
      setFranchisees(prev => [...prev, newFranchisee]);
    }
    setFormData({ name: '', username: '', email: '', phone: '', territory: '', status: 'Active', image: '' });
    setShowCreateForm(false);
  };

  const handleEdit = (franchisee: Franchisee) => {
    setEditingFranchisee(franchisee);
    setFormData({
      name: franchisee.name,
      username: franchisee.username,
      email: franchisee.email,
      phone: franchisee.phone,
      territory: franchisee.territory,
      status: franchisee.status,
      image: franchisee.image,
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: number) => {
    setFranchisees(prev => prev.filter(f => f.id !== id));
  };

  const sendMagicLink = async (franchisee: Franchisee) => {
    setSendingMagicLink(franchisee.id);
    try {
      const response = await fetch('/api/magic-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: franchisee.email,
          userType: 'franchisee',
          userId: franchisee.id,
          name: franchisee.name,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Magic link sent successfully to ${franchisee.email}!`);
      } else {
        alert(`Failed to send magic link: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to send magic link. Please try again.');
    } finally {
      setSendingMagicLink(null);
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'destructive';
      case 'Pending': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Franchisees</h1>
          <p className="text-muted-foreground">Manage your Pop-A-Lock franchise network</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          Add Franchisee
        </Button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingFranchisee ? 'Edit Franchisee' : 'Create New Franchisee'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                <input
                  type="text"
                  value={formData.territory}
                  onChange={(e) => setFormData(prev => ({ ...prev, territory: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' | 'Pending' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingFranchisee ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingFranchisee(null);
                    setFormData({ name: '', username: '', email: '', phone: '', territory: '', status: 'Active', image: '' });
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

      <Card>
        <CardHeader>
          <CardTitle>Franchise Partners</CardTitle>
          <CardDescription>A list of active and pending franchise partners in your network.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {franchisees.map((franchisee) => (
                <TableRow key={franchisee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        className="rounded-full"
                        src={franchisee.image}
                        width={40}
                        height={40}
                        alt={franchisee.name}
                      />
                      <div>
                        <div className="font-medium">{franchisee.name}</div>
                        <span className="text-muted-foreground mt-0.5 text-xs">
                          {franchisee.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{franchisee.email}</div>
                      <div className="text-muted-foreground text-xs">{franchisee.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{franchisee.territory}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(franchisee.status)}>
                      {franchisee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{franchisee.revenue}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendMagicLink(franchisee)}
                        disabled={sendingMagicLink === franchisee.id}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {sendingMagicLink === franchisee.id ? 'Sending...' : 'Send Link'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(franchisee)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(franchisee.id)}
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