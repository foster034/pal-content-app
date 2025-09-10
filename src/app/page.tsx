import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Marquee from "@/components/ui/marquee";
import BlurFade from "@/components/ui/blur-fade";
import { DraggableCardContainer, DraggableCardBody } from "@/components/ui/draggable-card";
import { ArrowRight, Shield, Clock, MapPin, Users, Star, CheckCircle, Quote, Car, Home as HomeIcon, Building, Truck } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Franchisee - Dallas",
    content: "Pop-A-Lock has transformed my business. The support and brand recognition are unmatched.",
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "Mike Rodriguez",
    role: "Technician - Miami", 
    content: "Working with Pop-A-Lock gives me the tools and training to excel in locksmith services.",
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "Lisa Chen",
    role: "Franchisee - Seattle",
    content: "The franchise system is well-organized and profitable. Highly recommend!",
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "David Thompson",
    role: "Customer - Austin",
    content: "Quick response, professional service, and fair pricing. Pop-A-Lock is the best!",
    avatar: "/placeholder-avatar.jpg"
  }
];

const demoJobs = [
  {
    id: 1,
    type: "Automotive",
    title: "Emergency Car Lockout",
    description: "Locked out of 2023 Tesla Model 3 in downtown parking garage. Customer needs immediate assistance.",
    location: "Dallas, TX",
    priority: "Emergency",
    timePosted: "5 minutes ago",
    icon: Car,
    status: "Available",
    estimatedTime: "15-20 mins",
    price: "$85"
  },
  {
    id: 2,
    type: "Residential",
    title: "Home Lock Rekeying",
    description: "Need to rekey all exterior door locks after recent home purchase. 3 doors total.",
    location: "Plano, TX",
    priority: "Standard",
    timePosted: "1 hour ago",
    icon: HomeIcon,
    status: "Available", 
    estimatedTime: "45-60 mins",
    price: "$120"
  },
  {
    id: 3,
    type: "Commercial",
    title: "Office Access Control Installation",
    description: "Install new keypad access control system for medical office. 2 entry points required.",
    location: "Richardson, TX",
    priority: "Scheduled",
    timePosted: "3 hours ago",
    icon: Building,
    status: "Available",
    estimatedTime: "2-3 hours",
    price: "$450"
  },
  {
    id: 4,
    type: "Roadside",
    title: "Highway Vehicle Lockout",
    description: "Driver locked out of delivery truck on I-35. Keys visible inside vehicle.",
    location: "Austin, TX",
    priority: "Emergency",
    timePosted: "2 minutes ago",
    icon: Truck,
    status: "Available",
    estimatedTime: "20-25 mins",
    price: "$95"
  }
];

const TestimonialCard = ({ name, role, content }: { name: string; role: string; content: string }) => (
  <div className="relative w-80 p-6 mx-4 bg-card border rounded-lg shadow-lg">
    <Quote className="h-8 w-8 text-primary/30 mb-4" />
    <p className="text-sm text-muted-foreground mb-4 italic">{content}</p>
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
        <span className="text-sm font-medium text-primary">{name[0]}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  </div>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-70" />
        
        <div className="container mx-auto px-4 py-24 relative">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <BlurFade delay={0.1}>
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium backdrop-blur-sm border border-primary/20">
                Trusted Locksmith Services Since 1991
              </Badge>
            </BlurFade>
            
            <BlurFade delay={0.2}>
              <Image
                src="/images/pop-a-lock-logo.png"
                alt="Pop-A-Lock Locksmith - Auto, Home, Business"
                width={400}
                height={160}
                priority
                className="mb-4"
              />
            </BlurFade>
            
            <div className="space-y-6">
              <BlurFade delay={0.3}>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Professional Locksmith Services
                  <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"> Franchise Management</span>
                </h1>
              </BlurFade>
              
              <BlurFade delay={0.4}>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Complete marketing content management platform for Pop-A-Lock franchisees and technicians. Streamline your operations and showcase your expertise.
                </p>
              </BlurFade>
            </div>

            <BlurFade delay={0.5}>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                  <a href="/admin">
                    <Shield className="mr-2 h-5 w-5" />
                    Admin Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/5 backdrop-blur-sm">
                  <a href="/franchisee">
                    <Users className="mr-2 h-5 w-5" />
                    Franchisee Portal
                  </a>
                </Button>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <section className="py-16 bg-muted/30 border-y border-border/40">
        <div className="container mx-auto px-4">
          <BlurFade delay={0.1}>
            <h3 className="text-center text-lg font-semibold text-muted-foreground mb-8">
              Trusted by thousands of customers and franchise partners
            </h3>
          </BlurFade>
          
          <Marquee className="py-4" pauseOnHover>
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={idx} {...testimonial} />
            ))}
          </Marquee>
        </div>
      </section>

      {/* Live Jobs Demo Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <BlurFade delay={0.1}>
            <div className="text-center mb-16">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium backdrop-blur-sm border border-primary/20 mb-4">
                Live Demo Content
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Available Service Requests
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Interactive demo showcasing real-time service requests across all Pop-A-Lock specialties. Hover to explore details.
              </p>
            </div>
          </BlurFade>

          <DraggableCardContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoJobs.map((job, idx) => {
              const IconComponent = job.icon;
              const priorityColor = job.priority === "Emergency" ? "text-red-500" : 
                                  job.priority === "Standard" ? "text-blue-500" : "text-green-500";
              const priorityBg = job.priority === "Emergency" ? "bg-red-50 border-red-200" : 
                                job.priority === "Standard" ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200";
              
              return (
                <BlurFade key={job.id} delay={0.2 + idx * 0.1}>
                  <DraggableCardBody className="h-full">
                    <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/70 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className={`text-xs font-medium ${priorityBg} ${priorityColor}`}>
                            {job.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{job.timePosted}</span>
                        </div>
                        <div className="flex items-center mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mr-3">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
                            <p className="text-sm text-primary font-medium">{job.type}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm mb-4 line-clamp-3">
                          {job.description}
                        </CardDescription>
                        
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-muted-foreground">{job.location}</span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-muted-foreground">{job.estimatedTime}</span>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <span className="text-lg font-bold text-primary">{job.price}</span>
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DraggableCardBody>
                </BlurFade>
              );
            })}
          </DraggableCardContainer>

          <BlurFade delay={0.7}>
            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground mb-4">
                This is a demo of our live job board. Real technicians see actual service requests in real-time.
              </p>
              <Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                <a href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  View Live Dashboard
                </a>
              </Button>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-background relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="container mx-auto px-4 relative">
          <BlurFade delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Our Professional Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive locksmith solutions for all your security needs, backed by decades of expertise and innovation.
              </p>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Automotive", icon: "🚗", description: "Car lockouts, key programming, ignition repair, and emergency roadside assistance.", features: ["24/7 Emergency Service", "All Vehicle Types"] },
              { title: "Commercial", icon: "🏢", description: "Office locks, access control systems, and master key solutions for businesses.", features: ["Access Control", "Master Key Systems"] },
              { title: "Residential", icon: "🏠", description: "Home security, lock installation, rekeying, and residential security upgrades.", features: ["Home Security", "Lock Installation"] },
              { title: "Roadside", icon: "🛣️", description: "Emergency lockout assistance and mobile locksmith services available 24/7.", features: ["Mobile Service", "Emergency Response"] }
            ].map((service, idx) => (
              <BlurFade key={service.title} delay={0.2 + idx * 0.1}>
                <Card className="group hover:shadow-xl transition-all duration-500 border-0 shadow-md hover:scale-105 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                      <span className="text-3xl">{service.icon}</span>
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base mb-4">
                      {service.description}
                    </CardDescription>
                    <div className="space-y-2">
                      {service.features.map((feature, featureIdx) => (
                        <div key={featureIdx} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <BlurFade delay={0.1}>
              <div className="lg:col-span-1">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                  Why Choose Pop-A-Lock?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  With over 30 years of experience, we're the trusted choice for professional locksmith services across North America.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Star, text: "Industry Leading Experience" },
                    { icon: Clock, text: "24/7 Emergency Service" },
                    { icon: MapPin, text: "Nationwide Coverage" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center">
                      <item.icon className="h-5 w-5 text-primary mr-3" />
                      <span className="font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </BlurFade>
            
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Shield, title: "Trusted & Reliable", description: "Licensed, bonded, and insured professionals with background checks and ongoing training." },
                { icon: Clock, title: "Fast Response", description: "Average 15-minute response time for emergency services with mobile units ready to help." },
                { icon: Users, title: "Expert Technicians", description: "Highly trained professionals using the latest tools and techniques for all locksmith needs." },
                { icon: Star, title: "Satisfaction Guaranteed", description: "100% satisfaction guarantee with upfront pricing and no hidden fees or surprises." }
              ].map((feature, idx) => (
                <BlurFade key={feature.title} delay={0.2 + idx * 0.1}>
                  <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <feature.icon className="h-6 w-6 text-primary mr-2" />
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </BlurFade>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 text-center relative">
          <BlurFade delay={0.1}>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
          </BlurFade>
          
          <BlurFade delay={0.2}>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join our network of successful franchisees or access your technician portal to manage your marketing content.
            </p>
          </BlurFade>
          
          <BlurFade delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-lg">
                <a href="/franchisee">
                  <Users className="mr-2 h-5 w-5" />
                  Franchisee Portal
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary shadow-lg">
                <a href="/tech/login">
                  <Shield className="mr-2 h-5 w-5" />
                  Tech Login
                </a>
              </Button>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Separator className="mb-8" />
            <BlurFade delay={0.1}>
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <p className="text-muted-foreground">
                  © 2024 Pop-A-Lock. All rights reserved.
                </p>
                <div className="flex items-center space-x-6">
                  <Badge variant="outline">Trusted Since 1991</Badge>
                  <Badge variant="outline">24/7 Service</Badge>
                  <Badge variant="outline">Licensed & Insured</Badge>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </footer>
    </div>
  );
}
