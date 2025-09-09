import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'default' | 'dark';
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, variant = 'default', required, ...props }, ref) => {
    const baseClasses = 'w-full rounded-md px-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
    
    const variants = {
      default: 'h-11 border border-black/10 bg-white shadow-sm focus:ring-black/10 text-black placeholder:text-gray-600',
      dark: 'h-10 bg-[#0d1117] border border-[#30363d] text-white placeholder:text-[#8b949e] focus:ring-[#58a6ff]'
    };
    
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
    
    return (
      <div className="space-y-1">
        {label && (
          <label className={cn(
            'block text-sm font-medium',
            variant === 'dark' ? 'text-white' : 'text-black'
          )}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          className={cn(baseClasses, variants[variant], errorClasses, className)}
          ref={ref}
          {...props}
        />
        {helper && !error && (
          <p className={cn(
            'text-xs',
            variant === 'dark' ? 'text-white/60' : 'text-black/60'
          )}>
            {helper}
          </p>
        )}
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;