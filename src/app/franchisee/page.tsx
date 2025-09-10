'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const recentPhotoSubmissions = [
  { id: 1, customer: 'Dallas Office Complex', tech: 'Alex Rodriguez', service: 'Master Key Installation', status: 'Pending', date: '2024-09-08', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=80&fit=crop' },
  { id: 2, customer: 'Maria Garcia', tech: 'Sarah Wilson', service: 'Home Rekey', status: 'Approved', date: '2024-09-07', image: 'https://images.unsplash.com/photo-1544860565-d4c4d73cb237?w=100&h=80&fit=crop' },
  { id: 3, customer: 'John Davis', tech: 'Mike Johnson', service: 'Car Lockout', status: 'Pending', date: '2024-09-06', image: 'https://images.unsplash.com/photo-1571974599782-87624638275e?w=100&h=80&fit=crop' },
  { id: 4, customer: 'Emergency Call', tech: 'Alex Rodriguez', service: 'Roadside Assistance', status: 'Denied', date: '2024-09-05', image: 'https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=100&h=80&fit=crop' },
];

const techLeaderboard = [
  { 
    name: 'Alex Rodriguez', 
    photoSubmissions: 18, 
    approved: 15, 
    marketingScore: 96, 
    recentJobs: 'Master Key Installation, Roadside Assistance',
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg'
  },
  { 
    name: 'Sarah Wilson', 
    photoSubmissions: 16, 
    approved: 14, 
    marketingScore: 92, 
    recentJobs: 'Home Rekey, Smart Lock Installation',
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg'
  },
  { 
    name: 'Mike Johnson', 
    photoSubmissions: 13, 
    approved: 10, 
    marketingScore: 85, 
    recentJobs: 'Car Lockout, Emergency Services',
    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-05_cmz0mg.jpg'
  },
];

export default function FranchiseeDashboard() {
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
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">47</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Photo Submissions</div>
            <div className="text-xs text-green-600 dark:text-green-400">+12% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">8</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Needs attention</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">35</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved for Marketing</div>
            <div className="text-xs text-green-600 dark:text-green-400">+8% approval rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Reports Generated</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Marketing ready</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Photo Submissions</CardTitle>
            <CardDescription>Latest marketing photos from your technicians</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPhotoSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <div className="w-12 h-10 relative rounded overflow-hidden shrink-0">
                    <img
                      src={submission.image}
                      alt={submission.service}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {submission.customer}
                      </p>
                      <Badge 
                        variant={
                          submission.status === 'Approved' ? 'default' : 
                          submission.status === 'Pending' ? 'secondary' : 
                          'destructive'
                        }
                        className="text-xs"
                      >
                        {submission.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {submission.tech} • {submission.service}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(submission.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/franchisee/marketing">
                <Button variant="outline" className="w-full">
                  View All Submissions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technician Leaderboard</CardTitle>
            <CardDescription>Top performers in marketing content creation</CardDescription>
          </CardHeader>
          <CardContent>
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
                        Score: {tech.marketingScore}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{tech.photoSubmissions} submissions</span>
                      <span>{tech.approved} approved</span>
                      <span>{Math.round((tech.approved / tech.photoSubmissions) * 100)}% rate</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
        <Card>
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

        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Photo Submissions</span>
                <span className="font-medium text-green-600 dark:text-green-400">+12%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Approval Rate</span>
                <span className="font-medium text-green-600 dark:text-green-400">+8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Marketing Ready</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">74%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Reports Created</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">12</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}