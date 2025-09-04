import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user ?? null;
  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();
  return (
    <main className="h-screen relative overflow-hidden bg-[#0C0F41] text-white">
      {/* Top gradient + subtle stars */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(99,102,241,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_90%,rgba(168,85,247,0.35),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_400px_at_20%_20%,rgba(59,130,246,0.15),transparent_60%)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-transparent backdrop-blur">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left cluster: Brand + Nav */}
          <div className="flex items-center gap-6 min-w-0">
            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <Image
                src="/github-mark-white.png"
                alt="Logo"
                width={30}
                height={30}
              />
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
              {[
                "Platform",
                "Solutions",
                "Resources",
                "Open Source",
                "Enterprise",
                "Pricing",
              ].map((item) => (
                <button
                  key={item}
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>{item}</span>
                  {item !== "Pricing" && (
                    <svg
                      aria-hidden
                      className="size-3.5 opacity-70"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M5.25 7.75L10 12.5l4.75-4.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
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

            {user ? (
              <div className="ml-2 flex items-center gap-3">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || user.email || "User"}
                    width={28}
                    height={28}
                    className="rounded-full border border-white/20"
                  />)
                : (
                  <div className="size-8 rounded-full bg-white/15 text-white flex items-center justify-center font-semibold">
                    {initial}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex rounded-md border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10 cursor-pointer">
                  Sign in
                </Link>
                <Link href="/signup" className="inline-flex rounded-md border border-white/50 px-3 py-1.5 text-sm font-semibold hover:bg-white/10 cursor-pointer">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-64px)] pt-8 lg:pt-28 pb-72 text-center">
        <h1 className="mx-auto max-w-5xl text-4xl sm:text-5xl lg:text-[60px] font-extrabold leading-tight tracking-tight">
          Build and ship software on a
          <br className="hidden sm:block" />
          <span className="whitespace-nowrap">
            single, collaborative platform
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-white/80">
          Join the world’s most widely adopted AI-powered developer platform.
        </p>

        {/* Signup form */}
        <div className="mx-auto relative z-[10000] mt-8 flex max-w-3xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {/* Composite field: input with embedded signup button */}
          <div className="flex w-[60%] items-center rounded-xl bg-gradient-to-b from-white to-white/90 p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-lg bg-transparent px-4 text-base text-black placeholder:text-gray-600 focus:outline-none"
            />
            <Link href="/signup" className="h-12 ml-1 rounded-lg bg-[#238636] px-5 text-base font-semibold text-white ring-2 ring-white hover:bg-[#2ea043] cursor-pointer inline-flex items-center justify-center">
              Sign up for GitHub
            </Link>
          </div>

          {/* Secondary CTA */}
          <button className="h-12 rounded-xl border-2 border-white px-5 text-base font-semibold text-white/90 hover:bg-white/10 cursor-pointer">
            Try GitHub Copilot
          </button>
        </div>

        {/* Floating icons + gradient image pinned to bottom */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-[1200px] sm:-bottom-16 md:-bottom-32 flex justify-center animate-float-slow">
          <div className="relative w-full max-w-[1600px] h-[520px] sm:h-[660px] md:h-[800px] lg:h-[920px]">
            <Image
              src="/floating_icons_gradient.png"
              alt="Floating icons with glow gradient"
              fill
              priority
              sizes="100vw"
              className="object-contain select-none"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

