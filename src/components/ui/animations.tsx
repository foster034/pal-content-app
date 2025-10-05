'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Fade In Animation Component
interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  once?: boolean;
  threshold?: number;
}

const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({
    className,
    delay = 0,
    duration = 500,
    direction = 'up',
    distance = 20,
    once = true,
    threshold = 0.1,
    children,
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && (!once || !hasAnimated)) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
          } else if (!once && !entry.isIntersecting) {
            setIsVisible(false);
          }
        },
        { threshold }
      );

      const element = ref?.current || document.querySelector('[data-fade-in]');
      if (element) observer.observe(element as Element);

      return () => observer.disconnect();
    }, [delay, once, hasAnimated, threshold, ref]);

    const getInitialTransform = () => {
      switch (direction) {
        case 'up': return `translateY(${distance}px)`;
        case 'down': return `translateY(-${distance}px)`;
        case 'left': return `translateX(${distance}px)`;
        case 'right': return `translateX(-${distance}px)`;
        default: return 'translateY(20px)';
      }
    };

    const animationStyles: React.CSSProperties = {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translate(0)' : getInitialTransform(),
      transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
    };

    return (
      <div
        ref={ref}
        data-fade-in
        className={cn('transition-all', className)}
        style={animationStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FadeIn.displayName = "FadeIn";

// Scale Animation Component
interface ScaleOnHoverProps extends React.HTMLAttributes<HTMLDivElement> {
  scale?: number;
  duration?: number;
  origin?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const ScaleOnHover = forwardRef<HTMLDivElement, ScaleOnHoverProps>(
  ({
    className,
    scale = 1.05,
    duration = 200,
    origin = 'center',
    children,
    ...props
  }, ref) => {
    const originClasses = {
      center: 'origin-center',
      top: 'origin-top',
      bottom: 'origin-bottom',
      left: 'origin-left',
      right: 'origin-right'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'transition-transform cursor-pointer',
          `hover:scale-[${scale}]`,
          `duration-${duration}`,
          originClasses[origin],
          className
        )}
        style={{
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScaleOnHover.displayName = "ScaleOnHover";

// Slide Animation Component
interface SlideProps extends React.HTMLAttributes<HTMLDivElement> {
  direction: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  distance?: string;
  trigger?: boolean;
  delay?: number;
}

const Slide = forwardRef<HTMLDivElement, SlideProps>(
  ({
    className,
    direction,
    duration = 300,
    distance = '100%',
    trigger = true,
    delay = 0,
    children,
    ...props
  }, ref) => {
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
      if (trigger && delay > 0) {
        const timer = setTimeout(() => setShouldAnimate(true), delay);
        return () => clearTimeout(timer);
      } else if (trigger) {
        setShouldAnimate(true);
      }
    }, [trigger, delay]);

    const getTransform = () => {
      if (!trigger && !shouldAnimate) {
        switch (direction) {
          case 'left': return `translateX(-${distance})`;
          case 'right': return `translateX(${distance})`;
          case 'up': return `translateY(-${distance})`;
          case 'down': return `translateY(${distance})`;
        }
      }
      return 'translate(0)';
    };

    const animationStyles: React.CSSProperties = {
      transform: getTransform(),
      transition: `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    };

    return (
      <div
        ref={ref}
        className={cn('transition-transform', className)}
        style={animationStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Slide.displayName = "Slide";

// Bounce Animation Component
interface BounceProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger?: boolean;
  duration?: number;
  intensity?: 'subtle' | 'normal' | 'strong';
}

const Bounce = forwardRef<HTMLDivElement, BounceProps>(
  ({
    className,
    trigger = false,
    duration = 600,
    intensity = 'normal',
    children,
    ...props
  }, ref) => {
    const intensityClasses = {
      subtle: 'animate-bounce-subtle',
      normal: 'animate-bounce',
      strong: 'animate-bounce-strong'
    };

    return (
      <div
        ref={ref}
        className={cn(
          trigger && intensityClasses[intensity],
          className
        )}
        style={{
          animationDuration: `${duration}ms`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Bounce.displayName = "Bounce";

// Pulse Animation Component
interface PulseProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  color?: 'purple' | 'blue' | 'green' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  speed?: 'slow' | 'normal' | 'fast';
}

const Pulse = forwardRef<HTMLDivElement, PulseProps>(
  ({
    className,
    active = true,
    color = 'purple',
    size = 'md',
    speed = 'normal',
    children,
    ...props
  }, ref) => {
    const colorClasses = {
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500'
    };

    const sizeClasses = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4'
    };

    const speedClasses = {
      slow: 'animate-ping-slow',
      normal: 'animate-ping',
      fast: 'animate-ping-fast'
    };

    return (
      <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
        {children}
        {active && (
          <span className="absolute top-0 right-0 flex h-full w-full">
            <span
              className={cn(
                'absolute inline-flex rounded-full opacity-75',
                colorClasses[color],
                sizeClasses[size],
                speedClasses[speed]
              )}
            />
            <span
              className={cn(
                'relative inline-flex rounded-full',
                colorClasses[color],
                sizeClasses[size]
              )}
            />
          </span>
        )}
      </div>
    );
  }
);

Pulse.displayName = "Pulse";

// Stagger Animation Component
interface StaggerProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  staggerDelay?: number;
  animation?: 'fadeIn' | 'slideUp' | 'scale';
  duration?: number;
}

const Stagger = forwardRef<HTMLDivElement, StaggerProps>(
  ({
    className,
    delay = 0,
    staggerDelay = 100,
    animation = 'fadeIn',
    duration = 300,
    children,
    ...props
  }, ref) => {
    const [startAnimation, setStartAnimation] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setStartAnimation(true), delay);
      return () => clearTimeout(timer);
    }, [delay]);

    const getAnimationClass = (index: number) => {
      const totalDelay = delay + (index * staggerDelay);

      switch (animation) {
        case 'fadeIn':
          return {
            opacity: startAnimation ? 1 : 0,
            transitionDelay: `${totalDelay}ms`,
            transitionDuration: `${duration}ms`,
            transitionProperty: 'opacity',
          };
        case 'slideUp':
          return {
            opacity: startAnimation ? 1 : 0,
            transform: startAnimation ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: `${totalDelay}ms`,
            transitionDuration: `${duration}ms`,
            transitionProperty: 'opacity, transform',
          };
        case 'scale':
          return {
            opacity: startAnimation ? 1 : 0,
            transform: startAnimation ? 'scale(1)' : 'scale(0.95)',
            transitionDelay: `${totalDelay}ms`,
            transitionDuration: `${duration}ms`,
            transitionProperty: 'opacity, transform',
          };
        default:
          return {};
      }
    };

    return (
      <div ref={ref} className={cn(className)} {...props}>
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            style={getAnimationClass(index)}
            className="transition-all ease-out"
          >
            {child}
          </div>
        ))}
      </div>
    );
  }
);

Stagger.displayName = "Stagger";

// Hover Lift Effect Component
interface HoverLiftProps extends React.HTMLAttributes<HTMLDivElement> {
  lift?: number;
  shadowIntensity?: 'subtle' | 'normal' | 'strong';
  duration?: number;
}

const HoverLift = forwardRef<HTMLDivElement, HoverLiftProps>(
  ({
    className,
    lift = 8,
    shadowIntensity = 'normal',
    duration = 200,
    children,
    ...props
  }, ref) => {
    const shadowClasses = {
      subtle: 'hover:shadow-md',
      normal: 'hover:shadow-lg',
      strong: 'hover:shadow-xl'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all cursor-pointer',
          shadowClasses[shadowIntensity],
          className
        )}
        style={{
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = `translateY(-${lift}px)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HoverLift.displayName = "HoverLift";

// Parallax Component
interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  direction?: 'up' | 'down';
}

const Parallax = forwardRef<HTMLDivElement, ParallaxProps>(
  ({
    className,
    speed = 0.5,
    direction = 'up',
    children,
    ...props
  }, ref) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
      const handleScroll = () => {
        const scrolled = window.pageYOffset;
        const parallaxOffset = scrolled * speed;
        setOffset(direction === 'down' ? parallaxOffset : -parallaxOffset);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [speed, direction]);

    return (
      <div
        ref={ref}
        className={cn(className)}
        style={{
          transform: `translateY(${offset}px)`,
          transition: 'transform 0.1s ease-out'
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Parallax.displayName = "Parallax";

// Custom CSS animations for enhanced effects
const customAnimations = `
  @keyframes bounce-subtle {
    0%, 100% {
      transform: translateY(-5%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }

  @keyframes bounce-strong {
    0%, 100% {
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }

  @keyframes ping-slow {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  @keyframes ping-fast {
    50%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(147, 51, 234, 0.5); }
    50% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.8); }
  }

  @keyframes shake-subtle {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }

  @keyframes typewriter {
    from { width: 0; }
    to { width: 100%; }
  }

  @keyframes blink {
    from, to { border-color: transparent; }
    50% { border-color: currentColor; }
  }

  .animate-bounce-subtle {
    animation: bounce-subtle 1s infinite;
  }

  .animate-bounce-strong {
    animation: bounce-strong 1s infinite;
  }

  .animate-ping-slow {
    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .animate-ping-fast {
    animation: ping-fast 0.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite alternate;
  }

  .animate-shake-subtle {
    animation: shake-subtle 0.5s ease-in-out;
  }

  .animate-typewriter {
    overflow: hidden;
    border-right: 2px solid currentColor;
    white-space: nowrap;
    animation: typewriter 2s steps(40, end), blink 0.75s step-end infinite;
  }

  /* Smooth scroll behavior */
  html {
    scroll-behavior: smooth;
  }

  /* Reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = customAnimations;
  document.head.appendChild(style);
}

export {
  FadeIn,
  ScaleOnHover,
  Slide,
  Bounce,
  Pulse,
  Stagger,
  HoverLift,
  Parallax
};

export type {
  FadeInProps,
  ScaleOnHoverProps,
  SlideProps,
  BounceProps,
  PulseProps,
  StaggerProps,
  HoverLiftProps,
  ParallaxProps
};