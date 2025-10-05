'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Loader2 } from 'lucide-react';

// Enhanced Button Component
interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  pulse?: boolean;
  asChild?: boolean;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    rounded = 'lg',
    shadow = 'md',
    glow = false,
    pulse = false,
    children,
    disabled,
    ...props
  }, ref) => {

    const baseClasses = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

    const sizeClasses = {
      xs: "h-7 px-2 text-xs gap-1",
      sm: "h-9 px-3 text-sm gap-1.5",
      md: "h-11 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2",
      xl: "h-14 px-8 text-lg gap-3"
    };

    const roundedClasses = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-xl",
      xl: "rounded-2xl",
      full: "rounded-full"
    };

    const shadowClasses = {
      none: "",
      sm: "shadow-sm hover:shadow-md",
      md: "shadow-md hover:shadow-lg",
      lg: "shadow-lg hover:shadow-xl",
      xl: "shadow-xl hover:shadow-2xl"
    };

    const variantClasses = {
      primary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white focus:ring-purple-500 transform hover:scale-[1.02] active:scale-[0.98]",
      secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 transform hover:scale-[1.02] active:scale-[0.98]",
      outline: "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white focus:ring-purple-500 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-400 dark:hover:text-gray-900",
      ghost: "text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/20 focus:ring-purple-500",
      destructive: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-red-500 transform hover:scale-[1.02] active:scale-[0.98]",
      success: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white focus:ring-green-500 transform hover:scale-[1.02] active:scale-[0.98]",
      gradient: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white focus:ring-purple-500 transform hover:scale-[1.02] active:scale-[0.98]"
    };

    const getButtonClasses = () => {
      return cn(
        baseClasses,
        sizeClasses[size],
        roundedClasses[rounded],
        shadowClasses[shadow],
        variantClasses[variant],
        fullWidth && "w-full",
        glow && "shadow-purple-500/25 dark:shadow-purple-400/25",
        pulse && !disabled && "animate-pulse",
        loading && "pointer-events-none",
        className
      );
    };

    const renderIcon = (position: 'left' | 'right') => {
      if (loading && position === 'left') {
        return <Loader2 className="animate-spin" />;
      }

      if (Icon && iconPosition === position && !loading) {
        return <Icon />;
      }

      return null;
    };

    const iconSize = {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      md: "w-4 h-4",
      lg: "w-5 h-5",
      xl: "w-6 h-6"
    };

    return (
      <button
        ref={ref}
        className={getButtonClasses()}
        disabled={disabled || loading}
        {...props}
      >
        {/* Left Icon or Loading Spinner */}
        <span className={cn(iconSize[size], !children && "mr-0")}>
          {renderIcon('left')}
        </span>

        {/* Button Content */}
        {children && (
          <span className={loading && iconPosition === 'left' ? "ml-1" : ""}>
            {children}
          </span>
        )}

        {/* Right Icon */}
        <span className={cn(iconSize[size], !children && "ml-0")}>
          {renderIcon('right')}
        </span>

        {/* Glow Effect */}
        {glow && !disabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-[inherit] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
      </button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

// Button Group Component
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({
    className,
    orientation = 'horizontal',
    size = 'md',
    variant = 'outline',
    rounded = 'md',
    spacing = 'none',
    children,
    ...props
  }, ref) => {

    const orientationClasses = {
      horizontal: "flex-row",
      vertical: "flex-col"
    };

    const spacingClasses = {
      none: orientation === 'horizontal' ? "space-x-0" : "space-y-0",
      sm: orientation === 'horizontal' ? "space-x-1" : "space-y-1",
      md: orientation === 'horizontal' ? "space-x-2" : "space-y-2",
      lg: orientation === 'horizontal' ? "space-x-3" : "space-y-3"
    };

    const getGroupClasses = () => {
      return cn(
        "inline-flex",
        orientationClasses[orientation],
        spacing !== 'none' && spacingClasses[spacing],
        spacing === 'none' && "[&>*:not(:first-child)]:border-l-0 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none",
        className
      );
    };

    return (
      <div ref={ref} className={getGroupClasses()} {...props}>
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

// Icon Button Component
interface IconButtonProps extends Omit<EnhancedButtonProps, 'children'> {
  icon: LucideIcon;
  label?: string;
  tooltip?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    icon: Icon,
    label,
    tooltip,
    size = 'md',
    variant = 'ghost',
    rounded = 'full',
    ...props
  }, ref) => {

    const iconSizes = {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
      xl: "w-7 h-7"
    };

    return (
      <EnhancedButton
        ref={ref}
        size={size}
        variant={variant}
        rounded={rounded}
        title={tooltip || label}
        aria-label={label}
        {...props}
      >
        <Icon className={iconSizes[size]} />
      </EnhancedButton>
    );
  }
);

IconButton.displayName = "IconButton";

// Loading Button Component
interface LoadingButtonProps extends EnhancedButtonProps {
  loadingText?: string;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({
    children,
    loadingText = "Loading...",
    loading = false,
    ...props
  }, ref) => {

    return (
      <EnhancedButton
        ref={ref}
        loading={loading}
        {...props}
      >
        {loading ? loadingText : children}
      </EnhancedButton>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

// Floating Action Button Component
interface FABProps extends Omit<EnhancedButtonProps, 'size' | 'rounded'> {
  size?: 'md' | 'lg' | 'xl';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  extended?: boolean;
}

const FloatingActionButton = forwardRef<HTMLButtonElement, FABProps>(
  ({
    className,
    size = 'lg',
    position = 'bottom-right',
    extended = false,
    children,
    ...props
  }, ref) => {

    const sizeClasses = {
      md: extended ? "h-12 px-4" : "w-12 h-12",
      lg: extended ? "h-14 px-6" : "w-14 h-14",
      xl: extended ? "h-16 px-8" : "w-16 h-16"
    };

    const positionClasses = {
      'bottom-right': "fixed bottom-6 right-6",
      'bottom-left': "fixed bottom-6 left-6",
      'top-right': "fixed top-6 right-6",
      'top-left': "fixed top-6 left-6"
    };

    return (
      <EnhancedButton
        ref={ref}
        rounded="full"
        shadow="xl"
        glow
        className={cn(
          positionClasses[position],
          sizeClasses[size],
          "z-50",
          className
        )}
        {...props}
      >
        {children}
      </EnhancedButton>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";

export {
  EnhancedButton,
  ButtonGroup,
  IconButton,
  LoadingButton,
  FloatingActionButton
};

export type {
  EnhancedButtonProps,
  ButtonGroupProps,
  IconButtonProps,
  LoadingButtonProps,
  FABProps
};