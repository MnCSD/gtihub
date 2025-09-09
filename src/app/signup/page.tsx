'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SignupForm } from '@/components/auth';
import { Logo } from '@/components/ui';

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-white text-[#0d1117]">
      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left visual panel */}
        <aside className="relative hidden lg:block bg-black overflow-hidden">
          {/* content top-left */}
          <div className="relative z-10 px-10 pt-16">
            <h1 className="text-white text-4xl font-extrabold tracking-tight">
              Create your free account
            </h1>
            <p className="mt-3 text-white/80 max-w-xl">
              Explore GitHub&apos;s core features for individuals and organizations.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 text-white font-medium">
              See what&apos;s included
              <svg
                viewBox="0 0 20 20"
                className="size-4"
                fill="currentColor"
                aria-hidden
              >
                <path d="M5.75 7.75L10 12l4.25-4.25" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* background gradient layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#140a3a] opacity-90 z-0" />
          {/* bottom glow - raised and stronger */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(1400px_560px_at_50%_108%,rgba(59,46,137,0.9),rgba(166,136,255,0.55)_55%,transparent_76%)]" />
          {/* animated star field (parallax drift) */}
          <div aria-hidden className="parallax-stars absolute inset-0 z-10" />
          {/* extra spark particles rising */}
          <div aria-hidden className="absolute inset-0 z-10 pointer-events-none">
            {Array.from({ length: 36 }).map((_, i) => {
              const left = (i * 37) % 100;
              const bottomPct = 8 + ((i * 13) % 28);
              const delay = (i % 12) * 0.45;
              const duration = 5.5 + ((i * 7) % 10) * 0.25;
              const size = 2 + (i % 3);
              const rise = 100 + ((i * 11) % 80);
              const style: React.CSSProperties & Record<'--spark-rise', string> = {
                left: `${left}%`,
                bottom: `${bottomPct}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                width: `${size}px`,
                height: `${size}px`,
                ['--spark-rise']: `${rise}px`,
              };
              return <span key={i} className="sparkle absolute" style={style} />;
            })}
          </div>

          {/* Mascots image at bottom */}
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[900px] h-[420px] z-20">
            <Image
              src="/tres-amigoS.webp"
              alt="Three mascot icons"
              fill
              priority
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-contain object-bottom select-none"
            />
          </div>
        </aside>

        {/* Right form panel */}
        <section className="relative px-4 sm:px-6 lg:px-10 py-16 flex items-center justify-center">
          {/* Mini header sits only on the right panel */}
          <div className="absolute right-4 sm:right-6 lg:right-10 top-4 text-sm">
            <span className="text-black/70">Already have an account?</span>
            <Link href="/login" className="ml-2 font-semibold text-black hover:underline inline-flex items-center gap-1">
              Sign in <span aria-hidden> →</span>
            </Link>
          </div>

          <SignupForm />
        </section>
      </div>
    </main>
  );
}

