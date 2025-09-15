"use client";
import React from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconBrandGoogle,
} from "@tabler/icons-react";

function SignInForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const demoUsers = {
    "admin@popalock.com": { role: "admin", redirect: "/admin" },
    "franchisee@popalock.com": { role: "franchisee", redirect: "/franchisee" },
    "tech@popalock.com": { role: "technician", redirect: "/tech/dashboard" }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Check if it's a demo user
    if (email in demoUsers && password === "demo") {
      const user = demoUsers[email as keyof typeof demoUsers];
      
      setTimeout(() => {
        window.location.href = user.redirect;
      }, 1000);
      
      return;
    }

    // For non-demo users, show error
    setTimeout(() => {
      setIsLoading(false);
      alert("Invalid credentials. Try:\n• admin@popalock.com / demo\n• franchisee@popalock.com / demo\n• tech@popalock.com / demo");
    }, 1000);
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Welcome to Pop-A-Lock
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        Sign in to access your franchise portal and manage your content
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            placeholder="admin@popalock.com" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            placeholder="demo" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            <p><strong>Demo Accounts:</strong></p>
            <p>• admin@popalock.com / demo</p>
            <p>• franchisee@popalock.com / demo</p>
            <p>• tech@popalock.com / demo</p>
          </div>
        </LabelInputContainer>

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In →"}
          <BottomGradient />
        </button>

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

        <div className="flex flex-col space-y-4">
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] disabled:opacity-50"
            type="button"
            disabled={isLoading}
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                window.location.href = "/admin";
              }, 1000);
            }}
          >
            <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              GitHub (Demo Admin)
            </span>
            <BottomGradient />
          </button>
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] disabled:opacity-50"
            type="button"
            disabled={isLoading}
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                window.location.href = "/franchisee";
              }, 1000);
            }}
          >
            <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              Google (Demo Franchisee)
            </span>
            <BottomGradient />
          </button>
        </div>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
        <Image
          src="/images/pop-a-lock-logo.png"
          alt="Pop-A-Lock Professional Services"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-8 left-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Professional Locksmith Services</h3>
          <p className="text-lg opacity-90">Trusted since 1991</p>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Image
              src="/images/pop-a-lock-logo.png"
              alt="Pop-A-Lock"
              width={200}
              height={80}
              priority
            />
          </div>
          
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
