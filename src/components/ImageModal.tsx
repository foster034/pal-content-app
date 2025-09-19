'use client';

import React, { useEffect } from 'react';
import { X, MapPin, Calendar, Tag, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

interface JobPhotoDetails {
  imageUrl: string;
  jobType: 'Commercial' | 'Residential' | 'Automotive' | 'Roadside';
  location: string;
  dateUploaded: string;
  status: 'Approved' | 'Denied' | 'Pending Review';
  serviceDescription: string;
  tags?: string[];
  technicianName?: string;
}

interface ImageModalProps {
  imageUrl: string;
  altText: string;
  isOpen: boolean;
  onClose: () => void;
  jobDetails?: JobPhotoDetails;
}

export default function ImageModal({ imageUrl, altText, isOpen, onClose, jobDetails }: ImageModalProps) {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getJobTypeColors(jobDetails.jobType)}`}>
                  {jobDetails.jobType}
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-inset ${getStatusColors(jobDetails.status)}`}>
                  {getStatusIcon(jobDetails.status)}
                  {jobDetails.status}
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 max-h-[75vh] overflow-hidden">
            {/* Image Section */}
            <div className="lg:col-span-3 bg-gray-50 relative">
              <div className="aspect-[4/3] flex items-center justify-center p-8">
                <img
                  src={imageUrl}
                  alt={altText}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                />
              </div>
              <button
                onClick={() => window.open(imageUrl, '_blank')}
                className="absolute top-4 right-4 inline-flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium rounded-lg hover:bg-white transition-all duration-200 shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Full Size
              </button>
            </div>

            {/* Details Section */}
            <div className="lg:col-span-2 bg-white flex flex-col max-h-[75vh]">
              <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-[calc(75vh-120px)]">
                {/* Job Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-3">
                    Job Information
                  </h3>

                  <div className="space-y-4">
                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Location</p>
                        <p className="text-base font-semibold text-gray-900 truncate">{jobDetails.location}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date Uploaded</p>
                        <p className="text-base font-semibold text-gray-900">{jobDetails.dateUploaded}</p>
                      </div>
                    </div>

                    {/* Technician */}
                    {jobDetails.technicianName && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Technician</p>
                          <p className="text-base font-semibold text-gray-900">{jobDetails.technicianName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Description */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
                    Service Description
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                      {jobDetails.serviceDescription}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {jobDetails.tags && jobDetails.tags.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-gray-400" />
                      <h4 className="text-lg font-semibold text-gray-900">Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {jobDetails.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 ring-1 ring-blue-200/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-100 bg-gray-50 px-8 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Job #{imageUrl.split('/').pop()?.split('.')[0]?.substring(0, 8) || 'Unknown'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(imageUrl, '_blank')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm border border-gray-200"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Original
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}