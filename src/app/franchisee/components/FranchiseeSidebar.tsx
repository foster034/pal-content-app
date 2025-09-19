"use client";
import React, { useState, Suspense } from "react";
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
import Image from "next/image";
import { useLogo } from "@/contexts/logo-context";
import LogoutButton from "@/components/auth/LogoutButton";

function SidebarContent({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const franchiseeId = searchParams.get('id');

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
          <div className="mt-auto">
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
  const { mainLogo } = useLogo();
  
  return (
    <Link
      href="/franchisee"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src={mainLogo}
        alt="Pop-A-Lock"
        width={120}
        height={40}
        className="h-8 w-auto"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre font-medium text-black dark:text-white"
      >
        Franchisee
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  const { mainLogo } = useLogo();
  
  return (
    <Link
      href="/franchisee"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src={mainLogo}
        alt="Pop-A-Lock"
        width={32}
        height={32}
        className="h-8 w-8"
      />
    </Link>
  );
};