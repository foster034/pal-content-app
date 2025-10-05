"use client";
import React, { useState, Suspense, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconDashboard,
  IconSettings,
  IconTool,
  IconFileText,
  IconChartBar,
  IconUser,
  IconPhoto,
  IconDeviceGamepad2,
  IconCircleCheck,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { createClientComponentClient } from '@/lib/supabase-client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function SidebarContent({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const franchiseeId = searchParams.get('id');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setUserProfile({
          email: user.email,
          full_name: profile?.full_name || user.user_metadata?.full_name || 'Franchisee',
          role: profile?.role || 'franchisee',
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url
        });
      }
    };

    fetchUserProfile();
  }, [supabase]);

  // Ensure we're on the client before applying ID parameters
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper function to add ID parameter to URLs when admin is viewing specific franchisee
  const getHrefWithId = (basePath: string) => {
    return isClient && franchiseeId ? `${basePath}?id=${franchiseeId}` : basePath;
  };

  const links = [
    {
      label: "Dashboard",
      href: getHrefWithId("/franchisee"),
      icon: (
        <IconDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "My Technicians",
      href: getHrefWithId("/franchisee/techs"),
      icon: (
        <IconTool className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Job Submissions",
      href: getHrefWithId("/franchisee/photos"),
      icon: (
        <IconPhoto className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Reports",
      href: getHrefWithId("/franchisee/reports"),
      icon: (
        <IconChartBar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: getHrefWithId("/franchisee/profile"),
      icon: (
        <IconUser className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: getHrefWithId("/franchisee/settings"),
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
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
              {links.map((link, idx) => (
                <Link key={idx} href={link.href}>
                  <SidebarLink link={link} />
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-auto space-y-4">
            {userProfile && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-neutral-700/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white">
                    {userProfile.full_name?.charAt(0) || userProfile.email?.charAt(0) || 'F'}
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
            )}
            <LogoutButton variant="ghost" className="w-full justify-start" />
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

export function FranchiseeSidebar({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <SidebarContent>{children}</SidebarContent>
    </Suspense>
  );
}

export const Logo = () => {
  const searchParams = useSearchParams();
  const franchiseeId = searchParams.get('id');

  return (
    <Link
      href={franchiseeId ? `/franchisee?id=${franchiseeId}` : "/franchisee"}
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre text-xl font-bold text-black dark:text-white"
      >
        Franchisee
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  const searchParams = useSearchParams();
  const franchiseeId = searchParams.get('id');

  return (
    <Link
      href={franchiseeId ? `/franchisee?id=${franchiseeId}` : "/franchisee"}
      className="relative z-20 flex items-center justify-center py-1 text-sm font-normal text-black"
    >
      <span className="text-xl font-bold text-black dark:text-white">
        F
      </span>
    </Link>
  );
};