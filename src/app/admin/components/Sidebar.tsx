'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLogo } from '@/contexts/logo-context';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ProfileModal } from "@/components/ui/profile-modal";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Wrench, 
  BarChart3, 
  Settings, 
  Bell,
  Search,
  LogOut,
  User,
  ChevronDown,
  Zap,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: LayoutDashboard,
    count: null
  },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: Users,
    count: 1234
  },
  { 
    name: 'Franchisees', 
    href: '/admin/franchisees', 
    icon: Building2,
    count: 89
  },
  { 
    name: 'Technicians', 
    href: '/admin/techs', 
    icon: Wrench,
    count: 567
  },
  { 
    name: 'Analytics', 
    href: '/admin/analytics', 
    icon: BarChart3,
    count: null
  },
  { 
    name: 'Settings', 
    href: '/admin/settings', 
    icon: Settings,
    count: null
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mainLogo } = useLogo();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  return (
    <>
      <div className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center mb-4">
            <Image
              src={mainLogo}
              alt="Pop-A-Lock"
              width={180}
              height={72}
              className="mb-2"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-medium px-2 py-1">
                <Shield className="h-3 w-3 mr-1" />
                Admin Portal
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-muted rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`h-5 w-5 mr-3 ${
                      isActive ? 'text-sidebar-primary' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                    }`} />
                    <span>{item.name}</span>
                  </div>
                  
                  {item.count && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-2 py-0.5 min-w-[20px] ${
                        isActive ? 'bg-sidebar-primary/10 text-sidebar-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.count > 999 ? '999+' : item.count}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <Separator />

        {/* Enhanced User Profile */}
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-4 h-auto hover:bg-sidebar-accent group transition-all duration-300 rounded-xl">
                <div className="flex items-center w-full">
                  <div className="relative mr-4">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full blur-sm opacity-20 group-hover:opacity-60 transition duration-500"></div>
                    <Avatar className="relative h-12 w-12 border-2 border-primary/20 shadow-lg">
                      <AvatarImage src={profileImage || "/placeholder-user.jpg"} alt="Admin User" className="object-cover w-full h-full" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 text-primary font-bold text-base border border-primary/20">
                        AU
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse shadow-sm"></div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-sidebar-foreground truncate">Admin User</p>
                    <p className="text-xs text-muted-foreground truncate">admin@popalock.com</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: 0 }}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-sidebar-accent-foreground transition-colors flex-shrink-0" />
                  </motion.div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56" side="top">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <Zap className="h-3 w-3 mr-1" />
              System Status
            </div>
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </>
  );
}