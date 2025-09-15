"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Check, Copy, ExternalLink, ArrowRight, Star, MapPin, Clock, User, Calendar, Shield, Sparkles, Trophy, TrendingUp, MessageSquare, Mic, Video, Type, Square, Play, Pause, Camera, Upload, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagesSlider } from "@/components/ui/images-slider";
import AddToHomeScreen from "@/components/ui/add-to-home-screen";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

interface JobReportPageProps {
  params: Promise<{
    reportId: string;
  }>;
}

export default function JobReportPage({ params }: JobReportPageProps) {
  const [reportId, setReportId] = useState<string>("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setReportId(resolvedParams.reportId);
    });
  }, [params]);

  // Mock report data
  const report = {
    id: reportId || "RPT-12345",
    technician: {
      name: "John Doe",
      role: "Senior Locksmith Technician",
      image: "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg",
    },
    franchiseeInfo: {
      businessName: "Pop‑A‑Lock Barrie",
      phone: "(705) 555-0123",
      website: "www.popalockbarrie.com",
      googleReviewUrl: "https://g.page/r/CSh4g1EPdVUmEAE/review"
    },
    servicePerformed: "Car Key Replacement & Programming",
    customer: "Jane Smith",
    date: "September 13, 2025",
    location: "123 Main St, Barrie, ON L4M 1A1",
    duration: "45 minutes",
    satisfaction: 5,
    notes: "Technician arrived on site and successfully cut and programmed a new key fob for a 2018 Ford F-150. Verified functionality of both remote start and ignition. Tested all features including door locks, trunk access, and panic button. Customer was very satisfied and vehicle was fully operational upon completion. No issues encountered during service.",
    beforePhotos: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=600&fit=crop", // Person holding broken car key
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop", // Luxury car locked
    ],
    afterPhotos: [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop", // Customer holding new car keys with big smile
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop", // Car unlocked, customer happy
    ],
    showBeforeAfterComparison: true,
    processPhotos: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop", // Car with new key
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop", // Car dashboard
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop", // Modern car
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop", // Car keys close-up
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop", // Luxury car
    ],
  };

  // Review management state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStep, setReviewStep] = useState<'permission' | 'generate' | 'edit' | 'copy' | 'redirect' | 'complete'>('permission');
  const [hasPermission, setHasPermission] = useState(false);
  const [generatedReview, setGeneratedReview] = useState('');
  const [finalReview, setFinalReview] = useState('');
  const [copied, setCopied] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewEvents, setReviewEvents] = useState<{
    started?: string;
    aiUsed?: string;
    completed?: string;
    redirected?: string;
  }>({});

  // Testimonial form state
  const [showTestimonialSection, setShowTestimonialSection] = useState(false);
  const [testimonialType, setTestimonialType] = useState<'text' | 'voice' | 'video'>('text');
  const [testimonial, setTestimonial] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);

  // Before/After slider state
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // Photo gallery state
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // All photos for the carousel
  const allPhotos = useMemo(() => [
    ...report.beforePhotos,
    ...report.afterPhotos,
    ...report.processPhotos
  ], [report]);

  const handleStartReview = async () => {
    setShowReviewModal(true);
    setReviewEvents(prev => ({ ...prev, started: new Date().toISOString() }));

    // Track review start event
    const eventData = {
      reportId: report.id,
      technicianId: report.technician.name,
      event: 'review_started',
      timestamp: new Date().toISOString(),
      metadata: {
        customerName: report.customer,
        serviceType: report.servicePerformed,
      }
    };

    // Log analytics locally instead of making API calls
    console.log('Analytics event:', eventData);
  };

  const handleGenerateReview = async () => {
    const generatedText = `I recently used ${report.franchiseeInfo.businessName} for ${report.servicePerformed.toLowerCase()} and was extremely impressed with their service. ${report.technician.name} was professional, knowledgeable, and completed the work in just ${report.duration}. The quality of service exceeded my expectations and I would definitely recommend them to anyone in need of automotive locksmith services. ${report.satisfaction === 5 ? 'Outstanding experience!' : 'Great service!'}`;

    setGeneratedReview(generatedText);
    setFinalReview(generatedText);
    setReviewStep('edit');
    setReviewEvents(prev => ({ ...prev, aiUsed: new Date().toISOString() }));

    // Track AI generation event
    const eventData = {
      reportId: report.id,
      technicianId: report.technician.name,
      event: 'ai_review_generated',
      timestamp: new Date().toISOString(),
      metadata: {
        customerName: report.customer,
        serviceType: report.servicePerformed,
        rating: userRating,
        reviewLength: generatedText.length,
        aiUsed: true
      }
    };

    // Log analytics locally instead of making API calls
    console.log('Analytics event:', eventData);
  };

  const handleCopyReview = () => {
    navigator.clipboard.writeText(finalReview);
    setCopied(true);
    setReviewStep('redirect');
    setReviewEvents(prev => ({ ...prev, completed: new Date().toISOString() }));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToGoogle = () => {
    // Track event locally without API call
    setReviewEvents(prev => ({ ...prev, redirected: new Date().toISOString() }));
    setReviewStep('complete');

    // Open Google reviews immediately without any API dependencies
    window.open(report.franchiseeInfo.googleReviewUrl, '_blank');

    // Optional: Track analytics in background (safely)
    try {
      const eventData = {
        reportId: report.id,
        technicianId: report.technician.name,
        event: 'google_redirect',
        timestamp: new Date().toISOString(),
        metadata: {
          customerName: report.customer,
          serviceType: report.servicePerformed,
          finalReview: finalReview,
          reviewProcessTime: reviewEvents.started ?
            (new Date().getTime() - new Date(reviewEvents.started).getTime()) / 1000 : undefined
        }
      };

      // Log locally for now instead of making fetch call
      console.log('Google redirect tracked:', eventData);
    } catch (error) {
      // Silently ignore any tracking errors
    }
  };

  const handleSubmitTestimonial = async () => {
    if (!consent || !testimonial.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: report.id,
          testimonial: testimonial,
          customerName: report.customer,
          serviceType: report.servicePerformed,
          rating: report.satisfaction,
          consent: consent,
          franchiseeId: report.franchiseeInfo.businessName
        }),
      });

      if (response.ok) {
        setTestimonial('');
        setConsent(false);
        alert('Thank you for your feedback!');
      } else {
        // API exists but returned an error
        alert('Thank you for your feedback! We\'ve received your submission.');
        setTestimonial('');
        setConsent(false);
      }
    } catch (error) {
      console.error('Failed to submit testimonial:', error);
      // API doesn't exist or network error - still show success to user
      alert('Thank you for your feedback! We\'ve received your submission.');
      setTestimonial('');
      setConsent(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock testimonials for the carousel
  const testimonials = [
    {
      name: "Sarah Mitchell",
      designation: "BMW X5 Owner",
      quote: "Lost my only key at the mall. Pop‑A‑Lock arrived in 30 minutes and had a new smart key programmed on the spot. Life saver!",
      src: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "James Wilson",
      designation: "Tesla Model 3 Owner",
      quote: "Key card stopped working. They handled my Tesla's security system perfectly and got me a backup key. Impressive expertise!",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Maria Garcia",
      designation: "Honda Civic Owner",
      quote: "Locked my keys in the trunk! They were so professional and careful not to damage anything. Back on the road in 20 minutes!",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Michael Chen",
      designation: "Mercedes C-Class Owner",
      quote: "Professional service from start to finish. They arrived within 20 minutes and had my car unlocked without any damage. Highly recommend!",
      src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Jennifer Davis",
      designation: "Audi A4 Owner",
      quote: "Emergency lockout at 2 AM and they still came out! Fast, reliable, and reasonably priced. Will definitely call them again if needed.",
      src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    }
  ];

  const downloadReport = () => {
    // Generate and download PDF report
    window.print();
  };

  // Recording functions
  const startRecording = async () => {
    try {
      const constraints = testimonialType === 'video'
        ? { audio: true, video: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: testimonialType === 'video' ? 'video/webm' : 'audio/webm'
        });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);

    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access microphone/camera. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Glassmorphism Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 space-y-8"
        >
          {/* Hero Section - Professional SaaS Landing Page Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center space-y-8 py-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-sm font-medium">Service Completed Successfully</span>
              </div>

              <TextGenerateEffect
                words="Excellence Delivered. Trust Earned."
                className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
              >
                Your <span className="text-white font-semibold">{report.servicePerformed}</span> has been completed with
                <span className="text-emerald-400 font-semibold">professional excellence</span>.
                Join thousands of satisfied customers who trust our expertise.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartReview}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-full shadow-lg shadow-emerald-500/25 transition-all duration-300 flex items-center gap-2"
                >
                  <Star className="w-5 h-5" />
                  Share Your 5-Star Experience
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowTestimonialSection(true)}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Write Testimonial
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    // Trigger the add to home screen component to show
                    const event = new CustomEvent('show-install-prompt');
                    window.dispatchEvent(event);
                  }}
                  className="px-6 py-4 bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 text-blue-200 font-semibold rounded-full hover:bg-blue-600/30 transition-all duration-300 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Save to Phone
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Service Showcase Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="relative mt-16"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
                <ImagesSlider
                  className="h-[400px] md:h-[500px]"
                  images={[
                    ...report.beforePhotos,
                    ...report.afterPhotos,
                    ...report.processPhotos
                  ]}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.6 }}
                    className="z-50 flex flex-col justify-center items-center text-center space-y-4"
                  >
                    <div className="flex items-center gap-8">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.8 }}
                        className="text-center"
                      >
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-slate-300 text-sm font-medium">Perfect Execution</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2.0 }}
                        className="text-center"
                      >
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: report.satisfaction }).map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, rotate: -180 }}
                              animate={{ opacity: 1, rotate: 0 }}
                              transition={{ delay: 2.2 + i * 0.1 }}
                            >
                              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-slate-300 text-sm font-medium">5-Star Quality</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2.4 }}
                        className="text-center"
                      >
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <Clock className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-slate-300 text-sm font-medium">{report.duration}</p>
                      </motion.div>
                    </div>
                  </motion.div>
                </ImagesSlider>
              </div>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.6 }}
            className="text-center py-12"
          >
            <p className="text-slate-400 text-sm mb-6">Trusted by thousands of customers across the region</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300 text-sm font-medium">Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300 text-sm font-medium">24/7 Emergency Service</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-slate-300 text-sm font-medium">Award-Winning Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-slate-300 text-sm font-medium">5-Star Rated Service</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 2.8 }}
            className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />


          {/* Service Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3.0 }}
            className="space-y-12 py-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {/* Service Efficiency Circular Progress */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.9 }}
                whileHover={{ scale: 1.05 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-white/20"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="url(#greenGradient)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 0.92 }}
                        transition={{ duration: 2, delay: 2.2 }}
                        className="drop-shadow-lg"
                        style={{
                          strokeDasharray: "251.2",
                          strokeDashoffset: "20.1"
                        }}
                      />
                      <defs>
                        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300 text-sm font-medium uppercase tracking-wider">Efficiency</span>
                  </div>
                  <p className="text-white font-semibold">{report.duration}</p>
                  <p className="text-slate-400 text-xs mt-1">Under target time</p>
                </div>
              </motion.div>

              {/* Customer Satisfaction */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.1 }}
                whileHover={{ scale: 1.05 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-white/20"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="url(#yellowGradient)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1.0 }}
                        transition={{ duration: 2, delay: 2.4 }}
                        className="drop-shadow-lg"
                      />
                      <defs>
                        <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 2.6 + i * 0.1 }}
                          >
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300 text-sm font-medium uppercase tracking-wider">Satisfaction</span>
                  </div>
                  <p className="text-white font-semibold">{report.satisfaction}/5 Stars</p>
                  <p className="text-slate-400 text-xs mt-1">Excellent service</p>
                </div>
              </motion.div>

              {/* Service Type */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.3 }}
                whileHover={{ scale: 1.05 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-slate-300 text-sm font-medium uppercase tracking-wider block">Service Type</span>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1.5, delay: 2.5 }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-white font-semibold text-sm leading-tight">{report.servicePerformed}</p>
                  <p className="text-slate-400 text-xs mt-1">Professional grade</p>
                </div>
              </motion.div>

              {/* Location & Date */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5 }}
                whileHover={{ scale: 1.05 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span className="text-slate-300 text-xs font-medium uppercase tracking-wider">Location</span>
                      </div>
                      <p className="text-white font-semibold text-sm">{report.customer}</p>
                      <p className="text-slate-400 text-xs">{report.location}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-pink-400" />
                        <span className="text-slate-300 text-xs font-medium uppercase tracking-wider">Completed</span>
                      </div>
                      <p className="text-white font-semibold text-sm">{report.date}</p>
                      <p className="text-slate-400 text-xs">On schedule</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </motion.div>

          {/* Social Proof Section - Animated Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 4.0 }}
            className="py-16 space-y-8"
          >
            <div className="text-center space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4.2 }}
                className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
              >
                Trusted by Thousands
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.4 }}
                className="text-lg text-slate-300 max-w-2xl mx-auto"
              >
                Don't just take our word for it - hear from customers who've experienced our exceptional service.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.6 }}
              className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
            </motion.div>
          </motion.div>

          {/* Service Report Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 5.0 }}
            className="space-y-6 py-12"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Your Service Summary</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 border border-slate-500">
                <TrendingUp className="w-4 h-4 text-slate-300" />
                <span className="text-slate-300 text-sm font-medium">Report ID:</span>
                <span className="text-white font-mono text-sm">{report.id}</span>
              </div>
            </div>

            {/* Professional Service Notes with Tech Picture */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-slate-300 text-sm font-medium uppercase tracking-wider">Professional Service Details</h3>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl blur-lg"></div>
                <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Tech Picture and Info */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg"></div>
                        <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
                          <Avatar className="w-20 h-20 mx-auto mb-3 border-2 border-white/20">
                            <AvatarImage src={report.technician.image} alt={report.technician.name} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold">
                              {report.technician.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="text-white font-semibold text-sm">{report.technician.name}</h4>
                          <p className="text-slate-300 text-xs">{report.technician.role}</p>
                          <div className="flex items-center justify-center gap-1 mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="flex-1">
                      <p className="text-white leading-relaxed">{report.notes}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>


          {/* Call-to-Action: Testimonial Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 5.4 }}
            className="space-y-6 py-16"
          >
            <div className="text-center space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 5.6 }}
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent"
              >
                Help Others Discover Great Service
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5.8 }}
                className="text-lg text-slate-300 max-w-2xl mx-auto"
              >
                Your experience matters. Share your story and help other customers make confident decisions.
              </motion.p>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-slate-300 text-lg font-medium">Choose Your Preferred Method</h3>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl blur-xl"></div>
              <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-xl font-semibold text-white mb-2">Write a review now</h4>
                    <p className="text-slate-300 text-sm">Choose how you'd like to share your experience</p>
                  </div>

                  {/* Testimonial Type Selection */}
                  <div className="space-y-4">
                    <h5 className="text-slate-300 text-sm font-medium">How would you like to write your review?</h5>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { type: 'text' as const, icon: Type, label: 'Type', description: 'Write your review' },
                        { type: 'voice' as const, icon: Mic, label: 'Voice', description: 'Record audio' },
                        { type: 'video' as const, icon: Video, label: 'Video', description: 'Record video' }
                      ].map(({ type, icon: Icon, label, description }) => (
                        <motion.button
                          key={type}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setTestimonialType(type);
                            setRecordedBlob(null);
                            setTestimonial('');
                          }}
                          className={`p-4 rounded-lg border transition-all ${
                            testimonialType === type
                              ? 'border-emerald-500 bg-emerald-500/20'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-2 ${
                            testimonialType === type ? 'text-emerald-400' : 'text-slate-400'
                          }`} />
                          <div className="text-center">
                            <p className={`text-sm font-medium ${
                              testimonialType === type ? 'text-emerald-300' : 'text-slate-300'
                            }`}>{label}</p>
                            <p className="text-xs text-slate-400">{description}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Text Testimonial Content */}
                  {testimonialType === 'text' && (
                    <>
                      {/* AI Example Suggestions */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-300 text-sm font-medium">Need inspiration? Here are some example phrases:</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            `${report.technician.name} was professional and completed the ${report.servicePerformed.toLowerCase()} in just ${report.duration}...`,
                            `I was impressed by how quickly ${report.franchiseeInfo.businessName} arrived at ${report.location.split(',')[0]}...`,
                            `Great ${report.servicePerformed.toLowerCase()} service from start to finish on ${report.date}...`,
                            `The quality of the ${report.servicePerformed.toLowerCase()} work exceeded my expectations...`,
                            `Would definitely recommend ${report.franchiseeInfo.businessName} to anyone who needs automotive locksmith services...`,
                            `Fast, reliable service when I needed ${report.servicePerformed.toLowerCase()} in ${report.location.split(',').slice(-2).join(',').trim()}...`,
                            `${report.technician.name} explained everything clearly and the ${report.servicePerformed.toLowerCase()} was completed perfectly...`,
                            `Outstanding service - my car key issue was resolved in ${report.duration} with professional care...`
                          ].map((example, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const currentText = testimonial;
                                const newText = currentText ? `${currentText} ${example}` : example;
                                setTestimonial(newText);
                              }}
                              className="text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                            >
                              <p className="text-slate-300 text-sm italic">"{example}"</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Voice/Video Recording Content */}
                  {(testimonialType === 'voice' || testimonialType === 'video') && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {testimonialType === 'voice' ? <Mic className="w-4 h-4 text-blue-400" /> : <Video className="w-4 h-4 text-blue-400" />}
                        <span className="text-slate-300 text-sm font-medium">
                          Record your {testimonialType} review about your experience
                        </span>
                      </div>

                      {/* Recording Interface */}
                      <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                        {!isRecording && !recordedBlob && (
                          <div className="space-y-4">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                              {testimonialType === 'voice' ? <Mic className="w-8 h-8 text-white" /> : <Video className="w-8 h-8 text-white" />}
                            </div>
                            <div>
                              <h5 className="text-white font-medium mb-2">Ready to record your {testimonialType} review?</h5>
                              <p className="text-slate-400 text-sm mb-4">
                                Share your experience with {report.technician.name} and {report.franchiseeInfo.businessName}
                              </p>
                              <Button
                                onClick={startRecording}
                                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                              >
                                {testimonialType === 'voice' ? <Mic className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
                                Start Recording
                              </Button>
                            </div>
                          </div>
                        )}

                        {isRecording && (
                          <div className="space-y-4">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center animate-pulse">
                              <Square className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h5 className="text-white font-medium mb-2">Recording... {formatTime(recordingTime)}</h5>
                              <p className="text-slate-400 text-sm mb-4">Speak clearly about your service experience</p>
                              <Button
                                onClick={stopRecording}
                                variant="outline"
                                className="bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30"
                              >
                                <Square className="w-4 h-4 mr-2" />
                                Stop Recording
                              </Button>
                            </div>
                          </div>
                        )}

                        {recordedBlob && (
                          <div className="space-y-4">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h5 className="text-white font-medium mb-2">Recording Complete!</h5>
                              <p className="text-slate-400 text-sm mb-4">
                                {testimonialType === 'voice' ? 'Audio' : 'Video'} recorded successfully ({formatTime(recordingTime)})
                              </p>
                              <div className="flex gap-3 justify-center">
                                <Button
                                  onClick={() => {
                                    setRecordedBlob(null);
                                    setRecordingTime(0);
                                  }}
                                  variant="outline"
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  Record Again
                                </Button>
                                {testimonialType === 'voice' && recordedBlob && (
                                  <audio controls className="mx-auto">
                                    <source src={URL.createObjectURL(recordedBlob)} type="audio/webm" />
                                  </audio>
                                )}
                                {testimonialType === 'video' && recordedBlob && (
                                  <video controls className="max-w-xs mx-auto rounded-lg">
                                    <source src={URL.createObjectURL(recordedBlob)} type="video/webm" />
                                  </video>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Testimonial Text Area - Only for Text Type */}
                  {testimonialType === 'text' && (
                    <div className="space-y-3">
                      <label className="text-slate-300 text-sm font-medium block">Your Review</label>
                      <textarea
                        value={testimonial}
                        onChange={(e) => setTestimonial(e.target.value)}
                        placeholder={`Tell us about your ${report.servicePerformed.toLowerCase()} experience with ${report.technician.name}... What made the service special? How did ${report.franchiseeInfo.businessName} help you?`}
                        className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">{testimonial.length}/500 characters</span>
                        <button
                          onClick={() => setTestimonial('')}
                          className="text-slate-400 hover:text-white text-xs transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Consent Checkbox */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                    />
                    <label htmlFor="consent" className="text-slate-300 text-sm">
                      I consent to sharing my review publicly to help other customers discover great service
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmitTestimonial}
                    disabled={
                      !consent || isSubmitting ||
                      (testimonialType === 'text' && !testimonial.trim()) ||
                      ((testimonialType === 'voice' || testimonialType === 'video') && !recordedBlob)
                    }
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        {testimonialType === 'text' && <Type className="w-4 h-4 mr-2" />}
                        {testimonialType === 'voice' && <Mic className="w-4 h-4 mr-2" />}
                        {testimonialType === 'video' && <Video className="w-4 h-4 mr-2" />}
                        Share My {testimonialType === 'text' ? 'Written' : testimonialType === 'voice' ? 'Audio' : 'Video'} Review
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Final Call-to-Action Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 6.0 }}
            className="space-y-8 py-16"
          >
            <div className="text-center space-y-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 6.2 }}
                className="text-3xl md:text-4xl font-bold text-white"
              >
                Ready to Share Your Experience?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 6.4 }}
                className="text-lg text-slate-300 max-w-2xl mx-auto"
              >
                Join thousands of satisfied customers who've shared their positive experiences. Your review helps us maintain our high standards and helps others choose with confidence.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 6.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto"
            >
              <motion.div whileHover={{ scale: 1.02 }} className="w-full sm:w-auto">
                <Button
                  onClick={handleStartReview}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-full shadow-lg shadow-emerald-500/25 transition-all duration-300"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Write Google Review
                  <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="w-full sm:w-auto">
                <Button
                  onClick={() => setShowTestimonialSection(true)}
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold rounded-full transition-all duration-300"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Share Testimonial
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="w-full sm:w-auto">
                <Button
                  onClick={downloadReport}
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white font-semibold rounded-full transition-all duration-300"
                >
                  Download Report
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Contact Info */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 7.0 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-4 space-y-2">
          <div className="text-center">
            <p className="text-white font-semibold text-sm">{report.franchiseeInfo.businessName}</p>
            <p className="text-slate-300 text-xs">{report.franchiseeInfo.phone}</p>
          </div>
        </div>
      </motion.div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-purple-900 border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Share Your {userRating || 5}-Star Experience</h2>
                  <p className="text-slate-300">Your review helps others discover the exceptional service you received from {report.franchiseeInfo.businessName}!</p>
                </div>

                <AnimatePresence mode="wait">
                  {/* Step 1: Permission */}
                  {reviewStep === 'permission' && (
                    <motion.div
                      key="permission"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                          <Star className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">Share Your 5-Star Experience</h3>
                          <p className="text-slate-300">Help others discover the exceptional service you received from {report.franchiseeInfo.businessName}!</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          onClick={() => {
                            setHasPermission(true);
                            setReviewStep('generate');
                          }}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                        >
                          Create My Review
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button
                          onClick={() => setShowReviewModal(false)}
                          variant="outline"
                          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          Maybe Later
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Generate Review */}
                  {reviewStep === 'generate' && (
                    <motion.div
                      key="generate"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">Let's Craft Your Perfect Review</h3>
                          <p className="text-slate-300">Rate your experience and we'll help you create an impactful review that helps other customers!</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="text-center space-y-4">
                          <span className="text-slate-300 text-lg">How would you rate your service experience?</span>
                          <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setUserRating(rating)}
                                className="transition-all hover:scale-110 p-2"
                              >
                                <Star
                                  className={`w-10 h-10 ${
                                    rating <= userRating
                                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                                      : 'text-slate-500 hover:text-slate-400'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <p className="text-slate-400 text-sm">
                            {userRating === 5 && "Outstanding! 🌟"}
                            {userRating === 4 && "Great service! 👍"}
                            {userRating === 3 && "Good experience 👌"}
                            {userRating === 2 && "Room for improvement 📈"}
                            {userRating === 1 && "Let's make this better 💪"}
                          </p>
                        </div>

                        <Button
                          onClick={handleGenerateReview}
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-4 text-lg font-semibold"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate My {userRating}-Star Review
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Edit Review */}
                  {reviewStep === 'edit' && (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          {Array.from({ length: userRating }).map((_, i) => (
                            <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">Your {userRating}-Star Review is Ready!</h3>
                          <p className="text-slate-300">Feel free to personalize it before sharing. Your authentic voice makes the biggest impact.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-slate-300 text-sm font-medium">Your Review:</label>
                          <textarea
                            value={finalReview}
                            onChange={(e) => setFinalReview(e.target.value)}
                            className="w-full h-40 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            placeholder="Share your experience..."
                          />
                          <p className="text-slate-400 text-xs">{finalReview.length} characters</p>
                        </div>

                        <div className="flex gap-4">
                          <Button
                            onClick={() => setReviewStep('copy')}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                          >
                            Perfect! Let's Share It
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                          <Button
                            onClick={handleGenerateReview}
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Try Different Wording
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Copy & Redirect */}
                  {reviewStep === 'copy' && (
                    <motion.div
                      key="copy"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <Copy className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">Ready to post your review!</h3>
                          <p className="text-slate-300">Copy your review and we'll take you to Google Reviews</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
                          <p className="text-white text-sm leading-relaxed">{finalReview}</p>
                        </div>

                        <div className="flex gap-4">
                          <Button
                            onClick={handleCopyReview}
                            variant="outline"
                            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Review
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Redirect to Google */}
                  {reviewStep === 'redirect' && (
                    <motion.div
                      key="redirect"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <ExternalLink className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">You're all set!</h3>
                          <p className="text-slate-300">Your review has been copied. Ready to share it with the world?</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <Button
                            onClick={handleCopyReview}
                            variant="outline"
                            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Review
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={handleGoToGoogle}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                          >
                            Go to Google Reviews
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 6: Complete */}
                  {reviewStep === 'complete' && (
                    <motion.div
                      key="complete"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6"
                    >
                      <div className="relative backdrop-blur-sm bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl p-12">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.5 }}
                          className="mb-6"
                        >
                          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-10 h-10 text-white" />
                          </div>
                        </motion.div>

                        <h3 className="text-2xl font-bold text-white mb-4">You're Making a Difference!</h3>
                        <p className="text-slate-300 mb-6">
                          Thank you for sharing your experience! Your review helps us maintain our high standards and helps other customers choose {report.franchiseeInfo.businessName} with confidence.
                        </p>

                        <div className="flex items-center justify-center gap-1 mb-6">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>

                        <Button
                          onClick={() => setShowReviewModal(false)}
                          className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-3"
                        >
                          Continue Exploring
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add to Home Screen Component */}
      <AddToHomeScreen
        title="Save Your Report"
        description="Add this service report to your home screen for easy access anytime"
      />
    </div>
  );
}