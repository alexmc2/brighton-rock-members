'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRoot = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  bg?: 'dark' | 'light' | 'none';
  size?: 'sm' | 'md' | 'lg' | 'none';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      bg = 'none',
      size = 'none',
      position = 'top',
      sideOffset = 4,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      lg: 'w-[280px]',
      md: 'w-[240px]',
      sm: 'w-[200px]',
      none: 'w-auto',
    };

    const colorClasses = {
      light: 'bg-white text-slate-950 border-slate-200',
      dark: 'bg-slate-950 text-slate-50 border-slate-800',
      none: 'bg-white text-slate-950 border-slate-200 dark:bg-slate-950 dark:text-slate-50 dark:border-slate-800',
    };

    return (
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 overflow-hidden rounded-md border p-3 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          sizeClasses[size],
          colorClasses[bg],
          className
        )}
        {...props}
      />
    );
  }
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  bg?: 'dark' | 'light' | 'none';
  size?: 'sm' | 'md' | 'lg' | 'none';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip = ({
  children,
  content,
  className = '',
  bg = 'none',
  size = 'none',
  position = 'top',
}: TooltipProps) => {
  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <button
            className={cn('block', className)}
            onClick={(e) => e.preventDefault()}
          >
            {children || (
              <svg
                className="fill-current text-slate-400 dark:text-slate-500"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z" />
              </svg>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent bg={bg} size={size} position={position}>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
};

export {
  Tooltip,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
};
