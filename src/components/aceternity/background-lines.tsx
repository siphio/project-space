"use client";

import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundLines = ({
  children,
  className,
  svgOptions,
}: {
  children: React.ReactNode;
  className?: string;
  svgOptions?: {
    duration?: number;
  };
}) => {
  return (
    <div className={cn("relative w-full", className)}>
      <SVGBackground {...svgOptions} />
      {children}
    </div>
  );
};

const SVGBackground = ({ duration = 10 }: { duration?: number }) => {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid-pattern"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-muted-foreground/20"
          />
        </pattern>
        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      {[...Array(5)].map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0%"
          y1={`${20 + i * 15}%`}
          x2="100%"
          y2={`${20 + i * 15}%`}
          stroke="url(#line-gradient)"
          strokeWidth="1"
          className="text-primary"
        >
          <animate
            attributeName="opacity"
            values="0;0.5;0"
            dur={`${duration + i * 2}s`}
            repeatCount="indefinite"
            begin={`${i * 0.5}s`}
          />
        </line>
      ))}
      {[...Array(5)].map((_, i) => (
        <line
          key={`v-${i}`}
          x1={`${20 + i * 15}%`}
          y1="0%"
          x2={`${20 + i * 15}%`}
          y2="100%"
          stroke="url(#line-gradient)"
          strokeWidth="1"
          className="text-primary"
        >
          <animate
            attributeName="opacity"
            values="0;0.5;0"
            dur={`${duration + i * 2}s`}
            repeatCount="indefinite"
            begin={`${i * 0.7}s`}
          />
        </line>
      ))}
    </svg>
  );
};
