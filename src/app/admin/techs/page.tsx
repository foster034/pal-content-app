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
import { MoreHorizontal, MessageCircle, Eye, Send, Edit, Trash2, Settings } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import ImageModal from "@/components/ImageModal";
import { DetailModal } from "@/components/DetailModal";
import '../../../styles/animations.css';

interface Tech {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  franchiseeId: string;
  franchiseeName: string;
  specialties: string[];
  status: 'Active' | 'Inactive' | 'On Leave';
  hireDate: string;
  rating: number;
  completedJobs: number;
  image: string;
}

interface Franchisee {
  id: string;
  business_name: string;
  email: string;
}

const initialTechs: Tech[] = [];

const specialtyOptions = ['Automotive Locksmith', 'Commercial Locksmith', 'Residential Locksmith', 'Roadside Assistance', 'Key Programming', 'Safe Services', 'Access Control', 'Emergency Services'];

export default function TechsPage() {
  const [techs, setTechs] = useState<Tech[]>(initialTechs);
  const [franchisees, setFranchisees] = useState<Franchisee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTech, setEditingTech] = useState<Tech | null>(null);
  const [sendingMagicLink, setSendingMagicLink] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [selectedTech, setSelectedTech] = useState<Tech | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    franchiseeId: '',
    specialties: [] as string[],
    status: 'Active' as const,
    image: '',
  });

  useEffect(() => {
    fetchFranchisees();
    fetchTechnicians();
  }, []);

  const fetchFranchisees = async () => {
    try {
      const response = await fetch('/api/franchisees');
      if (response.ok) {
        const data = await response.json();
        setFranchisees(data);
        // Set the first franchisee as default if available
        if (data.length > 0 && !formData.franchiseeId) {
          setFormData(prev => ({ ...prev, franchiseeId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch franchisees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/api/technicians');
      if (response.ok) {
        const data = await response.json();
        // Transform API data to match Tech interface
        const techsData = data.map((tech: any) => ({
          id: tech.id,
          name: tech.name,
          username: tech.email.split('@')[0], // Generate username from email
          email: tech.email,
          phone: tech.phone || '',
          franchiseeId: tech.franchisee_id,
          franchiseeName: tech.franchiseeName || 'Unknown Franchise',
          specialties: [],
          status: 'Active' as const,
          hireDate: tech.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          rating: tech.rating || 0,
          completedJobs: 0,
          image: tech.image_url || ''
        }));
        setTechs(techsData);
      }
    } catch (error) {
      console.error('Failed to fetch technicians:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFranchisee = franchisees.find(f => f.id === formData.franchiseeId);

    try {
      if (editingTech) {
        // Update existing technician (if API supports it)
        const response = await fetch('/api/technicians', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTech.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: 'technician',
            image_url: formData.image
          })
        });

        if (response.ok) {
          await fetchTechnicians(); // Refresh the list
        }
        setEditingTech(null);
      } else {
        // Create new technician
        const response = await fetch('/api/technicians', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            franchiseeId: formData.franchiseeId,
            role: 'technician',
            image: formData.image,
            createAuth: true,
            authMethod: 'magic_link'
          })
        });

        if (response.ok) {
          const newTech = await response.json();

          // Show success message
          if (newTech.authCreated) {
            alert(`✅ Technician created successfully!\n\n📧 A magic link has been sent to ${formData.email}`);
          } else {
            alert('✅ Technician created successfully!');
          }

          await fetchTechnicians(); // Refresh the list
        } else {
          const error = await response.json();
          alert(`Failed to create technician: ${error.error}`);
        }
      }
    } catch (error) {
      console.error('Error saving technician:', error);
      alert('Failed to save technician. Please try again.');
    }

    setFormData({ name: '', username: '', email: '', phone: '', franchiseeId: '', specialties: [], status: 'Active' as const, image: '' });
    setShowCreateForm(false);
  };

  const handleEdit = (tech: Tech) => {
    setEditingTech(tech);
    console.log('Editing tech:', tech, 'franchiseeId:', tech.franchiseeId);
    console.log('Available franchisees:', franchisees);
    setFormData({
      name: tech.name,
      username: tech.username,
      email: tech.email,
      phone: tech.phone,
      franchiseeId: tech.franchiseeId.toString(),
      specialties: tech.specialties,
      status: tech.status,
      image: tech.image,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this technician?')) {
      return;
    }

    try {
      const response = await fetch(`/api/technicians?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTechnicians(); // Refresh the list
        alert('✅ Technician deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete technician: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting technician:', error);
      alert('Failed to delete technician. Please try again.');
    }
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
                  onChange={(e) => setFormData(prev => ({ ...prev, franchiseeId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a franchisee</option>
                  {franchisees.map(franchisee => (
                    <option key={franchisee.id} value={franchisee.id}>
                      {franchisee.business_name || franchisee.name}
                    </option>
                  ))}
                </select>
              </div>

              <ImageUploader
                label="Technician Photo"
                currentImage={formData.image}
                onImageSelected={(imageDataUrl) => setFormData(prev => ({ ...prev, image: imageDataUrl }))}
                enableCrop={true}
                cropAspect={1}
              />

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
                    setFormData({ name: '', username: '', email: '', phone: '', franchiseeId: '', specialties: [], status: 'Active' as const, image: '' });
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">Loading technicians...</div>
                  </TableCell>
                </TableRow>
              ) : techs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">No technicians found. Click "Add Technician" to create one.</div>
                  </TableCell>
                </TableRow>
              ) : techs.map((tech) => (
                <TableRow
                  key={tech.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer"
                  onClick={() => {
                    setSelectedTech(tech);
                    setShowDetailModal(true);
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {tech.image ? (
                        <img
                          className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all object-cover"
                          src={tech.image}
                          alt={tech.name}
                          onClick={() => setSelectedImage({ url: tech.image, name: tech.name })}
                          title="Click to view larger"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            {tech.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
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
          setSelectedTech(null);
        }}
        type="technician"
        data={selectedTech}
        onEdit={(tech) => {
          handleEdit(tech);
        }}
        onSendMagicLink={(tech) => {
          sendMagicLink(tech);
        }}
        onViewAs={(tech) => {
          window.open('/tech/dashboard', '_blank');
        }}
      />
    </div>
  );
}