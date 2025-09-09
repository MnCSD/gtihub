import Link from 'next/link';
import { Logo } from '@/components/ui';
import { ChevronDownIcon } from '@/components/icons';

const navigationItems = [
  'Platform',
  'Solutions',
  'Resources',
  'Open Source',
  'Enterprise',
  'Pricing',
];

const LandingHeader = () => {
  return (
    <header className="sticky top-0 z-30 bg-transparent backdrop-blur">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left cluster: Brand + Nav */}
        <div className="flex items-center gap-6 min-w-0">
          {/* Brand */}
          <Logo />

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
            {navigationItems.map((item) => (
              <button
                key={item}
                className="inline-flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>{item}</span>
                {item !== 'Pricing' && (
                  <ChevronDownIcon size={14} className="opacity-70" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right cluster: Search + Auth */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center bg-[#272E49] gap-2 w-[420px] rounded-md border border-white/15 px-3 py-1.5">
            <svg
              aria-hidden
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
              className="flex-1 bg-transparent text-sm placeholder:text-white/50 focus:outline-none"
              placeholder="Search or jump to..."
            />
            <kbd className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-white/70">
              /
            </kbd>
          </div>

          <Link
            href="/login"
            className="hidden sm:inline-flex rounded-md border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10 cursor-pointer"
          >
            Sign in
          </Link>
          
          <Link
            href="/signup"
            className="inline-flex rounded-md border border-white/50 px-3 py-1.5 text-sm font-semibold hover:bg-white/10 cursor-pointer"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;