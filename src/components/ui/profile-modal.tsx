"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, User, Mail, Phone, MapPin, Building, Calendar, Loader2 } from "lucide-react";
import BlurFade from "@/components/ui/blur-fade";
import { createClientComponentClient } from '@/lib/supabase-client';
import { useToast } from "@/hooks/use-toast";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  joinDate: string;
  bio: string;
  avatar: string;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "Admin",
    lastName: "User",
    email: "admin@popalock.com",
    phone: "+1 (555) 123-4567",
    role: "System Administrator",
    department: "IT Operations",
    location: "Dallas, TX",
    joinDate: "2023-01-15",
    bio: "Experienced system administrator managing the Pop-A-Lock franchise network. Passionate about technology and helping franchisees succeed.",
    avatar: ""
  });

  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }

      setUploading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `profile-avatars/${fileName}`;

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update local state with the uploaded URL
        setProfileData(prev => ({ ...prev, avatar: publicUrl }));

        // Update profile in database immediately
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar_url: publicUrl })
        });

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        toast({
          title: "Profile photo updated",
          description: "Your profile photo has been uploaded successfully"
        });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload profile photo. Please try again.",
          variant: "destructive"
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      // Create a synthetic event to reuse handleFileUpload logic
      const syntheticEvent = {
        target: {
          files: [file]
        }
      } as React.ChangeEvent<HTMLInputElement>;
      await handleFileUpload(syntheticEvent);
    }
  };

  const handleSave = async () => {
    setSavingProfile(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
          phone: profileData.phone,
          bio: profileData.bio,
          avatar_url: profileData.avatar // Avatar URL (from Supabase storage)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl"
      >
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Profile Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account information and preferences. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6 relative z-10">
          {/* Profile Picture Section */}
          <BlurFade delay={0.1}>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <Avatar className="relative h-24 w-24 border-2 border-primary/20 shadow-lg">
                  <AvatarImage src={profileData.avatar} alt="Profile" className="object-cover w-full h-full rounded-full" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-lg font-semibold">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 w-full max-w-md transition-all duration-300 ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center space-y-2">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 mx-auto text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  )}
                  <p className="text-sm font-medium">
                    {uploading ? "Uploading to storage..." : "Drop image here or click to upload"}
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB - saves to Supabase storage</p>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BlurFade delay={0.2}>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="bg-muted/50 border-border/50 focus:bg-background/80 transition-all"
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.25}>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="bg-muted/50 border-border/50 focus:bg-background/80 transition-all"
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.3}>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-muted/50 border-border/50 focus:bg-background/80 transition-all"
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.35}>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-muted/50 border-border/50 focus:bg-background/80 transition-all"
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.4}>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Role
                </Label>
                <Select value={profileData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="System Administrator">System Administrator</SelectItem>
                    <SelectItem value="Franchise Manager">Franchise Manager</SelectItem>
                    <SelectItem value="Operations Manager">Operations Manager</SelectItem>
                    <SelectItem value="Support Specialist">Support Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </BlurFade>

            <BlurFade delay={0.45}>
              <div className="space-y-2">
                <Label htmlFor="department" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Department
                </Label>
                <Input
                  id="department"
                  value={profileData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="bg-muted/50 border-border/50 focus:bg-background/80 transition-all"
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.5}>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="bg-muted/50 border-border/50 focus:bg-background/80 transition-all"
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.55}>
              <div className="space-y-2">
                <Label htmlFor="joinDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Join Date
                </Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={profileData.joinDate}
                  onChange={(e) => handleInputChange("joinDate", e.target.value)}
                  className="bg-muted/50 border-border/50 focus:bg-background/80 transition-all"
                />
              </div>
            </BlurFade>
          </div>

          {/* Bio Section */}
          <BlurFade delay={0.6}>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-24 bg-muted/50 border-border/50 focus:bg-background/80 transition-all resize-none"
              />
            </div>
          </BlurFade>
        </div>

        <DialogFooter className="gap-3">
          <BlurFade delay={0.7}>
            <Button variant="outline" onClick={onClose} className="px-6" disabled={savingProfile || uploading}>
              Cancel
            </Button>
          </BlurFade>
          <BlurFade delay={0.75}>
            <Button
              onClick={handleSave}
              disabled={savingProfile || uploading}
              className="px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </BlurFade>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}