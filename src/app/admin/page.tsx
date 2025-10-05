'use client';

import { useState, useEffect } from 'react';
import { RecentActivity } from './components/RecentActivity';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BlurFade from "@/components/ui/blur-fade";
import NumberTicker from "@/components/ui/number-ticker";
import Meteors from "@/components/ui/meteors";
import { AnimatedChart } from "@/components/ui/animated-chart";
import { Plus, Download, RefreshCw, TrendingUp, Users, Building2, Wrench, Activity, Zap, Globe, Target } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState([
    {
      title: "Total Franchisees",
      value: 0,
      change: "Loading...",
      trend: "up",
      icon: Building2,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Active Technicians",
      value: 0,
      change: "Loading...",
      trend: "up",
      icon: Wrench,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Total Users",
      value: 0,
      change: "Loading...",
      trend: "up",
      icon: Users,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Content Submissions",
      value: 0,
      change: "Loading...",
      trend: "up",
      icon: Activity,
      color: "from-orange-500 to-red-500"
    }
  ]);

  // Load real analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Load franchisees
        const franchiseesResponse = await fetch('/api/franchisees');
        const franchisees = franchiseesResponse.ok ? await franchiseesResponse.json() : [];

        // Load technicians
        const techniciansResponse = await fetch('/api/technicians');
        const technicians = techniciansResponse.ok ? await techniciansResponse.json() : [];

        // Load job submissions
        const jobsResponse = await fetch('/api/job-submissions');
        const jobs = jobsResponse.ok ? await jobsResponse.json() : [];

        // Update stats with real data
        setStatsData([
          {
            title: "Total Franchisees",
            value: franchisees.length,
            change: franchisees.length === 0 ? "No franchisees yet" : `${franchisees.length} franchisee${franchisees.length !== 1 ? 's' : ''}`,
            trend: "up",
            icon: Building2,
            color: "from-blue-500 to-cyan-500"
          },
          {
            title: "Active Technicians",
            value: technicians.length,
            change: technicians.length === 0 ? "No technicians yet" : `${technicians.length} technician${technicians.length !== 1 ? 's' : ''}`,
            trend: "up",
            icon: Wrench,
            color: "from-emerald-500 to-teal-500"
          },
          {
            title: "Total Users",
            value: franchisees.length + technicians.length,
            change: (franchisees.length + technicians.length) === 0 ? "No users yet" : `${franchisees.length + technicians.length} total users`,
            trend: "up",
            icon: Users,
            color: "from-purple-500 to-pink-500"
          },
          {
            title: "Content Submissions",
            value: jobs.length,
            change: jobs.length === 0 ? "No submissions yet" : `${jobs.length} submission${jobs.length !== 1 ? 's' : ''}`,
            trend: "up",
            icon: Activity,
            color: "from-orange-500 to-red-500"
          }
        ]);

        console.log('📊 Analytics loaded:', {
          franchisees: franchisees.length,
          technicians: technicians.length,
          jobs: jobs.length
        });

      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };

    loadAnalytics();
  }, []);

  const quickActions = [
    {
      title: "Add Franchisee",
      icon: Building2,
      href: "/admin/franchisees",
      description: "Register new franchise",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Add Technician",
      icon: Wrench,
      href: "/admin/techs",
      description: "Onboard new tech",
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Content Review",
      icon: Activity,
      href: "/admin/marketing",
      description: "Review marketing content",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Export Data",
      icon: Download,
      href: "#",
      description: "Download reports",
      color: "from-orange-500 to-red-500"
    }
  ];
  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/20 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />
      
      {/* Header */}
      <BlurFade delay={0.1}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome back! Here's what's happening with your Pop-A-Lock franchise network.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="backdrop-blur-sm border-gray-100 dark:border-gray-800 hover:bg-muted/50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="backdrop-blur-sm border-gray-100 dark:border-gray-800 hover:bg-muted/50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>
      </BlurFade>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <BlurFade key={stat.title} delay={0.2 + index * 0.1}>
              <Card className="relative overflow-hidden border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm group">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500" 
                     style={{backgroundImage: `linear-gradient(135deg, ${stat.color.split(' ')[1]}, ${stat.color.split(' ')[3]})`}} />
                <Meteors number={5} />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full bg-gradient-to-br ${stat.color} opacity-80`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    <NumberTicker 
                      value={stat.value} 
                      delay={0.3 + index * 0.1}
                      className="text-foreground"
                    />
                  </div>
                  <div className="flex items-center">
                    <Badge 
                      variant={stat.trend === "up" ? "secondary" : "destructive"} 
                      className="text-xs"
                    >
                      <TrendingUp className={`h-3 w-3 mr-1 ${stat.trend === "down" ? "rotate-180" : ""}`} />
                      {stat.change}
                    </Badge>
                    <p className="text-xs text-muted-foreground ml-2">from last month</p>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <BlurFade delay={0.6} className="xl:col-span-2">
          <AnimatedChart />
        </BlurFade>
        
        <BlurFade delay={0.7}>
          <RecentActivity />
        </BlurFade>
      </div>

      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BlurFade delay={0.8}>
          <Card className="border-gray-100 dark:border-gray-800 shadow-sm bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
            <CardHeader className="relative">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-600" />
                Top Technicians
              </CardTitle>
              <CardDescription>
                Network performance leaders
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center py-8">
                  No technician data available yet
                </p>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        <BlurFade delay={0.85}>
          <Card className="border-gray-100 dark:border-gray-800 shadow-sm bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
            <CardHeader className="relative">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-violet-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest franchise network updates
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent activity
                </p>
              </div>
            </CardContent>
          </Card>
        </BlurFade>
      </div>


    </div>
  );
}