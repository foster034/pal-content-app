'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClientComponentClient } from '@/lib/supabase-client';

const supabase = createClientComponentClient();

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const franchiseeId = searchParams.get('id');

  const [selectedPeriod, setSelectedPeriod] = useState<string>('This Month');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    approvedJobs: 0,
    customerSatisfaction: 0,
    totalPhotos: 0
  });
  const [jobsByType, setJobsByType] = useState<any[]>([]);
  const [techPerformance, setTechPerformance] = useState<any[]>([]);

  useEffect(() => {
    loadReportsData();
  }, [franchiseeId, selectedPeriod]);

  const loadReportsData = async () => {
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
          loadJobMetrics(targetFranchiseeId),
          loadJobsByType(targetFranchiseeId),
          loadTechPerformance(targetFranchiseeId)
        ]);
      }
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobMetrics = async (franchiseeId: string) => {
    try {
      const response = await fetch(`/api/job-submissions?franchiseeId=${franchiseeId}&_t=${Date.now()}`, {
        cache: 'no-store'
      });

      if (!response.ok) return;

      const submissions = await response.json();
      const total = submissions?.length || 0;
      const completed = submissions?.filter((s: any) => s.status === 'completed').length || 0;
      const pending = submissions?.filter((s: any) => s.status === 'pending').length || 0;
      const approved = submissions?.filter((s: any) => s.status === 'approved').length || 0;

      // Calculate total photos
      const totalPhotos = submissions?.reduce((sum: number, s: any) => {
        const media = s.media || {};
        const photoCount = [
          ...(media.beforePhotos || []),
          ...(media.afterPhotos || []),
          ...(media.processPhotos || [])
        ].length;
        return sum + photoCount;
      }, 0) || 0;

      // Calculate average rating
      const ratedJobs = submissions?.filter((s: any) => s.rating && s.rating > 0) || [];
      const avgRating = ratedJobs.length > 0
        ? (ratedJobs.reduce((sum: number, s: any) => sum + s.rating, 0) / ratedJobs.length).toFixed(1)
        : '0.0';

      setMetrics({
        totalJobs: total,
        completedJobs: completed,
        pendingJobs: pending,
        approvedJobs: approved,
        customerSatisfaction: parseFloat(avgRating),
        totalPhotos
      });
    } catch (error) {
      console.error('Error loading job metrics:', error);
    }
  };

  const loadJobsByType = async (franchiseeId: string) => {
    try {
      const response = await fetch(`/api/job-submissions?franchiseeId=${franchiseeId}&_t=${Date.now()}`, {
        cache: 'no-store'
      });

      if (!response.ok) return;

      const submissions = await response.json();
      const total = submissions?.length || 0;

      // Count jobs by category
      const residential = submissions?.filter((s: any) => s.job_category?.toLowerCase().includes('residential')).length || 0;
      const commercial = submissions?.filter((s: any) => s.job_category?.toLowerCase().includes('commercial')).length || 0;
      const automotive = submissions?.filter((s: any) => s.job_category?.toLowerCase().includes('automotive') || s.job_category?.toLowerCase().includes('auto')).length || 0;
      const emergency = submissions?.filter((s: any) => s.job_category?.toLowerCase().includes('emergency')).length || 0;

      setJobsByType([
        { type: 'Residential', count: residential, percentage: total > 0 ? Math.round((residential / total) * 100) : 0 },
        { type: 'Commercial', count: commercial, percentage: total > 0 ? Math.round((commercial / total) * 100) : 0 },
        { type: 'Automotive', count: automotive, percentage: total > 0 ? Math.round((automotive / total) * 100) : 0 },
        { type: 'Emergency', count: emergency, percentage: total > 0 ? Math.round((emergency / total) * 100) : 0 }
      ]);
    } catch (error) {
      console.error('Error loading jobs by type:', error);
    }
  };

  const loadTechPerformance = async (franchiseeId: string) => {
    try {
      const [techResponse, submissionsResponse] = await Promise.all([
        fetch(`/api/technicians?franchiseeId=${franchiseeId}&_t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/job-submissions?franchiseeId=${franchiseeId}&_t=${Date.now()}`, { cache: 'no-store' })
      ]);

      if (!techResponse.ok || !submissionsResponse.ok) return;

      const technicians = await techResponse.json();
      const submissions = await submissionsResponse.json();

      const techStats = technicians.map((tech: any) => {
        const techSubmissions = submissions.filter((s: any) => s.technician_id === tech.id);
        const approvedSubmissions = techSubmissions.filter((s: any) => s.status === 'approved');

        // Calculate average rating for this tech
        const ratedJobs = techSubmissions.filter((s: any) => s.rating && s.rating > 0);
        const avgRating = ratedJobs.length > 0
          ? (ratedJobs.reduce((sum: number, s: any) => sum + s.rating, 0) / ratedJobs.length).toFixed(1)
          : '0.0';

        // Calculate efficiency (approved / total submissions)
        const efficiency = techSubmissions.length > 0
          ? Math.round((approvedSubmissions.length / techSubmissions.length) * 100)
          : 0;

        return {
          name: tech.name,
          jobs: techSubmissions.length,
          approvedJobs: approvedSubmissions.length,
          rating: parseFloat(avgRating),
          efficiency: `${efficiency}%`
        };
      });

      // Sort by job count
      techStats.sort((a: any, b: any) => b.jobs - a.jobs);

      setTechPerformance(techStats);
    } catch (error) {
      console.error('Error loading tech performance:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Reports & Analytics</h1>
          <p className="text-muted-foreground">Job performance insights and metrics</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadReportsData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {loading ? '...' : metrics.totalJobs}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Job Submissions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {loading ? '...' : metrics.approvedJobs}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {loading ? '...' : metrics.totalPhotos}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Photos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {loading ? '...' : metrics.customerSatisfaction}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Job Rating</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Service Type</CardTitle>
            <CardDescription>Breakdown of job submissions by category</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : jobsByType.length === 0 || metrics.totalJobs === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No job data yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobsByType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <div>
                        <div className="font-medium">{item.type}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{item.count} jobs</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technician Performance</CardTitle>
            <CardDescription>Individual job submission metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : techPerformance.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No technician data yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {techPerformance.map((tech) => (
                  <div key={tech.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{tech.name}</h4>
                      <Badge variant="outline">{tech.efficiency} Approval Rate</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Jobs</div>
                        <div className="font-medium">{tech.jobs}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Approved</div>
                        <div className="font-medium">{tech.approvedJobs}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Rating</div>
                        <div className="font-medium">⭐ {tech.rating}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Status Overview</CardTitle>
          <CardDescription>Current status of all job submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <span className="font-medium text-green-600">{metrics.completedJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending</span>
                <span className="font-medium text-orange-600">{metrics.pendingJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Approved</span>
                <span className="font-medium text-blue-600">{metrics.approvedJobs}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
