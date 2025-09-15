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

const statsData = [
  {
    title: "Total Franchisees",
    value: 89,
    change: "+12%",
    trend: "up",
    icon: Building2,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Active Technicians", 
    value: 567,
    change: "+8%",
    trend: "up",
    icon: Wrench,
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Total Users",
    value: 1234,
    change: "-3%",
    trend: "down",
    icon: Users,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Content Submissions",
    value: 2845,
    change: "+15%",
    trend: "up", 
    icon: Activity,
    color: "from-orange-500 to-red-500"
  }
];

const quickActions = [
  {
    title: "Add Franchisee",
    icon: Building2,
    description: "Register new franchise",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Add Technician",
    icon: Wrench,
    description: "Onboard new tech",
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Manage Users",
    icon: Users,
    description: "User administration",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Export Data",
    icon: Download,
    description: "Download reports",
    color: "from-orange-500 to-red-500"
  }
];

export default function AdminDashboard() {
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
                {[
                  { 
                    id: 'alex-rodriguez',
                    rank: 1,
                    name: 'Alex Rodriguez', 
                    franchise: 'Dallas Downtown',
                    photoSubmissions: 18, 
                    approved: 15, 
                    marketingScore: 96, 
                    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg'
                  },
                  { 
                    id: 'sofia-martinez',
                    rank: 2,
                    name: 'Sofia Martinez', 
                    franchise: 'Austin Central',
                    photoSubmissions: 16, 
                    approved: 14, 
                    marketingScore: 92, 
                    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg'
                  },
                  { 
                    id: 'jennifer-walsh',
                    rank: 3,
                    name: 'Jennifer Walsh', 
                    franchise: 'San Antonio North',
                    photoSubmissions: 14, 
                    approved: 12, 
                    marketingScore: 89, 
                    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-03_dkeufx.jpg'
                  },
                  { 
                    id: 'mike-johnson',
                    rank: 4,
                    name: 'Mike Johnson', 
                    franchise: 'Houston West',
                    photoSubmissions: 13, 
                    approved: 10, 
                    marketingScore: 85, 
                    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-05_cmz0mg.jpg'
                  },
                  { 
                    id: 'david-chen',
                    rank: 5,
                    name: 'David Chen', 
                    franchise: 'Dallas Downtown',
                    photoSubmissions: 12, 
                    approved: 9, 
                    marketingScore: 82, 
                    image: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-05_cmz0mg.jpg'
                  }
                ].map((tech, index) => (
                  <Link key={tech.name} href={`/tech/${tech.id}`} className="block transition-all duration-200 hover:scale-102 hover:shadow-sm">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-background/50 to-background/20 backdrop-blur-sm rounded-lg border-gray-100 dark:border-gray-800 hover:from-background/70 hover:to-background/40 cursor-pointer">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs font-bold shrink-0">
                        #{tech.rank}
                      </div>
                      <div className="w-8 h-8 relative rounded-full overflow-hidden shrink-0">
                        <img
                          src={tech.image}
                          alt={tech.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <p className="text-sm font-medium text-foreground truncate">
                            {tech.name}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {tech.marketingScore}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{tech.photoSubmissions} sent</span>
                          <span>{tech.approved} approved</span>
                          <span>{Math.round((tech.approved / tech.photoSubmissions) * 100)}%</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
                            style={{ width: `${tech.marketingScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" size="sm" className="w-full bg-gradient-to-r from-background/80 to-background/40 backdrop-blur-sm border-gray-100 dark:border-gray-800">
                  View All Technicians
                </Button>
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
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-background/50 to-background/20 backdrop-blur-sm rounded-lg border-gray-100 dark:border-gray-800">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">New photo submission approved</p>
                    <p className="text-xs text-muted-foreground">Alex Rodriguez • Dallas Downtown • 2 min ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-background/50 to-background/20 backdrop-blur-sm rounded-lg border-gray-100 dark:border-gray-800">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Magic link sent to technician</p>
                    <p className="text-xs text-muted-foreground">Sofia Martinez • Austin Central • 5 min ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-background/50 to-background/20 backdrop-blur-sm rounded-lg border-gray-100 dark:border-gray-800">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">New franchisee registered</p>
                    <p className="text-xs text-muted-foreground">Fort Worth East • 15 min ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-background/50 to-background/20 backdrop-blur-sm rounded-lg border-gray-100 dark:border-gray-800">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Marketing report generated</p>
                    <p className="text-xs text-muted-foreground">Houston West • 22 min ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-background/50 to-background/20 backdrop-blur-sm rounded-lg border-gray-100 dark:border-gray-800">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Photo submission denied</p>
                    <p className="text-xs text-muted-foreground">Mike Johnson • Quality review • 28 min ago</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" size="sm" className="w-full bg-gradient-to-r from-background/80 to-background/40 backdrop-blur-sm border-gray-100 dark:border-gray-800">
                  View Activity Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </BlurFade>
      </div>

      {/* System Status */}
      <BlurFade delay={0.9}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-gray-100 dark:border-gray-800 shadow-sm bg-gradient-to-br from-emerald-500/10 to-teal-500/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">System Health</CardTitle>
              <Zap className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">99.9%</div>
              <p className="text-xs text-emerald-600/80">Uptime this month</p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 dark:border-gray-800 shadow-sm bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Global Reach</CardTitle>
              <Globe className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">24</div>
              <p className="text-xs text-blue-600/80">States & provinces</p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 dark:border-gray-800 shadow-sm bg-gradient-to-br from-purple-500/10 to-pink-500/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">97.3%</div>
              <p className="text-xs text-purple-600/80">Job completion</p>
            </CardContent>
          </Card>
        </div>
      </BlurFade>

      {/* Quick Actions */}
      <BlurFade delay={1.0}>
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <CardHeader className="relative">
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>
              Frequently used administrative tasks and shortcuts for efficient management.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-24 flex-col gap-2 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border-gray-100 dark:border-gray-800 hover:shadow-sm transition-all duration-300 group"
                  >
                    <div className={`p-2 rounded-full bg-gradient-to-br ${action.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium">{action.title}</span>
                      <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
}