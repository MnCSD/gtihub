import Image from "next/image";

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
              Explore GitHub’s core features for individuals and organizations.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 text-white font-medium">
              See what’s included
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
              // Pseudo-random placement using deterministic math
              const left = (i * 37) % 100; // 0..99%
              const bottomPct = 8 + ((i * 13) % 28); // start 8%..36% from bottom (not a single line)
              const delay = (i % 12) * 0.45; // staggered
              const duration = 5.5 + ((i * 7) % 10) * 0.25; // 5.5s..8s
              const size = 2 + (i % 3); // 2-4px
              const rise = 100 + ((i * 11) % 80); // 100..180px variable rise
              return (
                <span
                  key={i}
                  className="sparkle absolute"
                  style={{
                    left: `${left}%`,
                    bottom: `${bottomPct}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    width: `${size}px`,
                    height: `${size}px`,
                    // custom properties consumed by keyframes
                    // @ts-ignore - CSS variable inline
                    ['--spark-rise' as any]: `${rise}px`,
                  } as React.CSSProperties}
                />
              );
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
            <a href="#" className="ml-2 font-semibold text-black hover:underline inline-flex items-center gap-1">
              Sign in <span aria-hidden>→</span>
            </a>
          </div>

          <div className="w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-5">Sign up for GitHub</h2>

            {/* Google OAuth button */}
            <button className="w-full h-10 rounded-md bg-white border border-black/10 shadow-sm flex items-center justify-center gap-2 text-sm font-medium">
              <GoogleIcon /> Continue with Google
            </button>

            {/* Divider */}
            <div className="my-5 flex items-center gap-4 text-black/50">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-xs">or</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <form className="space-y-4">
              <Field label="Email" type="email" placeholder="Email" />
              <Field
                label="Password"
                type="password"
                placeholder="Password"
                help="Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter."
              />
              <Field
                label="Username"
                type="text"
                placeholder="Username"
                help="Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen."
              />

              {/* Country/Region */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Country/Region
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select className="w-full h-11 rounded-md border border-black/10 bg-white px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10">
                    <option>Greece</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Germany</option>
                    <option>France</option>
                    <option>India</option>
                    <option>Other</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-black/60"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M5.75 7.75L10 12l4.25-4.25" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="mt-1.5 text-xs text-black/60">
                  For compliance reasons, we’re required to collect country information to send you occasional updates and announcements.
                </p>
              </div>

              {/* Email preferences */}
              <label className="mt-2 flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 size-4 rounded border border-black/20" />
                <span>Receive occasional product updates and announcements</span>
              </label>

              <button
                type="submit"
                className="mt-2 w-full h-11 rounded-md bg-black text-white font-semibold hover:bg-black/90"
              >
                Create account
                <span aria-hidden> →</span>
              </button>

              <p className="text-xs text-black/60 leading-relaxed mt-3">
                By creating an account, you agree to the Terms of Service. For more information about GitHub’s privacy practices, see the GitHub Privacy Statement.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  type,
  placeholder,
  help,
}: {
  label: string;
  type: string;
  placeholder: string;
  help?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
        <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full h-11 rounded-md border border-black/10 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10"
      />
      {help && <p className="mt-1.5 text-xs text-black/60">{help}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden
    >
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.746 32.658 29.248 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 29.082 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.655 16.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 29.082 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.21 35.091 26.735 36 24 36c-5.224 0-9.712-3.317-11.292-7.946l-6.54 5.036C9.467 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.02 12.02 0 01-4.095 5.565l.003-.002 6.191 5.238C36.888 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}
