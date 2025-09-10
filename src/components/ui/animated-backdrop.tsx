"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBackdropProps {
  className?: string;
  variant?: "default" | "gradient" | "dots" | "waves";
}

export function AnimatedBackdrop({ 
  className, 
  variant = "default" 
}: AnimatedBackdropProps) {
  const getBackdrop = () => {
    switch (variant) {
      case "gradient":
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20">
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/10 to-transparent"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        );
      
      case "dots":
        return (
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                backgroundSize: "20px 20px",
                color: "hsl(var(--primary))",
              }}
            >
              <motion.div
                className="w-full h-full"
                animate={{
                  backgroundPosition: ["0px 0px", "20px 20px"],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                  backgroundSize: "20px 20px",
                  color: "hsl(var(--accent))",
                }}
              />
            </div>
          </div>
        );
      
      case "waves":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,200 Q100,150 200,200 T400,200 L400,400 L0,400 Z"
                fill="url(#wave1)"
                animate={{
                  d: [
                    "M0,200 Q100,150 200,200 T400,200 L400,400 L0,400 Z",
                    "M0,180 Q100,230 200,180 T400,180 L400,400 L0,400 Z",
                    "M0,200 Q100,150 200,200 T400,200 L400,400 L0,400 Z",
                  ],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.path
                d="M0,220 Q100,170 200,220 T400,220 L400,400 L0,400 Z"
                fill="url(#wave2)"
                animate={{
                  d: [
                    "M0,220 Q100,170 200,220 T400,220 L400,400 L0,400 Z",
                    "M0,240 Q100,190 200,240 T400,240 L400,400 L0,400 Z",
                    "M0,220 Q100,170 200,220 T400,220 L400,400 L0,400 Z",
                  ],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </div>
        );
      
      default:
        return (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"
            animate={{
              background: [
                "linear-gradient(45deg, hsl(var(--primary) / 0.1) 0%, transparent 50%, hsl(var(--accent) / 0.1) 100%)",
                "linear-gradient(225deg, hsl(var(--accent) / 0.1) 0%, transparent 50%, hsl(var(--primary) / 0.1) 100%)",
                "linear-gradient(45deg, hsl(var(--primary) / 0.1) 0%, transparent 50%, hsl(var(--accent) / 0.1) 100%)",
              ],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
    }
  };

  return (
    <motion.div
      className={cn("absolute inset-0 pointer-events-none", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {getBackdrop()}
      <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
    </motion.div>
  );
}