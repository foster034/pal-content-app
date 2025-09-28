"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconBrandTabler,
  IconSettings,
  IconPhoto,
  IconTool,
  IconChartBar,
  IconLogout,
  IconUser,
  IconFileText,
  IconMessageCircle,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import TechLogoutButton from "@/components/auth/TechLogoutButton";
import { getTechSession } from "@/lib/tech-auth";
import { createClientComponentClient } from '@/lib/supabase-client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function TechSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const supabase = createClientComponentClient();

  // Check authentication status and fetch profile
  useEffect(() => {
    const checkAuth = async () => {
      const techSession = getTechSession();
      setIsAuthenticated(!!techSession);

      // If authenticated via tech session, use that info
      if (techSession) {
        // Try to fetch full profile data from tech-profile API
        try {
          const response = await fetch(`/api/tech-profile?techId=${techSession.id}`);
          if (response.ok) {
            const profileData = await response.json();
            setUserProfile({
              email: profileData.email || techSession.email || 'Tech User',
              full_name: profileData.full_name || techSession.name || 'Technician',
              role: 'tech',
              avatar_url: techSession.avatar_url || profileData.avatar_url || null
            });
          } else {
            // Fallback to session data
            setUserProfile({
              email: techSession.email || 'Tech User',
              full_name: techSession.name || 'Technician',
              role: 'tech',
              avatar_url: techSession.avatar_url || null
            });
          }
        } catch (error) {
          console.error('Error fetching tech profile:', error);
          // Fallback to session data
          setUserProfile({
            email: techSession.email || 'Tech User',
            full_name: techSession.name || 'Technician',
            role: 'tech',
            avatar_url: techSession.avatar_url || null
          });
        }
      } else {
        // Otherwise check if regular auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          setUserProfile({
            email: user.email,
            full_name: profile?.full_name || user.user_metadata?.full_name || 'User',
            role: profile?.role || 'tech',
            avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url
          });
        }
      }
    };

    checkAuth();

    // Re-check on storage changes
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);

    // Listen for profile updates (when user saves profile changes)
    const handleProfileUpdate = () => {
      setTimeout(() => checkAuth(), 100); // Small delay to ensure localStorage is updated
    };
    window.addEventListener('tech-profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tech-profile-updated', handleProfileUpdate);
    };
  }, [supabase]);

  // Extract techId from pathname if available
  const techId = pathname.split('/tech/')[1]?.split('/')[0];
  const isOnTechForm = techId && techId !== 'dashboard' && techId !== 'photos' && techId !== 'profile';
  
  const links = [
    {
      label: "Dashboard",
      href: "/tech/dashboard",
      icon: (
        <IconChartBar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "My Photos",
      href: "/tech/photos",
      icon: (
        <IconPhoto className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    ...(isOnTechForm ? [{
      label: "Submit Content",
      href: `/tech/${techId}`,
      icon: (
        <IconFileText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    }] : []),
  ];

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-none flex-1 flex-col bg-gray-100 md:flex-row dark:bg-neutral-800",
        "min-h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => {
                const sidebarLinkContent = (
                  <SidebarLink
                    key={idx}
                    link={{
                      ...link,
                      label: link.external ? `${link.label} ↗` : link.label,
                    }}
                  />
                );

                if (link.external) {
                  return (
                    <button
                      key={idx}
                      onClick={() => window.open(link.href, '_blank')}
                      className="w-full text-left"
                    >
                      {sidebarLinkContent}
                    </button>
                  );
                }

                return (
                  <Link key={idx} href={link.href}>
                    {sidebarLinkContent}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="mt-auto space-y-4">
            {userProfile && (
              <Link href="/tech/profile">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-neutral-700/50 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                      {userProfile.full_name?.charAt(0) || userProfile.email?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  {open && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {userProfile.full_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {userProfile.email}
                        </p>
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {userProfile.role}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            )}
            {isAuthenticated ? (
              <TechLogoutButton variant="ghost" className="w-full justify-start" />
            ) : (
              <LogoutButton variant="ghost" className="w-full justify-start" />
            )}
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1">
        <div className="flex w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/tech/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white"
    >
      <div className="h-8 w-8 shrink-0 rounded-lg bg-primary flex items-center justify-center">
        <span className="text-primary-foreground font-bold">🔧</span>
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Pop-A-Lock Tech
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/tech/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white"
    >
      <div className="h-8 w-8 shrink-0 rounded-lg bg-primary flex items-center justify-center">
        <span className="text-primary-foreground font-bold">🔧</span>
      </div>
    </Link>
  );
};