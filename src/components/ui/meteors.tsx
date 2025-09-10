"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MeteorData {
  left: number;
  delay: number;
  duration: number;
}

export default function Meteors({
  number = 20,
  className,
}: {
  number?: number;
  className?: string;
}) {
  const [meteors, setMeteors] = useState<MeteorData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const meteorData: MeteorData[] = [];
    for (let i = 0; i < number; i++) {
      meteorData.push({
        left: Math.floor(Math.random() * (400 - -400) + -400),
        delay: Math.random() * (0.8 - 0.2) + 0.2,
        duration: Math.floor(Math.random() * (10 - 2) + 2),
      });
    }
    setMeteors(meteorData);
  }, [number]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {meteors.map((meteor, idx) => (
        <span
          key={idx}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={{
            top: 0,
            left: meteor.left + "px",
            animationDelay: meteor.delay + "s",
            animationDuration: meteor.duration + "s",
          }}
        />
      ))}
    </>
  );
}