'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Send, Camera } from 'lucide-react';

interface Tech {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  franchiseeName: string;
}

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
  jobDuration?: number; // in minutes
  photoTypes?: { [photoId: string]: 'before' | 'after' | 'process' | 'result' | 'tools' };
}

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

// Sample tech data (in real app, this would come from database)
const techsDatabase = {
  'alex-rodriguez': {
    id: 'alex-rodriguez',
    name: 'Alex Rodriguez',
    email: 'alex@popalock.com',
    phone: '(555) 111-2222',
    specialties: ['Automotive Locksmith', 'Roadside Assistance'],
    franchiseeName: 'Downtown'
  },
  'david-chen': {
    id: 'david-chen',
    name: 'David Chen',
    email: 'david@popalock.com',
    phone: '(555) 333-4444',
    specialties: ['Residential Locksmith', 'Key Programming'],
    franchiseeName: 'Downtown'
  },
  'maria-garcia': {
    id: 'maria-garcia',
    name: 'Maria Garcia',
    email: 'maria@popalock.com',
    phone: '(555) 222-3333',
    specialties: ['Commercial Locksmith', 'Access Control'],
    franchiseeName: 'Westside'
  }
};

export default function TechMarketingDashboard() {
  const params = useParams();
  const router = useRouter();
  const techId = params.techId as string;

  const [tech, setTech] = useState<Tech | null>(null);
  const [marketingContent, setMarketingContent] = useState<MarketingContent[]>([]);
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
    photoTypes: {} as { [photoId: string]: 'before' | 'after' | 'process' | 'result' | 'tools' }
  });

  useEffect(() => {
    // Load tech data
    const techData = techsDatabase[techId as keyof typeof techsDatabase];
    if (techData) {
      setTech(techData);
      // Load sample marketing content
      setMarketingContent([
        {
          id: 1,
          category: 'Automotive',
          service: 'Duplicate Key Service',
          location: 'Downtown Shopping Center',
          description: 'Successfully created duplicate keys for customer\'s vehicle. Customer was very satisfied with quick service.',
          photos: ['/placeholder-car-keys.jpg'],
          submittedBy: techData.name,
          submittedAt: new Date().toISOString(),
          status: 'Submitted',
          customerPermission: true,
          vehicleYear: '2023',
          vehicleMake: 'Honda',
          vehicleModel: 'Civic'
        }
      ]);
    } else {
      router.push('/tech/login');
    }
  }, [techId, router]);

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

  const handleSubmitContent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contentForm.category || !contentForm.service) {
      alert('Please select both category and service');
      return;
    }


    const newContent: MarketingContent = {
      id: marketingContent.length + 1,
      category: contentForm.category as MarketingContent['category'],
      service: contentForm.service,
      location: contentForm.location,
      description: contentForm.description,
      photos: contentForm.photos,
      submittedBy: tech?.name || 'Unknown',
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
      customerPermission: contentForm.customerPermission,
      vehicleYear: contentForm.vehicleYear || undefined,
      vehicleMake: contentForm.vehicleMake || undefined,
      vehicleModel: contentForm.vehicleModel || undefined,
      jobDuration: contentForm.jobDuration,
      photoTypes: contentForm.photoTypes
    };

    setMarketingContent(prev => [newContent, ...prev]);
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
      photoTypes: {}
    });
    setVin('');
    setShowContentForm(false);
  };

  const [showCameraGuide, setShowCameraGuide] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'unknown'>('unknown');

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/Android/.test(userAgent)) {
      setDeviceType('android');
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Process files for social media optimization
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            // Create canvas for optimization
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Enhanced orientation detection and cropping logic
            const originalWidth = img.width;
            const originalHeight = img.height;
            const originalAspectRatio = originalWidth / originalHeight;
            
            // Determine optimal format based on orientation
            let targetWidth: number, targetHeight: number, cropMode: 'fit' | 'crop' = 'crop';
            
            switch (socialMediaFormat) {
              case 'instagram':
                targetWidth = targetHeight = 1080; // Square format
                break;
              case 'facebook':
                targetWidth = 1200;
                targetHeight = 630; // Landscape format
                break;
              case 'auto':
              default:
                // Enhanced auto-detection based on orientation and aspect ratio
                if (originalAspectRatio >= 1.5) {
                  // Wide landscape - use Facebook format
                  targetWidth = 1200;
                  targetHeight = 630;
                } else if (originalAspectRatio >= 1.1) {
                  // Moderate landscape - could work for either, prefer Facebook
                  targetWidth = 1200;
                  targetHeight = 630;
                } else if (originalAspectRatio >= 0.9) {
                  // Nearly square - perfect for Instagram
                  targetWidth = targetHeight = 1080;
                } else if (originalAspectRatio >= 0.6) {
                  // Portrait - crop to square for Instagram
                  targetWidth = targetHeight = 1080;
                } else {
                  // Very tall portrait - crop to square for Instagram
                  targetWidth = targetHeight = 1080;
                }
                break;
            }
            
            const targetAspectRatio = targetWidth / targetHeight;
            
            // Smart cropping logic
            let sourceX = 0, sourceY = 0, sourceWidth = originalWidth, sourceHeight = originalHeight;
            let canvasWidth = targetWidth, canvasHeight = targetHeight;
            
            if (originalAspectRatio > targetAspectRatio) {
              // Image is wider than target - crop sides
              sourceWidth = originalHeight * targetAspectRatio;
              sourceX = (originalWidth - sourceWidth) / 2; // Center crop
            } else if (originalAspectRatio < targetAspectRatio) {
              // Image is taller than target - crop top/bottom
              sourceHeight = originalWidth / targetAspectRatio;
              sourceY = (originalHeight - sourceHeight) / 4; // Crop more from bottom, less from top (better for photos with people/objects)
            }

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            // Apply image enhancements for social media
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Smart cropping and drawing
            ctx.drawImage(
              img,
              sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle (crop area)
              0, 0, canvasWidth, canvasHeight // Destination rectangle (canvas)
            );
            
            // Compress with optimal quality for social media
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
          facingMode: 'environment', // Use back camera
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
      // Enhanced orientation detection and cropping logic
      const originalWidth = video.videoWidth;
      const originalHeight = video.videoHeight;
      const originalAspectRatio = originalWidth / originalHeight;
      
      // Determine optimal format based on orientation
      let targetWidth: number, targetHeight: number;
      
      switch (socialMediaFormat) {
        case 'instagram':
          targetWidth = targetHeight = 1080; // Square format
          break;
        case 'facebook':
          targetWidth = 1200;
          targetHeight = 630; // Landscape format
          break;
        case 'auto':
        default:
          // Enhanced auto-detection based on orientation and aspect ratio
          if (originalAspectRatio >= 1.5) {
            // Wide landscape - use Facebook format
            targetWidth = 1200;
            targetHeight = 630;
          } else if (originalAspectRatio >= 1.1) {
            // Moderate landscape - could work for either, prefer Facebook
            targetWidth = 1200;
            targetHeight = 630;
          } else if (originalAspectRatio >= 0.9) {
            // Nearly square - perfect for Instagram
            targetWidth = targetHeight = 1080;
          } else if (originalAspectRatio >= 0.6) {
            // Portrait - crop to square for Instagram
            targetWidth = targetHeight = 1080;
          } else {
            // Very tall portrait - crop to square for Instagram
            targetWidth = targetHeight = 1080;
          }
          break;
      }
      
      const targetAspectRatio = targetWidth / targetHeight;
      
      // Smart cropping logic
      let sourceX = 0, sourceY = 0, sourceWidth = originalWidth, sourceHeight = originalHeight;
      
      if (originalAspectRatio > targetAspectRatio) {
        // Image is wider than target - crop sides
        sourceWidth = originalHeight * targetAspectRatio;
        sourceX = (originalWidth - sourceWidth) / 2; // Center crop
      } else if (originalAspectRatio < targetAspectRatio) {
        // Image is taller than target - crop top/bottom
        sourceHeight = originalWidth / targetAspectRatio;
        sourceY = (originalHeight - sourceHeight) / 4; // Crop more from bottom, less from top
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Apply image enhancements for social media
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Smart cropping and drawing
      ctx.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle (crop area)
        0, 0, targetWidth, targetHeight // Destination rectangle (canvas)
      );
      
      // Compress with optimal quality for social media
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
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Use reverse geocoding to get address
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        
        if (response.ok) {
          const data = await response.json();
          // Create a readable address from the response
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
          // Fallback to coordinates
          setContentForm(prev => ({
            ...prev,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
        }
      } catch (geocodeError) {
        // Fallback to coordinates if reverse geocoding fails
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
      // Use NHTSA VIN decode API
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vinCode}?format=json`
      );
      
      if (response.ok) {
        const data = await response.json();
        const results = data.Results;
        
        // Extract year, make, and model from the results
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
          
          // Show success message
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

  const startVinScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setCameraStream(stream);
      setShowVinScanner(true);
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please check permissions and try again.');
    }
  };

  const stopVinScanner = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowVinScanner(false);
  };

  const captureVinFrame = () => {
    const video = document.getElementById('vinScannerVideo') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (video && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      // For now, we'll show a message that the frame was captured
      // In a full implementation, you'd use OCR libraries like Tesseract.js to read the VIN
      alert('Frame captured! For now, please manually enter the VIN you see in the camera view. Future versions will include automatic VIN recognition.');
      
      stopVinScanner();
    }
  };

  const lookupVehicleByYMM = async (year: string, make: string) => {
    if (!year || !make) return;
    
    try {
      // Get models for the selected year and make
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
      );
      
      if (response.ok) {
        const data = await response.json();
        const models = data.Results.map((item: any) => item.Model_Name);
        
        // For now, we'll just log the available models
        // In a full implementation, you'd show a dropdown with these models
        console.log('Available models:', models);
      }
    } catch (error) {
      console.error('YMM lookup error:', error);
    }
  };

  const generateAISummary = async () => {
    if (!contentForm.service || !contentForm.category) {
      alert('Please select service category and type first');
      return;
    }

    setAiGenerating(true);
    
    try {
      // Prepare context for AI generation
      const context = {
        category: contentForm.category,
        service: contentForm.service,
        location: contentForm.location,
        description: contentForm.description, // The tech's description/comments to enhance
        jobDuration: contentForm.jobDuration,
        vehicle: contentForm.vehicleYear && contentForm.vehicleMake && contentForm.vehicleModel ? 
          `${contentForm.vehicleYear} ${contentForm.vehicleMake} ${contentForm.vehicleModel}` : null,
        techName: tech?.name,
        photoCount: contentForm.photos.length
      };

      // Call the OpenAI API endpoint
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

  const getAvailableServices = () => {
    if (!contentForm.category) return [];
    return serviceCategories[contentForm.category] || [];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Residential': return 'bg-blue-100 text-blue-800';
      case 'Automotive': return 'bg-green-100 text-green-800';
      case 'Commercial': return 'bg-purple-100 text-purple-800';
      case 'Roadside': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Published': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Residential': return '🏠';
      case 'Automotive': return '🚗';
      case 'Commercial': return '🏢';
      case 'Roadside': return '🛣️';
      default: return '🔧';
    }
  };

  if (!tech) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const myContent = marketingContent.filter(content => content.submittedBy === tech.name);
  const submittedContent = myContent.filter(content => content.status === 'Submitted');
  const approvedContent = myContent.filter(content => content.status === 'Approved' || content.status === 'Published');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image
                src="/images/pop-a-lock-logo.svg"
                alt="Pop-A-Lock"
                width={160}
                height={64}
                className="mr-4"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">📸 {tech.name}'s Marketing Portal</h1>
                <p className="text-sm text-gray-600">{tech.franchiseeName} Territory • Content Creation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <div className="font-medium">{tech.email}</div>
                <div>{tech.phone}</div>
              </div>
              <button
                onClick={() => setShowContentForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Content
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Content Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{submittedContent.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedContent.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">📸</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Photos Shared</p>
                <p className="text-2xl font-bold text-gray-900">{myContent.reduce((sum, content) => sum + content.photos.length, 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories Covered</p>
                <p className="text-2xl font-bold text-gray-900">{new Set(myContent.map(c => c.category)).size}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Guide Modal */}
        {showCameraGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-green-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📱 Camera Positioning Guide</h2>
                <button
                  onClick={() => setShowCameraGuide(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Phone Positioning Visual Guide */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4 text-green-700">📸 Optimal Phone Position</h3>
                  <div className="bg-gradient-to-b from-blue-50 to-green-50 rounded-lg p-8 border-2 border-green-200">
                    <div className="relative">
                      {/* Phone illustration */}
                      <div className="mx-auto w-32 h-56 bg-gray-800 rounded-[20px] p-2 relative shadow-lg">
                        <div className="w-full h-full bg-white rounded-[16px] relative overflow-hidden">
                          {/* Camera viewfinder */}
                          <div className="absolute inset-2 border-2 border-dashed border-green-400 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-8 h-8 bg-green-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                                <span className="text-white text-lg">📸</span>
                              </div>
                              <p className="text-xs text-green-600 font-medium">Focus Here</p>
                            </div>
                          </div>
                          {/* Grid lines */}
                          <div className="absolute inset-2">
                            <div className="h-full w-full">
                              <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-green-300 opacity-50"></div>
                              <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-green-300 opacity-50"></div>
                              <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-green-300 opacity-50"></div>
                              <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-green-300 opacity-50"></div>
                            </div>
                          </div>
                        </div>
                        {/* Camera bump */}
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-600 rounded-full"></div>
                      </div>
                      
                      {/* Positioning arrows and text */}
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-center text-green-700">
                          <span className="text-2xl mr-2">📏</span>
                          <span className="font-medium">Hold 3-4 feet away</span>
                        </div>
                        <div className="flex items-center justify-center text-green-700">
                          <span className="text-2xl mr-2">📐</span>
                          <span className="font-medium">Keep phone level</span>
                        </div>
                        <div className="flex items-center justify-center text-green-700">
                          <span className="text-2xl mr-2">🎯</span>
                          <span className="font-medium">Center your subject</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Device-Specific Instructions */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-blue-700">⚙️ Camera Settings</h3>
                  
                  {deviceType === 'ios' && (
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-4">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">📱</span>
                        <h4 className="font-semibold text-blue-800">iPhone Settings</h4>
                      </div>
                      <div className="space-y-3 text-sm text-blue-700">
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">1️⃣</span>
                          <div>
                            <p className="font-medium">Open Camera app</p>
                            <p className="text-blue-600">Use the default Camera app for best results</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">2️⃣</span>
                          <div>
                            <p className="font-medium">Select PHOTO mode</p>
                            <p className="text-blue-600">Swipe to Photo (not Portrait or Video)</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">3️⃣</span>
                          <div>
                            <p className="font-medium">Turn ON Grid</p>
                            <p className="text-blue-600">Settings → Camera → Grid (helps with alignment)</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">4️⃣</span>
                          <div>
                            <p className="font-medium">Use back camera</p>
                            <p className="text-blue-600">Higher quality than front camera</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">5️⃣</span>
                          <div>
                            <p className="font-medium">Tap to focus</p>
                            <p className="text-blue-600">Tap on your subject before taking the photo</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {deviceType === 'android' && (
                    <div className="bg-green-50 rounded-lg p-6 border border-green-200 mb-4">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">🤖</span>
                        <h4 className="font-semibold text-green-800">Android Settings</h4>
                      </div>
                      <div className="space-y-3 text-sm text-green-700">
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">1️⃣</span>
                          <div>
                            <p className="font-medium">Open Camera app</p>
                            <p className="text-green-600">Use your default camera app</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">2️⃣</span>
                          <div>
                            <p className="font-medium">Switch to Photo mode</p>
                            <p className="text-green-600">Make sure you're not in video or other modes</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">3️⃣</span>
                          <div>
                            <p className="font-medium">Enable Grid lines</p>
                            <p className="text-green-600">Look for grid icon in camera settings</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">4️⃣</span>
                          <div>
                            <p className="font-medium">Set to highest quality</p>
                            <p className="text-green-600">Check resolution settings for best quality</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">5️⃣</span>
                          <div>
                            <p className="font-medium">Use rear camera</p>
                            <p className="text-green-600">Better quality than front-facing camera</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {deviceType === 'unknown' && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-4">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">📱</span>
                        <h4 className="font-semibold text-gray-800">General Mobile Settings</h4>
                      </div>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">📸</span>
                          <p>Use your device's default camera app for best results</p>
                        </div>
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">⚙️</span>
                          <p>Set camera to highest quality/resolution setting</p>
                        </div>
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">🔲</span>
                          <p>Enable grid lines if available (helps with composition)</p>
                        </div>
                        <div className="flex items-start">
                          <span className="w-6 text-center mr-2">🎯</span>
                          <p>Use back/rear camera for higher quality photos</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Social Media Optimization Tips */}
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">🎨</span>
                      <h4 className="font-semibold text-purple-800">Photography Composition Tips</h4>
                    </div>
                    <div className="space-y-3 text-sm text-purple-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="w-6 text-center mr-2">🟦</span>
                            <p className="font-medium">Instagram (Square 1:1)</p>
                          </div>
                          <ul className="pl-8 space-y-1 text-purple-600">
                            <li>• Center your subject in frame</li>
                            <li>• Use rule of thirds for tools/details</li>
                            <li>• Great for before/after comparisons</li>
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="w-6 text-center mr-2">📘</span>
                            <p className="font-medium">Facebook (Landscape 16:9)</p>
                          </div>
                          <ul className="pl-8 space-y-1 text-purple-600">
                            <li>• Show wider context/location</li>
                            <li>• Include surrounding environment</li>
                            <li>• Perfect for action shots</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="border-t border-purple-200 pt-3 mt-4">
                        <h5 className="font-medium text-purple-800 mb-2">📸 Professional Photo Tips</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <span className="w-6 text-center mr-2">🌟</span>
                              <p><strong>Before/After:</strong> Multiple angles tell the story</p>
                            </div>
                            <div className="flex items-center">
                              <span className="w-6 text-center mr-2">💡</span>
                              <p><strong>Lighting:</strong> Natural light or workshop lighting</p>
                            </div>
                            <div className="flex items-center">
                              <span className="w-6 text-center mr-2">🎨</span>
                              <p><strong>Background:</strong> Clean, uncluttered areas</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <span className="w-6 text-center mr-2">🔍</span>
                              <p><strong>Focus:</strong> Tap to focus on your work</p>
                            </div>
                            <div className="flex items-center">
                              <span className="w-6 text-center mr-2">📄</span>
                              <p><strong>Angles:</strong> Show skill and craftsmanship</p>
                            </div>
                            <div className="flex items-center">
                              <span className="w-6 text-center mr-2">👥</span>
                              <p><strong>Context:</strong> Include customer satisfaction</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  💡 <strong>Pro Tip:</strong> Always get customer permission before taking photos!
                </div>
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setShowCameraGuide(false);
                      handleCameraCapture();
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📸 Start Taking Photos
                  </button>
                  <button
                    onClick={() => setShowCameraGuide(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIN Scanner Modal */}
        {showVinScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-gray-900">📷 VIN Scanner</h2>
                <button
                  onClick={stopVinScanner}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="p-4">
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    id="vinScannerVideo"
                    ref={(video) => {
                      if (video && cameraStream) {
                        video.srcObject = cameraStream;
                        video.play();
                      }
                    }}
                    className="w-full h-64 object-cover"
                    playsInline
                    muted
                  />
                  
                  {/* VIN scanning overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border-2 border-dashed border-green-400 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white bg-black bg-opacity-50 p-2 rounded">
                        <p className="text-sm font-medium">Position VIN within this frame</p>
                        <p className="text-xs">VIN is usually on dashboard or door jamb</p>
                      </div>
                    </div>
                    
                    {/* Corner guides */}
                    <div className="absolute top-8 left-8 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
                    <div className="absolute top-8 right-8 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
                    <div className="absolute bottom-8 left-8 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
                    <div className="absolute bottom-8 right-8 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">📋 VIN Location Guide</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• <strong>Dashboard:</strong> Driver side, visible through windshield</li>
                      <li>• <strong>Door Jamb:</strong> Driver side door frame sticker</li>
                      <li>• <strong>Engine Block:</strong> Usually near front of engine</li>
                      <li>• <strong>Registration:</strong> Listed on vehicle registration document</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={captureVinFrame}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      📸 Capture VIN
                    </button>
                    <button
                      onClick={stopVinScanner}
                      className="flex-1 bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-600 text-center">
                    💡 Position the VIN clearly within the frame and tap "Capture VIN"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Camera Modal */}
        {showPhotoCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4">
            <div className="bg-black rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">📸 Take Photo</h2>
                <button
                  onClick={stopPhotoCamera}
                  className="text-gray-400 hover:text-white text-2xl font-bold"
                >
                  ×
                </button>
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
                  
                  {/* Corner frame indicators */}
                  <div className="absolute top-4 left-4 w-6 h-6">
                    <div className="absolute top-0 left-0 w-4 h-[2px] bg-white opacity-60 rounded"></div>
                    <div className="absolute top-0 left-0 w-[2px] h-4 bg-white opacity-60 rounded"></div>
                  </div>
                  <div className="absolute top-4 right-4 w-6 h-6">
                    <div className="absolute top-0 right-0 w-4 h-[2px] bg-white opacity-60 rounded"></div>
                    <div className="absolute top-0 right-0 w-[2px] h-4 bg-white opacity-60 rounded"></div>
                  </div>
                  <div className="absolute bottom-4 left-4 w-6 h-6">
                    <div className="absolute bottom-0 left-0 w-4 h-[2px] bg-white opacity-60 rounded"></div>
                    <div className="absolute bottom-0 left-0 w-[2px] h-4 bg-white opacity-60 rounded"></div>
                  </div>
                  <div className="absolute bottom-4 right-4 w-6 h-6">
                    <div className="absolute bottom-0 right-0 w-4 h-[2px] bg-white opacity-60 rounded"></div>
                    <div className="absolute bottom-0 right-0 w-[2px] h-4 bg-white opacity-60 rounded"></div>
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
                    <button
                      onClick={stopPhotoCamera}
                      className="w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-full flex items-center justify-center transition-colors"
                      title="Cancel"
                    >
                      ❌
                    </button>
                    
                    <button
                      onClick={capturePhoto}
                      className="w-16 h-16 bg-white hover:bg-gray-200 text-black rounded-full flex items-center justify-center transition-colors border-4 border-gray-400"
                      title="Take Photo"
                    >
                      <div className="w-12 h-12 bg-black rounded-full"></div>
                    </button>
                    
                    <button
                      onClick={() => {
                        // Cycle through formats
                        const formats = ['auto', 'instagram', 'facebook'] as const;
                        const currentIndex = formats.indexOf(socialMediaFormat);
                        const nextIndex = (currentIndex + 1) % formats.length;
                        setSocialMediaFormat(formats[nextIndex]);
                      }}
                      className="w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-full flex items-center justify-center transition-colors text-xs"
                      title="Change Format"
                    >
                      🔄
                    </button>
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

        {/* Content Form Modal */}
        {showContentForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Send className="h-5 w-5" />
                Submit Marketing Content
              </h2>
              <form onSubmit={handleSubmitContent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Category *</label>
                    <select
                      value={contentForm.category}
                      onChange={(e) => {
                        setContentForm(prev => ({ ...prev, category: e.target.value as MarketingContent['category'], service: '' }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
                    <select
                      value={contentForm.service}
                      onChange={(e) => setContentForm(prev => ({ ...prev, service: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={contentForm.location}
                      onChange={(e) => setContentForm(prev => ({ ...prev, location: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Downtown Mall, Main Street, Customer's Home"
                      required
                    />
                    <button
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
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Click "Use Location" to automatically fill with your current location
                  </p>
                </div>
                
                {/* Vehicle Information - Show only for Automotive and Roadside categories */}
                {(contentForm.category === 'Automotive' || contentForm.category === 'Roadside') && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-3">🚗 Vehicle Information</h4>
                    
                    {/* VIN Section */}
                    <div className="mb-4 p-3 bg-white rounded-md border border-blue-200">
                      <label className="block text-sm font-medium text-blue-700 mb-2">VIN (Vehicle Identification Number)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={vin}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            if (value.length <= 17) {
                              setVin(value);
                            }
                          }}
                          className="flex-1 border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          placeholder="Enter 17-character VIN"
                          maxLength={17}
                        />
                        <button
                          type="button"
                          onClick={startVinScanner}
                          className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                          title="Scan VIN with live camera"
                        >
                          <span>📷</span>
                          <span className="text-xs">Scan</span>
                        </button>
                        <button
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
                        </button>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        📱 Use "Scan" to photograph the VIN, then "Decode" to auto-fill vehicle details from NHTSA database
                      </p>
                    </div>

                    {/* Manual Entry Section */}
                    <div className="space-y-3">
                      <p className="text-xs text-blue-700 font-medium">Or enter manually:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">Year</label>
                          <input
                            type="text"
                            value={contentForm.vehicleYear}
                            onChange={(e) => {
                              const value = e.target.value;
                              setContentForm(prev => ({ ...prev, vehicleYear: value }));
                              // Trigger model lookup when year and make are available
                              if (value && contentForm.vehicleMake) {
                                lookupVehicleByYMM(value, contentForm.vehicleMake);
                              }
                            }}
                            className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 2023"
                            maxLength={4}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">Make</label>
                          <input
                            type="text"
                            value={contentForm.vehicleMake}
                            onChange={(e) => {
                              const value = e.target.value;
                              setContentForm(prev => ({ ...prev, vehicleMake: value }));
                              // Trigger model lookup when year and make are available
                              if (value && contentForm.vehicleYear) {
                                lookupVehicleByYMM(contentForm.vehicleYear, value);
                              }
                            }}
                            className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Honda, Ford, Toyota"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">Model</label>
                          <input
                            type="text"
                            value={contentForm.vehicleModel}
                            onChange={(e) => setContentForm(prev => ({ ...prev, vehicleModel: e.target.value }))}
                            className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Civic, F-150, Camry"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-blue-600 mt-3">
                      💡 VIN decoding uses official NHTSA database for accurate vehicle information
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photos *</label>
                  
                  {/* Social Media Format Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Social Media Format</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSocialMediaFormat('auto')}
                        className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                          socialMediaFormat === 'auto' 
                            ? 'bg-purple-100 text-purple-800 border-purple-300' 
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        🤖 Auto-detect
                      </button>
                      <button
                        type="button"
                        onClick={() => setSocialMediaFormat('instagram')}
                        className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                          socialMediaFormat === 'instagram' 
                            ? 'bg-pink-100 text-pink-800 border-pink-300' 
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        🟦 Instagram (1:1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSocialMediaFormat('facebook')}
                        className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                          socialMediaFormat === 'facebook' 
                            ? 'bg-blue-100 text-blue-800 border-blue-300' 
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        📘 Facebook (16:9)
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {socialMediaFormat === 'auto' && 'Automatically detects orientation and crops for optimal social media format'}
                      {socialMediaFormat === 'instagram' && 'Square format with smart cropping for Instagram (1080x1080)'}
                      {socialMediaFormat === 'facebook' && 'Landscape format with smart cropping for Facebook (1200x630)'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowCameraGuide(true);
                      }}
                      className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 transition-colors bg-green-50 hover:bg-green-100"
                    >
                      <div className="text-center">
                        <span className="text-2xl mb-2 block">📱</span>
                        <span className="text-sm font-medium text-green-700">Camera Guide</span>
                        <p className="text-xs text-green-600 mt-1">See positioning tips</p>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCameraCapture}
                      className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors bg-blue-50 hover:bg-blue-100"
                    >
                      <div className="text-center">
                        <span className="text-2xl mb-2 block">📸</span>
                        <span className="text-sm font-medium text-blue-700">Take Photo</span>
                        <p className="text-xs text-blue-600 mt-1">
                          {socialMediaFormat === 'instagram' && 'Square crop'}
                          {socialMediaFormat === 'facebook' && 'Landscape crop'}
                          {socialMediaFormat === 'auto' && 'Smart auto-crop'}
                        </p>
                      </div>
                    </button>
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload photos of your work (before/after shots work great!)</p>
                  
                  {contentForm.photos.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {contentForm.photos.map((photo, index) => (
                        <div key={index} className="relative inline-block">
                          <img 
                            src={photo} 
                            alt={`Upload ${index + 1}`} 
                            className="max-w-full max-h-48 object-contain rounded border bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                            onClick={() => setSelectedPhoto(photo)}
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Description *</label>
                    <button
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
                    </button>
                  </div>
                  <textarea
                    value={contentForm.description}
                    onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe the service provided, challenges encountered, work performed, tools used, resolution details, or any technical notes..."
                    required
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">Add your technical notes - AI will help format into a professional service report</p>
                    {!aiGenerating && (contentForm.service && contentForm.category) && (
                      <p className="text-xs text-purple-600">💡 Click "AI Generate" to format your notes into a professional service report</p>
                    )}
                  </div>
                </div>


                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={contentForm.customerPermission}
                      onChange={(e) => setContentForm(prev => ({ ...prev, customerPermission: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      required
                    />
                    <span className="text-sm font-medium text-yellow-800">
                      ✅ Customer gave permission to use photos and information for marketing purposes
                    </span>
                  </label>
                  <p className="text-xs text-yellow-700 mt-1">Required: Always get customer consent before submitting content</p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContentForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Specialties */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Specialties</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap gap-2">
              {tech.specialties.map(specialty => (
                <span key={specialty} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Marketing Content */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Submitted Content</h2>
          {myContent.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="flex justify-center mb-4">
                <Camera className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No marketing content submitted yet</p>
              <button
                onClick={() => setShowContentForm(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Your First Content
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myContent.map((content) => (
                <div key={content.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getCategoryIcon(content.category)} {content.service}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(content.category)}`}>
                          {content.category}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(content.status)}`}>
                          {content.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">📍 {content.location}</p>
                      {(content.category === 'Automotive' || content.category === 'Roadside') && 
                       (content.vehicleYear || content.vehicleMake || content.vehicleModel) && (
                        <p className="text-gray-600 mb-1">
                          🚗 {[content.vehicleYear, content.vehicleMake, content.vehicleModel]
                            .filter(Boolean)
                            .join(' ')}
                        </p>
                      )}
                      <p className="text-gray-600 mb-3">📋 {content.description}</p>
                      
                      {/* Marketing Details */}
                      <div className="flex flex-wrap gap-3 mb-3 text-sm">
                        {content.jobDuration && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            ⏱️ {content.jobDuration} min
                          </span>
                        )}
                      </div>
                      
                      
                      {content.photos.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-2">📸 Photos ({content.photos.length}):</p>
                          <div className="flex flex-wrap gap-2">
                            {content.photos.map((photo, index) => (
                              <img 
                                key={index}
                                src={photo} 
                                alt={`Content ${index + 1}`} 
                                className="max-h-24 max-w-32 object-contain rounded border bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                                onClick={() => setSelectedPhoto(photo)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📅 Submitted: {new Date(content.submittedAt).toLocaleDateString()}</span>
                        {content.customerPermission && <span className="text-green-600">✅ Customer Approved</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

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
              style={{ imageRendering: 'auto' }}
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold transition-all backdrop-blur-sm"
            >
              ×
            </button>
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
              📸 Original size • Click outside or × to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}