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

export function TechSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const techSession = getTechSession();
      setIsAuthenticated(!!techSession);
    };

    checkAuth();

    // Re-check on storage changes
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
    ...(isAuthenticated ? [{
      label: "Profile & Settings",
      href: "/tech/profile",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
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
          <div className="mt-auto">
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