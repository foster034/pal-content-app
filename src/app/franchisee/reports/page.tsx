'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('This Month');

  const metrics = {
    totalJobs: 47,
    completedJobs: 42,
    pendingJobs: 3,
    cancelledJobs: 2,
    totalRevenue: '$12,450',
    averageJobValue: '$296',
    customerSatisfaction: '4.8',
    responseTime: '18 min'
  };

  const jobsByType = [
    { type: 'Residential', count: 18, revenue: '$4,320', percentage: 43 },
    { type: 'Commercial', count: 15, revenue: '$5,250', percentage: 36 },
    { type: 'Automotive', count: 10, revenue: '$2,100', percentage: 21 },
    { type: 'Emergency', count: 4, revenue: '$780', percentage: 9 }
  ];

  const techPerformance = [
    { name: 'Alex Rodriguez', jobs: 18, revenue: '$5,400', rating: 4.9, efficiency: '95%' },
    { name: 'Mike Johnson', jobs: 16, revenue: '$4,800', rating: 4.7, efficiency: '92%' },
    { name: 'Sarah Wilson', jobs: 13, revenue: '$2,250', rating: 4.8, efficiency: '89%' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Reports & Analytics</h1>
          <p className="text-muted-foreground">Performance insights and business metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="This Quarter">This Quarter</option>
            <option value="This Year">This Year</option>
          </select>
          <Button>Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.totalJobs}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.totalRevenue}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.averageJobValue}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Job Value</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.customerSatisfaction}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Customer Rating</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Service Type</CardTitle>
            <CardDescription>Breakdown of completed jobs by category</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <div className="font-medium">{item.revenue}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technician Performance</CardTitle>
            <CardDescription>Individual performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {techPerformance.map((tech) => (
                <div key={tech.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{tech.name}</h4>
                    <Badge variant="outline">{tech.efficiency} Efficiency</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Jobs</div>
                      <div className="font-medium">{tech.jobs}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Revenue</div>
                      <div className="font-medium">{tech.revenue}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Rating</div>
                      <div className="font-medium">⭐ {tech.rating}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <span className="font-medium text-green-600">{metrics.completedJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending</span>
                <span className="font-medium text-orange-600">{metrics.pendingJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cancelled</span>
                <span className="font-medium text-red-600">{metrics.cancelledJobs}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Response Time</span>
                <span className="font-medium">{metrics.responseTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Satisfaction</span>
                <span className="font-medium">⭐ {metrics.customerSatisfaction}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Repeat Customers</span>
                <span className="font-medium">67%</span>
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
                <span className="text-sm">Jobs Growth</span>
                <span className="font-medium text-green-600">+12%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Revenue Growth</span>
                <span className="font-medium text-green-600">+8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">New Customers</span>
                <span className="font-medium text-blue-600">23</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}