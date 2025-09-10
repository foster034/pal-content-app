"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  const noise = useRef<SVGFilterElement>(null);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return "20s";
      case "fast":
        return "10s";
      default:
        return "10s";
    }
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <defs>
          <filter
            id="noiseFilter"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            filterUnits="objectBoundingBox"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="linearRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.102"
              numOctaves="4"
              seed="15"
              stitchTiles="stitch"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              result="noise"
              ref={noise}
            />
            <feGaussianBlur
              stdDeviation={`${isSafari ? 0 : blur} 0`}
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              in="noise"
              edgeMode="duplicate"
              result="out"
            />
          </filter>
          <linearGradient id="gradient1" gradientTransform="rotate(45)">
            <stop
              offset="0%"
              stopColor={colors?.[0] ?? "var(--primary)"}
              stopOpacity="0.8"
            />
            <stop
              offset="50%"
              stopColor={colors?.[1] ?? "var(--accent)"}
              stopOpacity="0.4"
            />
            <stop
              offset="100%"
              stopColor={colors?.[2] ?? "var(--primary)"}
              stopOpacity="0.2"
            />
          </linearGradient>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={backgroundFill ?? "var(--background)"}
        />
        <rect
          width="100%"
          height="100%"
          fill="url(#gradient1)"
          opacity={waveOpacity}
          style={{
            mixBlendMode: "multiply",
          }}
        />
        <rect
          width="100%"
          height="100%"
          fill="url(#noiseFilter)"
          opacity="0.4"
          style={{
            animation: `moveNoise ${getSpeed()} infinite linear`,
          }}
        />
      </svg>
      <div className={cn("relative z-10", className)}>{children}</div>
      
      <style jsx>{`
        @keyframes moveNoise {
          0% {
            transform: translateX(0px) translateY(0px);
          }
          10% {
            transform: translateX(-5px) translateY(-10px);
          }
          20% {
            transform: translateX(-10px) translateY(10px);
          }
          30% {
            transform: translateX(5px) translateY(-10px);
          }
          40% {
            transform: translateX(-5px) translateY(15px);
          }
          50% {
            transform: translateX(-10px) translateY(5px);
          }
          60% {
            transform: translateX(15px) translateY(0px);
          }
          70% {
            transform: translateX(0px) translateY(10px);
          }
          80% {
            transform: translateX(-15px) translateY(0px);
          }
          90% {
            transform: translateX(10px) translateY(5px);
          }
          100% {
            transform: translateX(5px) translateY(0px);
          }
        }
      `}</style>
    </div>
  );
};