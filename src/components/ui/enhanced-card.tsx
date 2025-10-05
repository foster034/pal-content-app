'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

// Enhanced Card Base Component
interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient' | 'interactive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  glow?: boolean;
  border?: 'none' | 'subtle' | 'accent' | 'gradient';
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = 'default', size = 'md', hover = false, glow = false, border = 'subtle', children, ...props }, ref) => {
    const getCardClasses = () => {
      const baseClasses = "relative overflow-hidden transition-all duration-300 ease-out";

      const sizeClasses = {
        sm: "p-4 rounded-lg",
        md: "p-6 rounded-xl",
        lg: "p-8 rounded-2xl",
        xl: "p-10 rounded-3xl"
      };

      const variantClasses = {
        default: "bg-white dark:bg-gray-800 shadow-sm",
        elevated: "bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl",
        glass: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl border border-white/20",
        gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg",
        interactive: "bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl cursor-pointer"
      };

      const borderClasses = {
        none: "",
        subtle: "border border-gray-200 dark:border-gray-700",
        accent: "border border-purple-200 dark:border-purple-800",
        gradient: "border border-transparent bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800"
      };

      const hoverClasses = hover ? "hover:scale-[1.02] hover:-translate-y-1" : "";
      const glowClasses = glow ? "shadow-purple-500/25 dark:shadow-purple-400/25" : "";

      return cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        borderClasses[border],
        hoverClasses,
        glowClasses,
        className
      );
    };

    return (
      <div ref={ref} className={getCardClasses()} {...props}>
        {glow && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-[inherit] opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

// Selection Card Component
interface SelectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: LucideIcon | React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  variant?: 'default' | 'compact' | 'feature';
  badge?: string;
}

const SelectionCard = forwardRef<HTMLDivElement, SelectionCardProps>(
  ({
    className,
    title,
    description,
    icon,
    selected = false,
    disabled = false,
    onSelect,
    variant = 'default',
    badge,
    ...props
  }, ref) => {
    const Icon = icon as LucideIcon;

    const getCardClasses = () => {
      const baseClasses = "relative cursor-pointer transition-all duration-200 group";

      const variantClasses = {
        default: "p-6 rounded-xl border-2",
        compact: "p-4 rounded-lg border-2",
        feature: "p-8 rounded-2xl border-2"
      };

      const stateClasses = {
        selected: "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg ring-2 ring-purple-200 dark:ring-purple-800",
        unselected: "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 hover:bg-purple-25 dark:hover:bg-purple-900/10",
        disabled: "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed"
      };

      const state = disabled ? 'disabled' : selected ? 'selected' : 'unselected';

      return cn(
        baseClasses,
        variantClasses[variant],
        stateClasses[state],
        className
      );
    };

    return (
      <div
        ref={ref}
        className={getCardClasses()}
        onClick={!disabled ? onSelect : undefined}
        {...props}
      >
        {/* Selection indicator */}
        {selected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
            {badge}
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Icon */}
          {icon && (
            <div className={cn(
              "flex-shrink-0 rounded-lg flex items-center justify-center transition-colors duration-200",
              variant === 'feature' ? 'w-12 h-12' : 'w-10 h-10',
              selected
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600'
            )}>
              {typeof icon === 'function' ? (
                <Icon className={variant === 'feature' ? 'w-6 h-6' : 'w-5 h-5'} />
              ) : (
                icon
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold transition-colors duration-200",
              variant === 'feature' ? 'text-lg' : 'text-base',
              selected ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-gray-100'
            )}>
              {title}
            </h3>
            {description && (
              <p className={cn(
                "text-gray-600 dark:text-gray-400 mt-1",
                variant === 'compact' ? 'text-sm' : 'text-sm'
              )}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    );
  }
);

SelectionCard.displayName = "SelectionCard";

// Photo Upload Card Component
interface PhotoUploadCardProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'camera' | 'upload' | 'preview';
  onAction?: () => void;
  onRemove?: () => void;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  loading?: boolean;
}

const PhotoUploadCard = forwardRef<HTMLDivElement, PhotoUploadCardProps>(
  ({
    className,
    type,
    onAction,
    onRemove,
    imageUrl,
    title,
    subtitle,
    icon: Icon,
    loading = false,
    ...props
  }, ref) => {
    if (type === 'preview' && imageUrl) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square",
            className
          )}
          {...props}
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      );
    }

    return (
      <button
        ref={ref}
        onClick={onAction}
        disabled={loading}
        className={cn(
          "relative w-full aspect-square rounded-xl border-2 border-dashed transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed",
          type === 'camera'
            ? "border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center justify-center h-full p-4">
          {loading ? (
            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {Icon && (
                <Icon className={cn(
                  "mb-2 transition-transform duration-200 group-hover:scale-110",
                  type === 'camera' ? 'w-8 h-8 text-blue-600 dark:text-blue-400' : 'w-8 h-8 text-gray-400 dark:text-gray-500'
                )} />
              )}
              {title && (
                <p className={cn(
                  "font-medium text-sm transition-colors duration-200",
                  type === 'camera' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                )}>
                  {title}
                </p>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </button>
    );
  }
);

PhotoUploadCard.displayName = "PhotoUploadCard";

// Stats Card Component
interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  description?: string;
  trend?: number[];
}

const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({
    className,
    title,
    value,
    change,
    changeType = 'neutral',
    icon: Icon,
    description,
    trend,
    ...props
  }, ref) => {
    const changeColors = {
      positive: 'text-green-600 dark:text-green-400',
      negative: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400'
    };

    return (
      <EnhancedCard
        ref={ref}
        variant="elevated"
        size="md"
        hover
        className={cn("group", className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {value}
            </p>
            {change && (
              <p className={cn("text-sm font-medium", changeColors[changeType])}>
                {change}
              </p>
            )}
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>

          {Icon && (
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors duration-200">
              <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          )}
        </div>

        {/* Simple trend line */}
        {trend && trend.length > 0 && (
          <div className="mt-4 h-16 flex items-end space-x-1">
            {trend.map((point, index) => (
              <div
                key={index}
                className="flex-1 bg-purple-200 dark:bg-purple-800 rounded-sm transition-all duration-300 hover:bg-purple-300 dark:hover:bg-purple-700"
                style={{ height: `${(point / Math.max(...trend)) * 100}%` }}
              />
            ))}
          </div>
        )}
      </EnhancedCard>
    );
  }
);

StatsCard.displayName = "StatsCard";

export { EnhancedCard, SelectionCard, PhotoUploadCard, StatsCard };