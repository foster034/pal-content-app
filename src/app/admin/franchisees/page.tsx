'use client';

import { useState, useEffect } from 'react';
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
import StorageImageUploader from "@/components/StorageImageUploader";
import ImageModal from "@/components/ImageModal";
import { DetailModal } from "@/components/DetailModal";
import { Mail, Phone, Bell, MoreHorizontal, Eye, Send, Edit, Trash2, Settings, Search, X } from "lucide-react";
import '../../../styles/animations.css';

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
  country: string;
  status: 'Active' | 'Inactive' | 'Pending';
  joinDate: string;
  image: string;
  owners: Owner[];
  notificationPreferences: NotificationPreferences;
  techCount?: number;
}

const defaultNotificationPreferences: NotificationPreferences = {
  newTechSubmissions: { email: true, sms: false, app: true },
  mediaArchival: { email: true, sms: false, app: false },
  systemUpdates: { email: true, sms: false, app: true },
  marketingReports: { email: true, sms: false, app: false },
  emergencyAlerts: { email: true, sms: true, app: true },
  weeklyDigest: { email: true, sms: false, app: false },
};

const initialFranchisees: Franchisee[] = [];

export default function FranchiseesPage() {
  const [franchisees, setFranchisees] = useState<Franchisee[]>(initialFranchisees);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFranchisee, setEditingFranchisee] = useState<Franchisee | null>(null);
  const [sendingMagicLink, setSendingMagicLink] = useState<number | null>(null);
  const [sendingSMS, setSendingSMS] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [selectedFranchisee, setSelectedFranchisee] = useState<Franchisee | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');

  // Fetch franchisees from database on component mount
  useEffect(() => {
    fetchFranchisees();
  }, []);

  const fetchFranchisees = async () => {
    try {
      const response = await fetch('/api/franchisees');
      if (response.ok) {
        const data = await response.json();

        // Fetch technician counts for all franchisees
        const franchiseeIds = data.map((f: any) => f.id);
        const techCountPromises = franchiseeIds.map(async (id: string) => {
          try {
            const techResponse = await fetch(`/api/technicians?franchiseeId=${id}`);
            if (techResponse.ok) {
              const techData = await techResponse.json();
              return { franchiseeId: id, techCount: Array.isArray(techData) ? techData.length : 0 };
            }
            return { franchiseeId: id, techCount: 0 };
          } catch {
            return { franchiseeId: id, techCount: 0 };
          }
        });

        const techCounts = await Promise.all(techCountPromises);
        const techCountMap = Object.fromEntries(
          techCounts.map(item => [item.franchiseeId, item.techCount])
        );

        // Map database fields to frontend format with tech counts
        const mappedData = data.map((f: any) => ({
          id: f.id,
          name: f.business_name,
          username: f.username,
          email: f.email,
          phone: f.phone,
          territory: f.territory,
          country: f.country || 'United States',
          status: f.status,
          joinDate: f.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          image: f.image || '',
          owners: f.owners || [],
          notificationPreferences: f.notification_preferences || defaultNotificationPreferences,
          techCount: techCountMap[f.id] || 0
        }));
        setFranchisees(mappedData);
      }
    } catch (error) {
      console.error('Failed to fetch franchisees:', error);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    territory: '',
    country: 'United States',
    status: 'Active' as 'Active' | 'Inactive' | 'Pending',
    image: '',
    owners: [] as Owner[],
    createAuth: true,
    authMethod: 'magic_link' as 'magic_link' | 'temp_password',
    tempPassword: '',
    ownerName: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingFranchisee) {
        // Update existing franchisee in database
        const response = await fetch('/api/franchisees', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingFranchisee.id,
            ...formData
          })
        });

        if (response.ok) {
          const updatedData = await response.json();
          // Update local state
          setFranchisees(prev => prev.map(f =>
            f.id === editingFranchisee.id
              ? {
                  ...f,
                  ...formData,
                  id: updatedData.id
                }
              : f
          ));
        } else {
          const error = await response.json();
          alert(`Failed to update franchisee: ${error.error}`);
        }
        setEditingFranchisee(null);
      } else {
        // Create new franchisee in database
        const response = await fetch('/api/franchisees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            owners: formData.owners.map((owner, index) => ({
              ...owner,
              id: Date.now() + index
            }))
          })
        });

        if (response.ok) {
          const newData = await response.json();
          // Add to local state with database ID
          const newFranchisee: Franchisee = {
            id: newData.id,
            name: newData.business_name,
            username: newData.username,
            email: newData.email,
            phone: newData.phone,
            territory: newData.territory,
            country: newData.country || 'United States',
            status: newData.status,
            joinDate: newData.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            image: newData.image || '',
            owners: newData.owners || [],
            notificationPreferences: newData.notification_preferences || defaultNotificationPreferences
          };
          setFranchisees(prev => [...prev, newFranchisee]);

          // Show success message with auth info
          if (newData.authCreated) {
            let authMessage = '';

            if (newData.authMethod === 'magic_link') {
              if (newData.emailSent) {
                authMessage = '📧 A magic link has been sent to their email address.';
              } else if (newData.magicLinkUrl) {
                // In development, show the link
                authMessage = `🔗 Magic link generated (email may not be configured).\n\nShare this link with the franchisee:\n${newData.magicLinkUrl}`;
                console.log('Magic Link URL:', newData.magicLinkUrl);
              } else {
                authMessage = 'Authentication user created. They can request a password reset to access their account.';
              }
            } else {
              authMessage = '🔑 They can log in with the temporary password you provided.';
            }

            alert(`✅ Franchisee created successfully!\n\n${authMessage}`);
          } else {
            alert('✅ Franchisee created successfully!');
          }
        } else {
          const error = await response.json();
          alert(`Failed to create franchisee: ${error.error}`);
        }
      }

      // Reset form
      setFormData({ name: '', username: '', email: '', phone: '', territory: '', country: 'United States', status: 'Active' as 'Active' | 'Inactive' | 'Pending', image: '', owners: [], createAuth: true, authMethod: 'magic_link' as 'magic_link' | 'temp_password', tempPassword: '', ownerName: '' });
      setCurrentOwner({ name: '', email: '', phone: '', image: '', isPrimary: false });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error saving franchisee:', error);
      alert('Failed to save franchisee. Please try again.');
    }
  };

  const handleEdit = (franchisee: Franchisee) => {
    setEditingFranchisee(franchisee);
    setFormData({
      name: franchisee.name,
      username: franchisee.username,
      email: franchisee.email,
      phone: franchisee.phone,
      territory: franchisee.territory,
      country: franchisee.country || 'United States',
      status: franchisee.status,
      image: franchisee.image,
      owners: franchisee.owners,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this franchisee?')) {
      return;
    }

    try {
      const response = await fetch(`/api/franchisees?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove from local state
        setFranchisees(prev => prev.filter(f => f.id !== id));
      } else {
        const error = await response.json();
        alert(`Failed to delete franchisee: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting franchisee:', error);
      alert('Failed to delete franchisee. Please try again.');
    }
  };

  const sendMagicLink = async (franchisee: Franchisee) => {
    setSendingMagicLink(franchisee.id);
    try {
      const primaryContact = getPrimaryContact(franchisee);
      const contactEmail = primaryContact?.email || franchisee.email;
      const contactName = primaryContact?.name || franchisee.name;

      const response = await fetch('/api/franchisees/resend-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: contactEmail,
          franchiseeName: contactName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.emailSent) {
          alert(`✅ Magic link sent successfully to ${contactName} (${contactEmail})!`);
        } else if (data.magicLinkUrl) {
          // In development, show the link
          const message = `🔗 Magic link generated (email may not be configured).\n\nShare this link with ${contactName}:\n${data.magicLinkUrl}`;
          alert(message);
          console.log('Magic Link URL:', data.magicLinkUrl);
        } else {
          alert(`Magic link processed for ${contactEmail}`);
        }
      } else {
        alert(`Failed to send magic link: ${data.error || data.details || 'Unknown error'}`);
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

  // Get unique company names for dropdown
  const companyNames = Array.from(new Set(franchisees.map(f => f.name))).sort();

  // Filter franchisees based on selected company and search term
  const filteredFranchisees = franchisees.filter(franchisee => {
    // First filter by selected company
    if (selectedCompany && franchisee.name !== selectedCompany) {
      return false;
    }

    // Then filter by search term if provided
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const primaryContact = getPrimaryContact(franchisee);

    return (
      // Search in franchisee name (company name)
      franchisee.name.toLowerCase().includes(searchLower) ||
      // Search in primary contact name (franchisee name)
      (primaryContact?.name || '').toLowerCase().includes(searchLower) ||
      // Search in email
      (primaryContact?.email || franchisee.email).toLowerCase().includes(searchLower) ||
      // Search in phone
      (primaryContact?.phone || franchisee.phone).toLowerCase().includes(searchLower) ||
      // Search in territory
      franchisee.territory.toLowerCase().includes(searchLower) ||
      // Search in country
      franchisee.country.toLowerCase().includes(searchLower) ||
      // Search in username
      franchisee.username.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 bg-white min-h-screen">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="United States">🇺🇸 United States</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                    <option value="Australia">🇦🇺 Australia</option>
                    <option value="Germany">🇩🇪 Germany</option>
                    <option value="France">🇫🇷 France</option>
                    <option value="Spain">🇪🇸 Spain</option>
                    <option value="Italy">🇮🇹 Italy</option>
                    <option value="Netherlands">🇳🇱 Netherlands</option>
                    <option value="Sweden">🇸🇪 Sweden</option>
                    <option value="Norway">🇳🇴 Norway</option>
                    <option value="Denmark">🇩🇰 Denmark</option>
                    <option value="Finland">🇫🇮 Finland</option>
                    <option value="Switzerland">🇨🇭 Switzerland</option>
                    <option value="Austria">🇦🇹 Austria</option>
                    <option value="Belgium">🇧🇪 Belgium</option>
                    <option value="Ireland">🇮🇪 Ireland</option>
                    <option value="New Zealand">🇳🇿 New Zealand</option>
                    <option value="Japan">🇯🇵 Japan</option>
                    <option value="South Korea">🇰🇷 South Korea</option>
                    <option value="Singapore">🇸🇬 Singapore</option>
                    <option value="Mexico">🇲🇽 Mexico</option>
                    <option value="Brazil">🇧🇷 Brazil</option>
                    <option value="Argentina">🇦🇷 Argentina</option>
                    <option value="Chile">🇨🇱 Chile</option>
                    <option value="South Africa">🇿🇦 South Africa</option>
                    <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
                    <option value="Israel">🇮🇱 Israel</option>
                    <option value="Other">🌍 Other</option>
                  </select>
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

              <StorageImageUploader
                label="Main Franchise Image"
                currentImage={formData.image}
                onImageUploaded={(imageUrl) => setFormData(prev => ({ ...prev, image: imageUrl }))}
                enableCrop={false}
                userType="franchisee"
                userId={editingFranchisee?.id || `temp-${Date.now()}`}
              />

              {/* Auth User Creation Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">User Account Creation</h3>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="createAuth"
                    checked={formData.createAuth}
                    onChange={(e) => setFormData(prev => ({ ...prev, createAuth: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="createAuth" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Create Supabase Auth User for this Franchisee
                  </label>
                </div>

                {formData.createAuth && (
                  <div className="space-y-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Owner Full Name (for auth account)
                      </label>
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                        placeholder="Enter franchisee owner's full name"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Authentication Method
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="magic_link"
                            checked={formData.authMethod === 'magic_link'}
                            onChange={(e) => setFormData(prev => ({ ...prev, authMethod: e.target.value as 'magic_link' | 'temp_password' }))}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">Send Magic Link (passwordless login via email)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="temp_password"
                            checked={formData.authMethod === 'temp_password'}
                            onChange={(e) => setFormData(prev => ({ ...prev, authMethod: e.target.value as 'magic_link' | 'temp_password' }))}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">Create with Temporary Password</span>
                        </label>
                      </div>
                    </div>

                    {formData.authMethod === 'temp_password' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Temporary Password
                        </label>
                        <input
                          type="text"
                          value={formData.tempPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, tempPassword: e.target.value }))}
                          placeholder="Enter temporary password (min 6 characters)"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          The franchisee will need to change this password on first login.
                        </p>
                      </div>
                    )}

                    {formData.authMethod === 'magic_link' && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          ℹ️ A magic link will be sent to the franchisee's email address. They can use it to log in without a password.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
                      <StorageImageUploader
                        label="Owner Image"
                        currentImage={currentOwner.image}
                        onImageUploaded={(imageUrl) => setCurrentOwner(prev => ({ ...prev, image: imageUrl }))}
                        cropAspect={1}
                        userType="franchisee"
                        userId={currentOwner.id ? String(currentOwner.id) : `temp-owner-${Date.now()}`}
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
                          {owner.image ? (
                            <img
                              src={owner.image}
                              alt={owner.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                              {owner.name?.charAt(0)?.toUpperCase()}
                            </div>
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
                    setFormData({ name: '', username: '', email: '', phone: '', territory: '', country: 'United States', status: 'Active' as 'Active' | 'Inactive' | 'Pending', image: '', owners: [] });
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Franchise Partners</CardTitle>
              <CardDescription>
                Professional franchise partners across your locksmith network.
                {(searchTerm || selectedCompany) && (
                  <span className="ml-2 text-sm font-medium text-blue-600">
                    ({filteredFranchisees.length} of {franchisees.length} shown
                    {selectedCompany && ` • ${selectedCompany}`})
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white bg-white min-w-[200px]"
              >
                <option value="">All Companies</option>
                {companyNames.map((companyName) => (
                  <option key={companyName} value={companyName}>
                    {companyName}
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={selectedCompany ? `Search within ${selectedCompany}...` : 'Search franchisees...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-2 w-80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
                {(searchTerm || selectedCompany) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCompany('');
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="border-0">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Owners</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notifications</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">Loading franchisees...</div>
                  </TableCell>
                </TableRow>
              ) : filteredFranchisees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm ? `No franchisees found matching "${searchTerm}".` : 'No franchisees found. Click "Add Franchisee" to create one.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredFranchisees.map((franchisee) => {
                const primaryContact = getPrimaryContact(franchisee);
                return (
                <TableRow
                  key={franchisee.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer"
                  onClick={() => {
                    setSelectedFranchisee(franchisee);
                    setShowDetailModal(true);
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {(primaryContact?.image || franchisee.image) ? (
                        <img
                          className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all object-cover"
                          src={primaryContact?.image || franchisee.image}
                          alt={primaryContact?.name || franchisee.name}
                          onClick={() => setSelectedImage({ url: primaryContact?.image || franchisee.image, name: primaryContact?.name || franchisee.name })}
                          title="Click to view larger"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            {(primaryContact?.name || franchisee.name)?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
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
                  <TableCell>
                    <div>
                      <div className="font-medium">{franchisee.territory}</div>
                      <div className="text-muted-foreground text-xs">{franchisee.country || 'United States'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {franchisee.owners.slice(0, 3).map((owner) =>
                        owner.image ? (
                          <img
                            key={owner.id}
                            src={owner.image}
                            alt={owner.name}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                            title={`${owner.name} (${owner.email}) - Click to view larger`}
                            onClick={() => setSelectedImage({ url: owner.image, name: `${owner.name} (${owner.email})` })}
                          />
                        ) : (
                          <div
                            key={owner.id}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                            title={`${owner.name} (${owner.email})`}
                          >
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                              {owner.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        )
                      )}
                      {franchisee.owners.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            +{franchisee.owners.length - 3}
                          </span>
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
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                          onClick={() => window.open(`/franchisee?id=${franchisee.id}`, '_blank')}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4 text-green-600" />
                          <span>View as Franchisee</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => window.open(`/franchisee/profile?id=${franchisee.id}`, '_blank')}
                          className="cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4 text-blue-600" />
                          <span>Profile Settings</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => sendMagicLink(franchisee)}
                          disabled={sendingMagicLink === franchisee.id}
                          className="cursor-pointer"
                        >
                          <Send className="mr-2 h-4 w-4 text-blue-600" />
                          <span>{sendingMagicLink === franchisee.id ? 'Sending Magic Link...' : 'Send Magic Link'}</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => handleEdit(franchisee)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Details</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDelete(franchisee.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Franchisee</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          altText={selectedImage.name}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedFranchisee(null);
        }}
        type="franchisee"
        data={selectedFranchisee}
        onEdit={(franchisee) => {
          handleEdit(franchisee);
        }}
        onSendMagicLink={(franchisee) => {
          sendMagicLink(franchisee);
        }}
        onViewAs={(franchisee) => {
          window.open(`/franchisee?id=${franchisee.id}`, '_blank');
        }}
      />
    </div>
  );
}