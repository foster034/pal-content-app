"use client";
import React, { useState } from "react";
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
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLogo } from "@/contexts/logo-context";

export function FranchiseeSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    {
      label: "Dashboard",
      href: "/franchisee",
      icon: (
        <IconDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "My Technicians",
      href: "/franchisee/techs",
      icon: (
        <IconTool className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Job Pics",
      href: "/franchisee/marketing",
      icon: (
        <IconPhoto className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Tech Hub",
      href: "/tech-hub",
      icon: (
        <IconDeviceGamepad2 className="h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400" />
      ),
    },
    {
      label: "Reports",
      href: "/franchisee/reports",
      icon: (
        <IconChartBar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: "/franchisee/profile",
      icon: (
        <IconUser className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-none flex-1 flex-col overflow-hidden bg-gray-100 md:flex-row dark:bg-neutral-800",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen} animate={true}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={idx} href={link.href}>
                    <SidebarLink
                      link={{
                        ...link,
                        icon: React.cloneElement(link.icon as React.ReactElement, {
                          className: cn(
                            "h-5 w-5 shrink-0",
                            isActive 
                              ? "text-primary" 
                              : "text-neutral-700 dark:text-neutral-200"
                          ),
                        }),
                      }}
                      className={cn(
                        "hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg px-3 py-2",
                        isActive && "bg-primary/10 text-primary dark:bg-primary/20"
                      )}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "John Smith",
                href: "#",
                icon: (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                    <IconUser className="h-4 w-4 text-primary" />
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-full flex-1 flex-col gap-4 rounded-tl-2xl border border-neutral-200 bg-white p-4 md:p-8 dark:border-neutral-700 dark:bg-neutral-900 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
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