'use client';

import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: number;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
}

interface EnhancedStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showLabels?: boolean;
  animated?: boolean;
}

export function EnhancedStepIndicator({
  steps,
  currentStep,
  className,
  variant = 'default',
  showLabels = true,
  animated = true
}: EnhancedStepIndicatorProps) {
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep - 1) return 'completed';
    if (stepIndex === currentStep - 1) return 'current';
    return 'upcoming';
  };

  const getStepClasses = (stepIndex: number, status: string) => {
    const baseClasses = "relative flex items-center justify-center rounded-full font-medium transition-all duration-300";

    switch (variant) {
      case 'compact':
        return cn(baseClasses, "w-8 h-8 text-sm", {
          'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg': status === 'completed',
          'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg ring-4 ring-purple-200': status === 'current',
          'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500': status === 'upcoming'
        });
      case 'minimal':
        return cn(baseClasses, "w-6 h-6 text-xs", {
          'bg-purple-600 text-white': status === 'completed',
          'bg-purple-500 text-white ring-2 ring-purple-300': status === 'current',
          'bg-gray-300 text-gray-400': status === 'upcoming'
        });
      default:
        return cn(baseClasses, "w-12 h-12", {
          'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl transform scale-105': status === 'completed',
          'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-xl ring-4 ring-purple-200 transform scale-110': status === 'current',
          'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400': status === 'upcoming'
        });
    }
  };

  const getConnectorClasses = (stepIndex: number) => {
    const isCompleted = stepIndex < currentStep - 1;
    const isCurrent = stepIndex === currentStep - 2;

    return cn(
      "flex-1 h-1 mx-2 transition-all duration-500 ease-out",
      variant === 'minimal' ? 'mx-1 h-0.5' : '',
      {
        'bg-gradient-to-r from-purple-600 to-blue-600': isCompleted,
        'bg-gradient-to-r from-purple-500 to-blue-500': isCurrent,
        'bg-gray-200 dark:bg-gray-700': stepIndex >= currentStep - 1
      }
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="relative flex items-center justify-between mb-6">
        {/* Background track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full -translate-y-1/2" />

        {/* Progress fill */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full -translate-y-1/2 transition-all duration-700 ease-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            boxShadow: '0 0 10px rgba(147, 51, 234, 0.4)'
          }}
        />

        {/* Step circles */}
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <div
              key={step.id}
              className={cn(
                "relative z-10 flex flex-col items-center",
                animated && "transition-transform duration-300 hover:scale-105"
              )}
            >
              <div className={getStepClasses(index, status)}>
                {status === 'completed' ? (
                  <Check
                    className={cn(
                      "transition-all duration-200",
                      variant === 'minimal' ? 'w-3 h-3' : variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'
                    )}
                  />
                ) : (
                  <span className="font-semibold">
                    {step.icon || step.id}
                  </span>
                )}

                {/* Pulse animation for current step */}
                {status === 'current' && animated && (
                  <div className="absolute inset-0 rounded-full bg-purple-500 opacity-30 animate-ping" />
                )}
              </div>

              {/* Step labels */}
              {showLabels && variant !== 'minimal' && (
                <div className="mt-3 text-center max-w-[120px]">
                  <div className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    status === 'current'
                      ? 'text-purple-600 dark:text-purple-400'
                      : status === 'completed'
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {step.subtitle}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current step info for minimal variant */}
      {variant === 'minimal' && (
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {steps[currentStep - 1]?.title}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {steps[currentStep - 1]?.subtitle}
          </div>
        </div>
      )}

      {/* Step counter for compact variant */}
      {variant === 'compact' && showLabels && (
        <div className="text-center mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep} of {steps.length}
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
            {steps[currentStep - 1]?.title}
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Step Navigation Component
interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  canProceed: boolean;
  isSubmitting: boolean;
  nextLabel?: string;
  submitLabel?: string;
  showSkip?: boolean;
  onSkip?: () => void;
  className?: string;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSubmit,
  canProceed,
  isSubmitting,
  nextLabel = "Continue",
  submitLabel = "Complete",
  showSkip = false,
  onSkip,
  className
}: StepNavigationProps) {
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {/* Back button */}
      <div className="flex-shrink-0">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrev}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        )}
      </div>

      {/* Main action button */}
      <div className="flex-1">
        {isLastStep ? (
          <button
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Check className="w-5 h-5 mr-2" />
                {submitLabel}
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
          >
            <div className="flex items-center justify-center">
              {nextLabel}
              <ChevronRight className="w-5 h-5 ml-2" />
            </div>
          </button>
        )}
      </div>

      {/* Skip button (optional) */}
      {showSkip && onSkip && isLastStep && (
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            Skip and submit
          </button>
        </div>
      )}
    </div>
  );
}