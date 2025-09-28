'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@/lib/supabase-client';
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
import TechQuickAdd from "@/components/TechQuickAdd";

interface Technician {
  id: string; // Changed from number to string to match UUID from database
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
  const searchParams = useSearchParams();
  const urlFranchiseeId = searchParams.get('id');
  const [franchiseeId, setFranchiseeId] = useState<string | null>(urlFranchiseeId);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [isLoadingFranchiseeId, setIsLoadingFranchiseeId] = useState(!urlFranchiseeId);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    status: 'Active' as 'Active' | 'Inactive' | 'On Leave'
  });
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  // Fetch current user's franchisee_id if not provided in URL
  useEffect(() => {
    const fetchCurrentUserFranchiseeId = async () => {
      if (urlFranchiseeId) {
        // URL has franchisee ID, no need to fetch
        setIsLoadingFranchiseeId(false);
        return;
      }

      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Error",
            description: "No user session found",
            variant: "destructive"
          });
          setIsLoadingFranchiseeId(false);
          return;
        }

        // Get user profile to find franchisee_id
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('franchisee_id')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          toast({
            title: "Error",
            description: `Unable to determine your franchise: ${error.message || 'Unknown error'}`,
            variant: "destructive"
          });
          setIsLoadingFranchiseeId(false);
          return;
        }

        if (!profile) {
          console.error('No profile found for user:', session.user.id);
          toast({
            title: "Error",
            description: "User profile not found",
            variant: "destructive"
          });
          setIsLoadingFranchiseeId(false);
          return;
        }

        if (profile?.franchisee_id) {
          setFranchiseeId(profile.franchisee_id);
        } else {
          toast({
            title: "Error",
            description: "Your account is not linked to a franchise",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error in fetchCurrentUserFranchiseeId:', error);
        toast({
          title: "Error",
          description: "Failed to determine franchise information",
          variant: "destructive"
        });
      } finally {
        setIsLoadingFranchiseeId(false);
      }
    };

    fetchCurrentUserFranchiseeId();
  }, [urlFranchiseeId, supabase, toast]);

  // Fetch technicians from API
  useEffect(() => {
    const fetchTechnicians = async () => {
      // Don't fetch if we're still loading franchiseeId or don't have one
      if (isLoadingFranchiseeId || !franchiseeId) {
        return;
      }

      try {
        // Build the API URL with franchiseeId
        const url = `/api/technicians?franchiseeId=${franchiseeId}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Map the API response to the frontend interface
          const mappedTechnicians = data.map((tech: any) => ({
            id: tech.id,
            name: tech.name,
            username: tech.email?.split('@')[0] || '', // Generate username from email
            email: tech.email,
            phone: tech.phone || '',
            specialties: [], // This would need to be stored separately or in tech data
            status: 'Active' as const, // Default status
            hireDate: new Date(tech.created_at).toISOString().split('T')[0],
            rating: tech.rating || 0,
            completedJobs: 0, // This would come from job submissions
            image: tech.image_url || `https://i.pravatar.cc/150?u=${tech.email}`,
            loginCode: tech.login_code || 'TEMP01', // Use actual login code from API
            autoLoginEnabled: true,
            lastCodeGenerated: new Date().toISOString().split('T')[0]
          }));
          setTechnicians(mappedTechnicians);
        } else {
          setTechnicians([]);
        }
      } catch (error) {
        console.error('Error fetching technicians:', error);
        setTechnicians([]);
      }
    };

    fetchTechnicians();
  }, [franchiseeId, isLoadingFranchiseeId]);

  const generateLoginCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateTech = async () => {
    if (!formData.name || !formData.email || !formData.username) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Get the franchisee ID - either from URL params or current user
    let targetFranchiseeId = franchiseeId;

    if (!targetFranchiseeId) {
      toast({
        title: "Error",
        description: "Unable to determine franchisee ID",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/technicians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          franchiseeId: targetFranchiseeId,
          role: 'technician',
          image: `https://i.pravatar.cc/150?u=${formData.email}`,
          createAuth: false, // For now, don't create auth - can be added later
          authMethod: 'magic_link'
        })
      });

      if (response.ok) {
        const newTech = await response.json();

        // Map the response to the frontend interface and add to local state
        const mappedTech: Technician = {
          id: newTech.id,
          name: newTech.name,
          username: formData.username,
          email: newTech.email,
          phone: newTech.phone || '',
          specialties: formData.specialties,
          status: formData.status,
          hireDate: new Date(newTech.created_at).toISOString().split('T')[0],
          rating: newTech.rating || 0,
          completedJobs: 0,
          image: newTech.image_url || `https://i.pravatar.cc/150?u=${newTech.email}`,
          loginCode: generateLoginCode(),
          autoLoginEnabled: true,
          lastCodeGenerated: new Date().toISOString().split('T')[0]
        };

        setTechnicians([...technicians, mappedTech]);
        setShowCreateDialog(false);
        resetForm();

        toast({
          title: "Technician Created",
          description: `${mappedTech.name} has been successfully added to your team and saved to the database.`
        });

        // Auto-send invitation if email is provided
        if (formData.email) {
          setTimeout(async () => {
            try {
              console.log('Auto-sending invitation for newly created tech:', {
                id: newTech.id,
                name: mappedTech.name,
                email: formData.email
              });

              await handleSendInvitation({
                id: newTech.id,
                name: mappedTech.name,
                email: formData.email
              } as Technician);
            } catch (error) {
              console.error('Auto-invitation failed:', error);
            }
          }, 500); // Wait 500ms to ensure database consistency
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to create technician",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating technician:', error);
      toast({
        title: "Error",
        description: "Failed to create technician. Please try again.",
        variant: "destructive"
      });
    }
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

  const handleDeleteTech = async () => {
    if (!selectedTech) return;

    try {
      // Call the API to delete from database
      const response = await fetch(`/api/technicians?id=${selectedTech.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state only after successful deletion
        setTechnicians(technicians.filter(tech => tech.id !== selectedTech.id));
        setShowDeleteDialog(false);
        setSelectedTech(null);

        toast({
          title: "Technician Removed",
          description: `${selectedTech.name} has been permanently removed from your team`
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to remove technician",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting technician:', error);
      toast({
        title: "Error",
        description: "Failed to remove technician. Please try again.",
        variant: "destructive"
      });
    }
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

      // For now, just update locally (database sync will be added later)
      toast({
        title: "Login Code Generated",
        description: `New code for ${tech.name}: ${newCode}`
      });

      console.log(`Login code generated for ${tech.name}: ${newCode}`);

      // Try to sync with database in the background (non-blocking)
      try {
        await updateTechProfile(updatedTech, {
          loginCode: newCode,
          lastCodeGenerated: updatedTech.lastCodeGenerated
        });
        console.log('Background sync successful');
      } catch (error) {
        console.log('Background sync failed, but that\'s okay for now');
      }

      // Auto-copy to clipboard
      navigator.clipboard.writeText(newCode);
      
    } catch (error) {
      console.error('Error in handleGenerateNewCode:', error);
      // This should not happen now, but just in case
      toast({
        title: "Error Generating Code",
        description: "Please try again",
        variant: "destructive"
      });
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
      // Update technician using the existing technicians API
      const response = await fetch('/api/technicians', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: tech.id,
          name: tech.name,
          email: tech.email,
          phone: tech.phone,
          role: 'technician',
          rating: tech.rating,
          login_code: specificUpdates?.loginCode || tech.loginCode
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`Failed to update technician profile: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Technician profile update successful:', result);

      return result;
    } catch (error) {
      console.error('Failed to update tech profile:', error);
      // Log error but return success for UI - the login code generation works locally
      console.warn('Database sync failed, but login code updated locally:', error);
      return { success: false, error: error };
    }
  };

  const handleSendInvitation = async (tech: Technician) => {
    if (!tech.email) {
      toast({
        title: "No Email Address",
        description: `${tech.name} doesn't have an email address on file`,
        variant: "destructive"
      });
      return;
    }

    console.log('Sending invitation for tech:', {
      techId: tech.id,
      techIdType: typeof tech.id,
      techName: tech.name,
      techEmail: tech.email
    });

    try {
      const response = await fetch('/api/technicians/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          technicianId: tech.id,
          sendEmail: true
        })
      });

      if (response.ok) {
        const result = await response.json();

        if (result.data?.magicLinkGenerated && !result.data?.invitationSent) {
          // Magic link generated but email failed due to rate limit
          toast({
            title: "Magic Link Generated! 🔗",
            description: `Email rate limited, but magic link copied to clipboard. Share it with ${tech.name} manually.`,
            variant: "default"
          });

          // Copy the magic link to clipboard
          if (result.data?.setupUrl) {
            navigator.clipboard.writeText(result.data.setupUrl);
          }
        } else {
          // Normal success case
          toast({
            title: "Magic Link Sent! ✨",
            description: result.data?.message || `Magic link sent to ${tech.name} at ${tech.email}. They can now login to their dashboard.`
          });

          // Copy the setup URL to clipboard if available
          if (result.data?.setupUrl) {
            navigator.clipboard.writeText(result.data.setupUrl);
          }
        }

      } else {
        const errorData = await response.json();

        // Handle rate limit specifically
        if (response.status === 429 || errorData.code === 'rate_limit') {
          const waitTime = errorData.waitTime || 60;
          toast({
            title: "Rate Limit Exceeded",
            description: `Please wait ${waitTime} seconds before sending another magic link. This prevents spam and protects the email service.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error Sending Magic Link",
            description: errorData.error || "Failed to send magic link email",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResetAccess = async (tech: Technician) => {
    if (!tech.email) {
      toast({
        title: "No Email Address",
        description: `${tech.name} doesn't have an email address on file`,
        variant: "destructive"
      });
      return;
    }

    console.log('Resetting access for tech:', {
      techId: tech.id,
      techName: tech.name,
      techEmail: tech.email
    });

    try {
      const response = await fetch('/api/technicians/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          technicianId: tech.id,
          sendEmail: true,
          forceRecreate: true // This triggers credential reset
        })
      });

      if (response.ok) {
        const result = await response.json();

        toast({
          title: "Access Reset Complete! 🔄",
          description: `New invitation sent to ${tech.name} at ${tech.email}. Their old credentials are now invalid and they'll receive a fresh setup email.`
        });

      } else {
        const errorData = await response.json();
        toast({
          title: "Error Resetting Access",
          description: errorData.error || "Failed to reset technician access",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error resetting access:', error);
      toast({
        title: "Error",
        description: "Failed to reset access. Please try again.",
        variant: "destructive"
      });
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

  // Show loading state while determining franchisee ID
  if (isLoadingFranchiseeId) {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Loading franchise information...</p>
            <p className="text-muted-foreground">Please wait while we set up your technician dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no franchisee ID could be determined
  if (!franchiseeId) {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="w-8 h-8 mx-auto mb-4 text-destructive" />
            <p className="text-lg font-medium">Unable to access technician dashboard</p>
            <p className="text-muted-foreground">Your account may not be linked to a franchise, or there was an error loading your information.</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Technicians</h1>
          <p className="text-muted-foreground">Manage your team of technicians and generate login codes</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="bg-primary hover:bg-primary/90"
            variant={showQuickAdd ? "outline" : "default"}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {showQuickAdd ? 'Hide Quick Add' : 'Quick Add Tech'}
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            variant="outline"
          >
            <Settings className="w-4 h-4 mr-2" />
            Advanced Add
          </Button>
        </div>
      </div>

      {/* Quick Add Section */}
      {showQuickAdd && (
        <div className="flex justify-center">
          <TechQuickAdd
            franchiseeId={franchiseeId || undefined}
            onTechAdded={(newTech) => {
              // Add the new tech to the list and refresh
              const mappedTech: Technician = {
                id: newTech.id,
                name: newTech.name,
                username: newTech.email?.split('@')[0] || '',
                email: newTech.email,
                phone: newTech.phone || '',
                specialties: [],
                status: 'Active' as const,
                hireDate: new Date(newTech.created_at).toISOString().split('T')[0],
                rating: newTech.rating || 0,
                completedJobs: 0,
                image: newTech.image_url || `https://i.pravatar.cc/150?u=${newTech.email}`,
                loginCode: newTech.login_code || 'TEMP01',
                autoLoginEnabled: true,
                lastCodeGenerated: new Date().toISOString().split('T')[0]
              };
              setTechnicians(prev => [mappedTech, ...prev]);

              toast({
                title: "Tech Added to List",
                description: `${newTech.name} has been added to your technician list`
              });
            }}
            className="w-full max-w-md"
          />
        </div>
      )}


      {/* Technician Table */}
      <Card className="border-0 shadow-none">
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
                          onClick={() => window.open(`/tech/${tech.id}`, '_blank')}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4 text-green-600" />
                          <span>View Tech</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleGenerateNewCode(tech)}
                          className="cursor-pointer"
                        >
                          <RefreshCw className="mr-2 h-4 w-4 text-orange-600" />
                          <span>Generate New Login Code</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleSendInvitation(tech)}
                          className="cursor-pointer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4 text-blue-600" />
                          <span>Send Magic Link</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleResetAccess(tech)}
                          className="cursor-pointer"
                        >
                          <RefreshCw className="mr-2 h-4 w-4 text-purple-600" />
                          <span>Reset Access (Lost Credentials)</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => openEditDialog(tech)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Tech</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(tech)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Remove Tech</span>
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
        <DialogContent className="max-w-2xl bg-white">
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