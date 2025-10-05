// Enhanced Design System Components
// A comprehensive collection of modern, accessible UI components

// Step Indicators and Navigation
export {
  EnhancedStepIndicator,
  StepNavigation
} from './enhanced-step-indicator';
export type {
  Step
} from './enhanced-step-indicator';

// Enhanced Card Components
export {
  EnhancedCard,
  SelectionCard,
  PhotoUploadCard,
  StatsCard
} from './enhanced-card';

// Enhanced Form Components
export {
  EnhancedInput,
  EnhancedTextarea,
  EnhancedSelect
} from './enhanced-form';
export type {
  EnhancedInputProps,
  EnhancedTextareaProps,
  EnhancedSelectProps,
  SelectOption
} from './enhanced-form';

// Enhanced Button Components
export {
  EnhancedButton,
  ButtonGroup,
  IconButton,
  LoadingButton,
  FloatingActionButton
} from './enhanced-button';
export type {
  EnhancedButtonProps,
  ButtonGroupProps,
  IconButtonProps,
  LoadingButtonProps,
  FABProps
} from './enhanced-button';

// Loading States and Skeletons
export {
  Skeleton,
  LoadingSpinner,
  ProgressBar,
  LoadingOverlay,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonText
} from './loading-states';
export type {
  SkeletonProps,
  LoadingSpinnerProps,
  ProgressBarProps,
  LoadingOverlayProps
} from './loading-states';

// Enhanced Typography
export {
  Heading,
  Text,
  Code,
  Link,
  List,
  Blockquote
} from './enhanced-typography';
export type {
  HeadingProps,
  TextProps,
  CodeProps,
  LinkProps,
  ListProps,
  BlockquoteProps
} from './enhanced-typography';

// Animation Components
export {
  FadeIn,
  ScaleOnHover,
  Slide,
  Bounce,
  Pulse,
  Stagger,
  HoverLift,
  Parallax
} from './animations';
export type {
  FadeInProps,
  ScaleOnHoverProps,
  SlideProps,
  BounceProps,
  PulseProps,
  StaggerProps,
  HoverLiftProps,
  ParallaxProps
} from './animations';

// Accessibility Components
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
} from './accessibility';
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
} from './accessibility';

// Re-export existing shadcn/ui components for compatibility
export { Button } from './button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Input } from './input';
export { Label } from './label';
export { Textarea } from './textarea';
export { Badge } from './badge';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Separator } from './separator';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './dialog';
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './dropdown-menu';
export { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
export { Checkbox } from './checkbox';
export { Switch } from './switch';
export { Progress } from './progress';
export { Slider } from './slider';
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './table';

// Design System Utilities
export const designSystem = {
  colors: {
    primary: {
      50: '#f3f4f6',
      100: '#e5e7eb',
      200: '#d1d5db',
      300: '#9ca3af',
      400: '#6b7280',
      500: '#374151',
      600: '#1f2937',
      700: '#111827',
      800: '#0f172a',
      900: '#0c0a09'
    },
    accent: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    }
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '2.5rem',  // 40px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
    '5xl': '5rem',    // 80px
    '6xl': '6rem'     // 96px
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },
  typography: {
    fontSizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem'  // 60px
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
  },
  animations: {
    durations: {
      fast: 150,
      normal: 300,
      slow: 500,
      slower: 1000
    },
    easings: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// Component composition helpers
export const createVariant = (base: string, variants: Record<string, string>) => {
  return (variant: string = 'default') => `${base} ${variants[variant] || variants.default || ''}`;
};

export const createSize = (sizes: Record<string, string>) => {
  return (size: string = 'md') => sizes[size] || sizes.md || '';
};

// Responsive helpers
export const responsive = {
  only: (breakpoint: keyof typeof designSystem.breakpoints) => `@media (max-width: ${designSystem.breakpoints[breakpoint]})`,
  up: (breakpoint: keyof typeof designSystem.breakpoints) => `@media (min-width: ${designSystem.breakpoints[breakpoint]})`,
  down: (breakpoint: keyof typeof designSystem.breakpoints) => {
    const breakpoints = Object.entries(designSystem.breakpoints);
    const currentIndex = breakpoints.findIndex(([key]) => key === breakpoint);
    const nextBreakpoint = breakpoints[currentIndex + 1];
    return nextBreakpoint ? `@media (max-width: ${nextBreakpoint[1]})` : '';
  },
  between: (min: keyof typeof designSystem.breakpoints, max: keyof typeof designSystem.breakpoints) =>
    `@media (min-width: ${designSystem.breakpoints[min]}) and (max-width: ${designSystem.breakpoints[max]})`
};

// Accessibility helpers
export const a11y = {
  visuallyHidden: 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
  reduceMotion: '@media (prefers-reduced-motion: reduce)',
  highContrast: '@media (prefers-contrast: high)',
  darkMode: '@media (prefers-color-scheme: dark)'
};

// Animation presets
export const animationPresets = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  slideUp: {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  slideDown: {
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  slideLeft: {
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0)' }
  },
  slideRight: {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' }
  },
  scale: {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' }
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
    '50%': { transform: 'none', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' }
  }
};

// Default export for easy importing
export default {
  designSystem,
  responsive,
  a11y,
  animationPresets,
  createVariant,
  createSize
};