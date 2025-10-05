'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Enhanced Heading Component
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  variant?: 'default' | 'gradient' | 'outlined' | 'muted';
  align?: 'left' | 'center' | 'right';
  spacing?: 'tight' | 'normal' | 'wide' | 'wider';
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({
    as: Component = 'h2',
    className,
    size,
    weight = 'semibold',
    variant = 'default',
    align = 'left',
    spacing = 'normal',
    children,
    ...props
  }, ref) => {

    // Default sizes based on heading level if not specified
    const defaultSizes = {
      h1: '4xl',
      h2: '3xl',
      h3: '2xl',
      h4: 'xl',
      h5: 'lg',
      h6: 'md'
    };

    const finalSize = size || defaultSizes[Component];

    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl'
    };

    const weightClasses = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold'
    };

    const variantClasses = {
      default: 'text-gray-900 dark:text-gray-100',
      gradient: 'bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent',
      outlined: 'text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text [-webkit-text-stroke:1px_theme(colors.purple.600)]',
      muted: 'text-gray-600 dark:text-gray-400'
    };

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };

    const spacingClasses = {
      tight: 'tracking-tight',
      normal: 'tracking-normal',
      wide: 'tracking-wide',
      wider: 'tracking-wider'
    };

    const getHeadingClasses = () => {
      return cn(
        'leading-tight',
        sizeClasses[finalSize as keyof typeof sizeClasses],
        weightClasses[weight],
        variantClasses[variant],
        alignClasses[align],
        spacingClasses[spacing],
        className
      );
    };

    return (
      <Component
        ref={ref}
        className={getHeadingClasses()}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = "Heading";

// Enhanced Text Component
interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'span' | 'div' | 'label';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  variant?: 'default' | 'muted' | 'subtle' | 'accent' | 'success' | 'warning' | 'danger';
  align?: 'left' | 'center' | 'right' | 'justify';
  spacing?: 'tight' | 'normal' | 'wide';
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  truncate?: boolean;
  italic?: boolean;
}

const Text = forwardRef<HTMLElement, TextProps>(
  ({
    as: Component = 'p',
    className,
    size = 'md',
    weight = 'normal',
    variant = 'default',
    align = 'left',
    spacing = 'normal',
    lineHeight = 'normal',
    truncate = false,
    italic = false,
    children,
    ...props
  }, ref) => {

    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };

    const weightClasses = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    };

    const variantClasses = {
      default: 'text-gray-900 dark:text-gray-100',
      muted: 'text-gray-600 dark:text-gray-400',
      subtle: 'text-gray-500 dark:text-gray-500',
      accent: 'text-purple-600 dark:text-purple-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      danger: 'text-red-600 dark:text-red-400'
    };

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify'
    };

    const spacingClasses = {
      tight: 'tracking-tight',
      normal: 'tracking-normal',
      wide: 'tracking-wide'
    };

    const lineHeightClasses = {
      tight: 'leading-tight',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
      loose: 'leading-loose'
    };

    const getTextClasses = () => {
      return cn(
        sizeClasses[size],
        weightClasses[weight],
        variantClasses[variant],
        alignClasses[align],
        spacingClasses[spacing],
        lineHeightClasses[lineHeight],
        truncate && 'truncate',
        italic && 'italic',
        className
      );
    };

    return (
      <Component
        ref={ref as any}
        className={getTextClasses()}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = "Text";

// Enhanced Code Component
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'inline' | 'block';
  language?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark' | 'auto';
}

const Code = forwardRef<HTMLElement, CodeProps>(
  ({
    className,
    variant = 'inline',
    language,
    size = 'sm',
    theme = 'auto',
    children,
    ...props
  }, ref) => {

    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    const variantClasses = {
      inline: 'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono',
      block: 'block p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono overflow-x-auto'
    };

    const getCodeClasses = () => {
      return cn(
        sizeClasses[size],
        variantClasses[variant],
        className
      );
    };

    if (variant === 'block') {
      return (
        <pre
          ref={ref as any}
          className={getCodeClasses()}
          {...props}
        >
          <code>{children}</code>
        </pre>
      );
    }

    return (
      <code
        ref={ref}
        className={getCodeClasses()}
        {...props}
      >
        {children}
      </code>
    );
  }
);

Code.displayName = "Code";

// Enhanced Link Component
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'subtle' | 'accent' | 'button';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  underline?: 'none' | 'hover' | 'always';
  external?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    weight = 'medium',
    underline = 'hover',
    external = false,
    children,
    ...props
  }, ref) => {

    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    };

    const variantClasses = {
      default: 'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300',
      subtle: 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
      accent: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
      button: 'inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200'
    };

    const underlineClasses = {
      none: 'no-underline',
      hover: 'no-underline hover:underline',
      always: 'underline'
    };

    const getLinkClasses = () => {
      return cn(
        'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-sm',
        sizeClasses[size],
        weightClasses[weight],
        variantClasses[variant],
        variant !== 'button' && underlineClasses[underline],
        className
      );
    };

    return (
      <a
        ref={ref}
        className={getLinkClasses()}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
        {external && (
          <svg
            className="inline-block w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </a>
    );
  }
);

Link.displayName = "Link";

// Enhanced List Component
interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  as?: 'ul' | 'ol';
  variant?: 'default' | 'ordered' | 'dashed' | 'checkmarks' | 'arrows';
  size?: 'sm' | 'md' | 'lg';
  spacing?: 'tight' | 'normal' | 'loose';
}

const List = forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(
  ({
    as: Component = 'ul',
    className,
    variant = 'default',
    size = 'md',
    spacing = 'normal',
    children,
    ...props
  }, ref) => {

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    const spacingClasses = {
      tight: 'space-y-1',
      normal: 'space-y-2',
      loose: 'space-y-3'
    };

    const variantClasses = {
      default: 'list-disc list-inside',
      ordered: 'list-decimal list-inside',
      dashed: '[&>li]:before:content-["-"] [&>li]:before:mr-2 [&>li]:before:text-gray-500',
      checkmarks: '[&>li]:before:content-["✓"] [&>li]:before:mr-2 [&>li]:before:text-green-500',
      arrows: '[&>li]:before:content-["→"] [&>li]:before:mr-2 [&>li]:before:text-purple-500'
    };

    const getListClasses = () => {
      return cn(
        sizeClasses[size],
        spacingClasses[spacing],
        variant === 'dashed' || variant === 'checkmarks' || variant === 'arrows' ? 'list-none' : variantClasses[variant],
        variant === 'dashed' || variant === 'checkmarks' || variant === 'arrows' ? variantClasses[variant] : '',
        'text-gray-700 dark:text-gray-300',
        className
      );
    };

    return (
      <Component
        ref={ref as any}
        className={getListClasses()}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

List.displayName = "List";

// Enhanced Blockquote Component
interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  variant?: 'default' | 'accent' | 'bordered' | 'highlighted';
  size?: 'sm' | 'md' | 'lg';
  author?: string;
  source?: string;
}

const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    author,
    source,
    children,
    ...props
  }, ref) => {

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    const variantClasses = {
      default: 'border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300',
      accent: 'border-l-4 border-purple-500 pl-4 italic text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-r-lg',
      bordered: 'border border-gray-200 dark:border-gray-700 p-4 rounded-lg italic text-gray-700 dark:text-gray-300',
      highlighted: 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-l-4 border-purple-500 p-4 rounded-r-lg italic text-gray-700 dark:text-gray-300'
    };

    const getBlockquoteClasses = () => {
      return cn(
        sizeClasses[size],
        variantClasses[variant],
        'relative',
        className
      );
    };

    return (
      <blockquote
        ref={ref}
        className={getBlockquoteClasses()}
        {...props}
      >
        {variant === 'highlighted' && (
          <div className="absolute top-2 right-2 text-purple-300 dark:text-purple-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>
        )}

        <div className="relative z-10">
          {children}
        </div>

        {(author || source) && (
          <footer className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {author && <cite className="not-italic font-medium">— {author}</cite>}
            {source && <span className="ml-2">{source}</span>}
          </footer>
        )}
      </blockquote>
    );
  }
);

Blockquote.displayName = "Blockquote";

export {
  Heading,
  Text,
  Code,
  Link,
  List,
  Blockquote
};

export type {
  HeadingProps,
  TextProps,
  CodeProps,
  LinkProps,
  ListProps,
  BlockquoteProps
};