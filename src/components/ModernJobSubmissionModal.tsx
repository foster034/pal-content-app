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
    jobDuration: undefined
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    // Clean up object URLs to prevent memory leaks
    photoPreviews.forEach(url => URL.revokeObjectURL(url));

    setCurrentStep(1);
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border-0 shadow-xl rounded-2xl">
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
                <div>
                  <Input
                    placeholder="Enter service location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="h-14 border-gray-300 focus:border-gray-900"
                  />
                </div>

                <div className="space-y-4">
                  {/* Upload Area */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-all bg-gray-50 hover:bg-gray-100"
                  >
                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Add photos</p>
                    <p className="text-gray-400 text-sm mt-1">Upload before, after, and process photos</p>
                  </button>

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
                      <div className="grid grid-cols-3 gap-2">
                        {photoPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => removePhoto(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-200 text-gray-600 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
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
                <Textarea
                  placeholder="Describe the work completed..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={8}
                  className="border-gray-300 rounded-lg focus:border-gray-900 resize-none"
                />
                <p className="text-xs text-gray-500">
                  Include details about the service, challenges faced, and the final outcome.
                </p>
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
          <div className="px-6 pb-6">
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                  className="w-12 h-12 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}

              {currentStep === STEPS.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedToNext() || isSubmitting}
                  className="flex-1 h-12 bg-black hover:bg-gray-800 text-white rounded-full font-medium"
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
                  className="flex-1 h-12 bg-black hover:bg-gray-800 text-white rounded-full font-medium"
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
  );
}