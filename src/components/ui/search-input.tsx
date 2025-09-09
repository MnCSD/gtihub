import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  width?: string;
  showKeyboardShortcut?: boolean;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, width = 'w-[320px]', showKeyboardShortcut = false, ...props }, ref) => {
    return (
      <div className={cn('hidden md:flex items-center bg-[#010409] border border-white/15 rounded-md px-3 py-1.5', width)}>
        <svg
          className="size-4 text-white/60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          className={cn('ml-2 flex-1 bg-transparent text-sm placeholder:text-white/50 focus:outline-none', className)}
          ref={ref}
          {...props}
        />
        {showKeyboardShortcut && (
          <kbd className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-white/70">
            /
          </kbd>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;