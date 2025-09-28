'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import JobSubmissionForm from '@/components/JobSubmissionForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function QuickSubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Get technician ID from URL params or localStorage
  const techId = searchParams.get('tech_id') || localStorage.getItem('technicianId');

  useEffect(() => {
    // If no tech ID, redirect to tech auth
    if (!techId) {
      router.push('/tech-auth');
      return;
    }

    // Store tech ID in localStorage for future quick access
    if (searchParams.get('tech_id')) {
      localStorage.setItem('technicianId', searchParams.get('tech_id')!);
    }
  }, [techId, router, searchParams]);

  const handleSubmissionSuccess = () => {
    setSubmitSuccess(true);
    setIsSubmitting(false);

    // Auto redirect to dashboard after 3 seconds
    setTimeout(() => {
      router.push('/tech/dashboard');
    }, 3000);
  };

  const handleSubmissionStart = () => {
    setIsSubmitting(true);
  };

  const handleSubmissionError = () => {
    setIsSubmitting(false);
  };

  if (!techId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Authentication Required</CardTitle>
            <CardDescription>
              Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Job Submitted!</CardTitle>
            <CardDescription className="text-lg">
              Your job has been submitted successfully. AI report is being generated in the background.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Redirecting to dashboard in 3 seconds...
              </p>
              <Button
                onClick={() => router.push('/tech/dashboard')}
                className="w-full"
              >
                Go to Dashboard Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Quick Submit</h1>
                <p className="text-sm text-gray-600">Submit your job quickly and easily</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/tech/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Submit New Job
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Capture photos and details of your completed work
            </CardDescription>
          </CardHeader>

          <CardContent>
            <JobSubmissionForm
              isVisible={true}
              onSubmissionSuccess={handleSubmissionSuccess}
              onSubmissionStart={handleSubmissionStart}
              onSubmissionError={handleSubmissionError}
              isSubmitting={isSubmitting}
              technicianId={techId}
            />
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-white border-t py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Pop-A-Lock Content Management • Quick Submit
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Bookmark this page for quick access to job submission
          </p>
        </div>
      </div>
    </div>
  );
}