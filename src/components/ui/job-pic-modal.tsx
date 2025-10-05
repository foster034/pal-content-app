'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight, MapPin, Clock, User, Phone, Mail } from "lucide-react";
import Image from "next/image";

export interface JobPicData {
  id: number;
  customer: string;
  customerPhone?: string;
  customerEmail?: string;
  technician: string;
  techPhone?: string;
  service: string;
  status: 'Pending' | 'Approved' | 'Denied';
  submittedDate: string;
  completedDate?: string;
  location: string;
  description?: string;
  images: string[];
  workPerformed?: string;
  materials?: string[];
  timeSpent?: string;
  cost?: string;
  notes?: string;
}

interface JobPicModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobData: JobPicData | null;
  onApprove?: (id: number) => void;
  onDeny?: (id: number) => void;
}

export function JobPicModal({ 
  isOpen, 
  onClose, 
  jobData, 
  onApprove, 
  onDeny 
}: JobPicModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !jobData) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === jobData.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? jobData.images.length - 1 : prev - 1
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Denied': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Job Details
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {jobData.service} for {jobData.customer}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(jobData.status)}>
              {jobData.status}
            </Badge>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Gallery */}
          {jobData.images.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <Image
                      src={jobData.images[currentImageIndex]}
                      alt={`Job photo ${currentImageIndex + 1}`}
                      width={800}
                      height={450}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {jobData.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  {jobData.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-black bg-opacity-50 rounded-full px-3 py-1">
                        <span className="text-white text-sm">
                          {currentImageIndex + 1} / {jobData.images.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {jobData.images.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto">
                    {jobData.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex 
                            ? 'border-blue-500' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-gray-100">{jobData.customer}</span>
                  </div>
                  {jobData.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">{jobData.customerPhone}</span>
                    </div>
                  )}
                  {jobData.customerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">{jobData.customerEmail}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">{jobData.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technician Information */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Technician Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-gray-100">{jobData.technician}</span>
                  </div>
                  {jobData.techPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">{jobData.techPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Submitted: {new Date(jobData.submittedDate).toLocaleDateString()}
                    </span>
                  </div>
                  {jobData.completedDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Completed: {new Date(jobData.completedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Details */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Job Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service Type
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{jobData.service}</p>
                </div>
                {jobData.timeSpent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time Spent
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">{jobData.timeSpent}</p>
                  </div>
                )}
                {jobData.cost && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cost
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">{jobData.cost}</p>
                  </div>
                )}
              </div>

              {jobData.description && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service Description
                  </label>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{jobData.description}</p>
                </div>
              )}
              
              {jobData.workPerformed && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Work Performed
                  </label>
                  <p className="text-gray-600 dark:text-gray-300">{jobData.workPerformed}</p>
                </div>
              )}

              {jobData.materials && jobData.materials.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Materials Used
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {jobData.materials.map((material, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {jobData.notes && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <p className="text-gray-600 dark:text-gray-300">{jobData.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {jobData.status === 'Pending' && (onApprove || onDeny) && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {onDeny && (
                <Button 
                  variant="outline" 
                  onClick={() => onDeny(jobData.id)}
                  className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                >
                  Deny for Marketing
                </Button>
              )}
              {onApprove && (
                <Button 
                  onClick={() => onApprove(jobData.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve for Marketing
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}