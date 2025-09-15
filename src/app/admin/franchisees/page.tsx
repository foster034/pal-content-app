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
import ImageUploader from "@/components/ImageUploader";
import { Mail, Phone, Bell } from "lucide-react";

interface Owner {
  id: number;
  name: string;
  email: string;
  phone: string;
  image: string;
  isPrimary?: boolean;
}

interface NotificationPreferences {
  newTechSubmissions: {
    email: boolean;
    sms: boolean;
    app: boolean;
  };
  mediaArchival: {
    email: boolean;
    sms: boolean;
    app: boolean;
  };
  systemUpdates: {
    email: boolean;
    sms: boolean;
    app: boolean;
  };
  marketingReports: {
    email: boolean;
    sms: boolean;
    app: boolean;
  };
  emergencyAlerts: {
    email: boolean;
    sms: boolean;
    app: boolean;
  };
  weeklyDigest: {
    email: boolean;
    sms: boolean;
    app: boolean;
  };
}

interface Franchisee {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  territory: string;
  status: 'Active' | 'Inactive' | 'Pending';
  joinDate: string;
  image: string;
  owners: Owner[];
  notificationPreferences: NotificationPreferences;
}

const defaultNotificationPreferences: NotificationPreferences = {
  newTechSubmissions: { email: true, sms: false, app: true },
  mediaArchival: { email: true, sms: false, app: false },
  systemUpdates: { email: true, sms: false, app: true },
  marketingReports: { email: true, sms: false, app: false },
  emergencyAlerts: { email: true, sms: true, app: true },
  weeklyDigest: { email: true, sms: false, app: false },
};

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
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg',
    notificationPreferences: {
      newTechSubmissions: { email: true, sms: true, app: true },
      mediaArchival: { email: true, sms: false, app: true },
      systemUpdates: { email: true, sms: false, app: true },
      marketingReports: { email: true, sms: false, app: false },
      emergencyAlerts: { email: true, sms: true, app: true },
      weeklyDigest: { email: true, sms: false, app: false },
    },
    owners: [
      {
        id: 1,
        name: 'Alex Thompson',
        email: 'alex.thompson@popalock.com',
        phone: '(555) 123-4567',
        image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg',
        isPrimary: true
      },
      {
        id: 2,
        name: 'Jennifer Thompson',
        email: 'jennifer.thompson@popalock.com',
        phone: '(555) 123-4568',
        image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg'
      }
    ]
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
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg',
    notificationPreferences: { ...defaultNotificationPreferences },
    owners: [
      {
        id: 3,
        name: 'Sarah Chen',
        email: 'sarah.chen@popalock.com',
        phone: '(555) 234-5678',
        image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg',
        isPrimary: true
      }
    ]
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
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-03_dkeufx.jpg',
    notificationPreferences: {
      newTechSubmissions: { email: true, sms: false, app: true },
      mediaArchival: { email: false, sms: false, app: true },
      systemUpdates: { email: true, sms: false, app: true },
      marketingReports: { email: false, sms: false, app: false },
      emergencyAlerts: { email: true, sms: true, app: true },
      weeklyDigest: { email: false, sms: false, app: false },
    },
    owners: [
      {
        id: 4,
        name: 'Maria Garcia',
        email: 'maria.garcia@popalock.com',
        phone: '(555) 345-6789',
        image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-03_dkeufx.jpg',
        isPrimary: true
      },
      {
        id: 5,
        name: 'Carlos Garcia',
        email: 'carlos.garcia@popalock.com',
        phone: '(555) 345-6790',
        image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-05_cmz0mg.jpg'
      },
      {
        id: 6,
        name: 'Isabella Garcia',
        email: 'isabella.garcia@popalock.com',
        phone: '(555) 345-6791',
        image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-04_h0gxqy.jpg'
      }
    ]
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
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-05_cmz0mg.jpg',
    notificationPreferences: { ...defaultNotificationPreferences },
    owners: [
      {
        id: 7,
        name: 'David Kim',
        email: 'david.kim@popalock.com',
        phone: '(555) 456-7890',
        image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-05_cmz0mg.jpg',
        isPrimary: true
      }
    ]
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
    status: 'Active' as 'Active' | 'Inactive' | 'Pending',
    image: '',
    owners: [] as Owner[],
  });

  const [currentOwner, setCurrentOwner] = useState({
    name: '',
    email: '',
    phone: '',
    image: '',
    isPrimary: false,
  });

  const addOwner = () => {
    if (currentOwner.name && currentOwner.email) {
      setFormData(prev => {
        let updatedOwners = [...prev.owners];
        
        // If this owner is being set as primary, remove primary from others
        if (currentOwner.isPrimary) {
          updatedOwners = updatedOwners.map(owner => ({
            ...owner,
            isPrimary: false
          }));
        }
        
        // Add new owner
        updatedOwners.push({ ...currentOwner, id: Date.now() });
        
        return {
          ...prev,
          owners: updatedOwners
        };
      });
      setCurrentOwner({ name: '', email: '', phone: '', image: '', isPrimary: false });
    }
  };

  const removeOwner = (ownerId: number) => {
    setFormData(prev => ({
      ...prev,
      owners: prev.owners.filter(owner => owner.id !== ownerId)
    }));
  };

  const setPrimaryOwner = (ownerId: number) => {
    setFormData(prev => ({
      ...prev,
      owners: prev.owners.map(owner => ({
        ...owner,
        isPrimary: owner.id === ownerId
      }))
    }));
  };


  const getPrimaryContact = (franchisee: Franchisee) => {
    const primaryOwner = franchisee.owners.find(owner => owner.isPrimary);
    return primaryOwner || franchisee.owners[0] || null;
  };

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
        notificationPreferences: { ...defaultNotificationPreferences },
        owners: formData.owners.map((owner, index) => ({
          ...owner,
          id: Date.now() + index
        })),
      };
      setFranchisees(prev => [...prev, newFranchisee]);
    }
    setFormData({ name: '', username: '', email: '', phone: '', territory: '', status: 'Active' as 'Active' | 'Inactive' | 'Pending', image: '', owners: [] });
    setCurrentOwner({ name: '', email: '', phone: '', image: '', isPrimary: false });
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
      owners: franchisee.owners,
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: number) => {
    setFranchisees(prev => prev.filter(f => f.id !== id));
  };

  const sendMagicLink = async (franchisee: Franchisee) => {
    setSendingMagicLink(franchisee.id);
    try {
      const primaryContact = getPrimaryContact(franchisee);
      const contactEmail = primaryContact?.email || franchisee.email;
      const contactName = primaryContact?.name || franchisee.name;

      const response = await fetch('/api/magic-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: contactEmail,
          userType: 'franchisee',
          userId: franchisee.id,
          name: contactName,
          franchiseName: franchisee.name,
          territory: franchisee.territory,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Magic link sent successfully to ${contactName} (${contactEmail})!`);
      } else {
        alert(`Failed to send magic link: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to send magic link. Please try again.');
    } finally {
      setSendingMagicLink(null);
    }
  };

  const sendSMS = async (franchisee: Franchisee) => {
    const primaryContact = getPrimaryContact(franchisee);
    const contactPhone = primaryContact?.phone || franchisee.phone;
    const contactName = primaryContact?.name || franchisee.name;
    
    const message = prompt(`Enter SMS message to send to ${contactName} (${contactPhone}):`, 
      `Hi ${contactName}, this is a test message from Pop-A-Lock Management Portal. Your franchise ${franchisee.territory} is important to us!`
    );
    
    if (!message) return;

    setSendingSMS(franchisee.id);
    try {
      const response = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: contactPhone,
          message: message,
          userType: 'franchisee',
          userId: franchisee.id,
          userName: contactName,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.testMode) {
          alert(`📱 SMS logged in test mode for ${contactName} (${contactPhone})\n\nMessage: ${message}`);
        } else {
          alert(`📱 SMS sent successfully to ${contactName} (${contactPhone})\n\nMessage SID: ${data.messageSid}`);
        }
      } else {
        alert(`❌ Failed to send SMS: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Failed to send SMS. Please check your Twilio configuration in Settings.');
    } finally {
      setSendingSMS(null);
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
        <div className="flex gap-3">
          <Button onClick={() => setShowCreateForm(true)}>
            Add Franchisee
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingFranchisee ? 'Edit Franchisee' : 'Create New Franchisee'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Territory</label>
                  <input
                    type="text"
                    value={formData.territory}
                    onChange={(e) => setFormData(prev => ({ ...prev, territory: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' | 'Pending' }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <ImageUploader
                label="Main Franchise Image"
                currentImage={formData.image}
                onImageSelected={(imageDataUrl) => setFormData(prev => ({ ...prev, image: imageDataUrl }))}
                cropAspect={1}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Franchise Owners</h3>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Add New Owner</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Owner Name</label>
                      <input
                        type="text"
                        value={currentOwner.name}
                        onChange={(e) => setCurrentOwner(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Owner Email</label>
                      <input
                        type="email"
                        value={currentOwner.email}
                        onChange={(e) => setCurrentOwner(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Owner Phone</label>
                      <input
                        type="tel"
                        value={currentOwner.phone}
                        onChange={(e) => setCurrentOwner(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <ImageUploader
                        label="Owner Image"
                        currentImage={currentOwner.image}
                        onImageSelected={(imageDataUrl) => setCurrentOwner(prev => ({ ...prev, image: imageDataUrl }))}
                        cropAspect={1}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentOwner.isPrimary}
                        onChange={(e) => setCurrentOwner(prev => ({ ...prev, isPrimary: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Set as Primary Contact
                      </span>
                    </label>
                    <Button
                      type="button"
                      onClick={addOwner}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={!currentOwner.name || !currentOwner.email}
                    >
                      Add Owner
                    </Button>
                  </div>
                </div>

                {formData.owners.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Current Owners ({formData.owners.length})</h4>
                    {formData.owners.map((owner) => (
                      <div key={owner.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          {owner.image && (
                            <img
                              src={owner.image}
                              alt={owner.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{owner.name}</div>
                              {owner.isPrimary && (
                                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                                  Primary
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{owner.email}</div>
                            {owner.phone && (
                              <div className="text-xs text-gray-500">{owner.phone}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!owner.isPrimary && (
                            <Button
                              type="button"
                              onClick={() => setPrimaryOwner(owner.id)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Set Primary
                            </Button>
                          )}
                          <Button
                            type="button"
                            onClick={() => removeOwner(owner.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    setFormData({ name: '', username: '', email: '', phone: '', territory: '', status: 'Active' as 'Active' | 'Inactive' | 'Pending', image: '', owners: [] });
                    setCurrentOwner({ name: '', email: '', phone: '', image: '', isPrimary: false });
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
          <CardTitle>Franchise Partners</CardTitle>
          <CardDescription>A list of active and pending franchise partners in your network.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="border-0">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Owners</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notifications</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {franchisees.map((franchisee) => {
                const primaryContact = getPrimaryContact(franchisee);
                return (
                <TableRow key={franchisee.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        className="rounded-full"
                        src={primaryContact?.image || franchisee.image}
                        width={40}
                        height={40}
                        alt={primaryContact?.name || franchisee.name}
                      />
                      <div>
                        <div className="font-medium">{primaryContact?.name || franchisee.name}</div>
                        <div className="text-muted-foreground mt-0.5 text-xs">
                          Primary Contact
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{primaryContact?.email || franchisee.email}</div>
                      <div className="text-muted-foreground text-xs">{primaryContact?.phone || franchisee.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{franchisee.territory}</TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {franchisee.owners.slice(0, 3).map((owner) => (
                        <img
                          key={owner.id}
                          src={owner.image}
                          alt={owner.name}
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                          title={`${owner.name} (${owner.email})`}
                        />
                      ))}
                      {franchisee.owners.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium">
                          +{franchisee.owners.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(franchisee.status)}>
                      {franchisee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      {Object.values(franchisee.notificationPreferences).some(methods => methods.email) && (
                        <Mail className="h-4 w-4 text-neutral-600 dark:text-neutral-400" title="Email notifications enabled" />
                      )}
                      {Object.values(franchisee.notificationPreferences).some(methods => methods.sms) && (
                        <Phone className="h-4 w-4 text-neutral-600 dark:text-neutral-400" title="SMS notifications enabled" />
                      )}
                      {Object.values(franchisee.notificationPreferences).some(methods => methods.app) && (
                        <Bell className="h-4 w-4 text-neutral-600 dark:text-neutral-400" title="App push notifications enabled" />
                      )}
                    </div>
                  </TableCell>
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}