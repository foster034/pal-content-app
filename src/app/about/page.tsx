'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, TrendingUp, Users, Zap, CheckCircle, Clock, BarChart3, MessageSquare, Star, MapPin, Smartphone, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">CarKeyPro Content Engine</h1>
            <p className="text-xl text-blue-100 mb-6">
              Transform Every Service Call Into Powerful Marketing Content
            </p>
            <Badge className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-6 py-2">
              Built for Pop-A-Lock Franchises
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">

        {/* What It Does */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What This App Does</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Camera className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Capture Real Work</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Technicians use their phones to document every job with before/after photos,
                  service details, and customer information - all submitted in under 2 minutes
                  right from the job site.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>AI-Powered Content</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Artificial intelligence instantly transforms raw job data into professional
                  marketing copy, complete with compelling descriptions, relevant hashtags,
                  and optimized for each platform.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Franchisee Approval</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Franchise owners review and approve content with one click, maintaining
                  brand consistency while giving technicians the power to create. No marketing
                  expertise required.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Globe className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle>Auto-Publish to GMB</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Approved content automatically posts to Google My Business, keeping your
                  local presence active and attracting new customers through real work examples.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Benefits Pop-A-Lock */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How This Benefits Pop-A-Lock</h2>

          <div className="space-y-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <CardTitle>Consistent Marketing Presence</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <strong>The Problem:</strong> Most franchises struggle to maintain consistent social media
                  and Google My Business posting. They rely on stock photos and generic content that
                  doesn't showcase real expertise.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>The Solution:</strong> Every job becomes content. If a franchise completes 20 jobs
                  per week, that's potentially 20 unique, authentic marketing posts showcasing real work,
                  real customers, and real results - all without hiring a marketing team.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-green-600" />
                  <CardTitle>Local SEO Dominance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <strong>The Problem:</strong> Google rewards businesses that post frequently to Google My
                  Business. Inactive profiles rank lower in local search results.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>The Solution:</strong> Automated GMB posting keeps your franchise visible in local
                  searches. Each post includes location data, service categories, and real photos - all
                  signals Google uses for ranking. More posts = higher visibility = more calls.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <CardTitle>Technician Engagement & Pride</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <strong>The Problem:</strong> Technicians complete great work but it disappears after the
                  job is done. There's no recognition or showcase for their expertise.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>The Solution:</strong> Techs see their work featured on the company's marketing
                  channels. The leaderboard creates friendly competition. They become invested in quality
                  documentation and customer service because their work is public-facing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-orange-600" />
                  <CardTitle>Zero Additional Work for Owners</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <strong>The Problem:</strong> Franchise owners are too busy running the business to create
                  marketing content daily. Hiring a marketer is expensive.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>The Solution:</strong> The entire content creation process happens automatically.
                  Tech submits → AI generates → Owner approves (10 seconds) → Auto-publishes. The owner's
                  only job is quality control, not content creation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Star className="h-6 w-6 text-red-600" />
                  <CardTitle>Customer Trust & Social Proof</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <strong>The Problem:</strong> Potential customers can't visualize what you do or trust
                  that you're the real deal without seeing actual work.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>The Solution:</strong> Real photos from real jobs build immediate credibility.
                  When someone searches "car locksmith near me" and sees your GMB profile filled with
                  recent, authentic job completions, they're far more likely to call you over competitors
                  with stock photos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                  <CardTitle>Data-Driven Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <strong>The Problem:</strong> You don't know which services are most popular, which techs
                  are most productive, or what content performs best.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>The Solution:</strong> Dashboard analytics show job category breakdowns, technician
                  performance metrics, approval rates, and GMB post engagement. Make informed decisions
                  about staffing, services, and marketing focus.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The Workflow */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">The Simple 4-Step Workflow</h2>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Step 1: Tech Submits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  At job completion, tech opens the app, takes 2-3 photos, selects service type,
                  adds location. Takes under 2 minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Step 2: AI Generates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI analyzes the photos and job data, creates professional marketing copy with
                  relevant hashtags. Happens instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Step 3: Owner Approves</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Franchise owner reviews content in dashboard, clicks "Approve" or edits if needed.
                  Takes 10 seconds per post.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Step 4: Auto-Publish</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  System automatically publishes to Google My Business with optimized formatting.
                  Reaches local customers immediately.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Camera, title: 'Mobile-First Design', desc: 'Optimized for techs on the go' },
              { icon: Zap, title: 'AI Content Generation', desc: 'Professional copy in seconds' },
              { icon: CheckCircle, title: 'Approval Workflow', desc: 'Maintain brand control' },
              { icon: Globe, title: 'GMB Integration', desc: 'Direct publishing to Google' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track performance metrics' },
              { icon: Users, title: 'Leaderboard', desc: 'Gamify content creation' },
              { icon: MessageSquare, title: 'Customer Testimonials', desc: 'Capture reviews easily' },
              { icon: Clock, title: 'Quick Submission', desc: 'Under 2 minutes per job' },
              { icon: Star, title: 'Photo Library', desc: 'Searchable content archive' }
            ].map((feature, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ROI Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Return on Investment</CardTitle>
              <CardDescription className="text-base">
                How much is consistent marketing worth to your franchise?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">20+</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Marketing posts per week (at 20 jobs/week)
                  </p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">$0</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Additional labor cost (techs document during normal workflow)
                  </p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Authentic content (no stock photos, all real work)
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-4 text-center">Traditional Marketing vs. CarKeyPro</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">❌ Traditional Approach</h4>
                    <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                      <li>• Hire social media manager ($3-5k/month)</li>
                      <li>• Stock photos and generic content</li>
                      <li>• No connection to actual work</li>
                      <li>• Irregular posting schedule</li>
                      <li>• Owner has to source content</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">✅ CarKeyPro Approach</h4>
                    <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                      <li>• Automated system (included)</li>
                      <li>• Real photos from actual jobs</li>
                      <li>• Every job becomes marketing</li>
                      <li>• Daily automated posting</li>
                      <li>• Techs create, AI optimizes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-0">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Marketing?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Turn every service call into powerful, authentic marketing content that builds
                trust, attracts customers, and dominates local search results.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/auth/login">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                    Get Started
                  </Button>
                </Link>
                <Link href="/franchisee">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                    View Demo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}
