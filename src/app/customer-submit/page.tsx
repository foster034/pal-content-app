'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CheckCircle, Shield, Lock, Upload, Star, MessageSquare, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function CustomerSubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [submitCode, setSubmitCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Customer form data
  const [customerForm, setCustomerForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    jobDescription: '',
    customerFeedback: '',
    rating: 0,
    location: '',
    beforeAfterPhotos: [] as File[],
    additionalComments: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setCustomerForm(prev => ({
        ...prev,
        beforeAfterPhotos: [...prev.beforeAfterPhotos, ...newFiles]
      }));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setCustomerForm(prev => ({
      ...prev,
      beforeAfterPhotos: prev.beforeAfterPhotos.filter((_, i) => i !== index)
    }));
  };

  const handleRatingClick = (rating: number) => {
    setCustomerForm(prev => ({ ...prev, rating }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!customerForm.customerName || !customerForm.customerEmail || !customerForm.jobDescription) {
      alert('Please fill in all required fields');
      return;
    }

    // Show code dialog for submission
    setShowCodeDialog(true);
    setSubmitCode('');
    setCodeError('');
  };

  const handleCodeSubmit = async () => {
    if (!submitCode.trim()) {
      setCodeError('Please enter a submission code');
      return;
    }

    // Validate the submission code
    try {
      const response = await fetch('/api/validate-submit-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: submitCode }),
      });

      const result = await response.json();

      if (!response.ok || !result.valid) {
        setCodeError(result.error || 'Invalid submission code');
        return;
      }

      // Code is valid, proceed with submission
      setShowCodeDialog(false);
      setIsSubmitting(true);

      // Use the validated technician ID from the code
      const technicianId = result.technicianId;

      // Submit the customer content
      await submitCustomerContent(technicianId);

    } catch (error) {
      setCodeError('Error validating code. Please try again.');
      console.error('Code validation error:', error);
    }
  };

  const submitCustomerContent = async (technicianId: string) => {
    try {
      // Prepare form data for submission
      const formData = new FormData();

      // Add customer information
      formData.append('technicianId', technicianId);
      formData.append('customerName', customerForm.customerName);
      formData.append('customerEmail', customerForm.customerEmail);
      formData.append('customerPhone', customerForm.customerPhone);
      formData.append('jobDescription', customerForm.jobDescription);
      formData.append('customerFeedback', customerForm.customerFeedback);
      formData.append('rating', customerForm.rating.toString());
      formData.append('location', customerForm.location);
      formData.append('additionalComments', customerForm.additionalComments);
      formData.append('submissionType', 'customer');

      // Add photos
      customerForm.beforeAfterPhotos.forEach((file, index) => {
        formData.append(`photo_${index}`, file);
      });

      // Submit to customer content API
      const response = await fetch('/api/customer-content', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      const result = await response.json();

      setSubmitSuccess(true);
      setIsSubmitting(false);

      // Auto redirect after 5 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 5000);

    } catch (error) {
      setIsSubmitting(false);
      console.error('Submission error:', error);
      alert('There was an error submitting your content. Please try again.');
    }
  };

  const handleSubmissionSuccess = () => {
    // This won't be called directly since we intercept the submission
  };

  const handleSubmissionStart = () => {
    // This won't be called directly since we intercept the submission
  };

  const handleSubmissionError = () => {
    setIsSubmitting(false);
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Thank You!</CardTitle>
            <CardDescription className="text-lg">
              Your job submission has been received successfully. Our team will review it shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Redirecting to homepage in 5 seconds...
              </p>
              <Button
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Return to Homepage
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
                <h1 className="text-xl font-bold text-gray-900">Pop-A-Lock Job Submission</h1>
                <p className="text-sm text-gray-600">Submit photos and details for your service</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Customer Portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-blue-800">
            <Lock className="w-4 h-4" />
            <p className="text-sm">
              <strong>Secure Submission:</strong> A submission code will be required to complete your job submission.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Submit Job Details
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Share photos and information about your Pop-A-Lock service
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Your Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      type="text"
                      placeholder="Your name"
                      value={customerForm.customerName}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, customerName: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={customerForm.customerEmail}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={customerForm.customerPhone}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        id="location"
                        type="text"
                        placeholder="City, State"
                        className="pl-10"
                        value={customerForm.location}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="jobDescription">What service did we provide? *</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Please describe the service Pop-A-Lock provided (e.g., lockout assistance, lock installation, key duplication, etc.)"
                  value={customerForm.jobDescription}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, jobDescription: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label>Rate Your Experience</Label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className={`p-1 ${star <= customerForm.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {customerForm.rating > 0 ? `${customerForm.rating} star${customerForm.rating !== 1 ? 's' : ''}` : 'No rating'}
                  </span>
                </div>
              </div>

              {/* Customer Feedback */}
              <div className="space-y-2">
                <Label htmlFor="customerFeedback">Your Experience</Label>
                <Textarea
                  id="customerFeedback"
                  placeholder="Tell us about your experience with our technician and service..."
                  value={customerForm.customerFeedback}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, customerFeedback: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Photos (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Add Photos</span>
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Share photos of our work, your experience, or anything relevant to the service provided.
                </p>
              </div>

              {/* Additional Comments */}
              <div className="space-y-2">
                <Label htmlFor="additionalComments">Additional Comments</Label>
                <Textarea
                  id="additionalComments"
                  placeholder="Any other feedback or comments you'd like to share..."
                  value={customerForm.additionalComments}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, additionalComments: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Submit Content
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Submission Code Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Submission Code Required</span>
            </DialogTitle>
            <DialogDescription>
              Please enter the submission code provided by your Pop-A-Lock technician to complete your job submission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="submit-code">Submission Code</Label>
              <Input
                id="submit-code"
                type="text"
                placeholder="Enter your code"
                value={submitCode}
                onChange={(e) => {
                  setSubmitCode(e.target.value.toUpperCase());
                  setCodeError('');
                }}
                className={codeError ? 'border-red-500' : ''}
              />
              {codeError && (
                <p className="text-sm text-red-600">{codeError}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowCodeDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCodeSubmit}
              disabled={!submitCode.trim()}
            >
              Submit Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="bg-white border-t py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Pop-A-Lock • Customer Job Submission Portal
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Secure submission with validation code
          </p>
        </div>
      </div>
    </div>
  );
}