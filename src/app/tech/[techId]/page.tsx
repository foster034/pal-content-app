'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

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
  const [contentForm, setContentForm] = useState({
    category: '' as MarketingContent['category'] | '',
    service: '',
    location: '',
    description: '',
    photos: [] as string[],
    customerPermission: false,
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: ''
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
      vehicleModel: contentForm.vehicleModel || undefined
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
      vehicleModel: ''
    });
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
          const img = new Image();
          img.onload = () => {
            // Create canvas for optimization
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Get optimal dimensions based on selected format
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
                // Auto-detect best format based on original image orientation
                if (img.width > img.height * 1.3) {
                  // Landscape - use Facebook format
                  targetWidth = 1200;
                  targetHeight = 630;
                } else {
                  // Square or portrait - use Instagram format
                  targetWidth = targetHeight = 1080;
                }
                break;
            }
            
            let { width, height } = img;
            
            // Calculate new dimensions maintaining aspect ratio
            const aspectRatio = width / height;
            const targetAspectRatio = targetWidth / targetHeight;
            
            if (aspectRatio > targetAspectRatio) {
              // Image is wider than target
              width = targetWidth;
              height = targetWidth / aspectRatio;
            } else {
              // Image is taller than target
              height = targetHeight;
              width = targetHeight * aspectRatio;
            }

            canvas.width = width;
            canvas.height = height;

            // Apply image enhancements for social media
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Draw and compress with optimal quality
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
            
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

  const handleCameraCapture = () => {
    // Trigger camera with specific settings for social media
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.capture = 'environment'; // Use back camera
    fileInput.onchange = (e) => handlePhotoUpload(e as any);
    fileInput.click();
  };

  const removePhoto = (index: number) => {
    setContentForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
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
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📸 Submit Content
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

        {/* Content Form Modal */}
        {showContentForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">📸 Submit Marketing Content</h2>
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
                  <input
                    type="text"
                    value={contentForm.location}
                    onChange={(e) => setContentForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Downtown Mall, Main Street, Customer's Home"
                    required
                  />
                </div>
                
                {/* Vehicle Information - Show only for Automotive and Roadside categories */}
                {(contentForm.category === 'Automotive' || contentForm.category === 'Roadside') && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-3">🚗 Vehicle Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Year</label>
                        <input
                          type="text"
                          value={contentForm.vehicleYear}
                          onChange={(e) => setContentForm(prev => ({ ...prev, vehicleYear: e.target.value }))}
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
                          onChange={(e) => setContentForm(prev => ({ ...prev, vehicleMake: e.target.value }))}
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
                    <p className="text-xs text-blue-600 mt-2">
                      💡 Vehicle details help with marketing content and service documentation
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
                      {socialMediaFormat === 'auto' && 'Automatically choose best format based on photo orientation'}
                      {socialMediaFormat === 'instagram' && 'Square format optimized for Instagram posts (1080x1080)'}
                      {socialMediaFormat === 'facebook' && 'Landscape format optimized for Facebook posts (1200x630)'}
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
                          {socialMediaFormat === 'instagram' && 'Square format'}
                          {socialMediaFormat === 'facebook' && 'Landscape format'}
                          {socialMediaFormat === 'auto' && 'Auto-optimized'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={contentForm.description}
                    onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe the service provided, customer satisfaction, any special details for marketing..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Include details that would be good for marketing content</p>
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
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📸 Submit Content
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
              <div className="text-gray-400 text-4xl mb-4">📸</div>
              <p className="text-gray-500 mb-4">No marketing content submitted yet</p>
              <button
                onClick={() => setShowContentForm(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📸 Submit Your First Content
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
              style={{ imageRendering: 'high-quality' }}
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