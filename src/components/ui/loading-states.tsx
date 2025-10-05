'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Skeleton Component
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({
    className,
    variant = 'text',
    width,
    height,
    animation = 'pulse',
    style,
    ...props
  }, ref) => {

    const variantClasses = {
      text: 'h-4 w-full',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-lg'
    };

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer',
      none: ''
    };

    const baseClasses = "bg-gray-200 dark:bg-gray-700";

    const getSkeletonClasses = () => {
      return cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      );
    };

    const customStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style
    };

    return (
      <div
        ref={ref}
        className={getSkeletonClasses()}
        style={customStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Loading Spinner Component
interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'bars' | 'ring' | 'pulse';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  label?: string;
}

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({
    className,
    size = 'md',
    variant = 'default',
    color = 'primary',
    label,
    ...props
  }, ref) => {

    const sizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };

    const colorClasses = {
      primary: 'text-purple-600',
      secondary: 'text-gray-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      danger: 'text-red-600'
    };

    const SpinnerVariant = () => {
      switch (variant) {
        case 'dots':
          return (
            <div className={cn("flex space-x-1", className)}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-full bg-current animate-bounce",
                    sizeClasses[size],
                    colorClasses[color]
                  )}
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '0.6s'
                  }}
                />
              ))}
            </div>
          );

        case 'bars':
          return (
            <div className={cn("flex space-x-1 items-end", className)}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "bg-current animate-pulse",
                    `w-${size === 'xs' ? '1' : size === 'sm' ? '1' : '1.5'} h-${sizeClasses[size].split(' ')[1].split('-')[1]}`,
                    colorClasses[color]
                  )}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s'
                  }}
                />
              ))}
            </div>
          );

        case 'ring':
          return (
            <div
              className={cn(
                "border-2 border-gray-200 border-t-current rounded-full animate-spin",
                sizeClasses[size],
                colorClasses[color],
                className
              )}
            />
          );

        case 'pulse':
          return (
            <div className={cn("relative", className)}>
              <div
                className={cn(
                  "rounded-full bg-current animate-ping absolute inset-0",
                  sizeClasses[size],
                  colorClasses[color]
                )}
              />
              <div
                className={cn(
                  "rounded-full bg-current",
                  sizeClasses[size],
                  colorClasses[color]
                )}
              />
            </div>
          );

        default:
          return (
            <div
              className={cn(
                "border-2 border-gray-200 dark:border-gray-700 border-t-current rounded-full animate-spin",
                sizeClasses[size],
                colorClasses[color],
                className
              )}
            />
          );
      }
    };

    return (
      <div
        ref={ref}
        className="flex flex-col items-center justify-center space-y-2"
        {...props}
      >
        <SpinnerVariant />
        {label && (
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            {label}
          </p>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

// Progress Bar Component
interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'default' | 'gradient' | 'striped' | 'animated';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({
    className,
    value = 0,
    max = 100,
    variant = 'default',
    size = 'md',
    color = 'primary',
    showLabel = false,
    label,
    ...props
  }, ref) => {

    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    };

    const colorClasses = {
      primary: 'bg-purple-600',
      secondary: 'bg-gray-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      danger: 'bg-red-600'
    };

    const gradientClasses = {
      primary: 'bg-gradient-to-r from-purple-600 to-blue-600',
      secondary: 'bg-gradient-to-r from-gray-600 to-gray-700',
      success: 'bg-gradient-to-r from-green-600 to-emerald-600',
      warning: 'bg-gradient-to-r from-yellow-600 to-orange-600',
      danger: 'bg-gradient-to-r from-red-600 to-red-700'
    };

    const getProgressClasses = () => {
      let classes = cn(
        "transition-all duration-300 ease-out rounded-full",
        sizeClasses[size]
      );

      if (variant === 'gradient') {
        classes = cn(classes, gradientClasses[color]);
      } else {
        classes = cn(classes, colorClasses[color]);
      }

      if (variant === 'striped' || variant === 'animated') {
        classes = cn(classes, "bg-striped");
      }

      if (variant === 'animated') {
        classes = cn(classes, "animate-progress");
      }

      return classes;
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label || `Progress`}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div className={cn(
          "w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
          sizeClasses[size]
        )}>
          <div
            className={getProgressClasses()}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

// Loading Overlay Component
interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  visible?: boolean;
  blur?: boolean;
  spinner?: boolean;
  message?: string;
  backdrop?: 'dark' | 'light' | 'blur';
}

const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({
    className,
    visible = false,
    blur = true,
    spinner = true,
    message,
    backdrop = 'dark',
    children,
    ...props
  }, ref) => {

    const backdropClasses = {
      dark: 'bg-black/50',
      light: 'bg-white/80',
      blur: 'bg-white/80 backdrop-blur-sm dark:bg-black/50'
    };

    if (!visible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          backdropClasses[backdrop],
          className
        )}
        {...props}
      >
        <div className="text-center">
          {spinner && (
            <LoadingSpinner
              size="lg"
              variant="default"
              color="primary"
              className="mb-4"
            />
          )}
          {message && (
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {message}
            </p>
          )}
          {children}
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = "LoadingOverlay";

// Skeleton variants for common UI patterns
const SkeletonCard = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 space-y-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700", className)} {...props}>
    <Skeleton variant="rectangular" height={200} />
    <Skeleton variant="text" height={20} />
    <Skeleton variant="text" height={16} width="60%" />
    <div className="flex space-x-2">
      <Skeleton variant="rectangular" height={32} width={80} />
      <Skeleton variant="rectangular" height={32} width={80} />
    </div>
  </div>
);

const SkeletonAvatar = ({ size = 'md', className, ...props }: { size?: 'sm' | 'md' | 'lg' } & React.HTMLAttributes<HTMLDivElement>) => {
  const sizeMap = { sm: 32, md: 40, lg: 48 };
  return (
    <Skeleton
      variant="circular"
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={className}
      {...props}
    />
  );
};

const SkeletonText = ({ lines = 3, className, ...props }: { lines?: number } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-2", className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? "60%" : "100%"}
      />
    ))}
  </div>
);

// Add custom CSS for animations
const customStyles = `
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }

  .animate-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }

  .dark .animate-shimmer {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200px 100%;
  }

  @keyframes progress {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }

  .animate-progress {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1rem 1rem;
    animation: progress 1s linear infinite;
  }

  .bg-striped {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1rem 1rem;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = customStyles;
  document.head.appendChild(style);
}

export {
  Skeleton,
  LoadingSpinner,
  ProgressBar,
  LoadingOverlay,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonText
};

export type {
  SkeletonProps,
  LoadingSpinnerProps,
  ProgressBarProps,
  LoadingOverlayProps
};