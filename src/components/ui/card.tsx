import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const baseClasses = 'rounded-lg border';
    
    const variants = {
      default: 'bg-white border-gray-200 text-gray-900',
      dark: 'bg-[#0d1117] border-white/10 text-white'
    };
    
    const paddings = {
      none: '',
      sm: 'p-2',
      md: 'p-3',
      lg: 'p-4'
    };
    
    return (
      <div
        className={cn(baseClasses, variants[variant], paddings[padding], className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between p-3 pb-0', className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-3 pt-0', className)}
      {...props}
    />
  )
);

CardContent.displayName = 'CardContent';

export { Card as default, CardHeader, CardContent };