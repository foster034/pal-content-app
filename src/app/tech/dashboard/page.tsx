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
    photoTypes: {} as { [photoId: string]: 'before' | 'after' | 'process' | 'result' | 'tools' }
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

  const handleSubmitContent = (e: React.FormEvent) => {
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
      photoTypes: contentForm.photoTypes
    };

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
      photoTypes: {}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">📸 Submit Marketing Content</DialogTitle>
            <DialogDescription>
              Submit photos and details of your work for marketing approval
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitContent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Service Category *</Label>
                <select
                  value={contentForm.category}
                  onChange={(e) => {
                    setContentForm(prev => ({ ...prev, category: e.target.value as MarketingContent['category'], service: '' }));
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select category...</option>
                  <option value="Residential">🏠 Residential</option>
                  <option value="Automotive">🚗 Automotive</option>
                  <option value="Commercial">🏢 Commercial</option>
                  <option value="Roadside">🛣️ Roadside</option>
                </select>
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Service Type *</Label>
                <select
                  value={contentForm.service}
                  onChange={(e) => setContentForm(prev => ({ ...prev, service: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  disabled={!contentForm.category}
                >
                  <option value="">Select service...</option>
                  {getAvailableServices().map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-2">Location *</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={contentForm.location}
                  onChange={(e) => setContentForm(prev => ({ ...prev, location: e.target.value }))}
                  className="flex-1"
                  placeholder="e.g., Downtown Mall, Main Street, Customer's Home"
                  required
                />
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-1 whitespace-nowrap"
                  title="Get current location"
                >
                  {locationLoading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span className="text-xs">Getting...</span>
                    </>
                  ) : (
                    <>
                      <span>📍</span>
                      <span className="text-xs">Use Location</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Click "Use Location" to automatically fill with your current location
              </p>
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

            <div>
              <Label className="block text-sm font-medium mb-2">Photos *</Label>
              
              {/* Social Media Format Selection */}
              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Social Media Format</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    onClick={() => setSocialMediaFormat('auto')}
                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                      socialMediaFormat === 'auto' 
                        ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200' 
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                    }`}
                  >
                    🤖 Auto-detect
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setSocialMediaFormat('instagram')}
                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                      socialMediaFormat === 'instagram' 
                        ? 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/50 dark:text-pink-200' 
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                    }`}
                  >
                    🟦 Instagram (1:1)
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setSocialMediaFormat('facebook')}
                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                      socialMediaFormat === 'facebook' 
                        ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200' 
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                    }`}
                  >
                    📘 Facebook (16:9)
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {socialMediaFormat === 'auto' && 'Automatically detects orientation and crops for optimal social media format'}
                  {socialMediaFormat === 'instagram' && 'Square format with smart cropping for Instagram (1080x1080)'}
                  {socialMediaFormat === 'facebook' && 'Landscape format with smart cropping for Facebook (1200x630)'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCameraGuide(true);
                  }}
                  className="flex flex-col items-center justify-center px-6 py-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 transition-colors bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-700 min-h-[120px]"
                >
                  <span className="text-3xl mb-3 block">📱</span>
                  <span className="text-base font-semibold text-green-700 dark:text-green-300 mb-1">Camera Guide</span>
                  <p className="text-sm text-green-600 dark:text-green-400 text-center leading-tight">See positioning tips & best practices</p>
                </Button>
                
                <Button
                  type="button"
                  onClick={handleCameraCapture}
                  className="flex flex-col items-center justify-center px-6 py-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-700 min-h-[120px]"
                >
                  <span className="text-3xl mb-3 block">📸</span>
                  <span className="text-base font-semibold text-blue-700 dark:text-blue-300 mb-1">Take Photo</span>
                  <p className="text-sm text-blue-600 dark:text-blue-400 text-center leading-tight">
                    {socialMediaFormat === 'instagram' && 'Square format (1:1)'}
                    {socialMediaFormat === 'facebook' && 'Landscape format (16:9)'}
                    {socialMediaFormat === 'auto' && 'Smart auto-detect format'}
                  </p>
                </Button>
              </div>
              
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload photos of your work (before/after shots work great!)</p>
              
              {contentForm.photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {contentForm.photos.map((photo, index) => (
                    <div key={index} className="relative inline-block">
                      <img 
                        src={photo} 
                        alt={`Upload ${index + 1}`} 
                        className="max-w-24 max-h-24 object-cover rounded border bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                        onClick={() => setSelectedPhoto(photo)}
                      />
                      <Button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 p-0 min-w-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="block text-sm font-medium">Description *</Label>
                <Button
                  type="button"
                  onClick={generateAISummary}
                  disabled={aiGenerating || !contentForm.service || !contentForm.category}
                  className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center gap-1 text-xs"
                  title="Generate AI marketing summary using form data"
                >
                  {aiGenerating ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>🤖</span>
                      <span>AI Generate</span>
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={contentForm.description}
                onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full"
                placeholder="Describe the service provided, challenges encountered, work performed, tools used, resolution details, or any technical notes..."
                required
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Add your technical notes - AI will help format into a professional service report</p>
                {!aiGenerating && (contentForm.service && contentForm.category) && (
                  <p className="text-xs text-purple-600 dark:text-purple-400">💡 Click "AI Generate" to format your notes into a professional service report</p>
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

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📸 Submit Content
              </Button>
              <Button
                type="button"
                onClick={() => setShowContentForm(false)}
                variant="outline"
                className="flex-1 py-2 rounded-lg transition-colors"
              >
                Cancel
              </Button>
            </div>
          </form>
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
                    video.play();
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
            <Button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold transition-all backdrop-blur-sm"
            >
              ×
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}