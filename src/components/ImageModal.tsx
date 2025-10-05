'use client';

import React, { useEffect, useState } from 'react';
import { X, MapPin, Calendar, Tag, CheckCircle, XCircle, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

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
    }
  }, [isOpen]);

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
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
          <p className="text-lg font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 flex-1 overflow-hidden">
            {/* Image Section */}
            <div className="lg:col-span-3 bg-gray-50 relative order-1 lg:order-none">
              <div className="aspect-[4/3] lg:aspect-auto lg:h-full flex items-center justify-center p-4 sm:p-8">
                <img
                  src={currentImage}
                  alt={altText}
                  className="max-w-full max-h-full object-contain rounded-lg sm:rounded-xl shadow-lg"
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
                className="absolute top-2 sm:top-4 right-2 sm:right-4 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-white transition-all duration-200 shadow-sm min-h-[44px] touch-manipulation"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Full Size</span>
              </button>
            </div>

            {/* Details Section */}
            <div className="lg:col-span-2 bg-white flex flex-col order-2 lg:order-none overflow-hidden">
              <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 overflow-y-auto">
                {/* Job Information */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2 sm:pb-3">
                    Job Information
                  </h3>

                  <div className="space-y-3 sm:space-y-4">
                    {/* Location */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Location</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{jobDetails.location}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Date Uploaded</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900">{jobDetails.dateUploaded}</p>
                      </div>
                    </div>

                    {/* Technician */}
                    {jobDetails.technicianName && (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Technician</p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">{jobDetails.technicianName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Description */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
                    Service Description
                  </h4>
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 max-h-48 sm:max-h-64 lg:max-h-96 overflow-y-auto">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                      {jobDetails.serviceDescription}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {jobDetails.tags && jobDetails.tags.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900">Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {jobDetails.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 ring-1 ring-blue-200/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Job Report */}
                {jobDetails.aiReport && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900">AI Job Report</h4>
                      {jobDetails.aiReportGeneratedAt && (
                        <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full">
                          Generated {new Date(jobDetails.aiReportGeneratedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200/50 max-h-48 sm:max-h-64 lg:max-h-96 overflow-y-auto">
                      <div className="prose prose-sm max-w-none">
                        {jobDetails.aiReport.split('\n').map((paragraph, index) => (
                          paragraph.trim() && (
                            <p key={index} className="text-gray-700 leading-relaxed mb-2 last:mb-0 text-xs sm:text-sm">
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
          </div>
        </div>
      </div>
    </div>
  );
}