'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

// Enhanced Input Component
interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  icon?: LucideIcon;
  endIcon?: LucideIcon;
  onEndIconClick?: () => void;
  variant?: 'default' | 'filled' | 'outlined' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({
    className,
    label,
    error,
    success,
    hint,
    icon: Icon,
    endIcon: EndIcon,
    onEndIconClick,
    variant = 'default',
    size = 'md',
    loading = false,
    type,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const sizeClasses = {
      sm: 'h-10 px-3 text-sm',
      md: 'h-12 px-4',
      lg: 'h-14 px-5 text-lg'
    };

    const variantClasses = {
      default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800',
      filled: 'border-0 bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-purple-500',
      outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-purple-500',
      minimal: 'border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent rounded-none focus:border-purple-500'
    };

    const getContainerClasses = () => {
      return cn(
        "relative transition-all duration-200",
        error && "animate-shake",
        className
      );
    };

    const getInputClasses = () => {
      return cn(
        "w-full font-medium transition-all duration-200 rounded-xl",
        "placeholder:text-gray-400 dark:placeholder:text-gray-500",
        "focus:outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        variantClasses[variant],
        Icon && "pl-12",
        (EndIcon || isPassword) && "pr-12",
        error && "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800",
        success && "border-green-500 focus:border-green-500 focus:ring-green-200 dark:focus:ring-green-800",
        isFocused && "shadow-lg"
      );
    };

    return (
      <div className={getContainerClasses()}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Start Icon */}
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Icon className="w-5 h-5" />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={getInputClasses()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* End Icon / Password Toggle / Loading */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            {loading && (
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            )}

            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}

            {EndIcon && (
              <button
                type="button"
                onClick={onEndIconClick}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <EndIcon className="w-5 h-5" />
              </button>
            )}

            {/* Status Icons */}
            {error && <X className="w-5 h-5 text-red-500" />}
            {success && <Check className="w-5 h-5 text-green-500" />}
          </div>

          {/* Focus Ring */}
          {isFocused && (
            <div className="absolute inset-0 rounded-xl ring-2 ring-purple-500/20 pointer-events-none" />
          )}
        </div>

        {/* Messages */}
        <div className="mt-2 min-h-[1.25rem]">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {error}
            </p>
          )}
          {success && !error && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <Check className="w-4 h-4 mr-1 flex-shrink-0" />
              {success}
            </p>
          )}
          {hint && !error && !success && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
          )}
        </div>
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

// Enhanced Textarea Component
interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  variant?: 'default' | 'filled' | 'outlined' | 'minimal';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  charCount?: boolean;
  maxLength?: number;
}

const EnhancedTextarea = forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({
    className,
    label,
    error,
    success,
    hint,
    variant = 'default',
    resize = 'vertical',
    charCount = false,
    maxLength,
    value,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const currentLength = String(value || '').length;

    const variantClasses = {
      default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800',
      filled: 'border-0 bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-purple-500',
      outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-purple-500',
      minimal: 'border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent rounded-none focus:border-purple-500'
    };

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };

    const getTextareaClasses = () => {
      return cn(
        "w-full p-4 font-medium transition-all duration-200 rounded-xl min-h-[120px]",
        "placeholder:text-gray-400 dark:placeholder:text-gray-500",
        "focus:outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        resizeClasses[resize],
        error && "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800",
        success && "border-green-500 focus:border-green-500 focus:ring-green-200 dark:focus:ring-green-800",
        isFocused && "shadow-lg",
        className
      );
    };

    return (
      <div className="relative transition-all duration-200">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Textarea Container */}
        <div className="relative">
          <textarea
            ref={ref}
            className={getTextareaClasses()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={maxLength}
            value={value}
            {...props}
          />

          {/* Character Count */}
          {charCount && (
            <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
              {currentLength}
              {maxLength && `/${maxLength}`}
            </div>
          )}

          {/* Focus Ring */}
          {isFocused && (
            <div className="absolute inset-0 rounded-xl ring-2 ring-purple-500/20 pointer-events-none" />
          )}
        </div>

        {/* Messages */}
        <div className="mt-2 min-h-[1.25rem]">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {error}
            </p>
          )}
          {success && !error && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <Check className="w-4 h-4 mr-1 flex-shrink-0" />
              {success}
            </p>
          )}
          {hint && !error && !success && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
          )}
        </div>
      </div>
    );
  }
);

EnhancedTextarea.displayName = "EnhancedTextarea";

// Enhanced Select Component
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: LucideIcon;
}

interface EnhancedSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'filled' | 'outlined' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
}

const EnhancedSelect = forwardRef<HTMLSelectElement, EnhancedSelectProps>(
  ({
    className,
    label,
    error,
    success,
    hint,
    options,
    placeholder,
    variant = 'default',
    size = 'md',
    icon: Icon,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const sizeClasses = {
      sm: 'h-10 px-3 text-sm',
      md: 'h-12 px-4',
      lg: 'h-14 px-5 text-lg'
    };

    const variantClasses = {
      default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800',
      filled: 'border-0 bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-purple-500',
      outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-purple-500',
      minimal: 'border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent rounded-none focus:border-purple-500'
    };

    const getSelectClasses = () => {
      return cn(
        "w-full font-medium transition-all duration-200 rounded-xl appearance-none cursor-pointer",
        "focus:outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        variantClasses[variant],
        Icon && "pl-12",
        "pr-12", // Always add right padding for the arrow
        error && "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800",
        success && "border-green-500 focus:border-green-500 focus:ring-green-200 dark:focus:ring-green-800",
        isFocused && "shadow-lg",
        className
      );
    };

    return (
      <div className="relative transition-all duration-200">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Select Container */}
        <div className="relative">
          {/* Start Icon */}
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Icon className="w-5 h-5" />
            </div>
          )}

          {/* Select */}
          <select
            ref={ref}
            className={getSelectClasses()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Status Icons */}
          {error && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <X className="w-5 h-5 text-red-500" />
            </div>
          )}
          {success && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <Check className="w-5 h-5 text-green-500" />
            </div>
          )}

          {/* Focus Ring */}
          {isFocused && (
            <div className="absolute inset-0 rounded-xl ring-2 ring-purple-500/20 pointer-events-none" />
          )}
        </div>

        {/* Messages */}
        <div className="mt-2 min-h-[1.25rem]">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {error}
            </p>
          )}
          {success && !error && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <Check className="w-4 h-4 mr-1 flex-shrink-0" />
              {success}
            </p>
          )}
          {hint && !error && !success && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
          )}
        </div>
      </div>
    );
  }
);

EnhancedSelect.displayName = "EnhancedSelect";

// Add shake animation to CSS
const shakeKeyframes = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shakeKeyframes;
  document.head.appendChild(style);
}

export { EnhancedInput, EnhancedTextarea, EnhancedSelect };
export type { EnhancedInputProps, EnhancedTextareaProps, EnhancedSelectProps, SelectOption };