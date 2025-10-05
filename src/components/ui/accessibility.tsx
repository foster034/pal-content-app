'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Screen Reader Only Component
interface ScreenReaderOnlyProps extends React.HTMLAttributes<HTMLSpanElement> {}

const ScreenReaderOnly = forwardRef<HTMLSpanElement, ScreenReaderOnlyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

ScreenReaderOnly.displayName = "ScreenReaderOnly";

// Focus Trap Component
interface FocusTrapProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  restoreFocus?: boolean;
}

const FocusTrap = forwardRef<HTMLDivElement, FocusTrapProps>(
  ({ className, active = true, restoreFocus = true, children, ...props }, ref) => {
    const [lastActiveElement, setLastActiveElement] = useState<Element | null>(null);

    useEffect(() => {
      if (!active) return;

      // Store the currently focused element
      setLastActiveElement(document.activeElement);

      const container = ref?.current;
      if (!container) return;

      // Get all focusable elements
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      // Focus the first element
      firstElement?.focus();

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);

      return () => {
        document.removeEventListener('keydown', handleTabKey);

        // Restore focus when component unmounts
        if (restoreFocus && lastActiveElement && 'focus' in lastActiveElement) {
          (lastActiveElement as HTMLElement).focus();
        }
      };
    }, [active, restoreFocus, ref]);

    if (!active) return <div className={className} {...props}>{children}</div>;

    return (
      <div
        ref={ref}
        className={cn('focus-trap', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FocusTrap.displayName = "FocusTrap";

// Skip Navigation Component
interface SkipNavProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  targetId: string;
  label?: string;
}

const SkipNav = forwardRef<HTMLAnchorElement, SkipNavProps>(
  ({ className, targetId, label = "Skip to main content", ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={`#${targetId}`}
        className={cn(
          'absolute top-0 left-0 z-50 p-4 bg-white text-purple-600 font-medium rounded-br-lg shadow-lg',
          'transform -translate-y-full focus:translate-y-0',
          'transition-transform duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-purple-500',
          className
        )}
        {...props}
      >
        {label}
      </a>
    );
  }
);

SkipNav.displayName = "SkipNav";

// Landmark Component for better navigation
interface LandmarkProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'main' | 'nav' | 'aside' | 'section' | 'header' | 'footer';
  label?: string;
}

const Landmark = forwardRef<HTMLElement, LandmarkProps>(
  ({ as: Component = 'section', className, label, children, ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        aria-label={label}
        className={cn('focus:outline-none', className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Landmark.displayName = "Landmark";

// Accessible Button Component with enhanced ARIA support
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  expanded?: boolean;
  controls?: string;
  describedBy?: string;
  pressed?: boolean;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    className,
    loading = false,
    loadingText = "Loading...",
    expanded,
    controls,
    describedBy,
    pressed,
    children,
    disabled,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
          'transition-all duration-200',
          className
        )}
        aria-expanded={expanded}
        aria-controls={controls}
        aria-describedby={describedBy}
        aria-pressed={pressed}
        aria-busy={loading}
        disabled={disabled || loading}
        {...props}
      >
        <ScreenReaderOnly>
          {loading && loadingText}
        </ScreenReaderOnly>
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

// Live Region Component for dynamic content announcements
interface LiveRegionProps extends React.HTMLAttributes<HTMLDivElement> {
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
}

const LiveRegion = forwardRef<HTMLDivElement, LiveRegionProps>(
  ({
    className,
    politeness = 'polite',
    atomic = false,
    relevant = 'additions text',
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        aria-live={politeness}
        aria-atomic={atomic}
        aria-relevant={relevant}
        className={cn('sr-only', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

LiveRegion.displayName = "LiveRegion";

// Progress Indicator with Accessibility
interface AccessibleProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  valueText?: string;
}

const AccessibleProgress = forwardRef<HTMLDivElement, AccessibleProgressProps>(
  ({
    className,
    value,
    max = 100,
    label,
    valueText,
    children,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const defaultValueText = `${Math.round(percentage)}% complete`;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={valueText || defaultValueText}
        aria-label={label}
        className={cn('relative', className)}
        {...props}
      >
        {children}
        <ScreenReaderOnly>
          {valueText || defaultValueText}
        </ScreenReaderOnly>
      </div>
    );
  }
);

AccessibleProgress.displayName = "AccessibleProgress";

// Mobile-Optimized Touch Target
interface TouchTargetProps extends React.HTMLAttributes<HTMLDivElement> {
  minSize?: number;
  as?: keyof JSX.IntrinsicElements;
}

const TouchTarget = forwardRef<HTMLDivElement, TouchTargetProps>(
  ({ className, minSize = 44, as: Component = 'div', children, style, ...props }, ref) => {
    const touchStyles: React.CSSProperties = {
      minHeight: `${minSize}px`,
      minWidth: `${minSize}px`,
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
      ...style
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'flex items-center justify-center',
          'cursor-pointer select-none',
          className
        )}
        style={touchStyles}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

TouchTarget.displayName = "TouchTarget";

// Responsive Text Component
interface ResponsiveTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  responsive?: boolean;
}

const ResponsiveText = forwardRef<HTMLElement, ResponsiveTextProps>(
  ({ className, as: Component = 'p', responsive = true, children, ...props }, ref) => {
    const responsiveClasses = responsive
      ? 'text-sm sm:text-base md:text-lg lg:text-xl'
      : '';

    return (
      <Component
        ref={ref as any}
        className={cn(
          responsiveClasses,
          'leading-relaxed',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveText.displayName = "ResponsiveText";

// Mobile-First Container
interface MobileContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  center?: boolean;
}

const MobileContainer = forwardRef<HTMLDivElement, MobileContainerProps>(
  ({
    className,
    padding = 'md',
    maxWidth = 'lg',
    center = true,
    children,
    ...props
  }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'px-4 sm:px-6',
      md: 'px-4 sm:px-6 md:px-8',
      lg: 'px-4 sm:px-6 md:px-8 lg:px-12',
      xl: 'px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16'
    };

    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          paddingClasses[padding],
          maxWidthClasses[maxWidth],
          center && 'mx-auto',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MobileContainer.displayName = "MobileContainer";

// Reduced Motion Wrapper
interface ReducedMotionProps extends React.HTMLAttributes<HTMLDivElement> {
  fallback?: React.ReactNode;
}

const ReducedMotion = forwardRef<HTMLDivElement, ReducedMotionProps>(
  ({ className, fallback, children, ...props }, ref) => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
      <div ref={ref} className={className} {...props}>
        {prefersReducedMotion ? fallback || children : children}
      </div>
    );
  }
);

ReducedMotion.displayName = "ReducedMotion";

// High Contrast Support
interface HighContrastProps extends React.HTMLAttributes<HTMLDivElement> {
  highContrastClass?: string;
}

const HighContrast = forwardRef<HTMLDivElement, HighContrastProps>(
  ({ className, highContrastClass, children, ...props }, ref) => {
    const [isHighContrast, setIsHighContrast] = useState(false);

    useEffect(() => {
      const checkHighContrast = () => {
        // Check for high contrast mode indicators
        const isWindows = navigator.platform.indexOf('Win') > -1;
        if (isWindows) {
          // Windows high contrast detection
          const testElement = document.createElement('div');
          testElement.style.position = 'absolute';
          testElement.style.visibility = 'hidden';
          testElement.style.backgroundColor = 'rgb(31, 31, 31)';
          testElement.style.borderColor = 'rgb(255, 255, 255)';
          document.body.appendChild(testElement);

          const computedStyle = window.getComputedStyle(testElement);
          const highContrast = computedStyle.backgroundColor === 'rgb(0, 0, 0)';

          document.body.removeChild(testElement);
          setIsHighContrast(highContrast);
        }
      };

      checkHighContrast();
      window.addEventListener('focus', checkHighContrast);

      return () => window.removeEventListener('focus', checkHighContrast);
    }, []);

    return (
      <div
        ref={ref}
        className={cn(
          className,
          isHighContrast && highContrastClass
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HighContrast.displayName = "HighContrast";

export {
  ScreenReaderOnly,
  FocusTrap,
  SkipNav,
  Landmark,
  AccessibleButton,
  LiveRegion,
  AccessibleProgress,
  TouchTarget,
  ResponsiveText,
  MobileContainer,
  ReducedMotion,
  HighContrast
};

export type {
  ScreenReaderOnlyProps,
  FocusTrapProps,
  SkipNavProps,
  LandmarkProps,
  AccessibleButtonProps,
  LiveRegionProps,
  AccessibleProgressProps,
  TouchTargetProps,
  ResponsiveTextProps,
  MobileContainerProps,
  ReducedMotionProps,
  HighContrastProps
};