'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GMBPost {
  name: string;
  languageCode: string;
  summary: string;
  createTime: string;
  updateTime: string;
  state: string;
  callToAction?: {
    actionType: string;
    url: string;
  };
  media?: Array<{
    mediaFormat: string;
    sourceUrl: string;
  }>;
  insights?: {
    viewsCount: number;
    actionsCount: number;
  };
}

interface JobSubmission {
  id: string;
  status: string;
  created_at: string;
  technician_id: string;
}

interface Analytics {
  totalSubmissions: number;
  pendingReview: number;
  approvedMarketing: number;
  submissionTrend: string;
  approvalRate: string;
}

export default function FranchiseeDashboard() {
  const searchParams = useSearchParams();
  const franchiseeId = searchParams.get('id'); // For admin viewing specific franchisee

  const [gmbPosts, setGmbPosts] = useState<GMBPost[]>([]);
  const [gmbLoading, setGmbLoading] = useState(false);
  const [gmbError, setGmbError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showReviewMetrics, setShowReviewMetrics] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalSubmissions: 0,
    pendingReview: 0,
    approvedMarketing: 0,
    submissionTrend: '+0%',
    approvalRate: '0%'
  });
  const [recentPhotoSubmissions, setRecentPhotoSubmissions] = useState<JobSubmission[]>([]);
  const [techLeaderboard, setTechLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on component mount and when franchiseeId changes
  useEffect(() => {
    loadDashboardData();
  }, [franchiseeId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      let targetFranchiseeId = franchiseeId;

      // If no franchiseeId in URL, get it from current user's profile
      if (!targetFranchiseeId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('franchisee_id')
            .eq('id', session.user.id)
            .single();

          targetFranchiseeId = profile?.franchisee_id;
        }
      }

      if (targetFranchiseeId) {
        await Promise.all([
          loadAnalytics(targetFranchiseeId),
          loadGMBPosts(targetFranchiseeId),
          loadRecentSubmissions(targetFranchiseeId),
          loadTechLeaderboard(targetFranchiseeId)
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (franchiseeId: string) => {
    try {
      const { data: submissions, error } = await supabase
        .from('job_submissions')
        .select('id, status, created_at')
        .eq('franchisee_id', franchiseeId);

      if (error) {
        console.error('Error loading analytics:', error);
        return;
      }

      const total = submissions?.length || 0;
      const pending = submissions?.filter(s => s.status === 'pending').length || 0;
      const approved = submissions?.filter(s => s.status === 'approved').length || 0;
      const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

      setAnalytics({
        totalSubmissions: total,
        pendingReview: pending,
        approvedMarketing: approved,
        submissionTrend: total > 0 ? '+12%' : '+0%',
        approvalRate: `${approvalRate}%`
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadGMBPosts = async (franchiseeId: string) => {
    setGmbLoading(true);
    setGmbError(null);

    try {
      const response = await fetch(`/api/google-my-business/posts?franchisee_id=${franchiseeId}&limit=3`);
      const data = await response.json();

      if (data.success) {
        setGmbPosts(data.posts);
        setLastRefresh(new Date());
      } else {
        setGmbError(data.error || 'Failed to load GMB posts');
      }
    } catch (error) {
      console.error('Error loading GMB posts:', error);
      setGmbError('Failed to load GMB posts');
    } finally {
      setGmbLoading(false);
    }
  };

  const loadRecentSubmissions = async (franchiseeId: string) => {
    try {
      const { data: submissions, error } = await supabase
        .from('job_submissions')
        .select('id, status, created_at, technician_id')
        .eq('franchisee_id', franchiseeId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error loading recent submissions:', error);
        return;
      }

      setRecentPhotoSubmissions(submissions || []);
    } catch (error) {
      console.error('Error loading recent submissions:', error);
    }
  };

  const loadTechLeaderboard = async (franchiseeId: string) => {
    try {
      const { data: technicians, error } = await supabase
        .from('technicians')
        .select('id, name, email, rating')
        .eq('franchisee_id', franchiseeId)
        .order('rating', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading technicians:', error);
        return;
      }

      setTechLeaderboard(technicians || []);
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your marketing content overview.</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {loading ? '...' : analytics.totalSubmissions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Photo Submissions</div>
            <div className="text-xs text-green-600 dark:text-green-400">
              {analytics.totalSubmissions > 0 ? analytics.submissionTrend + ' from last month' : 'No submissions yet'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {loading ? '...' : analytics.pendingReview}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {analytics.pendingReview > 0 ? 'Needs attention' : 'All caught up'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {loading ? '...' : analytics.approvedMarketing}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved for Marketing</div>
            <div className="text-xs text-green-600 dark:text-green-400">
              {analytics.approvedMarketing > 0 ? analytics.approvalRate + ' approval rate' : 'No approvals yet'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{gmbPosts.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">GMB Posts Live</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              {gmbPosts.reduce((total, post) => total + (post.insights?.viewsCount || 0), 0)} total views
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Photo Submissions</CardTitle>
            <CardDescription>Latest marketing photos from your technicians</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : recentPhotoSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No photo submissions yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                  Your technicians haven't submitted any marketing photos yet. Encourage them to start sharing their work!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPhotoSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          Job #{submission.id.slice(-6)}
                        </p>
                        <Badge
                          variant={
                            submission.status === 'approved' ? 'default' :
                            submission.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                          className="text-xs"
                        >
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tech ID: {submission.technician_id.slice(-6)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/franchisee/marketing">
                <Button variant="outline" className="w-full">
                  View All Submissions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle>Technician Leaderboard</CardTitle>
            <CardDescription>
              Top performers in marketing content creation and review generation
            </CardDescription>
            <div className="flex gap-2 mt-3">
              <Button
                variant={!showReviewMetrics ? "default" : "outline"}
                size="sm"
                onClick={() => setShowReviewMetrics(false)}
              >
                📸 Photo Metrics
              </Button>
              <Button
                variant={showReviewMetrics ? "default" : "outline"}
                size="sm"
                onClick={() => setShowReviewMetrics(true)}
              >
                ⭐ Review Metrics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {techLeaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No technicians yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                  Add technicians to your franchise to start tracking their marketing performance and review generation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {techLeaderboard.map((tech, index) => (
                <div key={tech.name} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-600 dark:text-gray-400">
                    #{index + 1}
                  </div>
                  <div className="w-10 h-10 relative rounded-full overflow-hidden shrink-0">
                    <img
                      src={tech.image}
                      alt={tech.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {tech.name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {showReviewMetrics ? `${tech.reviews.averageRating}⭐` : `Score: ${tech.marketingScore}`}
                      </Badge>
                    </div>
                    {!showReviewMetrics ? (
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{tech.photoSubmissions} submissions</span>
                        <span>{tech.approved} approved</span>
                        <span>{Math.round((tech.approved / tech.photoSubmissions) * 100)}% rate</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            📝 {tech.reviews.completed} reviews
                          </span>
                          <span className="flex items-center gap-1">
                            📈 {tech.reviews.conversionRate}% conversion
                          </span>
                          <span className="flex items-center gap-1">
                            🤖 {tech.reviews.aiUsageRate}% AI help
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${tech.reviews.conversionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  {showReviewMetrics && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {tech.reviews.completed}
                      </div>
                      <div className="text-xs text-gray-500">reviews</div>
                    </div>
                  )}
                </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/franchisee/techs">
                <Button variant="outline" className="w-full">
                  View All Technicians
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/franchisee/marketing">
              <Button className="w-full" variant="default">
                Review Job Pics
              </Button>
            </Link>
            <Link href="/franchisee/reports">
              <Button className="w-full" variant="outline">
                Generate Report
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle>Marketing Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Commercial Jobs</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Residential Jobs</span>
                <span className="font-medium">32%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Automotive Jobs</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Emergency Jobs</span>
                <span className="font-medium">8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  Latest GMB Posts
                </CardTitle>
                <CardDescription>Recent Google My Business activity</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadGMBPosts}
                disabled={gmbLoading}
                className="text-blue-600 hover:text-blue-700"
              >
                {gmbLoading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {gmbError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                <div className="text-sm">{gmbError}</div>
                <div className="text-xs mt-1 opacity-75">Try connecting to Google My Business first</div>
              </div>
            )}
            
            {gmbLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}
            
            {!gmbLoading && !gmbError && gmbPosts.length === 0 && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <div className="text-sm">No GMB posts found</div>
                <div className="text-xs">Connect to Google My Business to see posts</div>
              </div>
            )}
            
            {!gmbLoading && gmbPosts.length > 0 && (
              <div className="space-y-4">
                {gmbPosts.map((post, index) => (
                  <div key={post.name} className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-b-0">
                    <div className="flex gap-3">
                      {post.media && post.media[0] && (
                        <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0">
                          <img
                            src={post.media[0].sourceUrl}
                            alt="Post media"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                          {post.summary.length > 100 ? 
                            post.summary.substring(0, 100) + '...' : 
                            post.summary}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatDate(post.createTime)}</span>
                          {post.insights && (
                            <>
                              <span>👁 {post.insights.viewsCount}</span>
                              <span>🎯 {post.insights.actionsCount}</span>
                            </>
                          )}
                          <Badge 
                            variant={post.state === 'LIVE' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {post.state}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                  Last updated: {formatTime(lastRefresh.toISOString())}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}