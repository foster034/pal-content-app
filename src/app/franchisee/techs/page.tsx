'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { 
  MoreHorizontal, 
  Plus, 
  Edit, 
  Trash2, 
  Key, 
  Copy, 
  RefreshCw,
  MessageCircle,
  Eye,
  Settings,
  UserPlus,
  Shield,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Technician {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  specialties: string[];
  status: 'Active' | 'Inactive' | 'On Leave';
  hireDate: string;
  rating: number;
  completedJobs: number;
  image: string;
  loginCode: string;
  autoLoginEnabled: boolean;
  lastCodeGenerated: string;
}

const mockTechnicians: Technician[] = [
  {
    id: 1,
    name: 'Alex Rodriguez',
    username: 'alexrodriguez',
    email: 'alex@popalock.com',
    phone: '(555) 111-2222',
    specialties: ['Automotive Locksmith', 'Roadside Assistance'],
    status: 'Active',
    hireDate: '2024-01-19',
    rating: 4.8,
    completedJobs: 156,
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg',
    loginCode: 'A3X9M2',
    autoLoginEnabled: true,
    lastCodeGenerated: '2024-01-15'
  },
  {
    id: 2,
    name: 'David Chen',
    username: 'davidchen',
    email: 'david@popalock.com',
    phone: '(555) 333-4444',
    specialties: ['Residential Locksmith', 'Key Programming'],
    status: 'On Leave',
    hireDate: '2024-02-29',
    rating: 4.6,
    completedJobs: 89,
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-04_s7fyto.jpg',
    loginCode: 'D7K2P9',
    autoLoginEnabled: false,
    lastCodeGenerated: '2024-01-10'
  }
];

const specialtyOptions = [
  'Residential Locksmith',
  'Commercial Locksmith', 
  'Automotive Locksmith',
  'Safe Services',
  'Key Programming',
  'Emergency Services',
  'Roadside Assistance',
  'Access Control'
];

export default function FranchiseeTechsPage() {
  const [technicians, setTechnicians] = useState<Technician[]>(mockTechnicians);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    status: 'Active' as 'Active' | 'Inactive' | 'On Leave'
  });
  const { toast } = useToast();

  const generateLoginCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateTech = () => {
    if (!formData.name || !formData.email || !formData.username) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newTech: Technician = {
      id: technicians.length + 1,
      ...formData,
      hireDate: new Date().toISOString().split('T')[0],
      rating: 0,
      completedJobs: 0,
      image: `https://i.pravatar.cc/150?u=${formData.username}`,
      loginCode: generateLoginCode(),
      autoLoginEnabled: true,
      lastCodeGenerated: new Date().toISOString().split('T')[0]
    };

    setTechnicians([...technicians, newTech]);
    setShowCreateDialog(false);
    resetForm();
    
    toast({
      title: "Technician Created",
      description: `${newTech.name} has been added to your team. Login code: ${newTech.loginCode}`
    });

    // Simulate API call to update tech profile
    updateTechProfile(newTech);
  };

  const handleEditTech = () => {
    if (!selectedTech || !formData.name || !formData.email || !formData.username) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const updatedTech = {
      ...selectedTech,
      ...formData
    };

    setTechnicians(technicians.map(tech => 
      tech.id === selectedTech.id ? updatedTech : tech
    ));

    setShowEditDialog(false);
    setSelectedTech(null);
    resetForm();

    toast({
      title: "Technician Updated",
      description: `${updatedTech.name}'s profile has been updated`
    });

    // Simulate API call to update tech profile
    updateTechProfile(updatedTech);
  };

  const handleDeleteTech = () => {
    if (!selectedTech) return;

    setTechnicians(technicians.filter(tech => tech.id !== selectedTech.id));
    setShowDeleteDialog(false);
    setSelectedTech(null);

    toast({
      title: "Technician Removed",
      description: `${selectedTech.name} has been removed from your team`
    });
  };

  const handleGenerateNewCode = async (tech: Technician) => {
    const newCode = generateLoginCode();
    const updatedTech = {
      ...tech,
      loginCode: newCode,
      lastCodeGenerated: new Date().toISOString().split('T')[0]
    };

    try {
      // Update locally first
      setTechnicians(technicians.map(t => 
        t.id === tech.id ? updatedTech : t
      ));

      // Sync the login code change specifically with tech profile
      await updateTechProfile(updatedTech, {
        loginCode: newCode,
        lastCodeGenerated: updatedTech.lastCodeGenerated
      });

      toast({
        title: "Login Code Updated",
        description: `New code for ${tech.name}: ${newCode} (synced with tech profile)`
      });

      // Auto-copy to clipboard
      navigator.clipboard.writeText(newCode);
      
    } catch (error) {
      // Still show success for local update, but warn about sync
      toast({
        title: "New Login Code Generated",
        description: `New code for ${tech.name}: ${newCode} (sync pending)`
      });
      
      // Auto-copy to clipboard anyway
      navigator.clipboard.writeText(newCode);
    }
  };

  const handleGenerateAllCodes = async () => {
    let successCount = 0;
    let failCount = 0;
    
    // Process each technician
    for (const tech of technicians) {
      const newCode = generateLoginCode();
      const updatedTech = {
        ...tech,
        loginCode: newCode,
        lastCodeGenerated: new Date().toISOString().split('T')[0]
      };

      try {
        // Update locally first
        setTechnicians(prev => prev.map(t => 
          t.id === tech.id ? updatedTech : t
        ));

        // Sync with tech profile system
        await updateTechProfile(updatedTech, {
          loginCode: newCode,
          lastCodeGenerated: updatedTech.lastCodeGenerated
        });
        
        successCount++;
      } catch (error) {
        console.error(`Failed to sync code for ${tech.name}:`, error);
        failCount++;
      }
    }

    // Show summary notification
    if (failCount === 0) {
      toast({
        title: "Bulk Codes Generated",
        description: `New login codes generated and synced for all ${successCount} technicians`
      });
    } else if (successCount === 0) {
      toast({
        title: "Sync Failed",
        description: `Failed to sync codes for all technicians. Codes updated locally.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Partially Synced",
        description: `${successCount} codes synced successfully, ${failCount} failed. Check individual tech profiles.`,
        variant: "destructive"
      });
    }
  };

  const updateTechProfile = async (tech: Technician, specificUpdates?: any) => {
    try {
      // Real API call to sync with tech profile system
      const response = await fetch('/api/tech-profile/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          techId: tech.id,
          updates: specificUpdates || {
            name: tech.name,
            username: tech.username,
            email: tech.email,
            phone: tech.phone,
            specialties: tech.specialties,
            status: tech.status,
            loginCode: tech.loginCode,
            autoLoginEnabled: tech.autoLoginEnabled
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync tech profile');
      }

      const result = await response.json();
      console.log('Tech profile sync successful:', result);
      
      return result;
    } catch (error) {
      console.error('Failed to update tech profile:', error);
      toast({
        title: "Sync Warning",
        description: "Changes saved locally but may not be synced with tech profile. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      specialties: [],
      status: 'Active'
    });
  };

  const openEditDialog = (tech: Technician) => {
    setSelectedTech(tech);
    setFormData({
      name: tech.name,
      username: tech.username,
      email: tech.email,
      phone: tech.phone,
      specialties: tech.specialties,
      status: tech.status
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (tech: Technician) => {
    setSelectedTech(tech);
    setShowDeleteDialog(true);
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        specialties: prev.specialties.filter(s => s !== specialty)
      }));
    }
  };

  const getStatusVariant = (status: string) => {
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
    <div className="space-y-6 bg-white min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Technicians</h1>
          <p className="text-muted-foreground">Manage your team of technicians and generate login codes</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Technician
        </Button>
      </div>


      {/* Technician Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Technician Team</CardTitle>
          <CardDescription>
            Manage and coordinate with your skilled locksmith technicians.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Technician</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Login Code</TableHead>
                <TableHead>Tech Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={tech.image} 
                        alt={tech.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{tech.name}</div>
                        <div className="text-sm text-muted-foreground">@{tech.username}</div>
                        <div className="text-xs text-muted-foreground">Hired {tech.hireDate}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{tech.email}</div>
                      <div className="text-muted-foreground">{tech.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tech.specialties.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {tech.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs">
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
                  <TableCell>
                    <div className="font-mono text-sm font-bold bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-2">
                      {tech.loginCode}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(tech.loginCode);
                          toast({
                            title: "Copied to clipboard",
                            description: `Login code ${tech.loginCode} copied`
                          });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {tech.autoLoginEnabled ? (
                        <span className="text-green-600">Auto-login enabled</span>
                      ) : (
                        <span className="text-gray-500">Manual login only</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link 
                      href="/tech/login"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        🔐 Tech Login
                      </Button>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 bg-white border shadow-lg">
                        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          onClick={() => window.open('/tech-hub', '_blank')}
                          className="cursor-pointer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4 text-indigo-600" />
                          <span>View in Tech Hub</span>
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
                          <span>Tech Profile Settings</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Credential Management</DropdownMenuLabel>
                        
                        <DropdownMenuItem
                          onClick={() => handleGenerateNewCode(tech)}
                          className="cursor-pointer"
                        >
                          <RefreshCw className="mr-2 h-4 w-4 text-orange-600" />
                          <span>Generate New Login Code</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(`Login Code for ${tech.name}: ${tech.loginCode}`);
                            toast({
                              title: "Credentials copied",
                              description: `${tech.name}'s login information copied to clipboard`
                            });
                          }}
                          className="cursor-pointer"
                        >
                          <Copy className="mr-2 h-4 w-4 text-blue-600" />
                          <span>Copy Login Details</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          onClick={() => openEditDialog(tech)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Details</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(tech)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Remove Technician</span>
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

      {/* Create Technician Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Technician</DialogTitle>
            <DialogDescription>
              Create a new technician profile. A login code will be automatically generated.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Alex Rodriguez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="alexrodriguez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="alex@popalock.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Specialties</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border rounded-lg">
                {specialtyOptions.map(specialty => (
                  <label key={specialty} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty)}
                      onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTech}>
              Create Technician
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Technician Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Technician</DialogTitle>
            <DialogDescription>
              Update {selectedTech?.name}'s profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username *</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Specialties</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border rounded-lg">
                {specialtyOptions.map(specialty => (
                  <label key={specialty} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty)}
                      onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTech}>
              Update Technician
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Technician</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedTech?.name} from your team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTech}>
              Remove Technician
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}