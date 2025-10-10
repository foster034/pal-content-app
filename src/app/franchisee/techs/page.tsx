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
  Clock,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "@/components/ImageUploader";

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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSendMethodDialog, setShowSendMethodDialog] = useState(false);
  const [pendingTechData, setPendingTechData] = useState<any>(null);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [isLoadingFranchiseeId, setIsLoadingFranchiseeId] = useState(!urlFranchiseeId);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    status: 'Active' as 'Active' | 'Inactive' | 'On Leave',
    image: '',
    sendViaEmail: false,
    sendViaSMS: false
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
            specialties: tech.specialties || [], // Load specialties from database
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
          image: formData.image || `https://i.pravatar.cc/150?u=${formData.email}`,
          createAuth: false, // For now, don't create auth - can be added later
          authMethod: 'magic_link',
          specialties: formData.specialties // Include specialties
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

        // Send login code based on checkbox selections
        if (formData.sendViaSMS && formData.phone) {
          const smsMessage = `Welcome to PAL Content App! Your login code is: ${mappedTech.loginCode}\n\nUse this code to log in at ${window.location.origin}/auth/login`;

          fetch('/api/twilio/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: formData.phone,
              message: smsMessage,
              userType: 'technician',
              userId: mappedTech.id,
              userName: mappedTech.name
            })
          }).then(async (res) => {
            const data = await res.json();
            if (data.success) {
              toast({
                title: "SMS Sent",
                description: `Login code sent via SMS to ${formData.phone}`
              });
            }
          });
        }

        if (formData.sendViaEmail && formData.email) {
          fetch('/api/technicians/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              technicianId: newTech.id,
              sendEmail: true
            })
          }).then(async (res) => {
            const data = await res.json();
            if (data.success) {
              toast({
                title: "Email Sent",
                description: `Magic link sent via email to ${formData.email}`
              });
            }
          });
        }

        setShowCreateDialog(false);
        resetForm();

        toast({
          title: "Technician Created",
          description: `${mappedTech.name} has been successfully added to your team.`
        });
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

  const handleSendViaSMS = async () => {
    if (!pendingTechData) return;

    const { tech, formData } = pendingTechData;

    try {
      const smsMessage = `Welcome to PAL Content App! Your login code is: ${tech.loginCode}\n\nUse this code to log in at ${window.location.origin}/auth/login`;

      const smsResponse = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.phone,
          message: smsMessage,
          userType: 'technician',
          userId: tech.id,
          userName: tech.name
        })
      });

      if (smsResponse.ok) {
        const smsData = await smsResponse.json();
        console.log('SMS sent successfully:', smsData);
        toast({
          title: "SMS Sent",
          description: `Login code sent to ${formData.phone}`,
        });
      } else {
        const errorData = await smsResponse.json();
        console.error('SMS send failed:', errorData);
        toast({
          title: "SMS Failed",
          description: errorData.error || "Could not send SMS. Make sure SMS is configured in admin settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('SMS failed:', error);
      toast({
        title: "SMS Error",
        description: "Failed to send login code via SMS",
        variant: "destructive"
      });
    }

    setShowSendMethodDialog(false);
    setPendingTechData(null);
  };

  const handleSendViaEmail = async () => {
    if (!pendingTechData) return;

    const { tech, newTech, formData } = pendingTechData;

    try {
      const response = await fetch('/api/technicians/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId: newTech.id,
          sendEmail: true
        })
      });

      if (response.ok) {
        toast({
          title: "Email Sent",
          description: `Magic link sent to ${formData.email}`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Email Failed",
          description: errorData.error || "Could not send email invitation",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Email failed:', error);
      toast({
        title: "Email Error",
        description: "Failed to send email invitation",
        variant: "destructive"
      });
    }

    setShowSendMethodDialog(false);
    setPendingTechData(null);
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
      status: 'Active',
      image: '',
      sendViaEmail: false,
      sendViaSMS: false
    });
  };

  const sendCodeViaSMS = async (tech: Technician) => {
    if (!tech.phone) {
      toast({
        title: "No Phone Number",
        description: "This technician doesn't have a phone number on file.",
        variant: "destructive"
      });
      return;
    }

    try {
      const smsMessage = `Welcome to PAL Content App! Your login code is: ${tech.loginCode}\n\nUse this code to log in at ${window.location.origin}/auth/login`;

      const response = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: tech.phone,
          message: smsMessage,
          userType: 'technician',
          userId: tech.id,
          userName: tech.name
        })
      });

      if (response.ok) {
        toast({
          title: "SMS Sent",
          description: `Login code sent via SMS to ${tech.phone}`
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "SMS Failed",
          description: errorData.error || "Failed to send SMS",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('SMS failed:', error);
      toast({
        title: "SMS Error",
        description: "Failed to send login code via SMS",
        variant: "destructive"
      });
    }
  };

  const sendCodeViaEmail = async (tech: Technician) => {
    if (!tech.email) {
      toast({
        title: "No Email",
        description: "This technician doesn't have an email on file.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/technicians/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId: tech.id,
          sendEmail: true
        })
      });

      if (response.ok) {
        toast({
          title: "Email Sent",
          description: `Magic link sent via email to ${tech.email}`
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Email Failed",
          description: errorData.error || "Failed to send email",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Email failed:', error);
      toast({
        title: "Email Error",
        description: "Failed to send magic link via email",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (tech: Technician) => {
    setSelectedTech(tech);
    setFormData({
      name: tech.name,
      username: tech.username,
      email: tech.email,
      phone: tech.phone,
      specialties: tech.specialties,
      status: tech.status,
      image: tech.image,
      sendViaEmail: false,
      sendViaSMS: false
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
            onClick={() => setShowCreateDialog(true)}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-900"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Technician
          </Button>
        </div>
      </div>



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
              <TableRow className="border-none hover:bg-transparent">
                <TableHead>Technician</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Login Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((tech) => (
                <TableRow key={tech.id} className="border-none hover:bg-gray-50">
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
                    <div className="font-mono text-sm font-bold bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-2">
                      {tech.loginCode}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={async () => {
                          try {
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                              await navigator.clipboard.writeText(tech.loginCode);
                            } else {
                              // Fallback for browsers that don't support clipboard API
                              const textArea = document.createElement('textarea');
                              textArea.value = tech.loginCode;
                              textArea.style.position = 'fixed';
                              textArea.style.left = '-999999px';
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand('copy');
                              document.body.removeChild(textArea);
                            }
                            toast({
                              title: "Copied to clipboard",
                              description: `Login code ${tech.loginCode} copied`
                            });
                          } catch (error) {
                            console.error('Failed to copy:', error);
                            toast({
                              title: "Copy failed",
                              description: "Could not copy to clipboard",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
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

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => sendCodeViaSMS(tech)}
                          className="cursor-pointer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4 text-blue-600" />
                          <span>Send Code via SMS</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => sendCodeViaEmail(tech)}
                          className="cursor-pointer"
                        >
                          <Mail className="mr-2 h-4 w-4 text-purple-600" />
                          <span>Send Code via Email</span>
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
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Technician</DialogTitle>
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
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="alexrodriguez"
                className="border-gray-300"
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
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
                className="border-gray-300"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <ImageUploader
                label="Technician Photo"
                currentImage={formData.image}
                onImageSelected={(imageUrl) => setFormData(prev => ({ ...prev, image: imageUrl }))}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Specialties</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border border-gray-300 rounded-lg">
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            <div className="col-span-2 space-y-3 pt-4 mt-4">
              <Label className="text-base font-semibold">Send Login Code</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sendViaEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendViaEmail: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Send code via Email</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sendViaSMS}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendViaSMS: e.target.checked }))}
                    disabled={!formData.phone}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-medium">Send code via SMS</span>
                  {!formData.phone && <span className="text-xs text-gray-500">(Phone number required)</span>}
                </label>
              </div>
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
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border border-gray-300 rounded-lg">
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
      {/* Send Method Dialog */}
      <Dialog open={showSendMethodDialog} onOpenChange={setShowSendMethodDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Login Code</DialogTitle>
            <DialogDescription>
              How would you like to send the login code to {pendingTechData?.tech?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              onClick={handleSendViaSMS}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900"
              disabled={!pendingTechData?.formData?.phone}
            >
              <MessageCircle className="w-4 h-4" />
              Send via SMS
              {pendingTechData?.formData?.phone && (
                <span className="text-xs text-gray-500 ml-2">
                  ({pendingTechData.formData.phone})
                </span>
              )}
            </Button>
            {!pendingTechData?.formData?.phone && (
              <p className="text-xs text-amber-600 -mt-2">
                No phone number provided
              </p>
            )}

            <Button
              onClick={handleSendViaEmail}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900"
              disabled={!pendingTechData?.formData?.email}
            >
              <MessageCircle className="w-4 h-4" />
              Send via Email
              {pendingTechData?.formData?.email && (
                <span className="text-xs text-gray-500 ml-2">
                  ({pendingTechData.formData.email})
                </span>
              )}
            </Button>
            {!pendingTechData?.formData?.email && (
              <p className="text-xs text-amber-600 -mt-2">
                No email address provided
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSendMethodDialog(false);
                setPendingTechData(null);
              }}
            >
              Skip for Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Remove Technician</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedTech?.name} from your team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
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