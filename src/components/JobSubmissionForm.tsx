'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface JobSubmissionFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function JobSubmissionForm({ onClose, onSuccess }: JobSubmissionFormProps) {
  const router = useRouter();

  const handleNavigateToDashboard = () => {
    if (onClose) {
      onClose();
    }
    // Navigate to dashboard where the full form exists
    router.push('/tech/dashboard?openForm=true');
  };

  return (
    <div className="p-6 text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900">Submit New Job</h3>

      <p className="text-sm text-gray-600">
        To access the full job submission form with camera features, AI assistance, and location detection,
        please use the dashboard.
      </p>

      <button
        onClick={handleNavigateToDashboard}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Full Submission Form
      </button>

      <p className="text-xs text-gray-500">
        The dashboard has all the advanced features including:
        • Camera with grid overlay
        • AI-powered description generation
        • Automatic location detection
        • VIN scanner for vehicles
        • Progressive form steps
      </p>
    </div>
  );
}