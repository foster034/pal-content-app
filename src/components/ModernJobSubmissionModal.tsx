'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  Check,
  Camera,
  MapPin,
  FileText,
  User,
  Phone,
  Mail,
  X,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface ModernJobSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  serviceCategories: any;
}

const STEPS = [
  {
    id: 1,
    title: "What service did you complete?",
    subtitle: "Service Details"
  },
  {
    id: 2,
    title: "Where was the service?",
    subtitle: "Location & Photos"
  },
  {
    id: 3,
    title: "Describe your work",
    subtitle: "Job Description"
  },
  {
    id: 4,
    title: "Customer information",
    subtitle: "Contact Details (Optional)"
  }
];

export default function ModernJobSubmissionModal({
  isOpen,
  onClose,
  onSubmit,
  serviceCategories
}: ModernJobSubmissionModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [formData, setFormData] = useState({
    category: '',
    service: '',
    location: '',
    description: '',
    photos: [] as File[],
    photoTypes: {},
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerPermission: false,
    preferredContact: 'phone' as 'phone' | 'email',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    jobDuration: undefined,
    customerConcern: '',
    customerReaction: '',
    specialChallenges: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    // Clean up object URLs to prevent memory leaks
    photoPreviews.forEach(url => URL.revokeObjectURL(url));

    // Clean up camera stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }

    setCurrentStep(1);
    setShowCamera(false);
    setFormData({
      category: '',
      service: '',
      location: '',
      description: '',
      photos: [] as File[],
      photoTypes: {},
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerPermission: false,
      preferredContact: 'phone',
      vehicleYear: '',
      vehicleMake: '',
      vehicleModel: '',
      jobDuration: undefined
    });
    setPhotoPreviews([]);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const getAvailableServices = () => {
    if (!formData.category) return [];
    return serviceCategories[formData.category] || [];
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.category && formData.service;
      case 2:
        return formData.location && formData.photos.length > 0;
      case 3:
        return formData.description.trim().length > 0;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Create preview URLs for display
    const newPreviews = files.map(file => URL.createObjectURL(file));

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));

    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    if (photoPreviews[index]) {
      URL.revokeObjectURL(photoPreviews[index]);
    }

    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoTypes: Object.fromEntries(
        Object.entries(prev.photoTypes).filter(([key]) => parseInt(key) !== index)
      )
    }));

    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const startCamera = async (cameraIndex?: number) => {
    console.log('🎥 Starting camera initialization...');
    console.log('🔒 Secure context:', window.isSecureContext);
    console.log('📱 User agent:', navigator.userAgent);

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported by this browser');
      }

      // First enumerate all devices to get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('📷 Available video devices:', videoDevices.length, videoDevices);

      if (videoDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Store available cameras for switching
      setAvailableCameras(videoDevices);

      // Determine which camera to use
      const targetCameraIndex = cameraIndex !== undefined ? cameraIndex : currentCameraIndex;
      const selectedCamera = videoDevices[targetCameraIndex] || videoDevices[0];
      console.log(`🎯 Using camera ${targetCameraIndex + 1}/${videoDevices.length}:`, selectedCamera.label || 'Unknown camera');

      // Create constraints for the selected camera
      const constraints = {
        video: {
          deviceId: selectedCamera.deviceId ? { exact: selectedCamera.deviceId } : undefined,
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        }
      };
      console.log('⚙️ Camera constraints:', constraints);

      // Stop existing stream if any
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      // Get the camera stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Camera access successful');

      setCameraStream(stream);
      setCurrentCameraIndex(targetCameraIndex);
      setShowCamera(true);

      // Wait for modal to render, then setup video
      setTimeout(() => {
        const video = document.getElementById('cameraVideo') as HTMLVideoElement;
        if (video && stream) {
          video.srcObject = stream;
          video.autoplay = true;
          video.playsInline = true;
          console.log('📹 Video element setup complete');
        }
      }, 200);

    } catch (error: any) {
      console.error('❌ Camera access error:', error);
      let errorMessage = 'Unable to access camera. ';

      // Provide specific error messages based on error type
      if (error.name === 'NotFoundError' || error.message.includes('No camera devices found')) {
        errorMessage += 'No camera was found on this device.';
      } else if (error.name === 'NotAllowedError') {
        errorMessage += 'Camera access was denied. Please check your browser permissions and allow camera access for this site.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application. Please close other camera apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Camera doesn\'t support the required resolution. Try with a different camera.';
      } else {
        errorMessage += 'Please check your camera permissions and try again.';
      }

      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    console.log('🛑 Stopping camera and returning to form');

    // Stop all tracks
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        console.log('⏹️ Stopping track:', track.kind);
        track.stop();
      });
      setCameraStream(null);
    }

    // Clear video element
    const video = document.getElementById('cameraVideo') as HTMLVideoElement;
    if (video) {
      video.srcObject = null;
    }

    // Just hide camera modal, don't close main modal
    setShowCamera(false);
  };

  const switchCamera = async () => {
    if (availableCameras.length <= 1) {
      console.log('📷 Only one camera available, cannot switch');
      return;
    }

    const nextCameraIndex = (currentCameraIndex + 1) % availableCameras.length;
    console.log(`🔄 Switching to camera ${nextCameraIndex + 1}/${availableCameras.length}:`, availableCameras[nextCameraIndex].label || 'Unknown camera');

    try {
      await startCamera(nextCameraIndex);
    } catch (error) {
      console.error('❌ Error switching camera:', error);
      alert('Failed to switch camera. Please try again.');
    }
  };

  const capturePhoto = () => {
    console.log('📸 Attempting to capture photo');

    const video = document.getElementById('cameraVideo') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!video) {
      console.error('❌ Video element not found');
      alert('Camera not properly initialized. Please try again.');
      return;
    }

    if (!ctx) {
      console.error('❌ Canvas context not available');
      alert('Unable to capture photo. Please try again.');
      return;
    }

    // Check if video is actually playing
    if (video.readyState !== 4) { // HAVE_ENOUGH_DATA
      console.error('❌ Video not ready for capture, readyState:', video.readyState);
      alert('Camera is still loading. Please wait a moment and try again.');
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('❌ Video dimensions not available');
      alert('Camera stream not ready. Please wait a moment and try again.');
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    ctx.drawImage(video, 0, 0);
    console.log(`📷 Captured frame: ${canvas.width}x${canvas.height}`);

    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const preview = URL.createObjectURL(blob);

        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, file]
        }));

        setPhotoPreviews(prev => [...prev, preview]);
        console.log('✅ Photo captured successfully and added to form');

        // Just hide camera, don't close the main modal
        setShowCamera(false);

        // Stop camera stream but keep modal open
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
      }
    }, 'image/jpeg', 0.9);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStepConfig = () => STEPS.find(step => step.id === currentStep);
  const currentStepConfig = getCurrentStepConfig();

  return (
    <>
    <Dialog open={isOpen && !showCamera} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border-0 shadow-xl rounded-2xl photo-modal mobile-optimized">
        <DialogTitle className="sr-only">Job Submission Form</DialogTitle>
        <div className="relative">
          {/* Minimalist Header */}
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1">
                {STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 transition-all duration-300 rounded-full ${
                      index < currentStep
                        ? 'w-8 bg-black'
                        : index === currentStep - 1
                        ? 'w-8 bg-black'
                        : 'w-8 bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {currentStepConfig?.title}
              </h2>
              <p className="text-sm text-gray-500">
                {currentStepConfig?.subtitle}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 pb-6 space-y-6 max-h-[60vh] overflow-y-auto">

            {/* Step 1: Service Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        category: e.target.value,
                        service: ''
                      }))}
                      className="w-full h-14 border border-gray-300 rounded-lg px-4 bg-white text-gray-900 focus:outline-none focus:border-gray-900 transition-all"
                    >
                      <option value="">Select category</option>
                      <option value="Residential">Residential</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Roadside">Roadside</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                      disabled={!formData.category}
                      className="w-full h-14 border border-gray-300 rounded-lg px-4 bg-white text-gray-900 focus:outline-none focus:border-gray-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <option value="">Select service type</option>
                      {getAvailableServices().map((service: string) => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vehicle Info for Automotive */}
                {formData.category === 'Automotive' && (
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-gray-600">Vehicle Information</p>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="Year"
                        value={formData.vehicleYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, vehicleYear: e.target.value }))}
                        className="h-14 border-gray-300 focus:border-gray-900"
                      />
                      <Input
                        placeholder="Make"
                        value={formData.vehicleMake}
                        onChange={(e) => setFormData(prev => ({ ...prev, vehicleMake: e.target.value }))}
                        className="h-14 border-gray-300 focus:border-gray-900"
                      />
                      <Input
                        placeholder="Model"
                        value={formData.vehicleModel}
                        onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
                        className="h-14 border-gray-300 focus:border-gray-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Location & Photos */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Enter service location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="h-14 border-gray-300 focus:border-gray-900 pr-12"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if ('geolocation' in navigator) {
                        try {
                          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(
                              resolve,
                              (error) => {
                                console.error('Geolocation error:', error);
                                reject(error);
                              },
                              {
                                enableHighAccuracy: true,
                                timeout: 10000,
                                maximumAge: 0
                              }
                            );
                          });

                          // Use reverse geocoding to get address
                          const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
                            {
                              headers: {
                                'User-Agent': 'PopALock-App'
                              }
                            }
                          );

                          if (!response.ok) {
                            throw new Error('Failed to get address');
                          }

                          const data = await response.json();

                          const address = data.display_name || `${position.coords.latitude}, ${position.coords.longitude}`;
                          setFormData(prev => ({ ...prev, location: address }));
                        } catch (error: any) {
                          console.error('Error getting location:', error);
                          let errorMessage = 'Unable to get your location. Please enter manually.';

                          if (error.code === 1) {
                            errorMessage = 'Location permission denied. Please enable location access and try again.';
                          } else if (error.code === 2) {
                            errorMessage = 'Location unavailable. Please check your device settings.';
                          } else if (error.code === 3) {
                            errorMessage = 'Location request timed out. Please try again.';
                          }

                          alert(errorMessage);
                        }
                      } else {
                        alert('Geolocation is not supported by your browser');
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Use my location"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Photo Capture Options */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex-1 border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-all bg-blue-50 hover:bg-blue-100 photo-upload-area touch-manipulation"
                    >
                      <Camera className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-blue-700 font-medium text-sm">Take Photo</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-all bg-gray-50 hover:bg-gray-100 photo-upload-area touch-manipulation"
                    >
                      <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium text-sm">Upload Files</p>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {/* Photo Grid */}
                  {formData.photos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">{formData.photos.length} photo{formData.photos.length !== 1 ? 's' : ''} added</p>
                      <div className="grid grid-cols-3 gap-2 photo-grid">
                        {photoPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 mobile-optimized"
                            />
                            <button
                              onClick={() => removePhoto(index)}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-gray-200 text-gray-600 rounded-full flex items-center justify-center shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity touch-manipulation clickable"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <select
                              value={formData.photoTypes[index] || 'process'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                photoTypes: { ...prev.photoTypes, [index]: e.target.value }
                              }))}
                              className="absolute bottom-1 left-1 right-1 text-xs bg-white/95 backdrop-blur-sm rounded px-1 py-0.5 border border-gray-200"
                            >
                              <option value="before">Before</option>
                              <option value="after">After</option>
                              <option value="process">Process</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Description */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    What issue was the customer experiencing?
                  </Label>
                  <Textarea
                    placeholder="e.g., Locked out of their car, needed new keys, broken lock..."
                    value={formData.customerConcern}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerConcern: e.target.value }))}
                    rows={3}
                    className="border-gray-300 rounded-lg focus:border-gray-900 resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    How did the customer react?
                  </Label>
                  <Textarea
                    placeholder="e.g., Very relieved, extremely satisfied, mentioned they'll recommend us..."
                    value={formData.customerReaction}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerReaction: e.target.value }))}
                    rows={3}
                    className="border-gray-300 rounded-lg focus:border-gray-900 resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Any unique difficulties or interesting aspects?
                  </Label>
                  <Textarea
                    placeholder="e.g., Emergency lockout at night, complex key programming, difficult access..."
                    value={formData.specialChallenges}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialChallenges: e.target.value }))}
                    rows={3}
                    className="border-gray-300 rounded-lg focus:border-gray-900 resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Work completed summary
                  </Label>
                  <Textarea
                    placeholder="Describe the work completed..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="border-gray-300 rounded-lg focus:border-gray-900 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Include technical details about the service and final outcome.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Customer Info */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <Input
                    placeholder="Customer name (optional)"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="h-14 border-gray-300 focus:border-gray-900"
                  />

                  <Input
                    placeholder="Phone number (optional)"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="h-14 border-gray-300 focus:border-gray-900"
                  />

                  <Input
                    type="email"
                    placeholder="Email address (optional)"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="h-14 border-gray-300 focus:border-gray-900"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="customerPermission"
                    checked={formData.customerPermission}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPermission: e.target.checked }))}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-gray-900 mt-0.5"
                  />
                  <label htmlFor="customerPermission" className="text-sm text-gray-600">
                    Customer has consented to use their information for marketing purposes
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 pb-6 bottom-nav-safe">
            <div className="flex items-center gap-3 button-group">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                  className="w-12 h-12 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 touch-manipulation clickable"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}

              {currentStep === STEPS.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedToNext() || isSubmitting}
                  className="flex-1 h-12 bg-black hover:bg-gray-800 text-white rounded-full font-medium touch-manipulation clickable mobile-animation"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Complete'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToNext() || isSubmitting}
                  className="flex-1 h-12 bg-black hover:bg-gray-800 text-white rounded-full font-medium touch-manipulation clickable mobile-animation"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>

            {currentStep === 4 && (
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip and submit
              </button>
            )}
          </div>
        </div>
      </DialogContent>

    </Dialog>

    {/* Camera Modal */}
    {showCamera && (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[9999] p-4">
          <div className="bg-black rounded-lg w-full max-w-md h-full max-h-[80vh] flex flex-col">

            {/* Camera Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-black">
              <h2 className="text-white text-lg font-semibold">
                📸 Take Photo
              </h2>
              <Button
                onClick={stopCamera}
                className="text-gray-400 hover:text-white text-2xl font-bold p-1 bg-transparent hover:bg-gray-700"
              >
                ×
              </Button>
            </div>

            {/* Camera View */}
            <div className="relative flex-1 flex items-center justify-center bg-black">
              <video
                id="cameraVideo"
                ref={(video) => {
                  if (video && cameraStream) {
                    video.srcObject = cameraStream;
                    video.play().catch((error) => {
                      // Ignore AbortError which happens when play() is interrupted
                      if (error.name !== 'AbortError') {
                        console.error('❌ Video play error:', error);
                      }
                    });
                  }
                }}
                className="w-full h-full object-cover rounded-lg"
                playsInline
                muted
                autoPlay
              />

              {/* Camera Grid Overlay */}
              <div className="absolute inset-4 pointer-events-none">
                <svg className="w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Rule of thirds grid */}
                  <line x1="33.33" y1="0" x2="33.33" y2="100" stroke="white" strokeWidth="0.2"/>
                  <line x1="66.66" y1="0" x2="66.66" y2="100" stroke="white" strokeWidth="0.2"/>
                  <line x1="0" y1="33.33" x2="100" y2="33.33" stroke="white" strokeWidth="0.2"/>
                  <line x1="0" y1="66.66" x2="100" y2="66.66" stroke="white" strokeWidth="0.2"/>

                  {/* Center focus point */}
                  <circle cx="50" cy="50" r="1" fill="white" opacity="0.6"/>
                </svg>
              </div>

              {/* Camera Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={stopCamera}
                    className="w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-full flex items-center justify-center transition-colors touch-manipulation"
                    title="Cancel"
                  >
                    ❌
                  </Button>

                  {availableCameras.length > 1 && (
                    <Button
                      onClick={switchCamera}
                      className="w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-full flex items-center justify-center transition-colors touch-manipulation"
                      title={`Switch Camera (${currentCameraIndex + 1}/${availableCameras.length})`}
                    >
                      🔄
                    </Button>
                  )}

                  <Button
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-white hover:bg-gray-100 text-black rounded-full flex items-center justify-center transition-all shadow-lg touch-manipulation clickable mobile-animation"
                    title="Capture Photo"
                  >
                    📷
                  </Button>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-white text-xs opacity-75">
                    Use grid lines for better composition
                    {availableCameras.length > 1 && ` • Camera ${currentCameraIndex + 1}/${availableCameras.length}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}