'use client';

import React, { useEffect, useState } from 'react';
import { X, MapPin, Calendar, Tag, CheckCircle, XCircle, Clock, ExternalLink, ChevronLeft, ChevronRight, MessageSquare, Mail, Send } from 'lucide-react';

interface JobPhotoDetails {
  imageUrl: string;
  jobType: 'Commercial' | 'Residential' | 'Automotive' | 'Roadside';
  location: string;
  dateUploaded: string;
  status: 'Approved' | 'Denied' | 'Pending Review';
  serviceDescription: string;
  tags?: string[];
  technicianName?: string;
  allImages?: string[];
  aiReport?: string;
  aiReportGeneratedAt?: string;
  // Additional service fields
  serviceType?: string;
  serviceDate?: string;
  serviceDuration?: number;
  satisfactionRating?: number;
  // Client fields
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  // Vehicle fields (for Automotive)
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleVin?: string;
  // Content fields
  customerConcern?: string;
  customerReaction?: string;
  specialChallenges?: string;
}

interface ImageModalProps {
  imageUrl: string;
  altText: string;
  isOpen: boolean;
  onClose: () => void;
  jobDetails?: JobPhotoDetails;
}

export default function ImageModal({ imageUrl, altText, isOpen, onClose, jobDetails }: ImageModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Get all images or fallback to single image
  const allImages = jobDetails?.allImages || [imageUrl];
  const currentImage = allImages[currentImageIndex];

  // Navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Close modal on Escape key press and handle arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset image index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      // Pre-fill phone number if available in job details
      if (jobDetails?.clientPhone) {
        setPhoneNumber(jobDetails.clientPhone);
      }
      // Set default message
      const defaultMsg = jobDetails?.clientName
        ? `Hi ${jobDetails.clientName}! Here's a photo from your recent ${jobDetails.serviceType || 'service'} at ${jobDetails.location}. Thank you for choosing Pop-A-Lock!`
        : `Here's a photo from your recent service. Thank you for choosing Pop-A-Lock!`;
      setShareMessage(defaultMsg);
    }
  }, [isOpen, jobDetails]);

  // Handle SMS share
  const handleSendSMS = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    try {
      setSending(true);

      const message = shareMessage || `Here's a photo from your recent service: ${currentImage}`;

      const response = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message,
          userType: 'franchisee',
          userId: 1,
          userName: 'Franchisee'
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Photo shared via SMS successfully!${result.testMode ? ' (Test Mode)' : ''}`);
        setShowShareDialog(false);
      } else {
        throw new Error(result.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert(`❌ Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  // If no job details provided, show simple image modal
  if (!jobDetails) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <button
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={32} />
        </button>
        <div
          className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
          />
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
          <p className="text-lg font-medium bg-black/50 px-4 py-2 rounded backdrop-blur-sm">
            {altText}
          </p>
        </div>
      </div>
    );
  }

  const getJobTypeColors = (jobType: string) => {
    switch (jobType) {
      case 'Commercial':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'Residential':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
      case 'Automotive':
        return 'bg-gradient-to-r from-gray-700 to-gray-800 text-white';
      case 'Roadside':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'Denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Pending Review':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'Denied':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'Pending Review':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div
          className="relative w-full max-w-6xl bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-8 py-4 sm:py-6 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${getJobTypeColors(jobDetails.jobType)}`}>
                  {jobDetails.jobType}
                </div>
                <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ring-1 ring-inset ${getStatusColors(jobDetails.status)}`}>
                  {getStatusIcon(jobDetails.status)}
                  <span className="hidden sm:inline">{jobDetails.status}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 flex-1 overflow-hidden">
            {/* Image Section - Compact and consistent size */}
            <div className="bg-gray-50 relative order-1 lg:order-none flex items-center justify-center p-4 sm:p-6">
              <div className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px] aspect-square">
                <img
                  src={currentImage}
                  alt={altText}
                  className="w-full h-full object-cover rounded sm:rounded-xl shadow-lg"
                />
              </div>

              {/* Navigation arrows - only show if multiple images */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm min-h-[44px] min-w-[44px] touch-manipulation"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm min-h-[44px] min-w-[44px] touch-manipulation"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs sm:text-sm px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}

              <button
                onClick={() => window.open(currentImage, '_blank')}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs sm:text-sm font-medium rounded hover:bg-white transition-all duration-200 shadow-sm min-h-[44px] touch-manipulation"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Full Size</span>
              </button>
            </div>

            {/* Details Section - Equal width now */}
            <div className="bg-white flex flex-col order-2 lg:order-none overflow-hidden">
              <div className="flex-1 p-3 sm:p-4 space-y-3 overflow-y-auto">
                {/* Job Information */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-900 border-b border-gray-100 pb-1.5">
                    Job Information
                  </h3>

                  <div className="space-y-1.5">
                    {/* Location */}
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-7 h-7 bg-blue-50 rounded flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Location</p>
                        <p className="text-xs font-semibold text-gray-900 break-words leading-tight">{jobDetails.location}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-7 h-7 bg-purple-50 rounded flex items-center justify-center">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Date Uploaded</p>
                        <p className="text-xs font-semibold text-gray-900">{jobDetails.dateUploaded}</p>
                      </div>
                    </div>

                    {/* Technician */}
                    {jobDetails.technicianName && (
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-7 h-7 bg-green-50 rounded flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Technician</p>
                          <p className="text-xs font-semibold text-gray-900">{jobDetails.technicianName}</p>
                        </div>
                      </div>
                    )}

                    {/* Service Type */}
                    {jobDetails.serviceType && (
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-7 h-7 bg-indigo-50 rounded flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Service Type</p>
                          <p className="text-xs font-semibold text-gray-900">{jobDetails.serviceType}</p>
                        </div>
                      </div>
                    )}

                    {/* Service Date */}
                    {jobDetails.serviceDate && (
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-7 h-7 bg-orange-50 rounded flex items-center justify-center">
                          <Calendar className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Service Date</p>
                          <p className="text-xs font-semibold text-gray-900">{jobDetails.serviceDate}</p>
                        </div>
                      </div>
                    )}

                    {/* Client Name */}
                    {jobDetails.clientName && (
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-7 h-7 bg-cyan-50 rounded flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Client Name</p>
                          <p className="text-xs font-semibold text-gray-900">{jobDetails.clientName}</p>
                        </div>
                      </div>
                    )}

                    {/* Client Phone */}
                    {jobDetails.clientPhone && (
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-7 h-7 bg-teal-50 rounded flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Client Phone</p>
                          <p className="text-xs font-semibold text-gray-900">{jobDetails.clientPhone}</p>
                        </div>
                      </div>
                    )}

                    {/* Client Email */}
                    {jobDetails.clientEmail && (
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-7 h-7 bg-lime-50 rounded flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Client Email</p>
                          <p className="text-xs font-semibold text-gray-900 break-words">{jobDetails.clientEmail}</p>
                        </div>
                      </div>
                    )}

                    {/* Vehicle Information (for Automotive jobs) */}
                    {jobDetails.jobType === 'Automotive' && (jobDetails.vehicleYear || jobDetails.vehicleMake || jobDetails.vehicleModel) && (
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-7 h-7 bg-gray-50 rounded flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1-1V4a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6 0a1 1 0 001 1h2a1 1 0 001-1m-6 0h6" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Vehicle</p>
                          <p className="text-xs font-semibold text-gray-900">
                            {[jobDetails.vehicleYear, jobDetails.vehicleMake, jobDetails.vehicleModel, jobDetails.vehicleColor].filter(Boolean).join(' ')}
                          </p>
                          {jobDetails.vehicleVin && (
                            <p className="text-xs text-gray-500 mt-0.5">VIN: {jobDetails.vehicleVin}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Customer Concern */}
                    {jobDetails.customerConcern && (
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-7 h-7 bg-red-50 rounded flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Customer Concern</p>
                          <p className="text-xs font-semibold text-gray-900">{jobDetails.customerConcern}</p>
                        </div>
                      </div>
                    )}

                    {/* Customer Reaction */}
                    {jobDetails.customerReaction && (
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-7 h-7 bg-emerald-50 rounded flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Customer Reaction</p>
                          <p className="text-xs font-semibold text-gray-900">{jobDetails.customerReaction}</p>
                        </div>
                      </div>
                    )}

                    {/* Special Challenges */}
                    {jobDetails.specialChallenges && (
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-7 h-7 bg-amber-50 rounded flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Special Challenges</p>
                          <p className="text-xs font-semibold text-gray-900">{jobDetails.specialChallenges}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Description */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Service Description
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                    {/* Generate comprehensive service description */}
                    <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
                      <p>
                        On {jobDetails.serviceDate || 'the service date'}, technician {jobDetails.technicianName || 'the technician'} was at {jobDetails.location} to help a customer.
                        The service category was <strong>{jobDetails.jobType}</strong> and the service type was <strong>{jobDetails.serviceType || 'service'}</strong>.
                      </p>

                      {jobDetails.clientName && (
                        <p>
                          The customer's name was <strong>{jobDetails.clientName}</strong>
                          {jobDetails.clientPhone && `, contact phone: ${jobDetails.clientPhone}`}
                          {jobDetails.clientEmail && `, email: ${jobDetails.clientEmail}`}.
                        </p>
                      )}

                      {(jobDetails.vehicleYear || jobDetails.vehicleMake || jobDetails.vehicleModel) && (
                        <p>
                          The vehicle serviced was a {jobDetails.vehicleYear && `${jobDetails.vehicleYear} `}
                          {jobDetails.vehicleMake && `${jobDetails.vehicleMake} `}
                          {jobDetails.vehicleModel && jobDetails.vehicleModel}
                          {jobDetails.vehicleColor && `, color: ${jobDetails.vehicleColor}`}
                          {jobDetails.vehicleVin && `, VIN: ${jobDetails.vehicleVin}`}.
                        </p>
                      )}

                      {jobDetails.customerConcern && (
                        <p>
                          <strong>Customer's concern:</strong> {jobDetails.customerConcern}
                        </p>
                      )}

                      <p className="whitespace-pre-wrap">
                        {jobDetails.serviceDescription}
                      </p>

                      {jobDetails.specialChallenges && (
                        <p>
                          <strong>Special challenges encountered:</strong> {jobDetails.specialChallenges}
                        </p>
                      )}

                      {jobDetails.customerReaction && (
                        <p>
                          <strong>Customer's reaction:</strong> {jobDetails.customerReaction}
                        </p>
                      )}
                    </div>

                    {/* AI Report Summary */}
                    {jobDetails.aiReport && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                            </svg>
                          </div>
                          <h5 className="text-sm font-semibold text-gray-900">AI Job Report Summary</h5>
                          {jobDetails.aiReportGeneratedAt && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              Generated {new Date(jobDetails.aiReportGeneratedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200/50">
                          <div className="prose prose-sm max-w-none">
                            {jobDetails.aiReport.split('\n').map((paragraph, index) => (
                              paragraph.trim() && (
                                <p key={index} className="text-sm text-gray-700 leading-relaxed mb-2 last:mb-0">
                                  {paragraph.trim()}
                                </p>
                              )
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {jobDetails.tags && jobDetails.tags.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <h4 className="text-sm font-semibold text-gray-900">Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {jobDetails.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 ring-1 ring-blue-200/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Share Actions Footer */}
              {jobDetails && (
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowShareDialog(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px] touch-manipulation"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Send via SMS
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${jobDetails.clientEmail}?subject=Your Service Photo&body=Here's a photo from your recent service: ${currentImage}`, '_blank')}
                    disabled={!jobDetails.clientEmail}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                  >
                    <Mail className="w-4 h-4" />
                    Send via Email
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SMS Share Dialog */}
          {showShareDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]" onClick={() => setShowShareDialog(false)}>
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Send Photo via SMS
                  </h3>
                  <button
                    onClick={() => setShowShareDialog(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      value={shareMessage}
                      onChange={(e) => setShareMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Add a custom message..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Image link will be included in the message
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowShareDialog(false)}
                    disabled={sending}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendSMS}
                    disabled={sending || !phoneNumber.trim()}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send SMS
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}