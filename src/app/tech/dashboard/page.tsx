'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BlurFade from "@/components/ui/blur-fade";
import NumberTicker from "@/components/ui/number-ticker";
import Meteors from "@/components/ui/meteors";
import { Plus, Camera, Upload, CheckCircle, Clock, XCircle, TrendingUp, Star, X } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const photoStats = [
  {
    title: "Photos Submitted",
    value: 18,
    change: "+3 this week",
    trend: "up",
    icon: Camera,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Approved Photos", 
    value: 15,
    change: "+2 this week",
    trend: "up",
    icon: CheckCircle,
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Pending Review",
    value: 2,
    change: "1 new today",
    trend: "up",
    icon: Clock,
    color: "from-amber-500 to-orange-500"
  },
  {
    title: "Approval Rate",
    value: 83,
    change: "+5% this month",
    trend: "up", 
    icon: TrendingUp,
    color: "from-purple-500 to-pink-500"
  }
];

const recentPhotos = [
  {
    id: 1,
    photoUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    jobType: 'Commercial',
    description: 'Office building master key system installation',
    date: '2024-09-08',
    status: 'approved'
  },
  {
    id: 2,
    photoUrl: 'https://images.unsplash.com/photo-1544860565-d4c4d73cb237?w=400&h=300&fit=crop',
    jobType: 'Residential',
    description: 'Smart lock installation and setup',
    date: '2024-09-07',
    status: 'approved'
  },
  {
    id: 3,
    photoUrl: 'https://images.unsplash.com/photo-1571974599782-87624638275e?w=400&h=300&fit=crop',
    jobType: 'Automotive',
    description: 'Car lockout service - key extraction',
    date: '2024-09-06',
    status: 'pending'
  },
  {
    id: 4,
    photoUrl: 'https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=400&h=300&fit=crop',
    jobType: 'Roadside',
    description: 'Emergency roadside assistance',
    date: '2024-09-05',
    status: 'approved'
  }
];

// Service categories and their dependent services
const serviceCategories = {
  'Residential': [
    'Home Lockout',
    'Lock Installation', 
    'Rekey Service',
    'Smart Lock Installation',
    'Security Upgrade',
    'Mailbox Lock Service',
    'Safe Service',
    'Window Lock Repair'
  ],
  'Automotive': [
    'Car Lockout',
    'Duplicate Key Service',
    'Key Programming',
    'Ignition Repair',
    'Transponder Key',
    'Remote Programming',
    'Broken Key Extraction',
    'Motorcycle Key Service'
  ],
  'Commercial': [
    'Office Lockout',
    'Master Key System',
    'Access Control Installation',
    'High Security Locks',
    'Panic Hardware',
    'File Cabinet Service',
    'Keypad Installation',
    'Business Rekey'
  ],
  'Roadside': [
    'Emergency Lockout',
    'Mobile Key Service',
    '24/7 Assistance',
    'Trunk Lockout',
    'Motorcycle Assistance',
    'Fleet Vehicle Service',
    'Emergency Key Making',
    'Mobile Locksmith'
  ]
};

interface MarketingContent {
  id: number;
  category: 'Residential' | 'Automotive' | 'Commercial' | 'Roadside';
  service: string;
  location: string;
  description: string;
  photos: string[];
  submittedBy: string;
  submittedAt: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Published';
  customerPermission: boolean;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  jobDuration?: number;
  customerSatisfaction?: number;
  customerQuote?: string;
  jobComplexity?: 'Simple' | 'Standard' | 'Complex' | 'Emergency';
  photoTypes?: { [photoId: string]: 'before' | 'after' | 'process' | 'result' | 'tools' };
  // Client contact information for outreach
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientConsentToContact?: boolean;
  clientConsentToShare?: boolean;
  preferredContactMethod?: 'phone' | 'email' | 'sms';
}

export default function TechDashboard() {
  const [showContentForm, setShowContentForm] = useState(false);
  const [socialMediaFormat, setSocialMediaFormat] = useState<'instagram' | 'facebook' | 'auto'>('auto');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [vinLoading, setVinLoading] = useState(false);
  const [vin, setVin] = useState('');
  const [showVinScanner, setShowVinScanner] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showPhotoCamera, setShowPhotoCamera] = useState(false);
  const [photoCameraStream, setPhotoCameraStream] = useState<MediaStream | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showCameraGuide, setShowCameraGuide] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'unknown'>('unknown');
  const [contentForm, setContentForm] = useState({
    category: '' as MarketingContent['category'] | '',
    service: '',
    location: '',
    description: '',
    photos: [] as string[],
    customerPermission: false,
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    jobDuration: undefined as number | undefined,
    customerSatisfaction: undefined as number | undefined,
    customerQuote: '',
    jobComplexity: '' as MarketingContent['jobComplexity'] | '',
    photoTypes: {} as { [photoId: string]: 'before' | 'after' | 'process' | 'result' | 'tools' },
    // Client contact information
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientConsentToContact: false,
    clientConsentToShare: false,
    preferredContactMethod: 'phone' as 'phone' | 'email' | 'sms'
  });

  // Detect device type
  useEffect(() => {
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/Android/.test(userAgent)) {
      setDeviceType('android');
    }
  }, []);

  // Cleanup camera streams on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (photoCameraStream) {
        photoCameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream, photoCameraStream]);

  // Auto-detect location when form opens
  useEffect(() => {
    if (showContentForm && !contentForm.location) {
      getCurrentLocation();
    }
  }, [showContentForm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-amber-600 bg-amber-100';
      case 'denied': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getJobTypeVariant = (jobType: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (jobType) {
      case 'Commercial': return 'default';
      case 'Residential': return 'secondary';
      case 'Automotive': return 'destructive';
      case 'Roadside': return 'outline';
      default: return 'outline';
    }
  };

  // Helper functions for form
  const getAvailableServices = () => {
    if (!contentForm.category) return [];
    return serviceCategories[contentForm.category] || [];
  };

  const handleSubmitContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contentForm.category || !contentForm.service) {
      alert('Please select both category and service');
      return;
    }

    const newContent: MarketingContent = {
      id: Date.now(),
      category: contentForm.category as MarketingContent['category'],
      service: contentForm.service,
      location: contentForm.location,
      description: contentForm.description,
      photos: contentForm.photos,
      submittedBy: 'Alex Rodriguez',
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
      customerPermission: contentForm.customerPermission,
      vehicleYear: contentForm.vehicleYear || undefined,
      vehicleMake: contentForm.vehicleMake || undefined,
      vehicleModel: contentForm.vehicleModel || undefined,
      jobDuration: contentForm.jobDuration,
      customerSatisfaction: contentForm.customerSatisfaction,
      customerQuote: contentForm.customerQuote || undefined,
      jobComplexity: contentForm.jobComplexity || undefined,
      photoTypes: contentForm.photoTypes,
      // Include client contact information
      clientName: contentForm.clientName || undefined,
      clientPhone: contentForm.clientPhone || undefined,
      clientEmail: contentForm.clientEmail || undefined,
      clientConsentToContact: contentForm.clientConsentToContact,
      clientConsentToShare: contentForm.clientConsentToShare,
      preferredContactMethod: contentForm.preferredContactMethod
    };

    // Record consent for audit trail
    if (contentForm.clientName && (contentForm.clientConsentToContact || contentForm.clientConsentToShare)) {
      try {
        await fetch('/api/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: contentForm.clientName,
            clientPhone: contentForm.clientPhone,
            clientEmail: contentForm.clientEmail,
            consentToContact: contentForm.clientConsentToContact,
            consentToShare: contentForm.clientConsentToShare,
            jobId: newContent.id.toString(),
            franchiseeId: 1 // Replace with actual franchisee ID
          })
        });
      } catch (error) {
        console.error('Error recording consent:', error);
      }
    }

    alert('Content submitted successfully!');
    
    setContentForm({
      category: '',
      service: '',
      location: '',
      description: '',
      photos: [],
      customerPermission: false,
      vehicleYear: '',
      vehicleMake: '',
      vehicleModel: '',
      jobDuration: undefined,
      customerSatisfaction: undefined,
      customerQuote: '',
      jobComplexity: '',
      photoTypes: {},
      // Reset client contact fields
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientConsentToContact: false,
      clientConsentToShare: false,
      preferredContactMethod: 'phone'
    });
    setVin('');
    setShowContentForm(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const originalWidth = img.width;
            const originalHeight = img.height;
            const originalAspectRatio = originalWidth / originalHeight;
            
            let targetWidth: number, targetHeight: number;
            
            switch (socialMediaFormat) {
              case 'instagram':
                targetWidth = targetHeight = 1080;
                break;
              case 'facebook':
                targetWidth = 1200;
                targetHeight = 630;
                break;
              case 'auto':
              default:
                if (originalAspectRatio >= 1.5) {
                  targetWidth = 1200;
                  targetHeight = 630;
                } else if (originalAspectRatio >= 1.1) {
                  targetWidth = 1200;
                  targetHeight = 630;
                } else if (originalAspectRatio >= 0.9) {
                  targetWidth = targetHeight = 1080;
                } else if (originalAspectRatio >= 0.6) {
                  targetWidth = targetHeight = 1080;
                } else {
                  targetWidth = targetHeight = 1080;
                }
                break;
            }
            
            const targetAspectRatio = targetWidth / targetHeight;
            
            let sourceX = 0, sourceY = 0, sourceWidth = originalWidth, sourceHeight = originalHeight;
            let canvasWidth = targetWidth, canvasHeight = targetHeight;
            
            if (originalAspectRatio > targetAspectRatio) {
              sourceWidth = originalHeight * targetAspectRatio;
              sourceX = (originalWidth - sourceWidth) / 2;
            } else if (originalAspectRatio < targetAspectRatio) {
              sourceHeight = originalWidth / targetAspectRatio;
              sourceY = (originalHeight - sourceHeight) / 4;
            }

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(
              img,
              sourceX, sourceY, sourceWidth, sourceHeight,
              0, 0, canvasWidth, canvasHeight
            );
            
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.90);
            
            setContentForm(prev => ({
              ...prev,
              photos: [...prev.photos, optimizedDataUrl]
            }));
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const startPhotoCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 }
        }
      });
      
      setPhotoCameraStream(stream);
      setShowPhotoCamera(true);
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please check permissions and try again.');
    }
  };

  const stopPhotoCamera = () => {
    if (photoCameraStream) {
      photoCameraStream.getTracks().forEach(track => track.stop());
      setPhotoCameraStream(null);
    }
    setShowPhotoCamera(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById('photoCameraVideo') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (video && ctx) {
      const originalWidth = video.videoWidth;
      const originalHeight = video.videoHeight;
      const originalAspectRatio = originalWidth / originalHeight;
      
      let targetWidth: number, targetHeight: number;
      
      switch (socialMediaFormat) {
        case 'instagram':
          targetWidth = targetHeight = 1080;
          break;
        case 'facebook':
          targetWidth = 1200;
          targetHeight = 630;
          break;
        case 'auto':
        default:
          if (originalAspectRatio >= 1.5) {
            targetWidth = 1200;
            targetHeight = 630;
          } else if (originalAspectRatio >= 1.1) {
            targetWidth = 1200;
            targetHeight = 630;
          } else if (originalAspectRatio >= 0.9) {
            targetWidth = targetHeight = 1080;
          } else if (originalAspectRatio >= 0.6) {
            targetWidth = targetHeight = 1080;
          } else {
            targetWidth = targetHeight = 1080;
          }
          break;
      }
      
      const targetAspectRatio = targetWidth / targetHeight;
      
      let sourceX = 0, sourceY = 0, sourceWidth = originalWidth, sourceHeight = originalHeight;
      
      if (originalAspectRatio > targetAspectRatio) {
        sourceWidth = originalHeight * targetAspectRatio;
        sourceX = (originalWidth - sourceWidth) / 2;
      } else if (originalAspectRatio < targetAspectRatio) {
        sourceHeight = originalWidth / targetAspectRatio;
        sourceY = (originalHeight - sourceHeight) / 4;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, targetWidth, targetHeight
      );
      
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.90);
      
      setContentForm(prev => ({
        ...prev,
        photos: [...prev.photos, optimizedDataUrl]
      }));
      
      stopPhotoCamera();
    }
  };

  const handleCameraCapture = () => {
    startPhotoCamera();
  };

  const removePhoto = (index: number) => {
    setContentForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        
        if (response.ok) {
          const data = await response.json();
          const addressParts = [];
          
          if (data.locality) addressParts.push(data.locality);
          if (data.city) addressParts.push(data.city);
          if (data.principalSubdivisionCode) addressParts.push(data.principalSubdivisionCode);
          
          const address = addressParts.length > 0 ? addressParts.join(', ') : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          setContentForm(prev => ({
            ...prev,
            location: address
          }));
        } else {
          setContentForm(prev => ({
            ...prev,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
        }
      } catch (geocodeError) {
        setContentForm(prev => ({
          ...prev,
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        }));
      }
    } catch (error: any) {
      let errorMessage = 'Unable to get your location. ';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Please enable location access in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage += 'The request to get your location timed out.';
          break;
        default:
          errorMessage += 'An unknown error occurred.';
          break;
      }
      
      alert(errorMessage);
    } finally {
      setLocationLoading(false);
    }
  };

  const decodeVIN = async (vinCode: string) => {
    if (!vinCode || vinCode.length !== 17) {
      alert('Please enter a valid 17-character VIN');
      return;
    }

    setVinLoading(true);
    
    try {
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vinCode}?format=json`
      );
      
      if (response.ok) {
        const data = await response.json();
        const results = data.Results;
        
        const year = results.find((item: any) => item.Variable === 'Model Year')?.Value;
        const make = results.find((item: any) => item.Variable === 'Make')?.Value;
        const model = results.find((item: any) => item.Variable === 'Model')?.Value;
        
        if (year && make && model) {
          setContentForm(prev => ({
            ...prev,
            vehicleYear: year,
            vehicleMake: make,
            vehicleModel: model
          }));
          
          alert(`Vehicle decoded successfully!\n${year} ${make} ${model}`);
        } else {
          alert('Could not decode vehicle information from VIN. Please enter manually.');
        }
      } else {
        throw new Error('Failed to decode VIN');
      }
    } catch (error) {
      console.error('VIN decode error:', error);
      alert('Unable to decode VIN. Please check the VIN and try again, or enter vehicle information manually.');
    } finally {
      setVinLoading(false);
    }
  };

  const generateAISummary = async () => {
    if (!contentForm.service || !contentForm.category) {
      alert('Please select service category and type first');
      return;
    }

    setAiGenerating(true);
    
    try {
      const context = {
        category: contentForm.category,
        service: contentForm.service,
        location: contentForm.location,
        description: contentForm.description,
        jobComplexity: contentForm.jobComplexity,
        customerSatisfaction: contentForm.customerSatisfaction,
        customerQuote: contentForm.customerQuote,
        jobDuration: contentForm.jobDuration,
        vehicle: contentForm.vehicleYear && contentForm.vehicleMake && contentForm.vehicleModel ? 
          `${contentForm.vehicleYear} ${contentForm.vehicleMake} ${contentForm.vehicleModel}` : null,
        techName: 'Alex Rodriguez',
        photoCount: contentForm.photos.length
      };

      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setContentForm(prev => ({
        ...prev,
        description: data.summary
      }));

    } catch (error) {
      console.error('AI generation error:', error);
      alert('Unable to generate summary with AI. Please try again or write manually.');
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/20 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />
      
      {/* Header */}
      <BlurFade delay={0.1}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your job photos and marketing content submissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={() => setShowContentForm(true)}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Submit Content
            </Button>
          </div>
        </div>
      </BlurFade>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {photoStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <BlurFade key={stat.title} delay={0.2 + index * 0.1}>
              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm group">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500" 
                     style={{backgroundImage: `linear-gradient(135deg, ${stat.color.split(' ')[1]}, ${stat.color.split(' ')[3]})`}} />
                <Meteors number={5} />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full bg-gradient-to-br ${stat.color} opacity-80`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {stat.title === "Approval Rate" ? (
                      <>
                        <NumberTicker 
                          value={stat.value} 
                          delay={0.3 + index * 0.1}
                          className="text-foreground"
                        />%
                      </>
                    ) : (
                      <NumberTicker 
                        value={stat.value} 
                        delay={0.3 + index * 0.1}
                        className="text-foreground"
                      />
                    )}
                  </div>
                  <div className="flex items-center">
                    <Badge 
                      variant={stat.trend === "up" ? "secondary" : "destructive"} 
                      className="text-xs"
                    >
                      <TrendingUp className={`h-3 w-3 mr-1 ${stat.trend === "down" ? "rotate-180" : ""}`} />
                      {stat.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          );
        })}
      </div>

      {/* Recent Photos and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <BlurFade delay={0.6} className="xl:col-span-2">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
            <CardHeader className="relative">
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                Recent Photos
              </CardTitle>
              <CardDescription>
                Your latest photo submissions and their status
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                {recentPhotos.map((photo, index) => (
                  <div key={photo.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-background/50 to-background/20 backdrop-blur-sm rounded-lg border border-border/20">
                    <div className="w-16 h-12 relative rounded overflow-hidden shrink-0">
                      <img
                        src={photo.photoUrl}
                        alt={photo.description}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getJobTypeVariant(photo.jobType)} className="text-xs">
                          {photo.jobType}
                        </Badge>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(photo.status)}`}>
                          {photo.status === 'approved' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                          {photo.status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                          {photo.status === 'denied' && <XCircle className="w-3 h-3 inline mr-1" />}
                          {photo.status.charAt(0).toUpperCase() + photo.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate mb-1">
                        {photo.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {photo.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border/20">
                <Link href="/tech/photos">
                  <Button variant="outline" size="sm" className="w-full bg-gradient-to-r from-background/80 to-background/40 backdrop-blur-sm border-border/40">
                    View All Photos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        <BlurFade delay={0.7}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
            <CardHeader className="relative">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-3">
                <Button 
                  onClick={() => setShowContentForm(true)}
                  className="w-full justify-start bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit New Content
                </Button>
                <Link href="/tech/photos">
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="h-4 w-4 mr-2" />
                    Manage Photos
                  </Button>
                </Link>
                <Link href="/tech/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                </Link>
              </div>
              
              <div className="mt-6 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-200/20">
                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">📸 Photo Tips</h4>
                <ul className="text-xs text-amber-600/80 dark:text-amber-400/80 space-y-1">
                  <li>• Take clear, well-lit photos</li>
                  <li>• Show your work in progress</li>
                  <li>• Include before/after shots</li>
                  <li>• Capture professional results</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </BlurFade>
      </div>

      {/* Submit Content Modal */}
      <Dialog open={showContentForm} onOpenChange={setShowContentForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-950 border-0 shadow-xl">
          <div className="overflow-y-auto max-h-[calc(90vh-2rem)]">
            <DialogHeader className="sticky top-0 bg-white dark:bg-gray-950 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    Submit Content
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 max-w-lg">
                    Share photos and details of your completed work for marketing review
                  </DialogDescription>
                </div>
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </DialogHeader>
            
            <div className="px-6 pb-6">
              <form onSubmit={handleSubmitContent} className="space-y-8 pt-6">
                {/* Service Information */}
                <div className="space-y-6">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Service Details</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Select the type of work you completed</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category *</Label>
                        <select
                          value={contentForm.category}
                          onChange={(e) => {
                            setContentForm(prev => ({ ...prev, category: e.target.value as MarketingContent['category'], service: '' }));
                          }}
                          className="w-full h-11 border border-gray-200 dark:border-gray-700 rounded-lg px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Choose category</option>
                          <option value="Residential">Residential</option>
                          <option value="Automotive">Automotive</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Roadside">Roadside</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Type *</Label>
                        <select
                          value={contentForm.service}
                          onChange={(e) => setContentForm(prev => ({ ...prev, service: e.target.value }))}
                          className="w-full h-11 border border-gray-200 dark:border-gray-700 rounded-lg px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                          disabled={!contentForm.category}
                        >
                          <option value="">{!contentForm.category ? 'Select category first' : 'Choose service'}</option>
                          {getAvailableServices().map(service => (
                            <option key={service} value={service}>{service}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
            
                  {/* Location */}
                  <div>
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Job Location</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Where did you complete this service?</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address *</Label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={contentForm.location}
                          onChange={(e) => setContentForm(prev => ({ ...prev, location: e.target.value }))}
                          className="h-11 pr-20 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter job location"
                          required
                        />
                        <Button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={locationLoading}
                          className="absolute right-1 top-1 h-9 px-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-medium transition-colors"
                          title="Auto-detect location"
                        >
                          {locationLoading ? (
                            <span className="animate-spin text-sm">⏳</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>GPS</span>
                            </div>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Use GPS button to auto-detect your current location
                      </p>
                    </div>
                  </div>
                </div>
            
            {/* Client Contact Information */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-1">👤 Client Contact Information</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-4">
                Capture client details to enable follow-up reviews and customer outreach
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Client Name</Label>
                    <Input
                      type="text"
                      value={contentForm.clientName}
                      onChange={(e) => setContentForm(prev => ({ ...prev, clientName: e.target.value }))}
                      className="border-emerald-200 dark:border-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter client's full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Phone Number</Label>
                    <Input
                      type="tel"
                      value={contentForm.clientPhone}
                      onChange={(e) => setContentForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                      className="border-emerald-200 dark:border-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Email Address</Label>
                  <Input
                    type="email"
                    value={contentForm.clientEmail}
                    onChange={(e) => setContentForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className="border-emerald-200 dark:border-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="client@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Preferred Contact Method</Label>
                  <select
                    value={contentForm.preferredContactMethod}
                    onChange={(e) => setContentForm(prev => ({ ...prev, preferredContactMethod: e.target.value as 'phone' | 'email' | 'sms' }))}
                    className="w-full h-11 border border-emerald-200 dark:border-emerald-700 rounded-lg px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="phone">Phone Call</option>
                    <option value="sms">Text Message (SMS)</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                
                {/* Consent Checkboxes */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="clientConsentToContact"
                      checked={contentForm.clientConsentToContact}
                      onChange={(e) => setContentForm(prev => ({ ...prev, clientConsentToContact: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 mt-0.5"
                    />
                    <label htmlFor="clientConsentToContact" className="text-sm text-emerald-700 dark:text-emerald-300">
                      <span className="font-medium">Client consents to follow-up contact</span>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Client has given permission to be contacted for review requests and follow-up communications
                      </p>
                    </label>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="clientConsentToShare"
                      checked={contentForm.clientConsentToShare}
                      onChange={(e) => setContentForm(prev => ({ ...prev, clientConsentToShare: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 mt-0.5"
                    />
                    <label htmlFor="clientConsentToShare" className="text-sm text-emerald-700 dark:text-emerald-300">
                      <span className="font-medium">Client consents to social media sharing</span>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Client has given permission for their job photos/content to be shared on social media and marketing materials
                      </p>
                    </label>
                  </div>
                </div>
                
                <div className="bg-emerald-100 dark:bg-emerald-800/30 p-3 rounded-md">
                  <p className="text-xs text-emerald-800 dark:text-emerald-200">
                    <strong>📝 Note:</strong> This information enables automated review requests and professional job completion reports to be sent to clients, increasing your Google My Business reviews and customer satisfaction.
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2">
                    <strong>🔒 Privacy:</strong> All client data is collected and processed according to our{' '}
                    <a 
                      href="/api/privacy-policy" 
                      target="_blank" 
                      className="underline hover:text-emerald-600 dark:hover:text-emerald-200"
                    >
                      Privacy Policy
                    </a>
                    {' '}and with explicit client consent.
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Information - Show only for Automotive and Roadside categories */}
            {(contentForm.category === 'Automotive' || contentForm.category === 'Roadside') && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">🚗 Vehicle Information</h4>
                
                {/* VIN Section */}
                <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-md border border-blue-200 dark:border-blue-800">
                  <Label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">VIN (Vehicle Identification Number)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={vin}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (value.length <= 17) {
                          setVin(value);
                        }
                      }}
                      className="flex-1 font-mono"
                      placeholder="Enter 17-character VIN"
                      maxLength={17}
                    />
                    <Button
                      type="button"
                      onClick={() => decodeVIN(vin)}
                      disabled={vinLoading || vin.length !== 17}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-1 whitespace-nowrap"
                      title="Decode VIN using NHTSA database"
                    >
                      {vinLoading ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span className="text-xs">Decoding...</span>
                        </>
                      ) : (
                        <>
                          <span>🔍</span>
                          <span className="text-xs">Decode</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    📱 Enter VIN and click "Decode" to auto-fill vehicle details from NHTSA database
                  </p>
                </div>

                {/* Manual Entry Section */}
                <div className="space-y-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Or enter manually:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Year</Label>
                      <Input
                        type="text"
                        value={contentForm.vehicleYear}
                        onChange={(e) => setContentForm(prev => ({ ...prev, vehicleYear: e.target.value }))}
                        placeholder="e.g., 2023"
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Make</Label>
                      <Input
                        type="text"
                        value={contentForm.vehicleMake}
                        onChange={(e) => setContentForm(prev => ({ ...prev, vehicleMake: e.target.value }))}
                        placeholder="e.g., Honda, Ford, Toyota"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Model</Label>
                      <Input
                        type="text"
                        value={contentForm.vehicleModel}
                        onChange={(e) => setContentForm(prev => ({ ...prev, vehicleModel: e.target.value }))}
                        placeholder="e.g., Civic, F-150, Camry"
                      />
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                  💡 VIN decoding uses official NHTSA database for accurate vehicle information
                </p>
              </div>
            )}

                {/* Photos */}
                <div className="space-y-6">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Job Photos</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Upload clear photos showing your completed work</p>
                    </div>
                    
                    {/* Social Media Format Selection */}
                    <div className="mb-6">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Output Format</Label>
                      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Button
                          type="button"
                          onClick={() => setSocialMediaFormat('auto')}
                          className={`flex-1 px-3 py-2 text-xs rounded-md transition-all ${
                            socialMediaFormat === 'auto' 
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          Auto-detect
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setSocialMediaFormat('instagram')}
                          className={`flex-1 px-3 py-2 text-xs rounded-md transition-all ${
                            socialMediaFormat === 'instagram' 
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          Instagram
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setSocialMediaFormat('facebook')}
                          className={`flex-1 px-3 py-2 text-xs rounded-md transition-all ${
                            socialMediaFormat === 'facebook' 
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          Facebook
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {socialMediaFormat === 'auto' && 'Smart cropping based on image content'}
                        {socialMediaFormat === 'instagram' && 'Square format (1080×1080)'}
                        {socialMediaFormat === 'facebook' && 'Landscape format (1200×630)'}
                      </p>
                    </div>
              
                    {/* Photo Actions */}
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={handleCameraCapture}
                        className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Take Photo
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowCameraGuide(true);
                        }}
                        className="w-12 h-12 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center"
                        title="View camera tips"
                      >
                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Button>
                    </div>
                    
                    {/* File Upload */}
                    <div className="mt-4">
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Or upload from device</Label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-gray-50 dark:bg-gray-800/50">
                          <div className="text-center">
                            <svg className="w-6 h-6 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium text-blue-600 dark:text-blue-400">Click to browse</span> or drag files here
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                          </div>
                        </div>
                      </div>
                    </div>
              
                    {/* Photo Preview */}
                    {contentForm.photos.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Uploaded Photos ({contentForm.photos.length})
                          </Label>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {contentForm.photos.map((photo, index) => (
                            <div key={index} className="relative group aspect-square">
                              <img 
                                src={photo} 
                                alt={`Photo ${index + 1}`} 
                                className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedPhoto(photo)}
                              />
                              <Button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Job Description</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Describe the work you completed for this customer</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Summary *</Label>
                      <Button
                        type="button"
                        onClick={generateAISummary}
                        disabled={aiGenerating || !contentForm.service || !contentForm.category}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
                        title="Generate AI marketing summary using form data"
                      >
                        {aiGenerating ? (
                          <>
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            AI Generate
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <Textarea
                      value={contentForm.description}
                      onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={5}
                      className="w-full border-gray-200 dark:border-gray-700 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Describe the service provided, challenges encountered, work performed, tools used, resolution details, or any technical notes..."
                      required
                    />
                    
                    {!aiGenerating && (contentForm.service && contentForm.category) && (
                      <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/30 rounded-lg p-3">
                        <div className="flex gap-2">
                          <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs text-violet-700 dark:text-violet-300">
                            Add your technical notes above, then click "AI Generate" to create a professional service report for marketing use.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

            {/* Job Performance Section */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-3">📊 Job Performance & Marketing Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Job Complexity */}
                <div>
                  <Label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">🎯 Job Complexity</Label>
                  <select
                    value={contentForm.jobComplexity}
                    onChange={(e) => setContentForm(prev => ({ ...prev, jobComplexity: e.target.value as MarketingContent['jobComplexity'] }))}
                    className="w-full border border-green-300 dark:border-green-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select complexity...</option>
                    <option value="Simple">🟢 Simple - Basic service</option>
                    <option value="Standard">🟡 Standard - Regular job</option>
                    <option value="Complex">🟠 Complex - Challenging work</option>
                    <option value="Emergency">🔴 Emergency - Urgent situation</option>
                  </select>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Showcases skill level required</p>
                </div>
              </div>

              {/* Customer Satisfaction */}
              <div className="mb-4">
                <Label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">⭐ Customer Satisfaction</Label>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        type="button"
                        onClick={() => setContentForm(prev => ({ ...prev, customerSatisfaction: star }))}
                        className={`text-2xl transition-colors p-1 h-auto min-w-0 ${
                          contentForm.customerSatisfaction && contentForm.customerSatisfaction >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                        } bg-transparent hover:bg-transparent`}
                      >
                        ⭐
                      </Button>
                    ))}
                  </div>
                  {contentForm.customerSatisfaction && (
                    <span className="text-sm text-green-700 dark:text-green-300">
                      {contentForm.customerSatisfaction === 5 ? '🎉 Excellent!' : 
                       contentForm.customerSatisfaction === 4 ? '😊 Great!' :
                       contentForm.customerSatisfaction === 3 ? '👍 Good' :
                       contentForm.customerSatisfaction === 2 ? '😐 Fair' : '😕 Poor'}
                    </span>
                  )}
                </div>
                
                <Input
                  type="text"
                  value={contentForm.customerQuote}
                  onChange={(e) => setContentForm(prev => ({ ...prev, customerQuote: e.target.value }))}
                  placeholder="Optional: Customer quote or feedback (great for marketing!)"
                />
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Customer testimonials are powerful marketing content</p>
              </div>

              <p className="text-xs text-green-600 dark:text-green-400">
                💡 These details help create compelling marketing content that showcases professionalism and customer satisfaction
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contentForm.customerPermission}
                  onChange={(e) => setContentForm(prev => ({ ...prev, customerPermission: e.target.checked }))}
                  className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  required
                />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  ✅ Customer gave permission to use photos and information for marketing purposes
                </span>
              </label>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Required: Always get customer consent before submitting content</p>
            </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    type="button"
                    onClick={() => setShowContentForm(false)}
                    variant="outline"
                    className="flex-1 h-11 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Content
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Camera Modal */}
      {showPhotoCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4">
          <div className="bg-black rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">📸 Take Photo</h2>
              <Button
                onClick={stopPhotoCamera}
                className="text-gray-400 hover:text-white text-2xl font-bold p-1 bg-transparent hover:bg-gray-700"
              >
                ×
              </Button>
            </div>
            
            <div className="relative">
              <video
                id="photoCameraVideo"
                ref={(video) => {
                  if (video && photoCameraStream) {
                    video.srcObject = photoCameraStream;
                    video.play().catch((error) => {
                      // Ignore AbortError which happens when play() is interrupted
                      if (error.name !== 'AbortError') {
                        console.error('Video play error:', error);
                      }
                    });
                  }
                }}
                className="w-full aspect-square object-cover"
                playsInline
                muted
              />
              
              {/* Professional Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Rule of thirds grid */}
                <div className="absolute inset-0">
                  {/* Vertical lines */}
                  <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white opacity-30"></div>
                  <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-white opacity-30"></div>
                  {/* Horizontal lines */}
                  <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-white opacity-30"></div>
                  <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-white opacity-30"></div>
                </div>
                
                {/* Center focus point */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    {/* Plus icon */}
                    <div className="w-8 h-8 flex items-center justify-center">
                      <div className="absolute w-6 h-[2px] bg-white opacity-70 rounded"></div>
                      <div className="absolute w-[2px] h-6 bg-white opacity-70 rounded"></div>
                    </div>
                    {/* Center circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-white opacity-50 rounded-full"></div>
                  </div>
                </div>
                
                {/* Format indicator */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {socialMediaFormat === 'instagram' && '📷 Square (1:1)'}
                    {socialMediaFormat === 'facebook' && '📷 Landscape (16:9)'}
                    {socialMediaFormat === 'auto' && '📷 Smart Auto'}
                  </div>
                </div>
              </div>
              
              {/* Camera Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                <div className="flex items-center justify-center gap-8">
                  <Button
                    onClick={stopPhotoCamera}
                    className="w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-full flex items-center justify-center transition-colors"
                    title="Cancel"
                  >
                    ❌
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-white hover:bg-gray-200 text-black rounded-full flex items-center justify-center transition-colors border-4 border-gray-400"
                    title="Take Photo"
                  >
                    <div className="w-12 h-12 bg-black rounded-full"></div>
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const formats = ['auto', 'instagram', 'facebook'] as const;
                      const currentIndex = formats.indexOf(socialMediaFormat);
                      const nextIndex = (currentIndex + 1) % formats.length;
                      setSocialMediaFormat(formats[nextIndex]);
                    }}
                    className="w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-full flex items-center justify-center transition-colors text-xs"
                    title="Change Format"
                  >
                    🔄
                  </Button>
                </div>
                
                <div className="mt-3 text-center">
                  <p className="text-white text-xs opacity-75">
                    Use grid lines and center point for better composition
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Guide Modal */}
      <Dialog open={showCameraGuide} onOpenChange={setShowCameraGuide}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-950 border-0 shadow-xl">
          <div className="overflow-y-auto max-h-[calc(90vh-2rem)]">
            <DialogHeader className="sticky top-0 bg-white dark:bg-gray-950 pb-4 border-b border-gray-100 dark:border-gray-800">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                Photo Guide
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Use grid lines and focus points for professional job photos
              </DialogDescription>
            </DialogHeader>
            
            <div className="px-6 pb-6">
              <div className="space-y-6 py-4">
            {/* Grid Composition Guide */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Grid & Focus Guide</h3>
              <div className="relative bg-black rounded-lg p-3" style={{aspectRatio: '4/3'}}>
                <svg viewBox="0 0 240 180" className="w-full h-full">
                  {/* Camera viewfinder background */}
                  <rect x="10" y="10" width="220" height="160" fill="#1a1a1a" rx="4"/>
                  
                  {/* Grid lines (rule of thirds) */}
                  <line x1="83" y1="10" x2="83" y2="170" stroke="#ffffff" strokeWidth="1" opacity="0.4"/>
                  <line x1="157" y1="10" x2="157" y2="170" stroke="#ffffff" strokeWidth="1" opacity="0.4"/>
                  <line x1="10" y1="63" x2="230" y2="63" stroke="#ffffff" strokeWidth="1" opacity="0.4"/>
                  <line x1="10" y1="117" x2="230" y2="117" stroke="#ffffff" strokeWidth="1" opacity="0.4"/>
                  
                  {/* Center focus point + */}
                  <g transform="translate(120,90)">
                    <line x1="-8" y1="0" x2="8" y2="0" stroke="#00ff00" strokeWidth="2"/>
                    <line x1="0" y1="-8" x2="0" y2="8" stroke="#00ff00" strokeWidth="2"/>
                    <circle cx="0" cy="0" r="10" fill="none" stroke="#00ff00" strokeWidth="1" opacity="0.6"/>
                  </g>
                  
                  {/* Subject positioning dots */}
                  <circle cx="83" cy="63" r="3" fill="#ff6b6b" opacity="0.7"/>
                  <circle cx="157" cy="63" r="3" fill="#ff6b6b" opacity="0.7"/>
                  <circle cx="83" cy="117" r="3" fill="#ff6b6b" opacity="0.7"/>
                  <circle cx="157" cy="117" r="3" fill="#ff6b6b" opacity="0.7"/>
                  
                  {/* Example lock at focus point */}
                  <rect x="145" y="55" width="24" height="16" fill="#4ade80" rx="2"/>
                  
                  {/* Viewfinder corners */}
                  <path d="M15 15 L25 15 L25 25" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.6"/>
                  <path d="M215 15 L225 15 L225 25" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.6"/>
                  <path d="M15 155 L25 155 L25 165" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.6"/>
                  <path d="M215 155 L225 155 L225 165" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.6"/>
                </svg>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Green + = Tap to focus on your subject</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Red dots = Best placement points</span>
                </div>
              </div>
            </div>

            {/* Camera Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* iOS Settings */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  iOS Settings
                </h4>
                <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <div><strong>Grid:</strong> Settings → Camera → Grid: ON</div>
                  <div><strong>Quality:</strong> Settings → Camera → Formats → High Efficiency</div>
                  <div><strong>Focus:</strong> Tap screen to focus, hold to lock</div>
                </div>
              </div>

              {/* Android Settings */}
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993.9993.4482.9993.9993-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993.9993.4482.9993.9993-.4482.9997-.9993.9997"/>
                  </svg>
                  Android Settings
                </h4>
                <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <div><strong>Grid:</strong> Camera → Settings → Grid Lines: ON</div>
                  <div><strong>Quality:</strong> Picture Size: Highest Available</div>
                  <div><strong>Focus:</strong> Tap screen, long press to lock</div>
                </div>
              </div>
            </div>

            {/* Aspect Ratios */}
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">Recommended Aspect Ratios</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="text-amber-700 dark:text-amber-300">
                  <div className="font-medium">Instagram: 1:1 (Square)</div>
                  <div className="text-xs opacity-75">Perfect for feed posts</div>
                </div>
                <div className="text-amber-700 dark:text-amber-300">
                  <div className="font-medium">Facebook: 16:9 (Wide)</div>
                  <div className="text-xs opacity-75">Best for timeline</div>
                </div>
                <div className="text-amber-700 dark:text-amber-300">
                  <div className="font-medium">LinkedIn: 4:3 (Standard)</div>
                  <div className="text-xs opacity-75">Professional posts</div>
                </div>
              </div>
            </div>
            
                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    onClick={() => setShowCameraGuide(false)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Got it!
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[70] p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedPhoto} 
              alt="Full size photo" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}

