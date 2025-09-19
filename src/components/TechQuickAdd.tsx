'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase-client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Mail,
  Phone,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TechQuickAddProps {
  franchiseeId?: string;
  onTechAdded?: (tech: any) => void;
  className?: string;
}

interface InviteStatus {
  status: 'idle' | 'creating' | 'inviting' | 'completed' | 'error';
  message: string;
  techId?: string;
  setupUrl?: string;
}

export default function TechQuickAdd({ franchiseeId, onTechAdded, className = '' }: TechQuickAddProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [franchiseeInfo, setFranchiseeInfo] = useState<any>(null);
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>({
    status: 'idle',
    message: ''
  });
  const [autoInvite, setAutoInvite] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  // Fetch franchisee info on component mount
  useEffect(() => {
    const fetchFranchiseeInfo = async () => {
      if (!franchiseeId) {
        // Try to get from current user's profile
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('franchisee_id, franchisees!inner(*)')
              .eq('id', session.user.id)
              .single();

            if (profile?.franchisees) {
              setFranchiseeInfo(profile.franchisees);
            }
          }
        } catch (error) {
          console.error('Error fetching user franchisee info:', error);
        }
      } else {
        // Fetch specific franchisee info
        try {
          const { data } = await supabase
            .from('franchisees')
            .select('*')
            .eq('id', franchiseeId)
            .single();

          if (data) {
            setFranchiseeInfo(data);
          }
        } catch (error) {
          console.error('Error fetching franchisee info:', error);
        }
      }
    };

    fetchFranchiseeInfo();
  }, [franchiseeId, supabase]);

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
    setInviteStatus({ status: 'idle', message: '' });
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    if (!franchiseeInfo?.id) {
      toast({
        title: "Franchise Not Found",
        description: "Unable to determine franchise for tech assignment",
        variant: "destructive"
      });
      return;
    }

    try {
      // Step 1: Create technician
      setInviteStatus({
        status: 'creating',
        message: `Creating technician profile for ${formData.name}...`
      });

      const createResponse = await fetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          franchiseeId: franchiseeInfo.id,
          role: 'technician',
          image: `https://i.pravatar.cc/150?u=${formData.email}`,
          createAuth: false // We'll handle auth in the invitation step
        })
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        const errorMessage = error.details
          ? `${error.error}: ${error.details}`
          : error.error || 'Failed to create technician';
        throw new Error(errorMessage);
      }

      const newTech = await createResponse.json();

      // Step 2: Send invitation if auto-invite is enabled
      if (autoInvite) {
        setInviteStatus({
          status: 'inviting',
          message: `Sending setup invitation to ${formData.email}...`,
          techId: newTech.id
        });

        const inviteResponse = await fetch('/api/technicians/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            technicianId: newTech.id,
            sendEmail: true
          })
        });

        if (inviteResponse.ok) {
          const inviteResult = await inviteResponse.json();

          setInviteStatus({
            status: 'completed',
            message: `${formData.name} added successfully! Setup invitation sent to ${formData.email}`,
            techId: newTech.id,
            setupUrl: inviteResult.inviteData?.setupUrl
          });

          toast({
            title: "Technician Added & Invited",
            description: `${formData.name} has been added to your team and will receive a setup email at ${formData.email}`
          });
        } else {
          // Tech created but invitation failed
          setInviteStatus({
            status: 'completed',
            message: `${formData.name} added successfully, but invitation email failed. You can resend it later.`,
            techId: newTech.id
          });

          toast({
            title: "Technician Added",
            description: `${formData.name} has been added to your team. Manual invitation may be needed.`,
            variant: "destructive"
          });
        }
      } else {
        setInviteStatus({
          status: 'completed',
          message: `${formData.name} added successfully! No invitation sent.`,
          techId: newTech.id
        });

        toast({
          title: "Technician Added",
          description: `${formData.name} has been added to your team`
        });
      }

      // Call callback if provided
      if (onTechAdded) {
        onTechAdded(newTech);
      }

      // Auto-clear form after 3 seconds
      setTimeout(() => {
        resetForm();
      }, 3000);

    } catch (error) {
      console.error('Error in quick add:', error);
      setInviteStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to add technician'
      });

      toast({
        title: "Error Adding Technician",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    switch (inviteStatus.status) {
      case 'creating':
      case 'inviting':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusVariant = () => {
    switch (inviteStatus.status) {
      case 'completed':
        return 'default';
      case 'error':
        return 'destructive';
      case 'creating':
      case 'inviting':
        return 'default';
      default:
        return 'default';
    }
  };

  const isLoading = inviteStatus.status === 'creating' || inviteStatus.status === 'inviting';

  return (
    <Card className={`w-full max-w-lg ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Quick Add Technician
        </CardTitle>
        {franchiseeInfo && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4" />
            Adding to: <Badge variant="outline">{franchiseeInfo.business_name}</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleQuickAdd} className="space-y-4">
          {/* Status Alert */}
          {inviteStatus.status !== 'idle' && (
            <Alert variant={getStatusVariant()}>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <AlertDescription>{inviteStatus.message}</AlertDescription>
              </div>
            </Alert>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="tech-name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </Label>
            <Input
              id="tech-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., John Smith"
              disabled={isLoading}
              required
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="tech-email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </Label>
            <Input
              id="tech-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john@example.com"
              disabled={isLoading}
              required
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="tech-phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="tech-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(555) 123-4567"
              disabled={isLoading}
            />
          </div>

          {/* Auto-invite option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-invite"
              checked={autoInvite}
              onChange={(e) => setAutoInvite(e.target.checked)}
              disabled={isLoading}
              className="rounded"
            />
            <Label htmlFor="auto-invite" className="text-sm flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send setup invitation email automatically
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.email}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {inviteStatus.status === 'creating' ? 'Creating...' : 'Sending Invite...'}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Technician
                </>
              )}
            </Button>

            {inviteStatus.status === 'completed' && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Add Another
              </Button>
            )}
          </div>
        </form>

        {/* Success Actions */}
        {inviteStatus.status === 'completed' && inviteStatus.setupUrl && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800 mb-2">
              Setup link generated (for manual sharing if needed):
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(inviteStatus.setupUrl!);
                toast({
                  title: "Link Copied",
                  description: "Setup link copied to clipboard"
                });
              }}
              className="text-xs"
            >
              Copy Setup Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}