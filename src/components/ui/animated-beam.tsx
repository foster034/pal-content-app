"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLElement>;
  fromRef: React.RefObject<HTMLElement>;
  toRef: React.RefObject<HTMLElement>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export const AnimatedBeam = forwardRef<SVGSVGElement, AnimatedBeamProps>(
  (
    {
      className,
      containerRef,
      fromRef,
      toRef,
      curvature = 0,
      reverse = false,
      duration = Math.random() * 3 + 4,
      delay = 0,
      pathColor = "gray",
      pathWidth = 2,
      pathOpacity = 0.2,
      gradientStartColor = "#ffaa40",
      gradientStopColor = "#9c40ff",
      startXOffset = 0,
      startYOffset = 0,
      endXOffset = 0,
      endYOffset = 0,
    },
    ref
  ) => {
    const id = React.useId();
    const svgRef = useRef<SVGSVGElement>(null);
    const [pathD, setPathD] = React.useState("");
    const [svgDimensions, setSvgDimensions] = React.useState({
      width: 0,
      height: 0,
    });

    const updatePath = React.useCallback(() => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({
          width: svgWidth,
          height: svgHeight,
        });

        const startX = rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY = rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX = rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        const controlPointX = startX + (endX - startX) / 2;
        const controlPointY = startY + (endY - startY) / 2 - curvature;

        const d = `M ${startX},${startY} Q ${controlPointX},${controlPointY} ${endX},${endY}`;
        setPathD(d);
      }
    }, [
      containerRef,
      fromRef,
      toRef,
      curvature,
      startXOffset,
      startYOffset,
      endXOffset,
      endYOffset,
    ]);

    React.useEffect(() => {
      updatePath();
    }, [updatePath]);

    React.useEffect(() => {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          updatePath();
        }
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, [updatePath, containerRef]);

    return (
      <svg
        ref={ref}
        width={svgDimensions.width}
        height={svgDimensions.height}
        viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
        className={cn("absolute inset-0", className)}
      >
        <defs>
          <linearGradient
            id={`gradient-${id}`}
            gradientUnits="userSpaceOnUse"
            x1="0%"
            x2="100%"
            y1="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor={gradientStartColor} />
            <stop offset="100%" stopColor={gradientStopColor} />
          </linearGradient>
        </defs>
        {pathD && (
          <motion.path
            d={pathD}
            fill="none"
            stroke={pathColor}
            strokeWidth={pathWidth}
            strokeOpacity={pathOpacity}
          />
        )}
        <AnimatePresence>
          {pathD && (
            <motion.path
              d={pathD}
              fill="none"
              strokeWidth={pathWidth}
              stroke={`url(#gradient-${id})`}
              strokeDasharray="20 20"
              initial={{
                strokeDashoffset: reverse ? -40 : 40,
                opacity: 0,
              }}
              animate={{
                strokeDashoffset: reverse ? -1000 : 1000,
                opacity: 1,
              }}
              transition={{
                strokeDashoffset: {
                  duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay,
                },
                opacity: {
                  duration: 0.5,
                  delay,
                },
              }}
            />
          )}
        </AnimatePresence>
      </svg>
    );
  }
);

AnimatedBeam.displayName = "AnimatedBeam";